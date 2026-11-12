---
title: Evaluation-Set Factory - Plan
type: feat
date: 2026-11-12
topic: evaluation-set-factory
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
execution: code
---

# Evaluation-Set Factory - Plan

## Goal Capsule

- **Objective:** The project can show, with evidence, whether the CLR review catches every seeded insufficient cause and missing side effect (milestone MS1), and how many false findings it raises on clean trees (metric M2).
- **Product authority:** This plan covers the first, smallest evaluation set: two mutation operators and the clean trees that M2 needs. The other eight operators, seeded strategy documents, and evaluation runs in CI are not active scope (see How This Work Fits Together).
- **Open blockers:** None.

---

## Product Contract

### Summary

Build a small factory that makes the first evaluation set. Scripted operators turn neutral clean seed trees into mutants with known defects, each with an answer key and a repaired twin. A local command runs the review on every tree, scores each finding by CLR category and entity ID, and adds the result to the QUALITY.md results ledger.

### Problem Frame

STRATEGY.md and QUALITY.md promise evidence that the review catches what an expert would catch. Milestone MS1, metric M1 (seeded-defect catch rate), and metric M2 (false findings per clean tree) all depend on an evaluation set. No evaluation set exists, and the results ledger is empty. Until one exists, the claim "the review is accurate" in the strategy assurance case has no evidence, and the M1 floor of 100% cannot be checked.

The first set must stay small. The two defect kinds that slip through most often (cause insufficiency and missing side effects) are the ones MS1 names. A larger catalog before the first baseline run would delay the first evidence and add cost with no decision that depends on it.

### Key Decisions

- **The first set covers two operators, for MS1 only.** (session-settled: user-directed — chosen over the full 10-operator catalog, plan examples only, and strategy documents first: MS1 names these two defect kinds, and the first evidence comes sooner.) Governs R4, R5, R12.
- **A finding matches on CLR category and entity ID; wording is not scored.** (session-settled: user-directed — chosen over a model judge and over a person scoring by hand: the match is the same on every run and costs nothing.) Governs R10, R11.
- **Runs are on demand and local; results go to the QUALITY.md ledger.** (session-settled: user-directed — chosen over scheduled CI runs and runs on each pull request: no model keys in CI, and runs are not yet cheap or stable enough to gate merges.) Governs R14, R15.
- **M2 counts only the two MS1 categories.** Findings in the other six categories are logged and not scored in v1. (session-settled: user-directed — chosen over counting every finding and over a person labeling extra findings: the review checks all eight categories, but the set seeds only two.) Governs R13.
- **Mutants come from scripted operators on structured seeds; the clean seed is the repaired twin.** (session-settled: user-directed — chosen over recipe-guided writing and over a script plus a paraphrase pass: smallest build, same output on every run.) Governs R1, R4, R5, R6.

### Requirements

**Seeds**

- R1. Each seed is a clean, neutral tree in a structured form, with a stable ID on each entity and each arrow.
- R2. The first seeds include plan examples AE1 and AE2 from the core-vocabulary plan, rewritten as clean trees, plus new neutral seeds written for the two operators.
- R3. Every seed and every case names no real person, company, or private figure, and passes the neutrality check FF3 once it exists.

**Mutants and answer keys**

- R4. The insufficiency operator removes one condition from an AND group, so the remaining causes are not enough for the effect.
- R5. The side-effect operator deletes a negative branch below an action or injection.
- R6. Each mutant ships with an answer key (the CLR category, the entity ID, and a one-sentence expected finding for people to read) and names its clean seed as its repaired twin.
- R7. The set includes a few two-defect trees that use both operators, so a miss after the first finding shows up.
- R8. The set includes a few hand-written cases, so the review cannot pass by spotting tells in scripted mutants.

**Clean set**

- R9. The clean set holds the seeds and clean lookalikes: gates, cause AND NOT mitigation groups, and long but sufficient AND groups.

**Scoring**

- R10. A finding matches a key entry when its CLR category and entity ID both match.
- R11. Missing-side-effect findings use one fixed label, so the scorer can match them like a CLR category.
- R12. M1 is the share of seeded defects found, reported per operator and per defect position, never as one average.
- R13. M2 counts findings in the two MS1 categories on trees with no seeded defect of that kind; findings in other categories are logged with the run.

**Runs and results**

- R14. One local command runs the review on every case and scores it; no evaluation run is part of CI.
- R15. Each run adds one row per scored category to the QUALITY.md results ledger, with the reviewer version (skill text, vocabulary version, evaluation-set version, and model).
- R16. Every case runs with an agent author and no human present.

### Acceptance Examples

- AE1. **Covers R4, R10.** **Given** a mutant whose AND group lost one condition, **when** the review reports cause insufficiency on the effect with the keyed entity ID, **then** the defect counts as found, whatever the sentence says.
- AE2. **Covers R6, R13.** **Given** the repaired twin of that mutant, **when** the review reports cause insufficiency on the same effect, **then** the finding counts as false for M2.
- AE3. **Covers R5, R11.** **Given** a mutant with a deleted negative branch, **when** the review reports the fixed side-effect label on the keyed action, **then** the defect counts as found.
- AE4. **Covers R9, R13.** **Given** a clean lookalike with a gate, **when** the review reports a clarity finding on it, **then** the finding is logged and does not change M2.
- AE5. **Covers R7, R12.** **Given** a two-defect tree, **when** the review finds only the first defect, **then** M1 counts one of two, and the result for the second defect position shows the miss.

### Success Criteria

- MS1 is met when M1 is 100% for both operators on the first set (the floor in QUALITY.md). On a small set, one miss fails MS1; this is intended.
- The first run gives an M2 baseline, so the M2 floor decision can be made from data.
- A second run with no change to the reviewer gives the same scores, apart from model variation that the ledger records.

### Scope Boundaries

**Deferred for later**

- The other eight operators in the QUALITY.md catalog.
- Seeded strategy documents for prose mapping.
- A paraphrase pass that rewrites mutant wording.
- Scheduled or pull-request evaluation runs, and any merge gate on an evaluation result.
- Scoring of findings in the six other CLR categories.

**Outside this work**

- The CLR review itself; it is built by the core-vocabulary plan.
- Structure checks; the tool repository owns them.

<!-- ce-section: work-relationships -->
### How This Work Fits Together

This plan covers the first evaluation set (track T4) for milestone MS1. The list below is the current understanding, not a committed roadmap.

- CLR review and core vocabulary (docs/plans/2026-11-11-1621-feat-core-vocabulary-clr-review-plan.md): This plan depends on it for runs. The factory and its keys can be built before the review exists. This plan answers that plan's deferred question about the first test set.
- Full operator catalog: Depends on this plan's seed format and scorer. Still to decide when the first baseline is in.
- Seeded strategy documents: Depends on the prose-mapping part of the review. Can proceed independently of the full catalog.
- Fitness function FF8 (scheduled evaluation floors): Depends on this plan's runs being cheap and stable.

### Dependencies / Assumptions

- The review gives findings in the form of core-vocabulary plan R13 (category, entity with ID in brackets, one sentence). R11 needs that plan's R10 to use a fixed label for a possible negative branch.
- ADR 0002 (agent author with no human) and ADR 0004 (vocabulary stability uses the evaluation floors) apply to this set.
- QUALITY.md's evaluation-set contract names AE1-AE6 as the first seeds. Only AE1 and AE2 are defect seeds for the two operators; AE3 supplies a clean lookalike (cause AND NOT mitigation). AE4-AE6 test unreadable input, depth, and question mode, and stay out of v1. The contract text is corrected to match.

### Outstanding Questions

**Deferred to Planning**

- The structured format for seeds, keys, and results.
- The number of seeds per operator and the number of two-defect and hand-written cases.
- The wording of the fixed side-effect label, agreed with the core-vocabulary plan.
- How the run records the reviewer version.

### Sources / Research

- QUALITY.md (evaluation set contract, metric charter, results ledger)
- STRATEGY.md (MS1, M1, M2)
- ARCHITECTURE.md (FF3, FF8)
- docs/ideation/2026-11-12-testable-strategy-ideation.html (idea 3, evaluation-set factory)
- scripts/check-upload-limits.test.mjs (pattern for repository checks with temporary fixtures)
