# 13. Cause insufficiency keys match the effect, not its causes

Date: 2026-11-13

## Status

Accepted (2026-11-13). Chosen by the project owner after the first MS1 baseline. Refines ADR 0010, decision 2.

## Context

An answer key says which findings count as finding a seeded defect. A finding counts when its category matches and the ID it names is in the key's **match set**. The same match set decides a **twin breach**: a finding on the repaired twin that the mutant's key would match.

The first baseline ([2026-11-13, bare model](../../eval/baselines/2026-11-13-skill-none.md)) showed 26 Cause insufficiency twin breaches across three runs. The match set for a removed AND condition held three kinds of ID: the effect, the arrows into it, and the causes at the tail of those arrows. On the twin, the reviewer often raised a different insufficiency about one of those causes (for example, that the timer only waters the beds if the water supply runs). That can be a defensible reservation, but the scorer counted it as a breach of the seeded defect.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Keep the broad match sets | Effect, incoming arrows, and their causes | Rejected: a defensible finding about a cause counts as a breach, so MS1 measures key design as much as the review |
| B. Narrow to the effect and its incoming arrows | A finding must name the effect that lost its condition, or an arrow into it | Chosen |
| C. Narrow to the effect only | Arrow IDs are also dropped | Rejected: a reviewer that names the arrow is right, and arrows add no breach risk on the twin |
| D. Score the finding's wording | Match on the missing condition, not on IDs | Rejected for now: needs a judge model or a person, and the plan scores IDs only |

## Decision

1. **A Cause insufficiency key's match set holds the effect that lost a condition and the arrows into that effect.** It no longer holds the causes at the tail of those arrows. The mutation operator (`removeCondition` in `scripts/eval/operators.mjs`) writes this set, and the hand-written keys follow the same rule.
2. **Possible negative branch keys do not change.** Their match set is already one ID: the action or injection that lost its branch.
3. **The set version changes,** so results before and after this decision are compared as different reviewer versions (ADR 0012).

## Consequences

- On the same saved outputs of the first baseline, Cause insufficiency twin breaches fall from 26 to 17. Found defects fall from 32 to 31 of 36, because one run named a cause, not the effect. Fresh runs with the new keys give 24 breaches and 30/36 found; the model's run-to-run variance is about as large as the key effect ([second baseline](../../eval/baselines/2026-11-13-skill-none-narrow-keys.md)).
- The remaining Cause insufficiency breaches are findings that name the effect itself on the twin. The reviewer says the repaired AND group is still not enough. Narrowing IDs cannot separate these from the seeded defect; only the finding's wording can (option D).
- Negative-branch breaches stay, because the reviewer names the same action for a different side effect on the twin.
- A finding about a cause above the effect no longer counts as found on the mutant. A reviewer must name the effect that needs another condition, which matches the finding form in the key's `expected` sentence.

## Source

- [First MS1 baseline report](../../eval/baselines/2026-11-13-skill-none.md)
- [Second MS1 baseline report, narrowed keys](../../eval/baselines/2026-11-13-skill-none-narrow-keys.md)
- [ADR 0010: the evaluation set](0010-the-evaluation-set-is-built-from-neutral-seeds-and-mutation-operators.md)
- [ADR 0012: the reviewer is one versioned unit](0012-the-reviewer-is-one-versioned-unit-and-results-are-kept-per-category.md)
