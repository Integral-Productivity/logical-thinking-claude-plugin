# Baseline: bare model, no CLR review skill (2026-11-13)

This is the first MS1 baseline. The CLR review skill (`skills/clr-review/`) does not exist yet, so the reviewer is the bare model with a fixed CLR prompt. The skill must beat this score.

**Result: MS1 fails.** No run finds every seeded defect, and every run has twin breaches.

## Reviewer version

| Part | Value |
|---|---|
| Reviewer version (ledger) | `skill:none vocab:none set:ee0da824 model:claude-opus-5-5` |
| Reviewer command | `EVAL_MODEL=claude-opus-5-5 sh eval/reviewers/baseline.sh` |
| Prompt | [eval/reviewers/baseline-prompt.md](../reviewers/baseline-prompt.md), sha256 `028e9a1d` |
| Script | [eval/reviewers/baseline.sh](../reviewers/baseline.sh), sha256 `2707da02` |
| Runner | Claude Code 2.1.323, `claude -p` with no tools, no MCP servers, no settings, no skills, from an empty temporary folder |
| Raw outputs | `eval/runs/2026-11-13T01-46-03-609Z-run-{1,2,3}/` |

The prompt and script hashes are not part of the reviewer version string, because `version.mjs` hashes only `skills/clr-review/` and `vocabulary/`. They are recorded here instead.

## Reproduce

```sh
node scripts/eval/run.mjs --model claude-opus-5-5 \
  --reviewer "EVAL_MODEL=claude-opus-5-5 sh eval/reviewers/baseline.sh"
```

To score the saved outputs again without calling a model, copy each run folder to `<dir>/run-<k>/` and use `--findings <dir>`. The model is not deterministic, so a fresh run gives close but not equal numbers.

## Scores

M1 is found / seeded. M2 is findings in a seeded category on a case with no key entry of that category (clean seeds, lookalikes, twins, and mutants of the other category).

| Run | Cause insufficiency M1 | Possible negative branch M1 | M2 insufficiency | M2 negative branch | Twin breaches |
|---|---|---|---|---|---|
| 1 | 11/12 (92%) | 10/10 (100%) | 25 | 12 | 8 + 3 |
| 2 | 10/12 (83%) | 8/10 (80%) | 25 | 13 | 8 + 2 |
| 3 | 11/12 (92%) | 10/10 (100%) | 26 | 12 | 10 + 3 |

By position, the negative-branch defects at position 2 (in two-defect trees) were found 3/3, 2/3, and 3/3.

## Per-defect results

| Case | Category | Run 1 | Run 2 | Run 3 |
|---|---|---|---|---|
| late-deliveries-insufficient-late-and | Cause insufficiency | miss | miss | miss |
| overtime-shifts-insufficient-delivered-and | Cause insufficiency | found | miss | found |
| library-reminder-no-annoyed | Possible negative branch | found | miss | found |
| kitchen-rota-two-defect (position 2) | Possible negative branch | found | miss | found |
| All other 18 seeded defects | Both | found | found | found |

Twin breaches (a twin draws a finding that the mutant's key would match):

| Twin | Category | Runs |
|---|---|---|
| garden-timer, kitchen-rota, late-deliveries, library-reminder, overtime-shifts | Cause insufficiency | 1, 2, 3 |
| bake-sale-twin | Cause insufficiency | 1, 2, 3 |
| bus-stop | Cause insufficiency | 3 |
| overtime-shifts | Possible negative branch | 1, 2, 3 |
| bike-lane-twin | Possible negative branch | 1, 2 |
| late-deliveries | Possible negative branch | 1 |
| kitchen-rota | Possible negative branch | 3 |

## What the baseline shows

These are observations from the raw outputs, not settled causes.

1. **The bare model over-reports.** It raises about 25 Cause insufficiency findings and 12 negative-branch findings per run on trees that have no such seeded defect. It rarely prints nothing on a clean tree.
2. **Most twin breaches come from broad match sets.** A key's match set holds the effect, the arrow, and the cause. On the repaired twin, the model often raises a different insufficiency about the cause entity (for example, `watered` in garden-timer), and the scorer counts it as a breach. Some of these findings are defensible reservations, so part of the breach count may be a key-design question, not only a reviewer fault.
3. **The steady miss is a category confusion.** In late-deliveries-insufficient-late-and, all three runs name the missing condition, but file it as **Additional cause**, not **Cause insufficiency**. The scorer matches on category, so it counts as a miss.
4. **Output form is mostly stable.** One line per run was unreadable ("No reservations: the tree is sound."), and a few findings used categories outside the two seeded ones (Additional cause, Clarity, Entity existence, Causality existence).

## Dependencies

- This run does not depend on flying-logic-tools issue #2. It is part of area A (CLR review and core vocabulary) of that issue, and uses only the JSON tree format in this repository.
- The next comparison needs the CLR review skill. When it ships, run the same command with a skill-based reviewer and compare with the `skill:none` rows in the ledger.
