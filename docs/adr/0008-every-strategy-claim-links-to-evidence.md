# 8. Every strategy claim links to evidence

Date: 2026-11-13

## Status

Accepted (2026-11-13). Converted from QUALITY.md, section Strategy assurance case.

## Context

STRATEGY.md makes claims: the review catches weak logic, practitioners finish the chain, domains do not change the core. A claim with no metric, milestone, or check behind it cannot be shown to hold or to fail. The plugin exists to check this kind of logic in other people's trees, so it should apply the same check to its own strategy.

Line numbers in STRATEGY.md change with each edit, so links to them break.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Free-text links | QUALITY.md describes evidence in prose | Rejected: no check can find a claim with no evidence |
| B. Stable IDs and a claim tree | Each strategy item gets a stable ID; a claim tree links each claim to its evidence; a check finds IDs with no link | Chosen |

## Decision

1. **Each STRATEGY.md item has a stable ID** (P1, PO1, U1, B1-B6, RS1, M1-M5, T1-T5, MS1-MS3, BR1). Other files refer to the ID, not to a line.
2. **QUALITY.md keeps an assurance case.** A claim tree links each claim to metrics, milestones, checks, or ADRs. A claim with no evidence is **undeveloped** and goes in the gaps table.
3. **FF9 runs in CI.** It fails when a strategy ID appears only in the ID table and nowhere else in QUALITY.md, ARCHITECTURE.md, or an ADR.
4. **A change to STRATEGY.md updates the IDs, the claim tree, and the CLR pass on the strategy** (QUALITY.md, quality review cadence).

## Consequences

- An undeveloped claim fails CI. When FF9 first ran, it found that the primary user (U1) had no evidence in the claim tree; this pull request adds it.
- FF9 checks that a link exists, not that the evidence is enough. Sufficiency stays a judgment, made in the CLR pass on the strategy.
- Adding a strategy item means adding its ID and at least one piece of evidence in the same pull request.

## Source

- [QUALITY.md, Strategy assurance case](../../QUALITY.md#strategy-assurance-case)
- [QUALITY.md, Gaps found today](../../QUALITY.md#gaps-found-today)
