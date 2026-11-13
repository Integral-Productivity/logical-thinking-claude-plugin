# 5. The plugin judges logic only and shares one finding form with the tool

Date: 2026-11-13

## Status

Accepted (2026-11-13). Converted from ARCHITECTURE.md, sections Scope and System context. Applies STRATEGY.md boundary B1 and the tool link track (T3).

## Context

Two repositories work on the same trees. The tool repository reads and writes tree files and checks structure: loops, entity IDs, and unconnected entities. This plugin judges logic with the Categories of Legitimate Reservation (CLR) and guides the chain of questions.

If both repositories check the same thing, the author gets two findings for one problem, and the two can disagree. If the findings are written in two forms, the author must read two lists in two styles.

Options considered:

| Option | Summary | Outcome |
|---|---|---|
| A. One repository does both | The plugin also checks structure and file formats | Rejected: mixes logic and file handling, and repeats the tool's work |
| B. Split work, separate finding forms | Each repository reports in its own form | Rejected: the author reads two inconsistent lists |
| C. Split work, one finding form | The tool owns structure, the plugin owns logic, and both report findings in one form | Chosen |

## Decision

1. **The plugin judges logic only.** It does not draw or edit trees, and it does not check tree structure or file formats.
2. **The tool repository owns structure checks and file formats.** The CLR review skips structure checks (plan R12).
3. **Both repositories report a finding in one form.** A finding names the entity first, with its ID in brackets, then says in one sentence what is wrong (plan R13).
4. **No review category is a structure category.** Fitness function FF4 fails the pull request when a review category names a structure check.

## Consequences

- The author reads one consistent list, whichever repository found the problem.
- FF5 needs a finding schema that both repositories agree on. Until then, the shared form is a convention, not a check.
- A request to add structure checks to the plugin is out of scope and goes to the tool repository.
- Reversal is expensive: it changes the boundary in STRATEGY.md and both repositories at once.

## Source

- [ARCHITECTURE.md, Scope](../../ARCHITECTURE.md#scope)
- [ARCHITECTURE.md, System context](../../ARCHITECTURE.md#system-context)
- [STRATEGY.md, Boundaries](../../STRATEGY.md#boundaries)
