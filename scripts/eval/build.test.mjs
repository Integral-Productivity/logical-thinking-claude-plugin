import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { buildSet } from './build.mjs';

const ROOT = join(import.meta.dirname, '..', '..');
const CASES = join(ROOT, 'eval', 'cases');

function listFiles(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => relative(dir, join(d.parentPath, d.name)))
    .sort();
}

test('the committed cases match a fresh build', () => {
  const built = buildSet(ROOT);
  assert.deepEqual(listFiles(CASES), [...built.keys()].sort(), 'same file list; run node scripts/eval/build.mjs');
  for (const [path, content] of built) {
    assert.equal(readFileSync(join(CASES, path), 'utf8'), content, `${path} is stale; run node scripts/eval/build.mjs`);
  }
});

const manifest = () => JSON.parse(buildSet(ROOT).get('manifest.json'));
const key = (id) => JSON.parse(buildSet(ROOT).get(`${id}/key.json`));

test('the set has the planned shape', () => {
  const counts = {};
  for (const c of manifest().cases) counts[c.kind] = (counts[c.kind] ?? 0) + 1;
  assert.equal(counts['clean seed'], 6);
  assert.equal(counts.lookalike, 4);
  assert.equal(counts['clean twin'], 3);
  assert.equal(counts['two-defect'], 3);
  assert.equal(counts['hand-written'], 3);
  assert.ok(counts.mutant >= 12);
});

test('a two-defect key lists insufficiency first, each entry with its own match set', () => {
  for (const c of manifest().cases.filter((x) => x.kind === 'two-defect')) {
    const { entries } = key(c.id);
    assert.deepEqual(entries.map((x) => [x.position, x.category]), [[1, 'Cause insufficiency'], [2, 'Possible negative branch']]);
    assert.ok(entries.every((x) => x.matchSet.length > 0));
  }
});

test('every defect case names a twin that is a clean case, and clean cases have empty keys', () => {
  const cases = manifest().cases;
  const clean = new Set(cases.filter((c) => ['clean seed', 'lookalike', 'clean twin'].includes(c.kind)).map((c) => c.id));
  for (const c of cases) {
    if (clean.has(c.id)) {
      assert.deepEqual(key(c.id), { twin: null, entries: [] }, `${c.id} has an empty key`);
    } else {
      assert.ok(clean.has(c.twin), `${c.id} twin ${c.twin} is a clean case`);
      assert.equal(key(c.id).twin, c.twin);
      assert.ok(key(c.id).entries.length > 0);
    }
  }
});

test('case trees hold no key, check, or title data', () => {
  for (const [path, content] of buildSet(ROOT)) {
    if (!path.endsWith('tree.json')) continue;
    assert.deepEqual(Object.keys(JSON.parse(content)), ['entities', 'arrows', 'groups'], path);
  }
});

test('a hand-written case that fails validation stops the build with its case ID', () => {
  const dir = mkdtempSync(join(tmpdir(), 'eval-build-'));
  try {
    for (const sub of ['seeds', 'lookalikes', 'handwritten']) cpSync(join(ROOT, 'eval', sub), join(dir, 'eval', sub), { recursive: true });
    const path = join(dir, 'eval', 'handwritten', 'bike-lane', 'tree.json');
    const tree = JSON.parse(readFileSync(path, 'utf8'));
    tree.arrows.push({ id: 'ghost-arrow', from: 'nowhere', to: tree.entities[0].id });
    writeFileSync(path, JSON.stringify(tree));
    assert.throws(() => buildSet(dir), /bike-lane/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
