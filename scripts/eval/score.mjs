// Scores one review run against the answer keys.
//
// 1. A key entry is found when a finding has the same category and an ID in
//    the entry's match set; the finding's sentence is not scored.
// 2. A finding in a seeded category on a case with no key entry of that
//    category is a false finding and counts toward M2.
// 3. A finding in a seeded category that matches no entry of its category,
//    on a case that has one, is logged as unmatched.
// 4. Findings in other categories, and unreadable lines, are logged.
// 5. A twin breach is a finding on a repaired twin that would have matched a
//    key entry of the mutant made from it.

import { CATEGORIES, normalizeCategory } from './categories.mjs';

const SEEDED = Object.values(CATEGORIES);

// cases: manifest entries with their key; parsed: case ID -> parseFindings
// result. Returns one result per seeded category, plus the logged remainder.
export function score(cases, parsed) {
  const findingsOf = (id) => parsed[id]?.findings ?? [];
  const hits = (findings, category, matchSet) =>
    findings.some((f) => normalizeCategory(f.category) === normalizeCategory(category) && matchSet.includes(f.id));

  const categories = SEEDED.map((category) => ({
    category, seeded: 0, found: 0, byPosition: {}, misses: [], m2: 0, falseFindings: [], unmatched: [], twinBreaches: [],
  }));
  const resultFor = (name) => categories.find((c) => normalizeCategory(c.category) === normalizeCategory(name));
  const logged = [];
  const unreadable = [];

  for (const c of cases) {
    const findings = findingsOf(c.id);
    for (const entry of c.key.entries) {
      const r = resultFor(entry.category);
      const found = hits(findings, entry.category, entry.matchSet);
      const slot = (r.byPosition[entry.position] ??= { seeded: 0, found: 0 });
      r.seeded += 1;
      slot.seeded += 1;
      if (found) {
        r.found += 1;
        slot.found += 1;
      } else {
        r.misses.push({ case: c.id, position: entry.position });
      }
      if (c.twin && hits(findingsOf(c.twin), entry.category, entry.matchSet)) {
        r.twinBreaches.push({ case: c.twin, mutant: c.id, position: entry.position });
      }
    }
    for (const f of findings) {
      const r = resultFor(f.category);
      if (!r) {
        logged.push({ case: c.id, category: f.category, id: f.id });
        continue;
      }
      const entries = c.key.entries.filter((e) => resultFor(e.category) === r);
      if (entries.length === 0) {
        r.m2 += 1;
        r.falseFindings.push({ case: c.id, id: f.id });
      } else if (!entries.some((e) => e.matchSet.includes(f.id))) {
        r.unmatched.push({ case: c.id, id: f.id });
      }
    }
    for (const line of parsed[c.id]?.unreadable ?? []) unreadable.push({ case: c.id, line });
  }
  return { categories, logged, unreadable };
}
