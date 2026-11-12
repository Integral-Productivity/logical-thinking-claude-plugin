// The reviewer version: short hashes of the skill text, the vocabulary, and
// the evaluation set, plus the model name. A missing folder hashes as `none`.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

function hashDirs(root, dirs) {
  const present = dirs.map((d) => join(root, d)).filter((d) => existsSync(d));
  if (present.length === 0) return 'none';
  const hash = createHash('sha256');
  for (const dir of present) {
    const files = readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => join(d.parentPath, d.name))
      .sort();
    for (const file of files) hash.update(`${relative(root, file)}\0`).update(readFileSync(file)).update('\0');
  }
  return hash.digest('hex').slice(0, 8);
}

export function reviewerVersion(root, model) {
  const skill = hashDirs(root, ['skills/clr-review']);
  const vocab = hashDirs(root, ['vocabulary']);
  const set = hashDirs(root, ['eval/cases', 'eval/handwritten']);
  return `skill:${skill} vocab:${vocab} set:${set} model:${model}`;
}
