# 10. The evaluation set is built from neutral seeds and mutation operators

Date: 2026-11-13

## Status

Accepted (2026-11-13). Converted from QUALITY.md, section Evaluation set contract. The first set is built by the evaluation-set factory (`eval/`, `scripts/eval/`).

## Context

The evaluation set is the evidence for M1, M2, and MS1. It must show both that the review finds real defects and that it stays silent on sound logic. A set of only generated mutants can teach the review to spot generation tells instead of logic defects. A single average score can hide a category that got worse.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Hand-written cases only | Every case is written by a person | Rejected: slow, and coverage per category stays thin |
| B. Generated mutants only | Mutation operators make every case | Rejected: the review can learn generation tells |
| C. Seeds, operators, twins, lookalikes, and some hand-written cases | Mutation operators make one known defect each in a neutral seed; each mutant has an answer key and a repaired twin; clean lookalikes and hand-written cases are added | Chosen |

## Decision

1. **A mutation operator makes one known defect in a clean tree.** QUALITY.md lists one operator per CLR category, plus side effects and patterns.
2. **Each mutant has an answer key and a repaired twin.** The key names the category, the entity, and the expected finding. The review must flag the mutant and stay silent on the twin.
3. **The set also holds clean lookalikes, multi-defect trees, seeded strategy documents, and hand-written cases.**
4. **Every case is neutral and passes FF3** (ADR 0007).
5. **Every case runs once with an agent author and no human,** so ADR 0002 stays true.
6. **Results are reported per operator and per defect position,** never as one average.

## Consequences

- M1 and M2 can be measured without field data.
- The first set covers two categories only (cause insufficiency and possible negative branch). The other operators are planned work.
- Seeded strategy documents, for the prose-mapping part of T1, are not built yet.
- Rebuttals from the field feed new cases into the set (ADR 0012).

## Source

- [QUALITY.md, Evaluation set contract](../../QUALITY.md#evaluation-set-contract)
- [QUALITY.md, Mutation operators](../../QUALITY.md#mutation-operators)
