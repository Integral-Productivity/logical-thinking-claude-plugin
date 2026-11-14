# 14. Concrete Logic Domains live outside the plugin

Date: 2026-11-14

## Status

Accepted (2026-11-13). Chosen by the project owner. Supersedes [ADR 0001](0001-logic-tree-domains-model-commitment-to-outcome.md).

## Context

ADR 0001 defined three concrete domains (Self-Organization, Product Lifecycle and Customer Progress), the mapping from their source record types, and ten competency questions. Those are content for one area of use. The plugin holds the core method: the vocabulary, the CLR review and the guided chain. Its strategy says that added domains extend the core vocabulary and never change it, and that no domain starts before the core vocabulary is stable (ADR 0004).

A question about the scope of one check (CQ-09) showed the problem. The person who owns the domain must decide such a question. The method cannot decide it, and the plugin repository is the wrong place to record it.

"Domain" is the Flying Logic term for a group of entity classes, stored inside each tree and exported as an `.xlogicd` file. "Logic Domain" is that Flying Logic domain plus the logical kind of each class, its source mappings, and later its checks and scripts.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Keep the domains in the plugin | Plugin holds the method and the domains | Rejected: mixes one area of use with the core method; domain owners must change the plugin |
| B. Move the domains to their own repository | A public repository holds Logic Domains and a marketplace index; the plugin keeps the extension contract | Chosen |
| C. One repository per domain, no index | Each owner keeps a domain alone | Rejected for now: nothing to find domains with; a later package manager can read the index of option B |

## Decision

1. Concrete Logic Domains live in a separate public repository, `logic-domains`, owned by the same organization as this plugin. ADR 0001's content moved there as its ADR 0002, with its status still Proposed.
2. The plugin keeps the extension contract only:
   - Every class in a Logic Domain declares a logical kind, so the review reads the kind and not the class name.
   - Competency questions are a Logic Domain's acceptance tests.
   - With a Logic Domain loaded, the core evaluation set still passes at or above its floors (FF7).
   - The CLR guidance helps people design a Logic Domain and its checks.
3. A decision about one Logic Domain, such as the scope of a check, belongs to that Logic Domain's owner and is recorded in its repository.
4. The term is "Logic Domain". "Domain" alone means the Flying Logic group of entity classes.

## Consequences

- ADR 0001 is superseded. Its text stays as written.
- The domain-extension track in ARCHITECTURE.md and QUALITY.md (T5, B3, RS1, FF7, MS3) is unchanged: it now describes the contract, and the logic-domains repository holds the first domains to test it.
- Issue #23 (CQ-09 scope) becomes a general question about how a Logic Domain records the scope of a check and a reviewed exemption.
- A Logic Domain change no longer needs a plugin release.

## Source

- [ADR 0001: logic-tree domains model the path from commitment to outcome](0001-logic-tree-domains-model-commitment-to-outcome.md)
- logic-domains ADR 0001: the repository holds Logic Domains and their catalog (`docs/adr/0001-this-repository-holds-logic-domains-and-their-catalog.md` in that repository)
- logic-domains pull request #2: the bootstrap, with the moved ADR and the first four Logic Domains
- [Flying Logic user guide: domains](https://docs.flyinglogic.com/user-guide/domains.html)
- Issue #23 in this repository: CQ-09 scope
