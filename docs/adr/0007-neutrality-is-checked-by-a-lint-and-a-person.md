# 7. Neutrality is checked by a lint and a person

Date: 2026-11-13

## Status

Accepted (2026-11-13). Converted from ARCHITECTURE.md (characteristic AC4, fitness function FF3) and QUALITY.md (evaluation set rules). Applies STRATEGY.md boundary B4.

## Context

STRATEGY.md says that examples, fixtures, and test trees are neutral: no real person, company, or private business figure. The plugin is meant for any practitioner, and a real name or figure in a fixture can leak private information and can make an example feel like it belongs to one organization.

A machine can find some signs of a non-neutral file: an email address, a currency figure, or a known name. It cannot tell a real proper noun from an invented one.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. Review only | A person reads each fixture | Rejected: easy to miss on a large generated set |
| B. Lint only | A script decides | Rejected: cannot tell real names from invented names |
| C. Lint plus a person | A script blocks what it can see; a person reviews the rest | Chosen |

## Decision

1. **FF3 runs in CI on neutral paths.** These are the top-level Markdown files and the text files under `docs/`, `eval/`, `skills/`, and `vocabulary/`.
2. **FF3 fails on an email address, a currency figure, or a denylisted name.**
3. **The denylist holds SHA-256 hashes of words and word pairs, not the words.** The check itself names no one.
4. **Other proper nouns need a person's review.** An allowlist of invented names, to make that review smaller, is a later step.
5. **Every evaluation case is neutral and passes FF3** (QUALITY.md, evaluation set rules).

## Consequences

- A fixture with a real email address or a price fails before merge.
- A real name that is not on the denylist still passes CI. The person who reviews the pull request remains the last check.
- Some neutral text can fail, such as a fictional price in an example. The fix is to remove the figure, because neutral examples do not need one.
- Workflow files and settings are outside the neutral paths, because they must name the repositories and accounts they use.

## Source

- [ARCHITECTURE.md, Architectural characteristics (AC4)](../../ARCHITECTURE.md#architectural-characteristics)
- [ARCHITECTURE.md, Fitness functions (FF3)](../../ARCHITECTURE.md#fitness-functions)
- [QUALITY.md, Rules of the evaluation set](../../QUALITY.md#rules)
