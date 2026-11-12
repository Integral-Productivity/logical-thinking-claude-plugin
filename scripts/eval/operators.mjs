// Mutation operators. Each takes a clean seed and returns a mutant tree with
// one seeded defect plus the answer-key entry for it. Operators never change
// their input and leave no structural tell: removed entities take their arrows
// with them, and an AND group left with one arrow dissolves into a plain arrow.

import { CATEGORIES } from './categories.mjs';

function copy(tree) {
  return {
    entities: tree.entities.map((x) => ({ ...x })),
    arrows: tree.arrows.map((x) => ({ ...x })),
    groups: tree.groups.map((g) => ({ id: g.id, arrows: [...g.arrows] })),
  };
}

function textOf(tree, id) {
  return tree.entities.find((x) => x.id === id).text;
}

// Removes arrows by ID and keeps groups consistent. A group left with one
// arrow dissolves; a group would then strand an AND NOT mitigation, which the
// operators must never do.
function dropArrows(tree, ids) {
  tree.arrows = tree.arrows.filter((x) => !ids.has(x.id));
  tree.groups = tree.groups
    .map((g) => ({ ...g, arrows: g.arrows.filter((id) => !ids.has(id)) }))
    .filter((g) => {
      if (g.arrows.length >= 2) return true;
      if (g.arrows.some((id) => tree.arrows.find((x) => x.id === id)?.not)) {
        throw new Error(`group ${g.id} would leave an AND NOT mitigation outside a group`);
      }
      return false;
    });
}

// Repeatedly removes entities that `orphaned` reports as left dangling, with
// every arrow that touches them.
function prune(tree, orphaned) {
  for (;;) {
    const gone = new Set(tree.entities.filter((x) => orphaned(tree, x.id)).map((x) => x.id));
    if (gone.size === 0) return;
    tree.entities = tree.entities.filter((x) => !gone.has(x.id));
    dropArrows(tree, new Set(tree.arrows.filter((x) => gone.has(x.from) || gone.has(x.to)).map((x) => x.id)));
  }
}

const positives = (tree, group) => group.arrows.filter((id) => !tree.arrows.find((x) => x.id === id).not);

// AND groups with at least two positive conditions, in tree order.
export function insufficiencyTargets(tree) {
  return tree.groups.filter((g) => positives(tree, g).length >= 2).map((g) => g.id);
}

// Removes one positive condition from an AND group, so the remaining causes
// are not enough for the effect. The condition chosen rotates with the group's
// position, so different groups lose conditions in different slots.
export function removeCondition(seed, groupId) {
  const index = seed.groups.findIndex((g) => g.id === groupId);
  if (index < 0) throw new Error(`no group ${groupId}`);
  const candidates = positives(seed, seed.groups[index]);
  if (candidates.length < 2) throw new Error(`group ${groupId} has fewer than two positive conditions`);
  const removed = seed.arrows.find((x) => x.id === candidates[index % candidates.length]);
  const effect = removed.to;
  const sinks = new Set(seed.entities.filter((x) => !seed.arrows.some((y) => y.from === x.id)).map((x) => x.id));

  const mutant = copy(seed);
  dropArrows(mutant, new Set([removed.id]));
  prune(mutant, (t, id) => !sinks.has(id) && !t.arrows.some((x) => x.from === id));

  const incoming = mutant.arrows.filter((x) => x.to === effect);
  return {
    mutant,
    entry: {
      category: CATEGORIES.insufficiency,
      matchSet: [effect, ...incoming.map((x) => x.id), ...incoming.map((x) => x.from)],
      expected: `${textOf(seed, effect)} [${effect}] needs another cause; "${textOf(seed, removed.from)}" is missing.`,
    },
  };
}

function branchArrow(tree, rootId) {
  const kinds = new Set(['action', 'injection']);
  const root = tree.entities.find((x) => x.id === rootId);
  const incoming = tree.arrows.filter((x) => x.to === rootId);
  if (!root?.undesirable || incoming.length !== 1) return null;
  const [arrow] = incoming;
  const source = tree.entities.find((x) => x.id === arrow.from);
  const otherEffects = tree.arrows.some((x) => x.from === source.id && x.id !== arrow.id);
  return kinds.has(source.kind) && otherEffects ? arrow : null;
}

// Undesirable effects drawn directly below an action or injection, in arrow
// order. The action must keep another effect, so the mutant shows no dead end.
export function branchTargets(tree) {
  return tree.arrows.map((x) => x.to).filter((id, i, all) => all.indexOf(id) === i && branchArrow(tree, id));
}

// Deletes a negative branch: the branch root and every entity reachable only
// through it.
export function removeBranch(seed, rootId) {
  const arrow = branchArrow(seed, rootId);
  if (!arrow) throw new Error(`${rootId} is not a negative branch below an action or injection`);
  const sources = new Set(seed.entities.filter((x) => !seed.arrows.some((y) => y.to === x.id)).map((x) => x.id));

  const mutant = copy(seed);
  const grouped = new Set(seed.groups.flatMap((g) => g.arrows));
  const before = new Set(mutant.arrows.map((x) => x.id));
  dropArrows(mutant, new Set([arrow.id]));
  prune(mutant, (t, id) => !sources.has(id) && !t.arrows.some((x) => x.to === id));
  const lost = [...before].filter((id) => grouped.has(id) && !mutant.arrows.some((x) => x.id === id));
  if (lost.length) throw new Error(`deleting ${rootId} would change AND group arrows ${lost.join(', ')}`);

  return {
    mutant,
    entry: {
      category: CATEGORIES.sideEffect,
      matchSet: [arrow.from],
      expected: `${textOf(seed, arrow.from)} [${arrow.from}] also causes "${textOf(seed, rootId)}", which the tree does not show.`,
    },
  };
}
