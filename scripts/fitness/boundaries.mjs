// Fitness function FF4 (AC2, boundary B1): the plugin judges logic only.
// The tool repository owns structure checks: loops, entity IDs, and
// unconnected entities. No review category in this repository may be one of
// those. The categories come from scripts/eval/categories.mjs and from every
// answer key in eval/cases/. When the core vocabulary registry exists, its
// CLR categories join this list.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const STRUCTURE_TERMS = [/\bloops?\b/i, /\bcycles?\b/i, /\bids?\b/i, /\bidentifiers?\b/i, /\bunconnected\b/i, /\borphans?\b/i, /\bdangling\b/i, /\bduplicate\b/i, /\bfile format\b/i];

export function structureCategories(names) {
  return [...new Set(names)].filter((n) => STRUCTURE_TERMS.some((t) => t.test(n)));
}

export async function reviewCategories(root) {
  const names = [];
  const module = join(root, 'scripts', 'eval', 'categories.mjs');
  if (existsSync(module)) {
    const { CATEGORIES } = await import(pathToFileURL(module).href);
    names.push(...Object.values(CATEGORIES ?? {}));
  }
  const cases = join(root, 'eval', 'cases');
  if (existsSync(cases)) {
    for (const dir of readdirSync(cases)) {
      const key = join(cases, dir, 'key.json');
      if (!existsSync(key)) continue;
      for (const e of JSON.parse(readFileSync(key, 'utf8')).entries ?? []) if (e.category) names.push(e.category);
    }
  }
  return names;
}

export async function checkBoundaries(root) {
  const names = await reviewCategories(root);
  return { errors: structureCategories(names).map((n) => `review category "${n}" is a structure check; the tool repository owns it`) };
}
