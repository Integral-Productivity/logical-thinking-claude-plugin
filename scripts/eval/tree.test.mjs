import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadTree, publicTree, validateTree } from './tree.mjs';

const ROOT = join(import.meta.dirname, '..', '..');

function tree(overrides = {}) {
  return {
    id: 'demo',
    title: 'Demo',
    checks: { negativeBranches: '2026-11-12 agent check: none missing', neutrality: '2026-11-12 manual' },
    entities: [
      { id: 'act', text: 'Do the thing', kind: 'action' },
      { id: 'ready', text: 'Thing is ready', kind: 'effect' },
      { id: 'cond', text: 'Condition holds', kind: 'precondition' },
      { id: 'goal', text: 'Goal is met', kind: 'effect' },
      { id: 'cost', text: 'Cost rises', kind: 'effect', undesirable: true },
    ],
    arrows: [
      { id: 'act-ready', from: 'act', to: 'ready' },
      { id: 'ready-goal', from: 'ready', to: 'goal' },
      { id: 'cond-goal', from: 'cond', to: 'goal' },
      { id: 'act-cost', from: 'act', to: 'cost' },
    ],
    groups: [{ id: 'goal-and', arrows: ['ready-goal', 'cond-goal'] }],
    ...overrides,
  };
}

test('a valid tree has no errors', () => {
  assert.deepEqual(validateTree(tree(), { requireChecks: true }), []);
});

test('an arrow that names a missing entity fails and names the arrow', () => {
  const t = tree();
  t.arrows.push({ id: 'ghost-goal', from: 'ghost', to: 'goal' });
  const errors = validateTree(t);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /ghost-goal/);
});

test('a group whose arrows point to different effects fails', () => {
  const t = tree({ groups: [{ id: 'bad', arrows: ['ready-goal', 'act-cost'] }] });
  assert.match(validateTree(t).join('\n'), /bad.*different effects/);
});

test('a duplicate ID fails', () => {
  const t = tree();
  t.arrows.push({ id: 'act', from: 'act', to: 'goal' });
  assert.match(validateTree(t).join('\n'), /duplicate id act/);
});

test('a seed without both check records fails when checks are required', () => {
  const t = tree({ checks: { neutrality: '2026-11-12 manual' } });
  assert.match(validateTree(t, { requireChecks: true }).join('\n'), /checks\.negativeBranches/);
  assert.deepEqual(validateTree(t), []);
});

test('the public tree keeps only entities, arrows, and groups', () => {
  const p = publicTree(tree());
  assert.deepEqual(Object.keys(p), ['entities', 'arrows', 'groups']);
  assert.ok(!JSON.stringify(p).includes('checks'));
});

const committed = (dir) =>
  readdirSync(join(ROOT, 'eval', dir)).filter((f) => f.endsWith('.json')).map((f) => loadTree(join(ROOT, 'eval', dir, f)));

test('every committed seed and lookalike validates with its check records', () => {
  const trees = [...committed('seeds'), ...committed('lookalikes')];
  assert.equal(committed('seeds').length, 6);
  assert.equal(committed('lookalikes').length, 4);
  for (const t of trees) assert.deepEqual(validateTree(t, { requireChecks: true }), [], t.id);
});

test('every seed has an AND group of two positive conditions and a drawn negative branch', () => {
  for (const t of committed('seeds')) {
    const byId = new Map(t.entities.map((e) => [e.id, e]));
    const arrows = new Map(t.arrows.map((a) => [a.id, a]));
    const hasGroup = t.groups.some((g) => g.arrows.filter((id) => !arrows.get(id).not).length >= 2);
    const hasBranch = t.arrows.some(
      (a) => ['action', 'injection'].includes(byId.get(a.from).kind) && byId.get(a.to).undesirable,
    );
    assert.ok(hasGroup, `${t.id} has no AND group of two positive conditions`);
    assert.ok(hasBranch, `${t.id} has no negative branch below an action or injection`);
  }
});
