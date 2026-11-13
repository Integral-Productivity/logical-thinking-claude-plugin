---
name: Logical Thinking
last_updated: 2026-11-12
---

# Logical Thinking Quality

This file shows how the plugin proves that [STRATEGY.md](STRATEGY.md) holds. It traces each strategy claim to evidence, defines each metric before data arrives, sets the contract for the evaluation set, and keeps the results and decisions in one place. [ARCHITECTURE.md](ARCHITECTURE.md) lists the fitness functions that run the checks.

The ideas behind this file are ranked in [docs/ideation/2026-11-12-testable-strategy-ideation.html](docs/ideation/2026-11-12-testable-strategy-ideation.html).

## Strategy assurance case

An assurance case is a tree of claims, each linked to the evidence that supports it. A claim with no evidence is **undeveloped**. The plugin claims to check this kind of logic, so it applies the same check to its own strategy.

### Strategy IDs

Each item in STRATEGY.md has a stable ID. Other files refer to the ID, not to a line number.

| ID | Strategy item |
|---|---|
| P1 | Purpose: steps get skipped or abandoned, and weak cause-effect claims go unchallenged |
| PO1 | Positioning: a CLR review on every tree by default; the guided chain supports the flow |
| U1 | Primary user: self-guided practitioner, human or agent |
| B1 | Boundary: the tool repository owns structure checks and file formats |
| B2 | Boundary: a repair is applied only after the author reviews it and gives permission |
| B3 | Boundary: domains extend the core vocabulary and never change it |
| B4 | Boundary: examples, fixtures, and test trees are neutral |
| B5 | Boundary: not a course |
| B6 | Boundary: no tree editor |
| RS1 | Resist a change that makes the review optional by default, or starts a domain before the core vocabulary is stable |
| M1 | Metric: seeded-defect catch rate |
| M2 | Metric: false findings per clean tree |
| M3 | Metric: findings acted on |
| M4 | Metric: chain completion |
| M5 | Metric: findings before first action |
| T1 | Track: CLR review and core vocabulary |
| T2 | Track: guided chain |
| T3 | Track: tool link |
| T4 | Track: evaluation set |
| T5 | Track: domain extension |
| MS1 | Milestone: the review finds every seeded insufficient cause and missing side effect in the first evaluation set |
| MS2 | Milestone: the first guided tree-building skill ships with the review on by default |
| MS3 | Milestone: the first added domain passes the evaluation set without a change to the core vocabulary |
| BR1 | Brand: deep deliberation without delay |

### Claim tree

Read each line as "the claims below it, together, are enough for the claim above it".

- **P1 is solved:** practitioners finish the chain, and their trees have sound logic.
  - **Trees have sound logic** because PO1 runs a review on every tree, the review is accurate, and authors act on the findings.
    - Review runs on every tree: ADR 0003, FF2, MS2.
    - Review is accurate: M1, M2, MS1, T4.
    - Authors act on findings: M3.
  - **Practitioners finish the chain** because T2 guides each step and the review does not stall the flow.
    - Chain is guided: T2, M4, MS2.
    - Review does not stall the flow: BR1, M5.
  - **Findings read alike across both repositories:** T3, FF5.
  - **The method works in real domains without core change:** T5, B3, RS1, FF6, FF7, MS3.
  - **The boundaries hold:** B1 (FF4), B2 (session record), B4 (FF3), B5 and B6 (judgment at each review).

### Gaps found today

These are the undeveloped claims. Each one is a strategy test to resolve.

| Claim | Gap | Proposed evidence |
|---|---|---|
| T3 Tool link | No metric and no milestone | FF5: a shared finding schema check |
| T5 Domain extension | Only a milestone (MS3) | FF6 and FF7 |
| BR1 Without delay | Resolved: M5 added to STRATEGY.md (2026-11-12) | M5 |
| B2 Repair after permission | No check | The session record notes whether each repair had permission |
| RS1 "Core vocabulary is stable" | Resolved: three releases without a breaking change (ADR 0004) | FF6 and the stability rule in [ARCHITECTURE.md](ARCHITECTURE.md#core-vocabulary-stability) |
| MS1-MS3 | Not dated | Dates follow the first baseline run |
| Sound decisions | No metric measures decision quality | Accepted surrogate: M1-M3 stand in for it; recorded here so the gap stays visible |

### First CLR pass on the strategy

A manual CLR review of the claim tree, done before the review skill exists. Each finding uses the plugin's own finding form.

- **Cause insufficiency.** Positioning [PO1]: a review that runs by default is not enough to make "logic checked without a scarce expert"; the review must also catch defects as well as an expert does, which only M1 and M2 show.
- **Cause insufficiency.** Purpose [P1]: findings alone do not make decisions sound; the author must also act on them, and the repair must be correct.
- **Predicted effect existence.** Positioning [PO1]: a review on every tree predicts more findings to read, which can cause the very abandonment P1 names; no metric watches for it.
- **Clarity.** Resist line [RS1]: "core vocabulary is stable" has no test, so the rule cannot be applied.

The first and second findings are answered by the claim tree above. The third is the reason for M5. The fourth is answered by the stability rule.

## Metric charter

Each metric is defined before the first evaluation run, so the goalposts cannot move after results arrive. A **floor** is the least acceptable value, set now from an argument about what is unacceptable. A **target** is set after the first baseline run. A change to a floor or a target needs an ADR; it is never an edit in place.

| ID | Definition | Source | Denominator | Floor | Target | Status |
|---|---|---|---|---|---|---|
| M1 | Share of seeded insufficient causes and missing side effects that the review finds | Evaluation set | Seeded defects of those two kinds, per mutation operator | 100% on the first evaluation set (MS1) | Other CLR categories: after baseline | Floor set |
| M2 | Findings raised on trees with no seeded defect | Evaluation set, clean trees and lookalikes | Clean trees | Open decision | After baseline | Open |
| M3 | Share of findings the author accepts, repairs, or answers | Session record | Findings shown | None until field data exists | After baseline | Defined |
| M4 | Share of sessions, human or agent, that finish the chain of questions | Session record, from the report of unanswered links | Sessions started | None until the first chain skill ships | After baseline | Defined |
| M5 | Number of findings the author reads before the first one they act on | Session record and evaluation runs | Sessions | Open decision: the band | After baseline | Defined |

A report says "floor met, target pending" when a target is not yet set. It never says "no data" for a metric with a floor.

M3 counts a rebuttal and a repair the same way today. The session record keeps them apart, so a review that is often rebutted shows up.

## Evaluation set contract

The evaluation set is the evidence for M1, M2, and MS1. It is built from neutral seed trees and a catalog of mutation operators. A **mutation operator** makes one known defect in a clean tree.

### Composition

- **Seeds.** Plan examples AE1 and AE2 are the first defect seeds, and AE3 supplies a clean lookalike. AE4-AE6 test unreadable input, depth, and question mode, so they wait for a later set (AE4 needs an unreadable-image fixture). The first set's scope is in [docs/plans/2026-11-12-0418-feat-evaluation-set-factory-plan.md](docs/plans/2026-11-12-0418-feat-evaluation-set-factory-plan.md).
- **Mutants.** Each mutant ships with an answer key (the category, the entity, and the expected finding) and a **repaired twin**. The review must flag the mutant and stay silent on the twin.
- **Clean lookalikes.** Valid constructs that look like defects: gates, cause AND NOT mitigation groups, long but sufficient AND groups. They form the clean set for M2.
- **Multi-defect trees.** Trees with two or three defects of mixed categories, so a miss after the first finding shows up.
- **Seeded strategy documents.** Prose documents with known logic gaps, for the prose-mapping part of T1.
- **Hand-written cases.** Some cases are written by hand, so the review does not learn to spot tells in generated mutants.

### Mutation operators

| CLR category | Operator |
|---|---|
| Clarity | Replace an entity's text with a vague or compound statement |
| Entity existence | Add an entity that the scenario does not support |
| Causality existence | Add an arrow between two unrelated entities |
| Cause insufficiency | Remove one condition from an AND group |
| Additional cause | Remove one of two independent causes that the scenario gives for an effect |
| Cause-effect reversal | Reverse one arrow |
| Predicted effect existence | Add a cause whose other predicted effect contradicts a stated fact |
| Tautology | Make a cause restate its effect |
| Side effects (plan R10) | Delete a negative branch below an action or injection |
| Patterns (plan R11) | Drop the AND NOT mitigation from an undesirable effect |

### Rules

- Every case is neutral and passes FF3.
- Every case runs once with an agent author and no human, so ADR 0002 stays true.
- Results are reported per operator and per defect position, never as one average.

### Where the set lives and how to run it

- The first set covers **Cause insufficiency** and **Possible negative branch**. Its trees, keys, and build are in [eval/](eval/README.md) and `scripts/eval/`.
- Build the cases with `node scripts/eval/build.mjs`. CI runs `node --test scripts/eval/*.test.mjs`, which calls no model.
- Run an evaluation locally with `node scripts/eval/run.mjs --model <name> --reviewer "<command>"`. Each run adds one ledger row per category, and MS1 needs three runs.

## Session record contract

The plugin has no runtime that collects sessions. The session record is a local file the author can keep and choose to share. It is the source for M3, M4, and M5.

Each finding in the record has:

- A stable finding ID.
- Its CLR category and entity ID.
- A final disposition set by the author: **accepted**, **repaired**, **rebutted with a reason**, **answered without change**, or **left open**.
- For a repair: whether the author gave permission before it was applied (B2).

Each session has the chain steps reached and the links the source does not answer (from T2).

## Results ledger

The reviewer is one versioned unit: the skill text, the vocabulary version, the evaluation set version, and the model. Each evaluation run adds one row per CLR category, so a release that lowers one category shows up even when the average rises.

| Date | Reviewer version | Category | M1 | M2 | M5 | Notes |
|---|---|---|---|---|---|---|
| 2026-11-13 | skill:none vocab:none set:ee0da824 model:claude-opus-5-5 | Cause insufficiency | 11/12 (92%); by position 1: 11/12 | 25 | not measured | run 2026-11-13T01-46-03-609Z-run-1; twin breaches 8; unmatched 6 |
| 2026-11-13 | skill:none vocab:none set:ee0da824 model:claude-opus-5-5 | Possible negative branch | 10/10 (100%); by position 1: 7/7, 2: 3/3 | 12 | not measured | run 2026-11-13T01-46-03-609Z-run-1; twin breaches 3; unmatched 0 |
| 2026-11-13 | skill:none vocab:none set:ee0da824 model:claude-opus-5-5 | Cause insufficiency | 10/12 (83%); by position 1: 10/12 | 25 | not measured | run 2026-11-13T01-46-03-609Z-run-2; twin breaches 8; unmatched 7 |
| 2026-11-13 | skill:none vocab:none set:ee0da824 model:claude-opus-5-5 | Possible negative branch | 8/10 (80%); by position 1: 6/7, 2: 2/3 | 13 | not measured | run 2026-11-13T01-46-03-609Z-run-2; twin breaches 2; unmatched 0 |
| 2026-11-13 | skill:none vocab:none set:ee0da824 model:claude-opus-5-5 | Cause insufficiency | 11/12 (92%); by position 1: 11/12 | 26 | not measured | run 2026-11-13T01-46-03-609Z-run-3; twin breaches 10; unmatched 8 |
| 2026-11-13 | skill:none vocab:none set:ee0da824 model:claude-opus-5-5 | Possible negative branch | 10/10 (100%); by position 1: 7/7, 2: 3/3 | 12 | not measured | run 2026-11-13T01-46-03-609Z-run-3; twin breaches 3; unmatched 0 |

## Rebuttal loop

Rebuttals are the only field evidence of false findings. At each quality review, for each shared rebuttal:

1. Decide if the review or the author was wrong.
2. If the review was wrong, rewrite the pattern as a neutral clean case and add it to the evaluation set.
3. If the author was wrong, add the pattern as a mutant.

## Decision register

Changes to floors, targets, operators, or the reviewer version policy are recorded as ADRs in [docs/adr/](docs/adr/). Open decisions:

- The M2 floor (plan: "The planner sets the threshold, because no baseline exists today").
- The band for M5 (M5 itself was added to STRATEGY.md on 2026-11-12).
- When an evaluation run may block a merge.
- ADR 0001 open points on fail versus warn.

## Quality review cadence

- After each evaluation run: update the results ledger and check the floors.
- After each change to STRATEGY.md: update the strategy IDs and the claim tree, and run the CLR pass again.
- Each quarter (proposed): review the gaps table, the rebuttals, and the open decisions.
