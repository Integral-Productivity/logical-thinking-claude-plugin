import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCases, runEvaluation } from './run.mjs';
import { appendLedgerRows } from './ledger.mjs';
import { reviewerVersion } from './version.mjs';

const ROOT = join(import.meta.dirname, '..', '..');

function sandbox(t) {
  const dir = mkdtempSync(join(tmpdir(), 'eval-run-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const ledger = join(dir, 'QUALITY.md');
  copyFileSync(join(ROOT, 'QUALITY.md'), ledger);
  return { dir, ledger, runsDir: join(dir, 'runs') };
}

// Writes a findings directory that finds every seeded defect and stays
// silent on clean cases; `skip` drops one defect from one run.
function perfectFindings(dir, runs, skip) {
  for (let k = 1; k <= runs; k += 1) {
    const out = join(dir, 'findings', `run-${k}`);
    mkdirSync(out, { recursive: true });
    for (const c of loadCases(ROOT)) {
      const lines = c.key.entries
        .filter((e) => !(skip && skip.run === k && skip.case === c.id && skip.position === e.position))
        .map((e) => `- **${e.category}.** Some entity [${e.matchSet[0]}]: a sentence.`);
      writeFileSync(join(out, `${c.id}.txt`), lines.join('\n'));
    }
  }
  return join(dir, 'findings');
}

const ledgerRows = (path) => readFileSync(path, 'utf8').split('\n').filter((l) => /^\| 2026-01-02 /.test(l));
const options = (s, extra) => ({ root: ROOT, model: 'test-model', runs: 3, ledger: s.ledger, runsDir: s.runsDir, date: '2026-01-02', stamp: 'stamp', ...extra });

test('a perfect findings set passes MS1 and adds two ledger rows per run', (t) => {
  const s = sandbox(t);
  const outcome = runEvaluation(options(s, { findingsDir: perfectFindings(s.dir, 3) }));
  assert.equal(outcome.ms1.pass, true, outcome.ms1.reasons.join('; '));
  const rows = ledgerRows(s.ledger);
  assert.equal(rows.length, 6);
  assert.match(rows[0], /\| Cause insufficiency \| \d+\/\d+ \(100%\)/);
  assert.match(rows[1], /\| Possible negative branch \|/);
  assert.match(rows[0], /\| not measured \|/);
  assert.ok(readdirSync(join(s.runsDir, 'stamp-run-1')).includes('result.json'));
});

test('one missed defect in one run fails MS1 and names the run, operator, and case', (t) => {
  const s = sandbox(t);
  const target = loadCases(ROOT).find((c) => c.kind === 'two-defect');
  const findingsDir = perfectFindings(s.dir, 3, { run: 2, case: target.id, position: 2 });
  const { ms1 } = runEvaluation(options(s, { findingsDir }));
  assert.equal(ms1.pass, false);
  assert.deepEqual(ms1.reasons, [`run 2: side effect defect missed in ${target.id} (position 2)`]);
});

test('a twin breach fails MS1 even when every defect is found', (t) => {
  const s = sandbox(t);
  const findingsDir = perfectFindings(s.dir, 1);
  const mutant = loadCases(ROOT).find((c) => c.kind === 'mutant');
  const [entry] = mutant.key.entries;
  writeFileSync(join(findingsDir, 'run-1', `${mutant.twin}.txt`), `${entry.category}. Twin [${entry.matchSet[0]}]: false alarm.`);
  const { ms1, runs } = runEvaluation(options(s, { findingsDir, runs: 1 }));
  assert.ok(runs[0].result.categories.every((c) => c.found === c.seeded));
  assert.equal(ms1.pass, false);
  assert.ok(ms1.reasons.some((r) => r.startsWith(`run 1: twin breach in ${mutant.twin}`)));
});

test('fewer than three runs cannot pass MS1', (t) => {
  const s = sandbox(t);
  const { ms1 } = runEvaluation(options(s, { findingsDir: perfectFindings(s.dir, 1), runs: 1 }));
  assert.equal(ms1.pass, false);
  assert.deepEqual(ms1.reasons, ['only 1 run(s); MS1 needs three runs per reviewer version']);
});

test('the ledger writer replaces the placeholder, then appends, and leaves the rest unchanged', (t) => {
  const s = sandbox(t);
  const before = readFileSync(s.ledger, 'utf8');
  appendLedgerRows(s.ledger, ['| a | b | c | d | e | f | g |']);
  const once = readFileSync(s.ledger, 'utf8');
  assert.equal(once, before.replace(/^\| None yet \|.*$/m, '| a | b | c | d | e | f | g |'));
  appendLedgerRows(s.ledger, ['| h | i | j | k | l | m | n |']);
  assert.equal(readFileSync(s.ledger, 'utf8'), once.replace('| a | b | c | d | e | f | g |', '| a | b | c | d | e | f | g |\n| h | i | j | k | l | m | n |'));
});

test('the reviewer version shows none for missing skill and vocabulary folders', (t) => {
  const s = sandbox(t);
  mkdirSync(join(s.dir, 'eval', 'cases'), { recursive: true });
  writeFileSync(join(s.dir, 'eval', 'cases', 'manifest.json'), '{}');
  assert.match(reviewerVersion(s.dir, 'm1'), /^skill:none vocab:none set:[0-9a-f]{8} model:m1$/);
});

test('a reviewer that echoes its input finds nothing, and its input holds no key data', (t) => {
  const s = sandbox(t);
  const { ms1 } = runEvaluation(options(s, { reviewer: 'cat', runs: 1 }));
  assert.equal(ms1.pass, false);
  for (const c of loadCases(ROOT)) {
    const input = JSON.parse(readFileSync(join(s.runsDir, 'stamp-run-1', `${c.id}.txt`), 'utf8'));
    assert.deepEqual(Object.keys(input), ['entities', 'arrows', 'groups']);
  }
});

test('a reviewer that exits non-zero stops the run and writes no ledger row', (t) => {
  const s = sandbox(t);
  const before = readFileSync(s.ledger, 'utf8');
  assert.throws(() => runEvaluation(options(s, { reviewer: 'exit 3', runs: 1 })), /reviewer failed on case \S+ with exit code 3/);
  assert.equal(readFileSync(s.ledger, 'utf8'), before);
  const record = JSON.parse(readFileSync(join(s.runsDir, 'stamp-run-1', 'result.json'), 'utf8'));
  assert.equal(record.incomplete, true);
});

test('a run count that is not a whole number of 1 or more stops before any write', (t) => {
  for (const runs of [Number('three'), 0, 1.5]) {
    const s = sandbox(t);
    const before = readFileSync(s.ledger, 'utf8');
    assert.throws(() => runEvaluation(options(s, { findingsDir: s.dir, runs })), /--runs must be a whole number/);
    assert.equal(readFileSync(s.ledger, 'utf8'), before);
  }
});

test('a missing model, or both or neither of reviewer and findings, stops the run', (t) => {
  const s = sandbox(t);
  assert.throws(() => runEvaluation(options(s, { model: undefined, findingsDir: s.dir })), /--model is required/);
  assert.throws(() => runEvaluation(options(s, { reviewer: 'true', findingsDir: s.dir })), /exactly one/);
  assert.throws(() => runEvaluation(options(s, {})), /exactly one/);
});
