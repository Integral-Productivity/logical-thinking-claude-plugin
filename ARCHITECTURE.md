---
name: Logical Thinking
last_updated: 2026-11-13
---

# Logical Thinking Architecture

This file describes how the plugin is built and which checks keep it in shape. [STRATEGY.md](STRATEGY.md) says what the plugin is for. [QUALITY.md](QUALITY.md) says how the plugin shows that it gets there. The ADRs in [docs/adr/](docs/adr/) record the decisions that are hard to reverse.

## Scope

The plugin judges the logic of Thinking Process trees and guides a practitioner, human or agent, through the chain of questions. It does not draw or edit trees, and it does not check tree structure or file formats.

## System context

Two repositories share the work. The split is recorded in the tool repository's ADR 0001 (method and tool split).

| Repository | Owns | Does not own |
|---|---|---|
| Method: this plugin | Core vocabulary, CLR review, guided chain skills, evaluation set, domain extension | Structure checks, file formats, tree editing |
| Tool: the tree tool repository | Structure checks (loops, IDs, unconnected entities), file formats, scripts that read and write tree files | Logic judgments, CLR categories |

The two meet at one point: the **finding**. A finding from either repository names the entity first with its ID in brackets, then says in one sentence what is wrong (plan R13). The author reads one consistent list.

## Building blocks

| Block | What it does | Status | Source |
|---|---|---|---|
| Core vocabulary | Names the tree types, the logical kinds (effect, action, precondition, obstacle, indicator), connectors (arrow, AND group, OR), the gate and cause AND NOT mitigation patterns, and the eight CLR categories | Planned | Plan R1-R5 |
| CLR review | Restates any readable tree, or the logic in prose, as entities and arrows, then walks every entity and arrow through the CLR categories. Cause insufficiency comes first and deepest, side effects second | Planned | Plan R6-R16, ADR 0003 |
| Guided chain | One tree-building skill per tree type. Runs the chain of questions forward, or in reverse to backfill logic behind an existing solution. Calls the CLR review by default | Later | STRATEGY.md tracks |
| Evaluation set | Seeded-defect trees, clean trees, and seeded strategy documents, with answer keys | Partial: seeded trees for two categories exist; strategy documents are planned | [QUALITY.md](QUALITY.md#evaluation-set-contract) |
| Domain extension | Added domains map each class to a logical kind, so the review reads the kind, not the class name | Later | ADR 0001 (Proposed) |
| Repository checks | node:test scripts that fail a pull request when an architectural rule breaks | Five run in CI | [Fitness functions](#fitness-functions), [ADR 0006](docs/adr/0006-architectural-characteristics-are-guarded-by-fitness-functions.md) |

## How a review flows

1. **Input.** The author gives a tree in any form Claude can read, or a prose document such as a strategy.
2. **Restate.** The review restates the input as entities and arrows. If it cannot read a part, it names that part and goes on (plan R7).
3. **Walk.** The review walks each entity and arrow through the CLR categories in a fixed order (plan R8-R11). It skips structure checks, because the tool repository makes them (plan R12).
4. **Report.** Each finding has a category, the entity with its ID, and one sentence. Depth (a reason and a fixed example) comes on request and does not change the finding (plan R14, AE5).
5. **Disposition.** The author accepts, repairs, rebuts, or leaves each finding. A repair is applied only after the author reviews it and gives permission (STRATEGY.md boundaries, ADR 0002).

## Key decisions

| Decision | Record | Status |
|---|---|---|
| Method and tool live in separate repositories | Tool repository ADR 0001 | Accepted |
| Domains model the path from commitment to outcome; every class declares a logical kind | [ADR 0001](docs/adr/0001-logic-tree-domains-model-commitment-to-outcome.md) | Proposed |
| The primary user is a self-guided practitioner, human or agent | [ADR 0002](docs/adr/0002-primary-user-is-a-self-guided-practitioner-human-or-agent.md) | Accepted |
| The CLR review is on by default | [ADR 0003](docs/adr/0003-clr-review-is-on-by-default.md) | Accepted |
| The core vocabulary is stable after three releases without a breaking change | [ADR 0004](docs/adr/0004-core-vocabulary-is-stable-after-three-releases.md) | Accepted |
| The plugin judges logic only and shares one finding form with the tool | [ADR 0005](docs/adr/0005-plugin-judges-logic-and-shares-one-finding-form-with-the-tool.md) | Accepted |
| Architectural characteristics are guarded by fitness functions; static checks block, model runs are scheduled | [ADR 0006](docs/adr/0006-architectural-characteristics-are-guarded-by-fitness-functions.md) | Accepted |
| Neutrality is checked by a lint and a person | [ADR 0007](docs/adr/0007-neutrality-is-checked-by-a-lint-and-a-person.md) | Accepted |
| Every strategy claim links to evidence | [ADR 0008](docs/adr/0008-every-strategy-claim-links-to-evidence.md) | Accepted |
| Metrics are defined before data arrives | [ADR 0009](docs/adr/0009-metrics-are-defined-before-data-arrives.md) | Accepted |
| The evaluation set is built from neutral seeds and mutation operators | [ADR 0010](docs/adr/0010-the-evaluation-set-is-built-from-neutral-seeds-and-mutation-operators.md) | Accepted |
| The session record is a local file the author owns | [ADR 0011](docs/adr/0011-the-session-record-is-a-local-file-the-author-owns.md) | Accepted |
| The reviewer is one versioned unit, and results are kept per category | [ADR 0012](docs/adr/0012-the-reviewer-is-one-versioned-unit-and-results-are-kept-per-category.md) | Accepted |

## Architectural characteristics

These are the qualities the structure must protect. Each one has at least one fitness function below.

| ID | Characteristic | Why it matters | Strategy source |
|---|---|---|---|
| AC1 | Scrutiny by default | The positioning puts the CLR review first | Positioning, resist line |
| AC2 | Separation of concerns | The plugin judges logic only; the tool owns structure | Boundary B1 |
| AC3 | Interoperable findings | Tool findings and review findings must read alike | Tool link track |
| AC4 | Neutrality | Examples and fixtures name no real person, company, or private figure | Boundary B4 |
| AC5 | Extension without core change | Domains extend the vocabulary and never change it | Boundary B3, resist line, milestone MS3 |
| AC6 | Agent operability | Every skill works with no human present | ADR 0002 |
| AC7 | Low delay | Depth must not turn into analysis paralysis | Brand |
| AC8 | Installable size | Plugin and skill descriptions stay within upload limits | Marketplace rules |

## Fitness functions

A fitness function is an automated or scheduled check that shows whether the system still has a characteristic. The checks follow the pattern of `scripts/check-upload-limits.test.mjs`: build temporary fixtures, run the check, and fail the pull request on a break. The static checks live in `scripts/fitness/`; the Fitness functions workflow runs their tests and then `node scripts/fitness/run.mjs .` on each pull request ([ADR 0006](docs/adr/0006-architectural-characteristics-are-guarded-by-fitness-functions.md)). Claude branches merge on green CI, so a rule that lives only in prose can be removed without notice.

| ID | Protects | Check | Kind | Status |
|---|---|---|---|---|
| FF1 | AC8 | Plugin and skill descriptions are within the upload limits | CI, static | Exists |
| FF2 | AC1 | Every tree-building skill calls the CLR review by default, and no setting turns it off by default | CI, static | Planned, after the first skill |
| FF3 | AC4 | Fixtures and examples pass a neutrality lint: email addresses, currency figures, and denylisted names (stored as hashes) fail; other proper nouns are left for a person to review ([ADR 0007](docs/adr/0007-neutrality-is-checked-by-a-lint-and-a-person.md)) | CI, static plus review | Exists; the allowlist of invented names is planned |
| FF4 | AC2 | No CLR finding category is a structure category (loops, IDs, unconnected entities) | CI, static | Exists; reads the evaluation categories and answer keys until the vocabulary registry exists |
| FF5 | AC3 | Plugin findings validate against the same finding schema as tool findings | CI, static | Planned, needs a shared schema with the tool repository |
| FF6 | AC5 | The core vocabulary registry allows additions and rejects a rename or a changed definition | CI, static | Planned, after the registry exists |
| FF7 | AC5 | With a domain loaded, the core evaluation set still passes at or above its floors | Evaluation run | Later, with the first domain |
| FF8 | AC1, AC7 | Catch rate, false findings, and the delay measure stay at or above their floors | Evaluation run, scheduled | Planned, see [QUALITY.md](QUALITY.md#metric-charter) |
| FF9 | All | Every strategy ID in QUALITY.md links to a metric, a milestone, a check, or an ADR ([ADR 0008](docs/adr/0008-every-strategy-claim-links-to-evidence.md)) | CI, static | Exists |
| FF10 | All | Each ADR has a number, a Date, a Status, and a Source section, and is listed in the index; every relative Markdown link and heading anchor resolves | CI, static | Exists |

FF7 and FF8 call a language model. They are costly and not fully repeatable, so they run on a schedule and write to the results ledger. They do not block a merge until runs are cheap and stable.

### Core vocabulary stability

"Stable" needs a test before the domain track can start. The planned rule:

- The core terms live in one registry file with a content hash.
- An addition is allowed. A rename, a removal, or a changed definition fails FF6 and needs an ADR.
- The vocabulary is **stable** after three consecutive releases with no breaking change, while the evaluation set stays at or above its floors ([ADR 0004](docs/adr/0004-core-vocabulary-is-stable-after-three-releases.md)).

## Repository layout

| Path | Contents | Status |
|---|---|---|
| `STRATEGY.md`, `ARCHITECTURE.md`, `QUALITY.md` | Strategy, structure, and evidence | Exists |
| `docs/adr/` | Decision records | Exists |
| `docs/plans/` | Requirements and implementation plans | Exists |
| `docs/ideation/` | Ranked idea sets | Exists |
| `scripts/` | Repository checks | Exists |
| `scripts/fitness/` | Architecture fitness functions FF3, FF4, FF9, and FF10 | Exists |
| `skills/` | The CLR review and tree-building skills | Planned |
| `vocabulary/` | Core vocabulary registry | Planned |
| `eval/` | Evaluation set, answer keys, and run records ([eval/README.md](eval/README.md)) | Exists |
| `scripts/eval/` | Evaluation-set build, scorer, and run command | Exists |

## Open questions

- Which file holds the core vocabulary registry, and in which format.
- The shared finding schema, agreed with the tool repository.
- When an evaluation run may become a merge gate.
