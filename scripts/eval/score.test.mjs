import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFindings } from './findings.mjs';
import { score } from './score.mjs';

test('a finding line parses to its category, ID, and text', () => {
  const { findings, unreadable } = parseFindings('- **Cause insufficiency.** Late deliveries [late-deliveries]: one cause is not enough.\n\n');
  assert.deepEqual(unreadable, []);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].category, 'Cause insufficiency');
  assert.equal(findings[0].id, 'late-deliveries');
});

test('a line with no bracketed ID is unreadable', () => {
  const { findings, unreadable } = parseFindings('1. Cause insufficiency: the effect needs more.\nNo other findings.');
  assert.deepEqual(findings, []);
  assert.equal(unreadable.length, 2);
});

const insufficient = {
  id: 'seed-insufficient', kind: 'mutant', twin: 'seed',
  key: { twin: 'seed', entries: [{ position: 1, category: 'Cause insufficiency', matchSet: ['late', 'peaks-to-late', 'peaks'] }] },
};
const sideEffect = {
  id: 'seed-no-cost', kind: 'mutant', twin: 'seed',
  key: { twin: 'seed', entries: [{ position: 1, category: 'Possible negative branch', matchSet: ['hire'] }] },
};
const twoDefect = {
  id: 'seed-two-defect', kind: 'two-defect', twin: 'seed',
  key: {
    twin: 'seed',
    entries: [
      { position: 1, category: 'Cause insufficiency', matchSet: ['late', 'peaks'] },
      { position: 2, category: 'Possible negative branch', matchSet: ['hire'] },
    ],
  },
};
const clean = (id, kind = 'clean seed') => ({ id, kind, twin: null, key: { twin: null, entries: [] } });
const run = (cases, text) => score(cases, Object.fromEntries(Object.entries(text).map(([id, t]) => [id, parseFindings(t)])));
const cat = (result, name) => result.categories.find((c) => c.category === name);

for (const id of ['late', 'peaks-to-late', 'peaks']) {
  test(`an insufficiency finding on ${id} counts the defect as found, whatever the sentence says`, () => {
    const r = run([insufficient, clean('seed')], { 'seed-insufficient': `Cause insufficiency. Something [${id}]. Nonsense words.` });
    assert.deepEqual(cat(r, 'Cause insufficiency').byPosition, { 1: { seeded: 1, found: 1 } });
    assert.deepEqual(cat(r, 'Cause insufficiency').misses, []);
  });
}

test('a right-category finding outside the match set is unmatched, not found', () => {
  const r = run([insufficient, clean('seed')], { 'seed-insufficient': 'Cause insufficiency. Other [on-time]: wrong place.' });
  const c = cat(r, 'Cause insufficiency');
  assert.equal(c.found, 0);
  assert.deepEqual(c.misses, [{ case: 'seed-insufficient', position: 1 }]);
  assert.deepEqual(c.unmatched, [{ case: 'seed-insufficient', id: 'on-time' }]);
  assert.equal(c.m2, 0);
});

test('an insufficiency finding on the twin counts toward M2 and is a twin breach', () => {
  const r = run([insufficient, clean('seed')], {
    'seed-insufficient': 'Cause insufficiency. Late [late]: missing cause.',
    seed: 'Cause insufficiency. Late [late]: missing cause.',
  });
  const c = cat(r, 'Cause insufficiency');
  assert.equal(c.m2, 1);
  assert.deepEqual(c.twinBreaches, [{ case: 'seed', mutant: 'seed-insufficient', position: 1 }]);
});

test('a possible negative branch finding on the keyed action counts as found', () => {
  const r = run([sideEffect, clean('seed')], { 'seed-no-cost': '- **Possible negative branch:** Hire drivers [hire] also raises cost.' });
  assert.equal(cat(r, 'Possible negative branch').found, 1);
});

test('a clarity finding on a gate lookalike is logged and leaves M2 unchanged', () => {
  const r = run([clean('gate', 'lookalike')], { gate: 'Clarity. Light on [lamp]: unclear wording.' });
  assert.equal(cat(r, 'Cause insufficiency').m2, 0);
  assert.equal(cat(r, 'Possible negative branch').m2, 0);
  assert.deepEqual(r.logged, [{ case: 'gate', category: 'Clarity', id: 'lamp' }]);
});

test('a two-defect tree with only the first defect found shows the miss at position 2', () => {
  const r = run([twoDefect, clean('seed')], { 'seed-two-defect': 'Cause insufficiency. Late [late]: missing cause.' });
  const ci = cat(r, 'Cause insufficiency');
  const nb = cat(r, 'Possible negative branch');
  assert.equal(ci.found + nb.found, 1);
  assert.equal(ci.seeded + nb.seeded, 2);
  assert.deepEqual(nb.byPosition, { 2: { seeded: 1, found: 0 } });
  assert.deepEqual(nb.misses, [{ case: 'seed-two-defect', position: 2 }]);
});

test('an insufficiency finding on a side-effect mutant counts toward M2', () => {
  const r = run([sideEffect, clean('seed')], { 'seed-no-cost': 'Cause insufficiency. Late [late]: missing cause.' });
  assert.equal(cat(r, 'Cause insufficiency').m2, 1);
  assert.deepEqual(cat(r, 'Cause insufficiency').falseFindings, [{ case: 'seed-no-cost', id: 'late' }]);
});

test('unreadable lines are logged with their case', () => {
  const r = run([clean('seed')], { seed: 'Looks fine to me.' });
  assert.deepEqual(r.unreadable, [{ case: 'seed', line: 'Looks fine to me.' }]);
});
