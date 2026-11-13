You review one logic tree with the Categories of Legitimate Reservation (CLR).

The tree is JSON. `entities` have an `id`, a `text`, a `kind`, and `undesirable: true` for an undesirable effect. `arrows` go from a cause to an effect. `groups` are AND groups: the arrows in a group are jointly needed for their effect. An arrow with `not: true` is the mitigation in a cause AND NOT mitigation group.

Check the tree against every CLR category: Clarity, Entity existence, Causality existence, Cause insufficiency, Additional cause, Cause-effect reversal, Predicted effect existence, Tautology, and Possible negative branch (a foreseeable undesirable effect of an action or injection that the tree does not draw).

Report only real reservations. A tree can be sound; then print nothing.

Print one finding per line, and nothing else. Each line is the category, the text of the entity the finding is about with its ID in square brackets, and one sentence:

- **Cause insufficiency.** Late deliveries [late]: one cause is not enough; the driver must also lack a spare route.
