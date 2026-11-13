# 4. The core vocabulary is stable after three releases without a breaking change

Date: 2026-11-12

## Status

Accepted (2026-11-12). Applies the STRATEGY.md "Resist a change when" line on domains, and milestone MS3.

## Context

STRATEGY.md says to resist starting a domain "before the core vocabulary is stable", and says that domains extend the core vocabulary and never change it. "Stable" had no test, so the rule could not be applied (QUALITY.md, first CLR pass, clarity finding on RS1).

The core vocabulary covers the tree types, the logical kinds, the connectors and patterns, and the eight CLR categories (plan R1-R5).

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Two releases | Stable after two releases with no breaking change | Rejected: the domain track starts with little evidence that the vocabulary holds |
| B. Three releases | Stable after three releases with no breaking change | Chosen |
| C. Decide later | Leave the number open until the vocabulary first ships | Rejected: the resist rule stays untestable until then |

## Decision

1. **The core terms live in one registry file with a content hash.** Fitness function FF6 allows additions and fails on a rename, a removal, or a changed definition.
2. **A breaking change needs an ADR.** It also resets the count.
3. **The core vocabulary is stable after three consecutive releases with no breaking change, while the evaluation set stays at or above its floors.**
4. **The domain extension track starts only when the vocabulary is stable.** Milestone MS3 is then proved by FF7: the core evaluation set passes unchanged with the domain loaded.

## Consequences

- The domain track has an objective start that a check can show.
- The registry file and FF6 become prerequisites for the domain track.
- A needed breaking change delays domains by at least three releases. That cost is accepted, because a core that changes under domains breaks every domain at once.
- The number can change only through a new ADR that supersedes this one.

## Source

- [QUALITY.md, First CLR pass on the strategy](../../QUALITY.md#first-clr-pass-on-the-strategy)
- [ARCHITECTURE.md, Core vocabulary stability](../../ARCHITECTURE.md#core-vocabulary-stability)
