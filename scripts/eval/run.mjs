// Runs the review on every case, scores each run, and records the results.
//
//   node scripts/eval/run.mjs --model <name> --reviewer "<command>" [--runs 3] [--ledger QUALITY.md]
//   node scripts/eval/run.mjs --model <name> --findings <dir>
//
// The reviewer command runs once per case, with the case tree as JSON on
// standard input and CASE_ID in its environment; it prints findings on
// standard output. With --findings, saved outputs are scored instead: the
// file for run k and a case is <dir>/run-<k>/<case>.txt. A flat folder of
// <dir>/<case>.txt files holds one set of outputs, so it scores as one run
// whatever --runs says, and cannot pass MS1 alone.
// Raw outputs and result.json for each run go to eval/runs/<run-id>/.
// MS1 passes only when every run finds every seeded defect and no repaired
// twin draws a finding that a key would have matched.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { parseFindings } from './findings.mjs';
import { score } from './score.mjs';
import { OPERATOR } from './categories.mjs';
import { json } from './build.mjs';
import { appendLedgerRows } from './ledger.mjs';
import { reviewerVersion } from './version.mjs';

export function loadCases(root) {
  const dir = join(root, 'eval', 'cases');
  const { cases } = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
  return cases.map((c) => ({
    ...c,
    key: JSON.parse(readFileSync(join(dir, c.id, 'key.json'), 'utf8')),
    input: readFileSync(join(dir, c.id, 'tree.json'), 'utf8'),
  }));
}

function review(reviewer, c) {
  const out = spawnSync('sh', ['-c', reviewer], { input: c.input, encoding: 'utf8', env: { ...process.env, CASE_ID: c.id } });
  if (out.status !== 0) {
    throw new Error(`reviewer failed on case ${c.id} with exit code ${out.status ?? out.signal}${out.stderr ? `: ${out.stderr.trim()}` : ''}`);
  }
  return out.stdout;
}

// A findings folder is flat when it has no run-1 subfolder.
const isFlat = (dir) => !existsSync(join(dir, 'run-1'));

function savedFindings(dir, k, id) {
  const folder = isFlat(dir) ? dir : join(dir, `run-${k}`);
  if (!existsSync(folder)) throw new Error(`findings folder ${folder} is missing`);
  const path = join(folder, `${id}.txt`);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function ms1Reasons(k, result) {
  return result.categories.flatMap((r) => [
    ...r.misses.map((m) => `run ${k}: ${OPERATOR[r.category]} defect missed in ${m.case} (position ${m.position})`),
    ...r.twinBreaches.map((b) => `run ${k}: twin breach in ${b.case} (${r.category}, twin of ${b.mutant})`),
  ]);
}

function ledgerRow(date, version, runId, r) {
  const pct = r.seeded ? Math.round((100 * r.found) / r.seeded) : 0;
  const positions = Object.entries(r.byPosition).map(([p, s]) => `${p}: ${s.found}/${s.seeded}`).join(', ');
  const notes = `run ${runId}; twin breaches ${r.twinBreaches.length}; unmatched ${r.unmatched.length}`;
  return `| ${date} | ${version} | ${r.category} | ${r.found}/${r.seeded} (${pct}%); by position ${positions} | ${r.m2} | not measured | ${notes} |`;
}

export function runEvaluation({ root, model, reviewer, findingsDir, runs = 3, ledger, runsDir, date, stamp }) {
  if (!model) throw new Error('--model is required');
  if (!reviewer === !findingsDir) throw new Error('give exactly one of --reviewer and --findings');
  if (!Number.isInteger(runs) || runs < 1) throw new Error(`--runs must be a whole number of 1 or more, not ${runs}`);
  const cases = loadCases(root);
  const version = reviewerVersion(root, model);
  const outcomes = [];
  const count = findingsDir && isFlat(findingsDir) ? 1 : runs;

  for (let k = 1; k <= count; k += 1) {
    const runId = `${stamp}-run-${k}`;
    const out = join(runsDir, runId);
    mkdirSync(out, { recursive: true });
    const parsed = {};
    for (const c of cases) {
      let text;
      try {
        text = reviewer ? review(reviewer, c) : savedFindings(findingsDir, k, c.id);
      } catch (error) {
        writeFileSync(join(out, 'result.json'), json({ runId, version, incomplete: true, failedCase: c.id, error: error.message }));
        throw error;
      }
      writeFileSync(join(out, `${c.id}.txt`), text);
      parsed[c.id] = parseFindings(text);
    }
    const result = score(cases, parsed);
    writeFileSync(join(out, 'result.json'), json({ runId, version, ...result }));
    outcomes.push({ runId, result });
  }

  const reasons = outcomes.flatMap((o, i) => ms1Reasons(i + 1, o.result));
  if (count < runs) reasons.push(`the findings folder has no run-<k> subfolders, so it counts as one run`);
  if (!(count >= 3)) reasons.push(`only ${count} run(s); MS1 needs three runs per reviewer version`);
  appendLedgerRows(ledger, outcomes.flatMap((o) => o.result.categories.map((r) => ledgerRow(date, version, o.runId, r))));
  return { version, runs: outcomes, ms1: { pass: reasons.length === 0, reasons } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const root = join(import.meta.dirname, '..', '..');
  const { values } = parseArgs({
    options: {
      model: { type: 'string' },
      reviewer: { type: 'string' },
      findings: { type: 'string' },
      runs: { type: 'string', default: '3' },
      ledger: { type: 'string', default: join(root, 'QUALITY.md') },
    },
  });
  const now = new Date();
  try {
    const { version, ms1 } = runEvaluation({
      root,
      model: values.model,
      reviewer: values.reviewer,
      findingsDir: values.findings,
      runs: Number(values.runs),
      ledger: values.ledger,
      runsDir: join(root, 'eval', 'runs'),
      date: now.toISOString().slice(0, 10),
      stamp: now.toISOString().replace(/[:.]/g, '-'),
    });
    console.log(`reviewer version: ${version}`);
    console.log(ms1.pass ? 'MS1: pass' : `MS1: fail\n${ms1.reasons.map((r) => `  - ${r}`).join('\n')}`);
    process.exitCode = ms1.pass ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
