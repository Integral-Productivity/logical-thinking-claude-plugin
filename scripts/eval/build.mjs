// Builds the evaluation set into eval/cases/. Run `node scripts/eval/build.mjs`
// after changing a seed, lookalike, hand-written case, or operator; the drift
// test fails until the committed cases match a fresh build.
//
// Each case directory holds tree.json (the tree as a reviewer sees it) and
// key.json (the repaired twin and the seeded defects, in position order).
// manifest.json lists every case with its kind, operators, and twin.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadTree, publicTree, validateTree } from './tree.mjs';
import { branchTargets, insufficiencyTargets, removeBranch, removeCondition } from './operators.mjs';

export const CLEAN_KINDS = ['clean seed', 'lookalike', 'clean twin'];
const TWO_DEFECT_TREES = 3;

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function readDir(dir) {
  return readdirSync(dir).filter((f) => !f.startsWith('.')).sort();
}

function checked(tree, label, options) {
  const errors = validateTree(tree, options);
  if (errors.length) throw new Error(`${label}: ${errors.join('; ')}`);
  return tree;
}

const keyed = (twin, entries) => ({ twin, entries: entries.map((entry, i) => ({ position: i + 1, ...entry })) });

// Returns a map from path (relative to eval/cases/) to file content.
export function buildSet(root) {
  const evalDir = join(root, 'eval');
  const cases = [];
  const add = (id, kind, tree, key, operators = []) => cases.push({ id, kind, operators, twin: key.twin, tree, key });
  const clean = (tree, kind) => add(tree.id, kind, tree, { twin: null, entries: [] });

  const seeds = readDir(join(evalDir, 'seeds')).map((f) => checked(loadTree(join(evalDir, 'seeds', f)), `seed ${f}`, { requireChecks: true }));
  for (const seed of seeds) clean(seed, 'clean seed');
  for (const f of readDir(join(evalDir, 'lookalikes'))) clean(checked(loadTree(join(evalDir, 'lookalikes', f)), `lookalike ${f}`, { requireChecks: true }), 'lookalike');

  for (const seed of seeds) {
    for (const group of insufficiencyTargets(seed)) {
      const { mutant, entry } = removeCondition(seed, group);
      add(`${seed.id}-insufficient-${group}`, 'mutant', mutant, keyed(seed.id, [entry]), ['insufficiency']);
    }
    for (const branch of branchTargets(seed)) {
      const { mutant, entry } = removeBranch(seed, branch);
      add(`${seed.id}-no-${branch}`, 'mutant', mutant, keyed(seed.id, [entry]), ['side effect']);
    }
  }

  // Two-defect trees: an insufficiency mutant that also loses a negative
  // branch the first operator did not touch.
  let twoDefect = 0;
  for (const seed of seeds) {
    if (twoDefect === TWO_DEFECT_TREES) break;
    const [group] = insufficiencyTargets(seed);
    if (!group) continue;
    const first = removeCondition(seed, group);
    const [branch] = branchTargets(first.mutant).filter((b) => branchTargets(seed).includes(b));
    if (!branch) continue;
    const second = removeBranch(first.mutant, branch);
    add(`${seed.id}-two-defect`, 'two-defect', second.mutant, keyed(seed.id, [first.entry, second.entry]), ['insufficiency', 'side effect']);
    twoDefect += 1;
  }

  for (const id of readDir(join(evalDir, 'handwritten'))) {
    const dir = join(evalDir, 'handwritten', id);
    const tree = checked(loadTree(join(dir, 'tree.json')), `hand-written case ${id}`);
    const twin = checked(loadTree(join(dir, 'twin.json')), `hand-written case ${id} twin`, { requireChecks: true });
    const { entries } = loadTree(join(dir, 'key.json'));
    clean(twin, 'clean twin');
    add(id, 'hand-written', tree, { twin: twin.id, entries }, []);
  }

  const files = new Map();
  for (const c of cases) {
    files.set(`${c.id}/tree.json`, json(publicTree(c.tree)));
    files.set(`${c.id}/key.json`, json(c.key));
  }
  files.set('manifest.json', json({ cases: cases.map(({ id, kind, operators, twin }) => ({ id, kind, operators, twin })) }));
  return files;
}

export function writeSet(root) {
  const out = join(root, 'eval', 'cases');
  rmSync(out, { recursive: true, force: true });
  const files = buildSet(root);
  for (const [path, content] of files) {
    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), content);
  }
  return files.size;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const count = writeSet(join(import.meta.dirname, '..', '..'));
  console.log(`wrote ${count} files to eval/cases/`);
}
