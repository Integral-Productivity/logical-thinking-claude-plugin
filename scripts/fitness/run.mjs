// Runs every architecture fitness function against a repository root and
// fails when any of them finds a break. CI calls this on every pull request.
//
//   node scripts/fitness/run.mjs [root]

import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkAdrs } from './adr.mjs';
import { checkBoundaries } from './boundaries.mjs';
import { checkLinks } from './links.mjs';
import { checkNeutrality, loadDenylist } from './neutrality.mjs';
import { checkTraceability } from './traceability.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));

export async function runAll(root) {
  return {
    'ADR log': checkAdrs(root),
    'Markdown links': checkLinks(root),
    'FF3 neutrality': checkNeutrality(root, loadDenylist(join(here, 'neutrality-denylist.txt'))),
    'FF4 logic, not structure': await checkBoundaries(root),
    'FF9 strategy traceability': checkTraceability(root),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const results = await runAll(resolve(process.argv[2] ?? '.'));
  let failed = 0;
  for (const [name, { errors }] of Object.entries(results)) {
    console.log(`${errors.length ? 'FAIL' : 'ok  '} ${name}`);
    for (const e of errors) console.log(`     ${e}`);
    failed += errors.length;
  }
  if (failed) {
    console.error(`\n${failed} fitness break(s).`);
    process.exit(1);
  }
}
