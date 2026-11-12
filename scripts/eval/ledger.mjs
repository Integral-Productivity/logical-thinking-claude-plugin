// Appends rows to the results ledger table in QUALITY.md. The first write
// replaces the "None yet" placeholder row; later writes go after the last row.

import { readFileSync, writeFileSync } from 'node:fs';

const HEADER = /^\| Date \| Reviewer version \|/;
const PLACEHOLDER = /^\| None yet \|/;

export function appendLedgerRows(path, rows) {
  const lines = readFileSync(path, 'utf8').split('\n');
  const header = lines.findIndex((l) => HEADER.test(l));
  if (header < 0) throw new Error(`${path} has no results ledger table`);
  let end = header + 2;
  while (end < lines.length && lines[end].startsWith('|')) end += 1;
  const placeholder = lines.findIndex((l, i) => i > header && i < end && PLACEHOLDER.test(l));
  if (placeholder >= 0) lines.splice(placeholder, 1, ...rows);
  else lines.splice(end, 0, ...rows);
  writeFileSync(path, lines.join('\n'));
}
