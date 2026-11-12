// Tree format for the evaluation set.
//
// A tree has entities (id, text, kind, and `undesirable` for an undesirable
// effect), arrows (id, from, to, and `not: true` for the mitigation in a
// cause AND NOT mitigation group), and AND groups (id and the arrow IDs they
// join). IDs are text slugs, so removing an entity leaves no numbering gap.

import { readFileSync } from 'node:fs';

export const KINDS = ['effect', 'action', 'injection', 'precondition', 'obstacle', 'indicator'];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function loadTree(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// Returns a list of error strings; an empty list means the tree is valid.
// With requireChecks, the tree must record the negative-branch check and the
// neutrality check that every clean tree passes before it enters the set.
export function validateTree(tree, { requireChecks = false } = {}) {
  const errors = [];
  const entities = tree.entities ?? [];
  const arrows = tree.arrows ?? [];
  const groups = tree.groups ?? [];
  const seen = new Set();
  for (const item of [...entities, ...arrows, ...groups]) {
    if (!SLUG.test(item.id ?? '')) errors.push(`id ${item.id} is not a lowercase slug`);
    if (seen.has(item.id)) errors.push(`duplicate id ${item.id}`);
    seen.add(item.id);
  }
  const entityIds = new Set(entities.map((e) => e.id));
  for (const e of entities) {
    if (!e.text) errors.push(`entity ${e.id} has no text`);
    if (!KINDS.includes(e.kind)) errors.push(`entity ${e.id} has unknown kind ${e.kind}`);
  }
  const arrowById = new Map(arrows.map((a) => [a.id, a]));
  for (const a of arrows) {
    if (!entityIds.has(a.from)) errors.push(`arrow ${a.id} starts at missing entity ${a.from}`);
    if (!entityIds.has(a.to)) errors.push(`arrow ${a.id} ends at missing entity ${a.to}`);
    if (a.from === a.to) errors.push(`arrow ${a.id} points to itself`);
  }
  const grouped = new Set();
  for (const g of groups) {
    const members = g.arrows ?? [];
    if (members.length < 2) errors.push(`group ${g.id} joins fewer than two arrows`);
    for (const id of members) {
      if (!arrowById.has(id)) errors.push(`group ${g.id} names missing arrow ${id}`);
      if (grouped.has(id)) errors.push(`arrow ${id} is in more than one group`);
      grouped.add(id);
    }
    const targets = new Set(members.filter((id) => arrowById.has(id)).map((id) => arrowById.get(id).to));
    if (targets.size > 1) errors.push(`group ${g.id} joins arrows into different effects`);
  }
  for (const a of arrows) {
    if (a.not && !grouped.has(a.id)) errors.push(`arrow ${a.id} is an AND NOT mitigation outside a group`);
  }
  if (requireChecks) {
    for (const field of ['negativeBranches', 'neutrality']) {
      if (!tree.checks?.[field]) errors.push(`${tree.id}: missing checks.${field}`);
    }
  }
  return errors;
}

// The tree as a reviewer sees it: no title, no check records, no case data.
export function publicTree(tree) {
  return {
    entities: tree.entities.map(({ id, text, kind, undesirable }) => ({ id, text, kind, ...(undesirable ? { undesirable } : {}) })),
    arrows: tree.arrows.map(({ id, from, to, not }) => ({ id, from, to, ...(not ? { not } : {}) })),
    groups: tree.groups.map(({ id, arrows }) => ({ id, arrows: [...arrows] })),
  };
}
