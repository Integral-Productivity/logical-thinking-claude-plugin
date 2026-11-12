// Parses review output into findings. A finding line is the category, then
// the entity text with its ID in brackets, then one sentence, for example:
//   - **Cause insufficiency.** Late deliveries [late]: one cause is not enough.
// List markers and markdown emphasis are ignored. A non-blank line with no
// bracketed ID is returned as unreadable, so nothing is dropped silently.

const LIST_MARKER = /^\s*(?:[-*+]|\d+[.)])\s+/;
const EMPHASIS = /[*_`]+/g;
const ID = /\[([a-z0-9]+(?:-[a-z0-9]+)*)\]/;

export function parseFindings(text) {
  const findings = [];
  const unreadable = [];
  for (const raw of String(text).split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const plain = line.replace(LIST_MARKER, '').replace(EMPHASIS, '');
    const id = plain.match(ID)?.[1];
    const category = plain.split(/[.:]/, 1)[0].trim();
    if (!id || !category || category.includes('[')) {
      unreadable.push(line);
      continue;
    }
    findings.push({ category, id, text: line });
  }
  return { findings, unreadable };
}
