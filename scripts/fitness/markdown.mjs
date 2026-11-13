// Small Markdown helpers shared by the fitness functions. They read only what
// the checks need: headings, their GitHub anchors, and relative links. Text in
// fenced code blocks and inline code is ignored.

import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SKIP_DIRS = new Set(['.git', 'node_modules']);

// Every file under root whose name passes the filter, as paths relative to root.
export function walk(root, filter, dir = root) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(root, filter, path));
    else if (filter(name)) out.push(relative(root, path));
  }
  return out.sort();
}

// The lines of a Markdown text, with fenced code blocks and inline code blanked
// out, so headings and links inside code are not read.
export function proseLines(text) {
  let fenced = false;
  return text.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return '';
    }
    return fenced ? '' : line.replace(/`[^`]*`/g, '');
  });
}

// GitHub's heading anchor: lower case, punctuation removed, spaces to hyphens.
export function slug(heading) {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .replace(/ /g, '-');
}

// Heading texts in document order.
export function headings(text) {
  return proseLines(text)
    .map((line) => line.match(/^#{1,6}\s+(.*?)\s*#*\s*$/))
    .filter(Boolean)
    .map((m) => m[1]);
}

// The set of anchors a document offers. Repeated headings get -1, -2, ...
export function anchors(text) {
  const seen = new Map();
  const out = new Set();
  for (const h of headings(text)) {
    const base = slug(h);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.add(n === 0 ? base : `${base}-${n}`);
  }
  return out;
}

// Inline links, with their 1-based line numbers.
export function links(text) {
  const out = [];
  proseLines(text).forEach((line, i) => {
    for (const m of line.matchAll(/\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
      out.push({ target: m[1], line: i + 1 });
    }
  });
  return out;
}

// The body of a "## Name" section, up to the next heading of level 1 or 2.
export function section(text, name) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${name}\\s*$`).test(l));
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^#{1,2}\s/.test(l));
  return (end < 0 ? rest : rest.slice(0, end)).join('\n');
}
