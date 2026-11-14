# Architecture decision records

Each record states one decision that is hard to reverse: its context, the options, the decision, and the consequences. Each record has a Source section that links where the decision came from. The fitness function `scripts/fitness/adr.mjs` checks this log in CI.

To add a record, use the next number, add a Source section, and add a row here. To change a decision, write a new record that supersedes the old one.

| ADR | Decision | Status |
|---|---|---|
| [1](0001-logic-tree-domains-model-commitment-to-outcome.md) | Logic-tree domains model the path from commitment to outcome | Superseded by 14 |
| [2](0002-primary-user-is-a-self-guided-practitioner-human-or-agent.md) | The primary user is a self-guided practitioner, human or agent | Accepted |
| [3](0003-clr-review-is-on-by-default.md) | The CLR review is on by default | Accepted |
| [4](0004-core-vocabulary-is-stable-after-three-releases.md) | The core vocabulary is stable after three releases without a breaking change | Accepted |
| [5](0005-plugin-judges-logic-and-shares-one-finding-form-with-the-tool.md) | The plugin judges logic only and shares one finding form with the tool | Accepted |
| [6](0006-architectural-characteristics-are-guarded-by-fitness-functions.md) | Architectural characteristics are guarded by fitness functions | Accepted |
| [7](0007-neutrality-is-checked-by-a-lint-and-a-person.md) | Neutrality is checked by a lint and a person | Accepted |
| [8](0008-every-strategy-claim-links-to-evidence.md) | Every strategy claim links to evidence | Accepted |
| [9](0009-metrics-are-defined-before-data-arrives.md) | Metrics are defined before data arrives | Accepted |
| [10](0010-the-evaluation-set-is-built-from-neutral-seeds-and-mutation-operators.md) | The evaluation set is built from neutral seeds and mutation operators | Accepted |
| [11](0011-the-session-record-is-a-local-file-the-author-owns.md) | The session record is a local file the author owns | Accepted |
| [12](0012-the-reviewer-is-one-versioned-unit-and-results-are-kept-per-category.md) | The reviewer is one versioned unit, and results are kept per category | Accepted |
| [13](0013-cause-insufficiency-keys-match-the-effect-not-its-causes.md) | Cause insufficiency keys match the effect, not its causes | Accepted |
| [14](0014-concrete-logic-domains-live-outside-the-plugin.md) | Concrete Logic Domains live outside the plugin | Accepted |
