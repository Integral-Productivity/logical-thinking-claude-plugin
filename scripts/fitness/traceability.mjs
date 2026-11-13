// Fitness function FF9 (all characteristics): every strategy item is traced.
// QUALITY.md gives each STRATEGY.md item a stable ID in its "Strategy IDs"
// table. Each ID must appear somewhere else in QUALITY.md, ARCHITECTURE.md, or
// an ADR, so that no strategy claim is left without a metric, a milestone, a
// check, or a decision behind it. An ID found only in the table is an
// undeveloped claim.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function strategyIds(quality) {
  const lines = quality.split('\n');
  const start = lines.findIndex((l) => /^###\s+Strategy IDs\s*$/.test(l));
  if (start < 0) return null;
  const ids = [];
  for (const line of lines.slice(start + 1)) {
    if (/^#/.test(line)) break;
    const m = line.match(/^\|\s*([A-Z]{1,3}\d+)\s*\|/);
    if (m) ids.push(m[1]);
  }
  return ids;
}

export function checkTraceability(root) {
  const qualityPath = join(root, 'QUALITY.md');
  if (!existsSync(qualityPath)) return { errors: ['QUALITY.md is missing'] };
  const quality = readFileSync(qualityPath, 'utf8');
  const ids = strategyIds(quality);
  if (!ids?.length) return { errors: ['QUALITY.md: the Strategy IDs table is missing or empty'] };

  const errors = [];
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const id of new Set(dupes)) errors.push(`QUALITY.md: strategy ID ${id} is defined twice`);

  // Everything except the ID table rows themselves.
  const tableRow = (id) => new RegExp(`^\\|\\s*${id}\\s*\\|`);
  const corpus = [quality];
  const arch = join(root, 'ARCHITECTURE.md');
  if (existsSync(arch)) corpus.push(readFileSync(arch, 'utf8'));
  const adrDir = join(root, 'docs', 'adr');
  if (existsSync(adrDir)) {
    for (const n of readdirSync(adrDir).filter((n) => n.endsWith('.md'))) corpus.push(readFileSync(join(adrDir, n), 'utf8'));
  }
  const lines = corpus.join('\n').split('\n');

  for (const id of new Set(ids)) {
    const word = new RegExp(`(?<![A-Za-z0-9-])${id}(?![0-9])`);
    if (!lines.some((l) => !tableRow(id).test(l) && word.test(l))) {
      errors.push(`QUALITY.md: strategy item ${id} links to no metric, milestone, check, or decision`);
    }
  }
  return { errors };
}
