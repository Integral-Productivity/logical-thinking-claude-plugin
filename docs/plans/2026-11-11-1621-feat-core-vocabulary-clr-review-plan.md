---
title: Core Vocabulary and CLR Review - Plan
type: feat
date: 2026-11-11
topic: core-vocabulary-clr-review
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
execution: code
---

# Core Vocabulary and CLR Review - Plan

## Goal Capsule

- **Objective:** Logic errors in Thinking Process trees are caught before the tree is used. Insufficient causes and missed side effects are caught first. Experts, learners, and Claude checking its own draft all get the same findings in words they can act on.
- **Product authority:** This plan covers one area of the logical-thinking method: the core vocabulary and the CLR review. Tree-building skills, the tool-repo link, and the domain model are not active scope (see How This Work Fits Together).
- **Open blockers:** None.

---

## Product Contract

### Summary

Add a core vocabulary for Thinking Process trees and a CLR review built on it. The review restates any tree that Claude can read, then walks all eight CLR categories in a fixed order. Sufficiency and side effects come first and get the deepest check. The category walk is the default mode, and two other modes are available on request.

### Problem Frame

Thinking Process trees are only as good as their logic. Today a script checks the structure of a tree (loops, missing IDs, unconnected entities), and a person judges the logic. Logic errors still slip through. The most frequent error is a cause that is not sufficient on its own to produce its effect. The second, close behind, is a side effect that nobody drew: an action or injection that also causes an undesirable effect the tree does not show.

Three audiences meet this problem in different ways. A practitioner who knows the method wants a fast, complete check. A learner new to the method needs to see why an arrow is weak and what a better one looks like. Claude, when it drafts or edits a tree, needs a self-check before it shows the tree to anyone. No shared vocabulary exists yet, so each of these checks would use its own terms.

### Key Decisions

- **Scope is the core vocabulary and the CLR review only.** The other areas of the method depend on this one. (session-settled: user-directed — chosen over tree-building skills, the tool-repo link, or the whole method at once: the vocabulary is the base the other areas need.) Governs R1–R16.
- **All three audiences are served from the first release.** (session-settled: user-directed — chosen over experts only or Claude only: one review must work for experts, Claude, and learners.) Governs R13, R14, R15.
- **Every CLR category ships now; sufficiency and side effects get priority.** (session-settled: user-directed — chosen over a release with only the two priority categories: logic errors of every kind slip through, and these two slip through most.) Governs R5, R8, R9, R10.
- **Same findings for every audience; depth on request.** (session-settled: user-directed — chosen over separate outputs per audience: one finding list keeps the review consistent and testable.) Governs R13, R14.
- **Input is any tree form Claude can read.** (session-settled: user-directed — chosen over one tree format only: trees exist in several forms, and the review restates the tree before it judges.) Governs R6, R7.
- **Core vocabulary only.** Domains, source attributes, and competency questions CQ-01 to CQ-10 from plugin ADR 0001 wait for a later brainstorm. (session-settled: user-directed — chosen over core plus optional domains: the domain model is still Proposed.) Governs R1, R2.
- **Work type and Countermeasure type wait with the domains.** (session-settled: user-directed — chosen over adding them to the core now: they belong with the domain model.) Governs R2.
- **The gate pattern and the cause AND NOT mitigation pattern ship now as review checks.** (session-settled: user-directed — chosen over deferring them: both are frequent sources of insufficient causes.) Governs R4, R11.
- **The category walk is the primary mode; other modes are available.** (session-settled: user-directed — chosen over hot spots only or reservations as questions only: the walk is complete and testable, and the other modes serve speed and teaching.) Governs R8, R16.
- **The two other modes are in this plan, after the walk.** The category walk is built and tested first. (session-settled: user-approved — chosen over deferring the other modes to a later plan: confirmed in the scope synthesis.) Governs R16.
- **Logical kinds stay in the core vocabulary.** They are needed to judge sufficiency and side effects, and they do not depend on the domains. (session-settled: user-approved — chosen over deferring them with the domains: confirmed in the scope synthesis.) Governs R2.
- **The review judges logic only.** Structure checks stay with the tool scripts. Governs R12.

### Requirements

**Core vocabulary**

- R1. The vocabulary names the Thinking Process tree types: Goal Tree, Current Reality Tree, Evaporating Cloud, Future Reality Tree, Prerequisite Tree, and Transition Tree, with one plain-language definition each.
- R2. The vocabulary defines the logical kinds of entity (effect, action, precondition, obstacle, indicator) without domain, source, Work type, or Countermeasure type attributes.
- R3. The vocabulary defines arrows, AND groups, and OR (separate arrows into one effect), and states how sufficiency reads for each.
- R4. The vocabulary defines the gate pattern and the cause AND NOT mitigation pattern, each with one neutral example.
- R5. The vocabulary defines the eight CLR categories: clarity, entity existence, causality existence, cause insufficiency, additional cause, cause-effect reversal, predicted effect existence, and tautology.

**Review input**

- R6. The review accepts any tree form that Claude can read, and restates the tree as entities and arrows before it judges.
- R7. When the review cannot read part of a tree, it says which part and reviews the rest.

**Category walk (default mode)**

- R8. The default mode walks every entity and every arrow through all eight CLR categories in a fixed order.
- R9. Cause insufficiency is checked first and deepest: for each effect, the review asks whether its causes, together, are enough, and names the missing cause when they are not.
- R10. Side effects are checked second and as deeply: for each action or injection, the review predicts what else it causes, compares that with the tree, and reports each undrawn effect as a possible negative branch.
- R11. The review checks each gate and each cause AND NOT mitigation group against its pattern from R4.
- R12. The review does not repeat the structure checks that the tool scripts already make.

**Findings and audiences**

- R13. Each finding names the CLR category, names the entity first with its ID in brackets, and says in one sentence what is wrong.
- R14. On request, a finding adds the reason and an example of a fixed arrow or entity.
- R15. The findings use the same words for experts, learners, and Claude; Claude can run the review on its own draft before it shows the draft.

**Other modes**

- R16. Two other modes are available on request: a hot-spot mode that checks the most likely weak places deeply and sweeps the rest lightly, and a question mode that phrases each finding as a scrutinizer reservation for the tree author to answer.

### Acceptance Examples

- AE1. **Covers R9.** **Given** an effect "Late deliveries" with one cause "Too few drivers", **when** the review runs, **then** it reports cause insufficiency on that arrow and names a likely missing cause, for example "Orders arrive in peaks".
- AE2. **Covers R10.** **Given** an injection "Add overtime shifts" with only desired effects below it, **when** the review runs, **then** it reports a possible negative branch, for example "Driver fatigue rises".
- AE3. **Covers R11.** **Given** an undesirable effect drawn from its cause alone, where the tree also shows a mitigation, **when** the review runs, **then** it reports that the effect should read as cause AND NOT mitigation.
- AE4. **Covers R7.** **Given** a tree in which one branch is an unreadable image, **when** the review runs, **then** it names that branch as not reviewed and gives findings for the rest.
- AE5. **Covers R13, R14.** **Given** a finding on an arrow, **when** the user asks for depth, **then** the same finding adds a reason and a fixed example, and its category, entity, and sentence do not change.
- AE6. **Covers R16.** **Given** the question mode, **when** the review finds an insufficient cause, **then** it asks the author, for example, "Is 'Too few drivers' alone enough to cause 'Late deliveries'?"

### Success Criteria

- On a set of trees with seeded, known defects, the category walk finds every seeded insufficient cause and every seeded missing side effect.
- On a set of clean trees, the review raises few false findings. The planner sets the threshold, because no baseline exists today.
- A learner can act on a finding without other help, and an expert finds nothing in it that conflicts with standard CLR practice.

### Scope Boundaries

- Tree-building skills (one per tree type) are later work.
- The link from the tool repo to this vocabulary is later work.
- Domains, source attributes, competency questions CQ-01 to CQ-10, Work type, and Countermeasure type wait for the domains brainstorm.
- Structure checks (loops, IDs, unconnected entities) stay in the tool scripts.
- No example, fixture, or requirement names a real person, company, or private business figure.

<!-- ce-section: work-relationships -->
### How This Work Fits Together

This plan covers the core vocabulary and the CLR review. The list below is the current understanding of the other areas, not a committed roadmap.

- Tree-building skills: Depends on this plan's vocabulary. Enables guided building of each tree type.
- Domain model (domains, source attributes, CQ-01 to CQ-10, Work type, Countermeasure type): Depends on this plan's vocabulary. Still to decide in a later brainstorm, based on plugin ADR 0001.
  - Tool-repo competency-question checks (issue #6 in the tool repo): Depends on the domain model.
- Tool-repo link to this vocabulary: Depends on this plan's vocabulary. Can proceed independently of the tree-building skills.

### Dependencies / Assumptions

- The tool repo's check script gives findings as the entity name followed by its ID in brackets; R13 uses the same form so findings from both read alike.
- Plugin ADR 0001 is Proposed. This plan uses only its logical kinds and leaves its domains and CQs untouched.

### Outstanding Questions

**Deferred to Planning**

- Which seeded-defect and clean trees form the first test set, and the false-finding threshold.
- How the user selects a mode and asks for depth.

### Sources / Research

- docs/adr/0001-logic-tree-domains-model-commitment-to-outcome.md (logical kinds, CQ-01 to CQ-10, open points)
- Tool repo: docs/adr/0001-split-logical-thinking-method-from-flying-logic-tool.md (method and tool split)
- Tool repo: scripts/check-tree.py (structure checks and finding format)
- Tool repo: issue #2 (this work) and issue #6 (competency-question checks)
