// Fitness function FF3 (AC4, boundary B4): examples, fixtures, and docs stay
// neutral. A neutral file names no real person, company, or private figure.
//
// The check fails on three things a machine can see:
// - an email address,
// - a currency figure such as a dollar amount,
// - a word or word pair whose SHA-256 hash is on the denylist. The denylist
//   holds hashes, so the check itself names no one.
//
// Proper nouns that are not on the denylist still need a person's review; the
// check cannot tell a real name from an invented one.

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { walk } from './markdown.mjs';

// Paths whose files must be neutral. Top-level Markdown files count too.
export const NEUTRAL_DIRS = ['docs', 'eval', 'skills', 'vocabulary'];
const TEXT = /\.(md|json|html|txt|ya?ml|csv)$/;

const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.\p{L}{2,}/u;
const CURRENCY = /[$€£¥]\s?\d|\b\d[\d,.]*\s?(?:USD|EUR|GBP)\b/;

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

export function loadDenylist(path) {
  return new Set(
    readFileSync(path, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^[0-9a-f]{64}$/.test(l)),
  );
}

// The problems in one line of text, as short reasons.
export function lineProblems(line, denylist) {
  const out = [];
  if (EMAIL.test(line)) out.push('an email address');
  if (CURRENCY.test(line)) out.push('a currency figure');
  const words = line.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  for (let i = 0; i < words.length; i++) {
    const pair = i + 1 < words.length ? `${words[i]} ${words[i + 1]}` : null;
    if (denylist.has(sha256(words[i])) || (pair && denylist.has(sha256(pair)))) {
      out.push('a denylisted name');
      break;
    }
  }
  return out;
}

export function neutralFiles(root) {
  const top = walk(root, (n) => n.endsWith('.md')).filter((p) => !p.includes('/'));
  const nested = walk(root, (n) => TEXT.test(n)).filter((p) => NEUTRAL_DIRS.includes(p.split('/')[0]));
  return [...top, ...nested];
}

export function checkNeutrality(root, denylist) {
  const errors = [];
  for (const file of neutralFiles(root)) {
    readFileSync(join(root, file), 'utf8')
      .split('\n')
      .forEach((line, i) => {
        for (const p of lineProblems(line, denylist)) errors.push(`${file}:${i + 1}: contains ${p}`);
      });
  }
  return { errors };
}
