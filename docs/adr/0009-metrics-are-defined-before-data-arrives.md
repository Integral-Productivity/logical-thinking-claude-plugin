# 9. Metrics are defined before data arrives

Date: 2026-11-13

## Status

Accepted (2026-11-13). Converted from QUALITY.md, section Metric charter.

## Context

STRATEGY.md names five metrics (M1-M5). No evaluation run and no session data exist yet. If a metric's definition, floor, or target is set after results arrive, it can be set to make the results look good.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Define after the first run | Wait for data, then set definitions and thresholds | Rejected: the goalposts move to fit the data |
| B. Define now, floors now, targets after baseline | Write each definition, source, and denominator now; set a floor from an argument about what is unacceptable; set a target after the first baseline run | Chosen |

## Decision

1. **Each metric has a definition, a source, and a denominator before the first run** (QUALITY.md, metric charter).
2. **A floor is the least acceptable value.** It is set now, from an argument, not from data. M1 has a floor today: 100% of seeded insufficient causes and missing side effects on the first evaluation set (MS1).
3. **A target is set after the first baseline run.**
4. **A change to a floor or a target needs a new ADR.** It is never an edit in place.
5. **A report says "floor met, target pending"** when a target is not set. It never says "no data" for a metric that has a floor.

## Consequences

- Results cannot quietly redefine success.
- Some floors stay open (M2, the band for M5) until a decision is made, and QUALITY.md lists them in the decision register.
- M3 counts a rebuttal and a repair the same way. The session record keeps them apart, so a review that is often rebutted stays visible.

## Source

- [QUALITY.md, Metric charter](../../QUALITY.md#metric-charter)
- [QUALITY.md, Decision register](../../QUALITY.md#decision-register)
