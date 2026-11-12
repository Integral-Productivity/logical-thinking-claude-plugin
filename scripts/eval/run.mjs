// Runs the review on every case, scores each run, and records the results.
//
//   node scripts/eval/run.mjs --model <name> --reviewer "<command>" [--runs 3] [--ledger QUALITY.md]
//   node scripts/eval/run.mjs --model <name> --findings <dir>
//
// The reviewer command runs once per case, with the case tree as JSON on
// standard input and CASE_ID in its environment; it prints findings on
// standard output. With --findings, saved outputs are scored instead: the
// file for run k and a case is <dir>/run-<k>/<case>.txt, else <dir>/<case>.txt.
// Raw outputs and result.json for each run go to eval/runs/<run-id>/.
// MS1 passes only when every run finds every seeded defect and no repaired
// twin draws a finding that a key would have matched.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { parseFindings } from './findings.mjs';
import { score } from './score.mjs';
import { CATEGORIES } from './categories.mjs';
import { appendLedgerRows } from './ledger.mjs';
import { reviewerVersion } from './version.mjs';

const OPERATOR = { [CATEGORIES.insufficiency]: 'insufficiency', [CATEGORIES.sideEffect]: 'side effect' };

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

function savedFindings(dir, k, id) {
  const path = [join(dir, `run-${k}`, `${id}.txt`), join(dir, `${id}.txt`)].find((p) => existsSync(p));
  return path ? readFileSync(path, 'utf8') : '';
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
  const cases = loadCases(root);
  const version = reviewerVersion(root, model);
  const outcomes = [];

  for (let k = 1; k <= runs; k += 1) {
    const runId = `${stamp}-run-${k}`;
    const out = join(runsDir, runId);
    mkdirSync(out, { recursive: true });
    const parsed = {};
    for (const c of cases) {
      let text;
      try {
        text = reviewer ? review(reviewer, c) : savedFindings(findingsDir, k, c.id);
      } catch (error) {
        writeFileSync(join(out, 'result.json'), `${JSON.stringify({ runId, version, incomplete: true, failedCase: c.id, error: error.message }, null, 2)}\n`);
        throw error;
      }
      writeFileSync(join(out, `${c.id}.txt`), text);
      parsed[c.id] = parseFindings(text);
    }
    const result = score(cases, parsed);
    writeFileSync(join(out, 'result.json'), `${JSON.stringify({ runId, version, ...result }, null, 2)}\n`);
    outcomes.push({ runId, result });
  }

  const reasons = outcomes.flatMap((o, i) => ms1Reasons(i + 1, o.result));
  if (runs < 3) reasons.push(`only ${runs} run(s); MS1 needs three runs per reviewer version`);
  appendLedgerRows(ledger, outcomes.flatMap((o) => o.result.categories.map((r) => ledgerRow(date, version, o.runId, r))));
  return { version, runs: outcomes, ms1: { pass: reasons.length === 0, reasons } };
}

if (import.meta.url === `file://${process.argv[1]}`) {
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
