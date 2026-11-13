# 12. The reviewer is one versioned unit, and results are kept per category

Date: 2026-11-13

## Status

Accepted (2026-11-13). Converted from QUALITY.md, sections Results ledger and Rebuttal loop.

## Context

The review's output depends on four things: the skill text, the core vocabulary version, the evaluation set version, and the model. A change to any one of them can change the results. If results are kept as one average, a release that improves one category can hide a drop in another.

Rebuttals from authors are the only field evidence of false findings, and they are lost unless they feed back into the evaluation set.

## Decision

1. **The reviewer is one versioned unit:** skill text, vocabulary version, evaluation set version, and model. Each result names the reviewer version.
2. **Each evaluation run adds one row per CLR category to the results ledger** in QUALITY.md.
3. **At each quality review, each shared rebuttal is resolved.** If the review was wrong, the pattern becomes a neutral clean case. If the author was wrong, the pattern becomes a mutant. Both go into the evaluation set.
4. **A change to the reviewer version policy needs a new ADR.**

## Consequences

- A release that lowers one category shows up, even when the average rises.
- Comparing two results means comparing reviewer versions, not dates.
- The evaluation set grows from real disagreements, so it tracks the cases that matter in use.
- The ledger has no rows yet; the first evaluation run starts it.

## Source

- [QUALITY.md, Results ledger](../../QUALITY.md#results-ledger)
- [QUALITY.md, Rebuttal loop](../../QUALITY.md#rebuttal-loop)
