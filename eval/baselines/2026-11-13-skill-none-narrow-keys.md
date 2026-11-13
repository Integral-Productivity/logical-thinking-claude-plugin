# Baseline: bare model, narrowed keys (2026-11-13)

This is the second MS1 baseline. It uses the same reviewer as the [first baseline](2026-11-13-skill-none.md), and the answer keys narrowed by [ADR 0013](../../docs/adr/0013-cause-insufficiency-keys-match-the-effect-not-its-causes.md): a Cause insufficiency key now matches the effect and the arrows into it, not the causes above it.

**Result: MS1 still fails.** No run finds every seeded defect, and every run has twin breaches. Narrowing the keys removes about a third of the Cause insufficiency twin breaches on the same outputs. Most of the rest are findings that name the effect itself.

## Reviewer version

| Part | Value |
|---|---|
| Reviewer version (ledger) | `skill:none vocab:none set:94136ed3 model:claude-opus-5-5` |
| Previous version | `skill:none vocab:none set:ee0da824 model:claude-opus-5-5` (only the set changed) |
| Reviewer command | `EVAL_MODEL=claude-opus-5-5 sh eval/reviewers/baseline.sh` |
| Prompt and script | Unchanged: sha256 `028e9a1d` (prompt) and `2707da02` (script) |
| Raw outputs | `eval/runs/2026-11-13T05-02-16-638Z-run-{1,2,3}/` |

## Reproduce

```sh
node scripts/eval/run.mjs --model claude-opus-5-5 \
  --reviewer "EVAL_MODEL=claude-opus-5-5 sh eval/reviewers/baseline.sh"
```

To rescore the first baseline's outputs against the new keys (the controlled comparison below), copy `eval/runs/2026-11-13T01-46-03-609Z-run-<k>/` to `<dir>/run-<k>/` for k = 1 to 3, and run with `--findings <dir> --ledger <a copy of QUALITY.md>` so the live ledger does not change.

## Scores

### Controlled comparison: the same outputs, old keys and new keys

This isolates the key change from model variance. The outputs are the first baseline's three runs.

| Measure (sum of three runs) | Old keys | New keys |
|---|---|---|
| Cause insufficiency found | 32/36 | 31/36 |
| Cause insufficiency twin breaches | 26 | 17 |
| Possible negative branch found | 28/30 | 28/30 (no change) |
| Possible negative branch twin breaches | 8 | 8 (no change) |

### Fresh runs with the new keys

| Run | Cause insufficiency M1 | Possible negative branch M1 | M2 insufficiency | M2 negative branch | Twin breaches |
|---|---|---|---|---|---|
| 1 | 10/12 (83%) | 10/10 (100%) | 26 | 13 | 8 + 2 |
| 2 | 9/12 (75%) | 10/10 (100%) | 28 | 10 | 9 + 2 |
| 3 | 11/12 (92%) | 9/10 (90%) | 25 | 12 | 7 + 2 |

Sums: Cause insufficiency 30/36 found with 24 twin breaches; Possible negative branch 29/30 found with 6 twin breaches. Compared with the first baseline's fresh runs (32/36 and 26; 28/30 and 8), the drop in breaches is smaller than in the controlled comparison. The model's run-to-run variance is about as large as the key effect, so the controlled comparison is the better measure of the key change.

## Per-defect results (fresh runs)

| Case | Category | Run 1 | Run 2 | Run 3 |
|---|---|---|---|---|
| late-deliveries-insufficient-late-and | Cause insufficiency | miss | miss | miss |
| overtime-shifts-insufficient-delivered-and | Cause insufficiency | miss | miss | found |
| late-deliveries-insufficient-on-time-and | Cause insufficiency | found | miss | found |
| kitchen-rota-two-defect (position 2) | Possible negative branch | found | found | miss |
| All other 18 seeded defects | Both | found | found | found |

Twin breaches:

| Twin | Category | Runs |
|---|---|---|
| kitchen-rota, overtime-shifts, bake-sale-twin | Cause insufficiency | 1, 2, 3 |
| garden-timer | Cause insufficiency | 1, 2 |
| late-deliveries | Cause insufficiency | 1, 2 |
| bus-stop | Cause insufficiency | 2, 3 |
| library-reminder | Cause insufficiency | 1, 3 |
| overtime-shifts, bike-lane-twin | Possible negative branch | 1, 2, 3 |

## What changed and what did not

These are observations from the raw outputs, not settled causes.

1. **Narrowing removed the breaches about causes.** Findings such as "the timer only waters the beds if the water supply runs [watered]" no longer count against the garden-timer twin.
2. **The remaining breaches name the effect.** On the twin, the reviewer says the repaired AND group is still not enough for the effect (for example, that plants also need the timer to run long enough). An ID match cannot tell this from the seeded defect. Only the finding's wording can (ADR 0013, option D).
3. **The steady miss stays.** late-deliveries-insufficient-late-and is filed as Additional cause in all three runs, as in the first baseline.
4. **Negative-branch breaches are unchanged in kind.** The reviewer names the same action for a different side effect on the twin, and that key is already one ID.
