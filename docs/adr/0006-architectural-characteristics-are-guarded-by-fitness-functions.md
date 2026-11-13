# 6. Architectural characteristics are guarded by fitness functions

Date: 2026-11-13

## Status

Accepted (2026-11-13). Converted from ARCHITECTURE.md, sections Architectural characteristics and Fitness functions.

## Context

The plugin must keep eight characteristics (AC1-AC8 in ARCHITECTURE.md), such as scrutiny by default, neutrality, and extension without core change. Each one comes from a line in STRATEGY.md.

Claude branches merge on green CI. A rule that lives only in prose can be removed by a pull request that nobody reads closely. A **fitness function** is an automated or scheduled check that shows whether the system still has a characteristic.

Some checks are cheap and repeatable: they read files. Others call a language model: they are costly, and two runs can give different results.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Prose rules and review | ARCHITECTURE.md states the rules; reviewers enforce them | Rejected: auto-merge on green CI skips a careful human read |
| B. All checks block the merge | Static checks and evaluation runs both gate each pull request | Rejected: evaluation runs are costly and not fully repeatable |
| C. Static checks block, evaluation runs are scheduled | File-reading checks run in CI on each pull request; model-calling checks run on a schedule and write to the results ledger | Chosen |

## Decision

1. **Each characteristic has at least one fitness function.** ARCHITECTURE.md keeps the table from characteristic to check.
2. **Static checks run in CI and fail the pull request.** They are Node scripts with `node:test` tests that build temporary fixtures, like `scripts/check-upload-limits.test.mjs`. They live in `scripts/fitness/` and run from one workflow.
3. **Checks that call a model run on a schedule.** FF7 and FF8 write to the results ledger in QUALITY.md. They do not block a merge until runs are cheap and stable. That change needs a new ADR.
4. **The decision log is itself checked.** Each ADR has a Status, a Date, and a Source section that links where the decision came from, and every relative link in the repository's Markdown must resolve to a file and a heading.
5. **A planned check is listed with its status.** A characteristic with no running check stays visible as "Planned", not hidden.

## Consequences

- A pull request that breaks a static rule fails before auto-merge.
- Each new skill, registry, or schema brings its check with it: FF2 with the first tree-building skill, FF6 with the vocabulary registry, FF5 with the shared finding schema.
- A renamed heading in STRATEGY.md, ARCHITECTURE.md, or QUALITY.md fails CI until the links to it are updated. This is the intended cost of traceable decisions.
- Evaluation quality is not a merge gate yet, so a quality drop shows in the ledger, not in CI.

## Source

- [ARCHITECTURE.md, Architectural characteristics](../../ARCHITECTURE.md#architectural-characteristics)
- [ARCHITECTURE.md, Fitness functions](../../ARCHITECTURE.md#fitness-functions)
