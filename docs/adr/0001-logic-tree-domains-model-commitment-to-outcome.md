# 1. Logic-tree domains model the path from commitment to outcome

Date: 2026-11-11

## Status

Proposed (2026-11-11). Tried on one initiative before this record was written; all ten competency questions below passed. Open points decided 2026-11-12 (decisions 10 to 12). Amended 2026-11-12 after the first pilot review (decisions 4, 13 to 16, and the CQ-05 and CQ-09 wording).

## Context

Logic trees (Goal Tree, Current Reality Tree, Future Reality Tree, Prerequisite Tree) are often built from records kept in other tools: product objectives, key results and initiatives in a product-management tool, and goals, targets, projects and next actions in a self-organization (for example Holacracy) tool. The trees are then reviewed with the Categories of Legitimate Reservation (CLR).

Two problems appear when this is done:

1. **A box's source and its logical role are different things.** An objective is a source record; in a tree it acts as an effect. Tool-specific classes show where a box came from, and Thinking Process classes show its role. Without a rule that links the two, checks cannot reason about tool-specific classes.
2. **Objectives, key results, goals and targets are commitments, not results.** Each is a decision to pursue an outcome and stays a hypothesis until there is evidence. A tree that links an initiative straight to an objective hides the steps in between: something is released, it is launched, and a customer acts on it. Skipping those steps is "Field of Dreams" thinking ("build it and they will come").

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Thinking Process classes only | Keep Goal, Effect, Action and so on; record the source type in an attribute | Rejected: hides the release, launch and customer steps and the framework terms |
| B. One "Commitment to Outcome" domain | One custom domain for the whole chain | Rejected: mixes governance, product and customer terms in one list |
| C. Three domains plus a mapping layer | One domain per source area; every class declares a logical kind; the cross-domain chain is a mapping | Chosen |

## Decision

1. **Three domains.**

   | Domain | Classes (logical kind) |
   |---|---|
   | Self-Organization | Purpose, Accountability, Domain, Policy, Project, Next Action, Checklist Item, Metric, Tension, Trigger, Request, Governance Proposal, Inferred, Org Goal (effect), Org Target (indicator) |
   | Product Lifecycle | Objective (effect), Key Result (indicator), Initiative (action = commitment), Release (effect), Launch (action) |
   | Customer Progress | Job (precondition), Switch Trigger (precondition), Customer Outcome (effect), Pain Point (undesirable effect), Push (effect), Pull (effect), Anxiety (obstacle), Habit (obstacle), Customer Action (observed effect), Design Opportunity (bridge) |

   Customer Progress draws on Jobs To Be Done and Outcome-Driven Innovation (Job, Customer Outcome) and on the forces of progress (Push, Pull, Anxiety, Habit).

2. **Every class declares a logical kind:** effect, action, precondition, obstacle or indicator. Checks and CLR review read the kind, not the class name, so a box can keep its source class and still be checked.
3. **Thinking Process classes stay.** The built-in Obstacle is not duplicated. A self-organization "Action" is named "Next Action" so it does not clash with the Thinking Process "Action". A self-organization "Trigger" (of a tension) differs from a JTBD "Switch Trigger". A self-organization "Goal" is named "Org Goal".
4. **"Commitment to Outcome" names the mapping layer, not a domain.** The canonical chain is:
   - Initiative → Release → Launch
   - Launch AND customer need (Precondition) AND the forces → Customer Action
   - Customer Action → Customer Outcome → business outcome → Objective
   - The forces gate the customer's action, not the launch: Push AND Pull AND Switch Trigger AND NOT Anxiety AND NOT Habit, together with the Launch, → Customer Action. A Launch is the provider's act of making a release available; the switch is the customer's own act.
5. **One box per source record.** Lifecycle state goes in a `commitment` attribute. Evidence goes in `evidence` (hypothesis, partial, evidenced, refuted) and `evidence_ref`.
6. **A shared attribute set:** `src_type`, `src_id`, `stratum`, `commitment`, `evidence`, `evidence_ref`, `facet`, `journey_step`, `evidence_source`, `assumption`, `kind`. Values stay short. Links and long identifiers go in the box note, because some tools fail on long values without spaces.
7. **Outcome facets are attributes, not classes.** Balanced Scorecard perspectives and Lean SQDC are two value sets for `facet`. A business outcome with facet=Customer (the business's measure of its customers) is not a Customer Outcome (the customer's own success measure, written in ODI form: "Minimize the time it takes to …").
8. **Competency questions are the acceptance tests.**

   | ID | Question |
   |---|---|
   | CQ-01 | Does every box state its `src_type`? |
   | CQ-02 | Does each box's class fit its source type? |
   | CQ-03 | Does every initiative reach an objective? |
   | CQ-04 | Does every objective trace up to an anchor (an objective that mirrors an approved organizational goal)? |
   | CQ-05 | Is there no stratum inversion (a cause at a higher stratum than its effect), not counting enabler edges from a Release or Launch? |
   | CQ-06 | Is every edge that skips two or more strata flagged `level_skip=yes`? |
   | CQ-07 | Does each source record appear in exactly one box? |
   | CQ-08 | Does every edge have a source, or `assumption=yes`? |
   | CQ-09 | Is there no path from an Initiative or Release to an outcome that skips Customer Action, and does every Customer Action have a Release, a Launch and a Precondition among its ancestors? |
   | CQ-10 | Does every outcome state its `evidence`, with an `evidence_ref` when it is `evidenced`? |

   CQ-09 is the Field of Dreams check.

9. **Strata follow Stratified Systems Theory.** `stratum` uses the levels I to VIII of time span of discretion (after Elliott Jaques).
10. **`src_type` names the source tool and the record type** as `<tool>:<RecordType>`. `none` marks a box that exists only in the tree, and `research` marks evidence from a source that has no tool record. The allowed values for the reference tool set are:

    | Tool (prefix) | Record types |
    |---|---|
    | Product management, Productboard (`pb:`) | Product, Component, Feature, Subfeature, ReleaseGroup, Release, Objective, KeyResult, Initiative, Opportunity, Finding, Note (a feedback note) |
    | Self-organization, GlassFrog (`gf:`) | Role (for Purpose), Accountability, Domain, Policy, Project, Action, ChecklistItem, Metric, Tension, Goal, Target |
    | User research, Great Question (`gq:`) | Study, Session, Highlight, Insight, Reel, Response |
    | Other | `research`, `none` |

    People records (customers, organizations, research candidates and participants) are not box sources: a box describes a claim, not a person. Productboard's v2 API exposes no Topic or Theme record type, so none is listed. CQ-02 maps each class to the `src_type` values it allows.
11. **CQ-06 flags every edge that skips two or more strata.** No skip is allowed silently. CLR review clears a reviewed skip with `skip_ok=yes` and gives the reason in the edge note. A key result one stratum below its objective is not a skip.
12. **CQ-04 warns until every existing objective has an anchor, then fails.** The warning gives the count of objectives without an anchor. It becomes a failure when the re-parenting of existing objectives is complete.

13. **Tree-only hypothesis boxes use `src_type=research`.** A box that has no tool record and is a hypothesis to test (a job, an outcome, a force, an effect, a precondition) takes `research`, with `evidence=hypothesis`. CQ-02 allows `research` for the Customer Progress classes and for Intermediate Effect, Desirable Effect and Precondition. `none` stays for boxes that make no claim to test, such as layout or grouping aids. (Amended 2026-11-12 after the first pilot review.)
14. **CQ-05 skips enabler edges, and stratum measures time span, not frequency.** An edge from a Release or Launch makes an action possible; it does not cause it at the same time span, so CQ-05 does not count it as an inversion. A box's stratum is the time span of the task it names: a step done once per session, or once in days to weeks, is stratum I even when it repeats for years. (Amended 2026-11-12.)
15. **CQ-09 checks ancestors, not direct inputs.** The causal chain is Release → Launch → customer switch → customer use. Requiring Release, Launch and Precondition as direct inputs to every Customer Action would add edges that carry no meaning. A Customer Action passes when each of the three appears anywhere upstream. The no-bypass half of CQ-09 is unchanged. (Amended 2026-11-12.)
16. **A goal names the state to reach, not its cause.** A "because …" clause in a goal or objective title is a cause, and belongs in the tree as an effect box with an arrow into the goal. This keeps the goal stable while CLR review challenges the arrow. (Amended 2026-11-12.)

## Consequences

- **Tool layers implement this vocabulary.** A Flying Logic tool layer creates the three domains and runs the competency questions in its tree check. A change to this vocabulary needs a matching change there.
- **A formal ontology can follow.** The domains and the mapping layer can be published as SKOS concept schemes, with SHACL shapes for the competency questions.
- **The pilot left four classes unused:** Org Goal, Org Target, Pain Point and Design Opportunity. A later tree with self-organization records or customer research tests them.
- **"Objective" also exists in the Prerequisite Tree vocabulary.** Trees that use both need the logical kind to tell them apart.
- **Direct initiative → objective links in existing trees are kept and tagged**, so CQ-09 reports them instead of hiding them.

## Open points

- A Principle class (for service-design or other principles that justify an arrow) may be added if more than one principle appears; today a principle is a Precondition with `assumption_type=principle`.

The three open points of 2026-11-11 were decided on 2026-11-12 (decisions 10 to 12). Decisions 13 to 16 came from the first pilot review on 2026-11-12.
