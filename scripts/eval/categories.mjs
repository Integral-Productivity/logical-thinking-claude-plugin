// The two review categories the evaluation set seeds. The side-effect label
// follows the core vocabulary's "possible negative branch" wording and is
// provisional: if that wording changes, only this module and the committed
// keys change.

export const CATEGORIES = {
  insufficiency: 'Cause insufficiency',
  sideEffect: 'Possible negative branch',
};

// Category matching ignores case, emphasis, and surrounding punctuation.
export function normalizeCategory(text) {
  return String(text).toLowerCase().replace(/[^a-z ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
