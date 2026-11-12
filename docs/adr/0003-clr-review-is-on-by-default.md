# 3. The CLR review is on by default

Date: 2026-11-12

## Status

Accepted (2026-11-12). Recorded in STRATEGY.md, sections Positioning and Boundaries ("Resist a change when").

## Context

Trees built without review often hold weak cause-effect claims: a cause that is not sufficient, or a side effect that nobody stated. The Categories of Legitimate Reservation (CLR) find these claims. A self-guided practitioner has no expert to say when a review is needed, and is the person least likely to ask for one (see ADR 0002).

A review also costs time and can raise false findings, which can slow the practitioner down.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Review on request | The practitioner runs the CLR review when they choose | Rejected: the practitioner who most needs it does not know when to ask |
| B. Review at the end | One review after the tree is complete | Rejected: late findings cause rework across the whole tree |
| C. Review on by default | Every tree-building skill runs the CLR review as part of its flow; the practitioner can see the findings and decide what to do | Chosen |

## Decision

1. **Every tree gets a CLR review by default.** A tree-building skill runs the review as part of its flow. No setting turns it off by default.
2. **Sufficiency and side effects come first.** The review reports insufficient causes and missing side effects before the other categories.
3. **The review gives findings, not changes.** It can propose a repair, and applies it only after the author gives permission (ADR 0002).
4. **A change that makes the review optional by default is resisted.** STRATEGY.md lists this under "Resist a change when".

## Consequences

- **False findings are the main risk.** If the review raises too many findings on sound trees, practitioners will ignore it. STRATEGY.md measures this as "False findings per clean tree", and the evaluation set must hold clean trees.
- **The review must be fast enough to stay in the flow.** Depth on request keeps the default output short.
- **Each new tree-building skill needs a test that the review runs.** This can be an architecture fitness function in CI.
- **Reversal is expensive.** Making the review optional changes the positioning in STRATEGY.md and the meaning of the metrics.
