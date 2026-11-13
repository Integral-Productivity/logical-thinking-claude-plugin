// Fitness function: every relative link in the repository's Markdown resolves.
// A link to a Markdown heading must name an anchor that the target file has.
// This keeps each ADR's link to its source section honest when a note is
// edited or a heading is renamed.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { anchors, links, walk } from './markdown.mjs';

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function checkLinks(root) {
  const errors = [];
  const anchorCache = new Map();
  const anchorsOf = (path) => {
    if (!anchorCache.has(path)) anchorCache.set(path, anchors(readFileSync(path, 'utf8')));
    return anchorCache.get(path);
  };

  for (const file of walk(root, (n) => n.endsWith('.md'))) {
    const abs = join(root, file);
    for (const { target, line } of links(readFileSync(abs, 'utf8'))) {
      if (EXTERNAL.test(target)) continue;
      const [rawPath, anchor] = target.split('#');
      const path = rawPath ? normalize(join(dirname(abs), decodeURI(rawPath))) : abs;
      const where = `${file}:${line}`;
      if (!existsSync(path)) {
        errors.push(`${where}: link target ${rawPath} does not exist`);
        continue;
      }
      if (anchor && path.endsWith('.md') && !anchorsOf(path).has(anchor.toLowerCase())) {
        errors.push(`${where}: anchor #${anchor} is not a heading in ${rawPath || file}`);
      }
    }
  }
  return { errors };
}
