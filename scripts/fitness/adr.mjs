// Fitness function: the decision records stay a usable log.
//
// - Each file in docs/adr/ is named NNNN-slug.md, numbers start at 1 and have
//   no gaps or repeats, and the title is "# N. ...".
// - Each record has a Date line and a Status section that opens with a known
//   status word.
// - Each record has a Source section with at least one relative link to where
//   the decision came from. The links check (links.mjs) proves the link and its
//   anchor resolve.
// - The index, docs/adr/README.md, lists every record.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { links, section } from './markdown.mjs';

export const STATUSES = ['Proposed', 'Accepted', 'Rejected', 'Deprecated', 'Superseded'];

export function checkAdrs(root) {
  const dir = join(root, 'docs', 'adr');
  const errors = [];
  if (!existsSync(dir)) return { errors: ['docs/adr/ is missing'] };

  const files = readdirSync(dir).filter((n) => n.endsWith('.md') && n !== 'README.md').sort();
  const numbers = [];

  for (const name of files) {
    const where = `docs/adr/${name}`;
    const m = name.match(/^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/);
    if (!m) {
      errors.push(`${where}: name must be NNNN-lower-case-slug.md`);
      continue;
    }
    const n = Number(m[1]);
    numbers.push(n);
    const text = readFileSync(join(dir, name), 'utf8');

    const title = text.split('\n').find((l) => l.startsWith('# '));
    if (!title || !title.startsWith(`# ${n}. `)) errors.push(`${where}: title must start with "# ${n}. "`);
    if (!/^Date: \d{4}-\d{2}-\d{2}\s*$/m.test(text)) errors.push(`${where}: Date line (Date: YYYY-MM-DD) is missing`);

    const status = section(text, 'Status');
    const word = status?.trim().split(/[\s(.]/)[0];
    if (!STATUSES.includes(word)) errors.push(`${where}: Status must open with one of ${STATUSES.join(', ')}`);

    const source = section(text, 'Source');
    const relative = source && links(source).filter((l) => !/^[a-z][a-z0-9+.-]*:/i.test(l.target));
    if (!relative?.length) errors.push(`${where}: Source section with a relative link to its origin is missing`);
  }

  numbers.forEach((n, i) => {
    if (n !== i + 1) errors.push(`docs/adr: expected ADR ${String(i + 1).padStart(4, '0')}, found ${String(n).padStart(4, '0')}`);
  });

  const index = join(dir, 'README.md');
  if (!existsSync(index)) {
    errors.push('docs/adr/README.md (the index) is missing');
  } else {
    const listed = new Set(links(readFileSync(index, 'utf8')).map((l) => l.target.replace(/^\.\//, '').split('#')[0]));
    for (const name of files) if (!listed.has(name)) errors.push(`docs/adr/README.md: ${name} is not listed`);
  }
  return { errors };
}
