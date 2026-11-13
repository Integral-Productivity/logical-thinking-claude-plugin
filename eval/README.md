# Evaluation set

The evaluation set is the evidence for M1 (catch rate), M2 (false findings), and milestone MS1. The contract is in [QUALITY.md](../QUALITY.md#evaluation-set-contract). This first set seeds two defect kinds: **Cause insufficiency** and **Possible negative branch**.

## Layout

| Path | Contents | Written by |
|---|---|---|
| `seeds/` | Clean seed trees. Each one has at least one AND group and one action or injection with its negative branch drawn | Hand |
| `lookalikes/` | Clean trees with constructs that look like defects: a gate, a cause AND NOT mitigation group, long AND groups | Hand |
| `handwritten/<case>/` | Hand-written defect cases: `tree.json` (the defect), `key.json`, and `twin.json` (the repaired twin) | Hand |
| `cases/` | Every case the review sees, with `manifest.json` | `node scripts/eval/build.mjs` |
| `runs/<run-id>/` | Raw reviewer output per case and `result.json` for each run | `node scripts/eval/run.mjs` |

## Tree format

A tree is JSON with three lists. IDs are lowercase slugs, so removing an entity leaves no numbering gap.

- `entities`: `id`, `text`, `kind` (`effect`, `action`, `injection`, `precondition`, `obstacle`, or `indicator`), and `undesirable: true` for an undesirable effect.
- `arrows`: `id`, `from`, `to`, and `not: true` for the mitigation in a cause AND NOT mitigation group.
- `groups`: AND groups, each with `id` and the `arrows` it joins. All arrows in a group go to the same effect.

Seeds, lookalikes, and hand-written twins also have `id`, `title`, and `checks`. The review never sees these fields.

A key lists the repaired twin and the seeded defects in position order. Each entry has the `category`, a `matchSet` of entity and arrow IDs, and an `expected` sentence for people to read. A finding counts as found when its category matches and the ID it names is in the match set; the wording is not scored.

## Add a seed

1. Write an invented, everyday scenario. Name no real person, company, place, or figure.
2. Draw at least one AND group of two or more positive conditions, and at least one action or injection with its foreseeable negative branches.
3. Ask a second agent, which reads only the seed, to list undrawn foreseeable negative branches. Draw each one it finds.
4. Record both checks in the seed:
   - `checks.negativeBranches`: the date and result of the second-agent check.
   - `checks.neutrality`: the date of the manual neutrality check, until fitness function FF3 exists.
5. Build the set: `node scripts/eval/build.mjs`. The build refuses a seed with no checks.
6. Run the tests: `node --test scripts/eval/*.test.mjs`. The drift test fails until `cases/` matches a fresh build.

## Run an evaluation

The run is local and is never part of CI. Give a reviewer command, which runs once per case with the case tree as JSON on standard input and `CASE_ID` in its environment, and prints one finding per line:

```text
- **Cause insufficiency.** Late deliveries [late]: one cause is not enough.
```

```sh
node scripts/eval/run.mjs --model <model-name> --reviewer "<command>"
```

To score saved outputs again, give a findings directory instead: `--findings <dir>`, with `<dir>/run-<k>/<case>.txt` for each run. A flat folder of `<dir>/<case>.txt` files holds one set of outputs, so it scores as one run and cannot pass MS1 alone.

Each run writes `eval/runs/<run-id>/` and adds two rows to the results ledger in QUALITY.md, one per category, with the reviewer version (hashes of the skill text, the vocabulary, and this set, plus the model). MS1 passes only when all three runs find every seeded defect and no repaired twin draws a keyed finding.

## Baselines

- [2026-11-13, bare model, no skill](baselines/2026-11-13-skill-none.md): MS1 fails. Reviewer in [reviewers/](reviewers/).
