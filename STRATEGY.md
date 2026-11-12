---
name: Logical Thinking
last_updated: 2026-11-12
---

# Logical Thinking Strategy

## Purpose

People who try to apply the Thinking Processes skip or abandon steps in the chain of questions, because the tools are hard to learn and skilled facilitators are scarce. When trees do get built, weak cause-effect claims go unchallenged, so decisions rest on flawed logic.

## Positioning

Scrutiny is built in first, as a quality principle: every tree gets a CLR review by default, so logic is checked without a scarce expert. The guided chain of questions (what to change, to what, how to cause the change) supports the flow, so no step is skipped or abandoned.

## Users

**Primary:** Self-guided practitioner, human or agent - knows the basics of the Thinking Processes and has no facilitator. They hire Logical Thinking to build and check a tree on a real problem of their own.

Experts, learners, and Claude checking its own draft get the same findings, with depth on request.

## Boundaries

- The tool repo owns structure checks (loops, IDs, unconnected entities) and file formats; this plugin judges logic only.
- The review gives findings. It can propose and apply a repair only after the author reviews it and gives permission; for an agent author, its own approval rule applies.
- Domains extend the core vocabulary; they never change it.
- Examples, fixtures, and test trees are neutral: no real person, company, or private business figure.
- Not a course: learners are served by findings with depth on request, not by a separate curriculum.
- No tree editor: drawing and editing trees stays with the tree tool.

_Resist a change when:_ it makes the CLR review optional by default, or it starts a new domain before the core vocabulary is stable.

## Key metrics

- **Seeded-defect catch rate** - share of seeded insufficient causes and missing side effects that the review finds; measured on the evaluation set.
- **False findings per clean tree** - findings raised on trees with no seeded defect; measured on the evaluation set.
- **Findings acted on** - share of findings the author accepts, repairs, or answers; measured in sessions.
- **Chain completion** - share of sessions, human or agent, that finish the chain of questions.

## Tracks

### CLR review and core vocabulary

The shared words for trees and the category walk that checks them, with sufficiency and side effects first. It also maps the logic out of prose, such as a business or product strategy document, into a tree before it judges, and adds necessity checks for Goal Trees, Evaporating Clouds and Prerequisite Trees.

_Why it serves the approach:_ It is the scrutiny that the positioning puts first, and every other track depends on its vocabulary.

### Guided chain

Tree-building skills, one per tree type, that walk the practitioner through the chain of questions. It also runs the chain in reverse to backfill missing logic behind an existing solution, and reports which links in the chain a source does not answer.

_Why it serves the approach:_ It keeps the flow going so no step is skipped or abandoned.

### Tool link

The link from the tree tool repo to this vocabulary, so tool findings and review findings read alike.

_Why it serves the approach:_ Structure checks and logic checks meet in one consistent result for the author.

### Evaluation set

Seeded-defect trees, clean trees, and seeded strategy documents, shared by the review and the chain.

_Why it serves the approach:_ Three of the four metrics depend on it, so scrutiny claims stay testable.

### Domain extension

Design, evaluate, use, and integrate added domains (for example Self-Organization, Product Lifecycle and Customer Progress) in alignment with the default tools. Source marks come first, so each entity shows if it is stated in the source or inferred by backfill.

_Why it serves the approach:_ Practitioners apply the method to real problems in their own domain without changing the core.

## Milestones

- **Not yet dated** - The CLR review finds every seeded insufficient cause and missing side effect in the first evaluation set.
- **Not yet dated** - The first guided tree-building skill ships with the review on by default.
- **Not yet dated** - The first added domain passes the evaluation set without a change to the core vocabulary.

## Brand

**One-liner:** Deep deliberation without delay.

**Key message:** Deliver high-fidelity logic that solves complex problems without analysis paralysis.
