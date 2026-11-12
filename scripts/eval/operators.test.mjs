import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadTree, validateTree } from './tree.mjs';
import { CATEGORIES, normalizeCategory } from './categories.mjs';
import { removeCondition, removeBranch, insufficiencyTargets, branchTargets } from './operators.mjs';

const ROOT = join(import.meta.dirname, '..', '..');

const e = (id, kind = 'effect', undesirable = false) => ({ id, text: `Text of ${id}`, kind, ...(undesirable ? { undesirable } : {}) });
const a = (from, to, not = false) => ({ id: `${from}-to-${to}`, from, to, ...(not ? { not } : {}) });

function twoGroup() {
  return {
    id: 'two',
    entities: [e('x', 'precondition'), e('y', 'precondition'), e('z')],
    arrows: [a('x', 'z'), a('y', 'z')],
    groups: [{ id: 'z-and', arrows: ['x-to-z', 'y-to-z'] }],
  };
}

test('category labels are fixed and normalized', () => {
  assert.deepEqual(CATEGORIES, { insufficiency: 'Cause insufficiency', sideEffect: 'Possible negative branch' });
  assert.equal(normalizeCategory('**Cause Insufficiency.**'), 'cause insufficiency');
  assert.equal(normalizeCategory(' possible negative branch: '), 'possible negative branch');
});

test('removing one condition from a two-arrow group leaves a plain arrow', () => {
  const { mutant, entry } = removeCondition(twoGroup(), 'z-and');
  assert.deepEqual(mutant.groups, []);
  assert.equal(mutant.arrows.length, 1);
  assert.equal(mutant.entities.length, 2);
  const [kept] = mutant.arrows;
  assert.equal(entry.category, 'Cause insufficiency');
  assert.deepEqual(entry.matchSet, ['z', kept.id, kept.from]);
  assert.match(entry.expected, /\[z\]/);
  assert.deepEqual(validateTree(mutant), []);
});

test('removing one condition from a three-arrow group keeps a two-arrow group', () => {
  const tree = {
    id: 'three',
    entities: [e('p', 'precondition'), e('q', 'precondition'), e('r', 'precondition'), e('s')],
    arrows: [a('p', 's'), a('q', 's'), a('r', 's')],
    groups: [{ id: 's-and', arrows: ['p-to-s', 'q-to-s', 'r-to-s'] }],
  };
  const { mutant, entry } = removeCondition(tree, 's-and');
  assert.equal(mutant.groups.length, 1);
  assert.equal(mutant.groups[0].arrows.length, 2);
  assert.equal(entry.matchSet.length, 5);
  assert.deepEqual(validateTree(mutant), []);
});

test('the not arrow of a cause AND NOT mitigation group is never removed', () => {
  const tree = {
    id: 'mitigated',
    entities: [e('rain', 'precondition'), e('soil', 'precondition'), e('drain', 'precondition'), e('mud')],
    arrows: [a('rain', 'mud'), a('soil', 'mud'), a('drain', 'mud', true)],
    groups: [{ id: 'mud-and', arrows: ['rain-to-mud', 'soil-to-mud', 'drain-to-mud'] }],
  };
  assert.deepEqual(insufficiencyTargets(tree), ['mud-and']);
  const { mutant } = removeCondition(tree, 'mud-and');
  assert.ok(mutant.arrows.some((x) => x.not), 'the mitigation arrow stays');
  assert.deepEqual(validateTree(mutant), []);
  const onePositive = { ...tree, arrows: tree.arrows.filter((x) => x.id !== 'soil-to-mud'), entities: tree.entities.filter((x) => x.id !== 'soil'), groups: [{ id: 'mud-and', arrows: ['rain-to-mud', 'drain-to-mud'] }] };
  assert.deepEqual(insufficiencyTargets(onePositive), []);
  assert.throws(() => removeCondition(onePositive, 'mud-and'), /fewer than two positive/);
});

test('a condition that also causes another effect stays in the mutant', () => {
  const tree = twoGroup();
  tree.entities.push(e('w'));
  tree.arrows.push(a('y', 'w'), a('x', 'w'));
  const { mutant } = removeCondition(tree, 'z-and');
  assert.equal(mutant.entities.length, 4);
  assert.equal(mutant.arrows.length, 3);
});

function branchTree() {
  return {
    id: 'branch',
    entities: [e('act', 'action'), e('goal'), e('cost', 'effect', true), e('worse', 'effect', true), e('other', 'precondition'), e('shared', 'effect', true)],
    arrows: [a('act', 'goal'), a('act', 'cost'), a('cost', 'worse'), a('cost', 'shared'), a('other', 'shared')],
    groups: [],
  };
}

test('deleting a negative branch removes exclusive descendants and keys the action', () => {
  const tree = branchTree();
  assert.deepEqual(branchTargets(tree), ['cost']);
  const { mutant, entry } = removeBranch(tree, 'cost');
  assert.deepEqual(mutant.entities.map((x) => x.id).sort(), ['act', 'goal', 'other', 'shared']);
  assert.deepEqual(mutant.arrows.map((x) => x.id).sort(), ['act-to-goal', 'other-to-shared']);
  assert.equal(entry.category, 'Possible negative branch');
  assert.deepEqual(entry.matchSet, ['act']);
  assert.match(entry.expected, /\[act\]/);
  assert.deepEqual(validateTree(mutant), []);
});

test('a branch is not a target when the action has no other effect', () => {
  const tree = branchTree();
  tree.arrows = tree.arrows.filter((x) => x.id !== 'act-to-goal');
  tree.entities = tree.entities.filter((x) => x.id !== 'goal');
  assert.deepEqual(branchTargets(tree), []);
  assert.throws(() => removeBranch(tree, 'cost'), /not a negative branch/);
});

test('operators are deterministic and leave the input unchanged', () => {
  const tree = twoGroup();
  const before = JSON.stringify(tree);
  assert.deepEqual(removeCondition(tree, 'z-and'), removeCondition(tree, 'z-and'));
  assert.equal(JSON.stringify(tree), before);
});

test('every operator output on the committed seeds validates and carries a key', () => {
  const dir = join(ROOT, 'eval', 'seeds');
  let count = 0;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const seed = loadTree(join(dir, file));
    const outputs = [
      ...insufficiencyTargets(seed).map((g) => removeCondition(seed, g)),
      ...branchTargets(seed).map((r) => removeBranch(seed, r)),
    ];
    assert.ok(outputs.length >= 2, `${seed.id} yields at least two mutants`);
    for (const { mutant, entry } of outputs) {
      assert.deepEqual(validateTree(mutant), [], `${seed.id} mutant is valid`);
      assert.ok(entry.matchSet.length > 0 && entry.expected, `${seed.id} key is well formed`);
      assert.equal(mutant.checks, undefined, 'mutants carry no seed checks');
      count += 1;
    }
  }
  assert.ok(count >= 12, `about two dozen mutants, got ${count}`);
});

test('a precondition is removed before a condition caused by an action', () => {
  const tree = {
    id: 'prefer',
    entities: [e('act', 'action'), e('done'), e('pre', 'precondition'), e('goal')],
    arrows: [a('act', 'done'), a('done', 'goal'), a('pre', 'goal')],
    groups: [{ id: 'goal-and', arrows: ['done-to-goal', 'pre-to-goal'] }],
  };
  const { mutant } = removeCondition(tree, 'goal-and');
  assert.deepEqual(mutant.arrows.map((x) => x.id), ['act-to-done', 'done-to-goal']);
});
