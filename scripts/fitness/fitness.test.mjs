import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { anchors, links, slug } from './markdown.mjs';
import { checkLinks } from './links.mjs';
import { checkAdrs } from './adr.mjs';
import { checkNeutrality, lineProblems } from './neutrality.mjs';
import { checkTraceability, strategyIds } from './traceability.mjs';
import { checkBoundaries, structureCategories } from './boundaries.mjs';

// A temporary repository with the given files ({ 'path/name.md': 'text' }).
function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'fitness-'));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const adr = (n, { status = 'Accepted (2026-11-13).', source = '- [Q](../../QUALITY.md#metrics)' } = {}) =>
  `# ${n}. A decision\n\nDate: 2026-11-13\n\n## Status\n\n${status}\n\n## Decision\n\nDo it.\n${source === null ? '' : `\n## Source\n\n${source}\n`}`;
const index = (...names) => `# Index\n\n${names.map((n) => `- [${n}](${n})`).join('\n')}\n`;

// --- Markdown helpers

test('slug follows GitHub heading anchors', () => {
  assert.equal(slug('First CLR pass on the strategy'), 'first-clr-pass-on-the-strategy');
  assert.equal(slug('Rules (plan R11)'), 'rules-plan-r11');
  assert.equal(slug('`code` and *emphasis*'), 'code-and-emphasis');
});

test('repeated headings get numbered anchors', () => {
  assert.deepEqual([...anchors('## Rules\n\n## Rules\n')], ['rules', 'rules-1']);
});

test('links and headings inside code are ignored', () => {
  const text = '```\n# not a heading\n[x](nowhere.md)\n```\nSee `[y](gone.md)` and [z](here.md).\n';
  assert.deepEqual(links(text).map((l) => l.target), ['here.md']);
  assert.deepEqual([...anchors(text)], []);
});

// --- Links (FF10)

test('a link to an existing heading passes', () => {
  const root = repo({ 'A.md': '# A\n\n## Metrics\n', 'docs/b.md': '[m](../A.md#metrics) [web](https://example.org)\n' });
  assert.deepEqual(checkLinks(root).errors, []);
});

test('a link to a missing file fails', () => {
  const root = repo({ 'docs/b.md': 'See [x](../GONE.md).\n' });
  assert.match(checkLinks(root).errors[0], /docs\/b\.md:1: link target \.\.\/GONE\.md does not exist/);
});

test('a link to a missing heading fails', () => {
  const root = repo({ 'A.md': '# A\n\n## Metrics\n', 'b.md': '[m](A.md#metric-charter)\n' });
  assert.match(checkLinks(root).errors[0], /anchor #metric-charter is not a heading in A\.md/);
});

test('a same-file anchor is checked', () => {
  const root = repo({ 'a.md': '# Top\n\n[up](#top) [bad](#nope)\n' });
  assert.deepEqual(checkLinks(root).errors.length, 1);
});

// --- ADR log (FF10)

test('a well-formed ADR log passes', () => {
  const root = repo({
    'docs/adr/0001-first.md': adr(1),
    'docs/adr/0002-second.md': adr(2, { status: 'Proposed.' }),
    'docs/adr/README.md': index('0001-first.md', '0002-second.md'),
  });
  assert.deepEqual(checkAdrs(root).errors, []);
});

test('an ADR without a Source section fails', () => {
  const root = repo({ 'docs/adr/0001-first.md': adr(1, { source: null }), 'docs/adr/README.md': index('0001-first.md') });
  assert.match(checkAdrs(root).errors[0], /Source section/);
});

test('a Source section with only web links fails', () => {
  const root = repo({ 'docs/adr/0001-first.md': adr(1, { source: '- [w](https://example.org)' }), 'docs/adr/README.md': index('0001-first.md') });
  assert.match(checkAdrs(root).errors[0], /Source section/);
});

test('an unknown status word fails', () => {
  const root = repo({ 'docs/adr/0001-first.md': adr(1, { status: 'Draft.' }), 'docs/adr/README.md': index('0001-first.md') });
  assert.match(checkAdrs(root).errors[0], /Status must open with one of/);
});

test('a gap in the numbers fails', () => {
  const root = repo({
    'docs/adr/0001-first.md': adr(1),
    'docs/adr/0003-third.md': adr(3),
    'docs/adr/README.md': index('0001-first.md', '0003-third.md'),
  });
  assert.match(checkAdrs(root).errors.join('\n'), /expected ADR 0002, found 0003/);
});

test('a title that does not match the number fails', () => {
  const root = repo({ 'docs/adr/0001-first.md': adr(2), 'docs/adr/README.md': index('0001-first.md') });
  assert.match(checkAdrs(root).errors[0], /title must start with "# 1\. "/);
});

test('an ADR missing from the index fails', () => {
  const root = repo({ 'docs/adr/0001-first.md': adr(1), 'docs/adr/README.md': index() });
  assert.match(checkAdrs(root).errors[0], /0001-first\.md is not listed/);
});

test('a badly named ADR file fails', () => {
  const root = repo({ 'docs/adr/1-First.md': adr(1), 'docs/adr/README.md': index('1-First.md') });
  assert.match(checkAdrs(root).errors[0], /name must be NNNN-lower-case-slug\.md/);
});

// --- Neutrality (FF3)

const hash = (s) => createHash('sha256').update(s).digest('hex');
const deny = new Set([hash('zorbal'), hash('acme widgets')]);

test('neutral text passes', () => {
  assert.deepEqual(lineProblems('Paint a bike lane [paint] so more riders use the road.', deny), []);
});

test('an email address fails', () => {
  assert.deepEqual(lineProblems('Ask someone@example.org first.', deny), ['an email address']);
});

test('a currency figure fails', () => {
  assert.deepEqual(lineProblems('The bake sale raised $1,200.', deny), ['a currency figure']);
  assert.deepEqual(lineProblems('It costs 300 EUR.', deny), ['a currency figure']);
});

test('a denylisted word or word pair fails, in any case', () => {
  assert.deepEqual(lineProblems('Zorbal wrote this tree.', deny), ['a denylisted name']);
  assert.deepEqual(lineProblems('Built for ACME Widgets.', deny), ['a denylisted name']);
  assert.deepEqual(lineProblems('Acme alone is fine.', deny), []);
});

test('only neutral paths are scanned', () => {
  const root = repo({
    'README.md': 'Clean.\n',
    'eval/cases/a/tree.json': '{"text": "zorbal"}\n',
    '.github/CODEOWNERS': '* zorbal@example.org\n',
    'scripts/x.mjs': '// zorbal\n',
  });
  assert.deepEqual(checkNeutrality(root, deny).errors, ['eval/cases/a/tree.json:1: contains a denylisted name']);
});

// --- Strategy traceability (FF9)

const quality = (extra) => `# Q\n\n### Strategy IDs\n\n| ID | Item |\n|---|---|\n| P1 | Purpose |\n| M1 | Metric |\n\n### Claim tree\n\n${extra}\n`;

test('the strategy IDs are read from their table', () => {
  assert.deepEqual(strategyIds(quality('')), ['P1', 'M1']);
});

test('every ID linked somewhere passes', () => {
  const root = repo({ 'QUALITY.md': quality('- P1 is solved: M1.') });
  assert.deepEqual(checkTraceability(root).errors, []);
});

test('an ID found only in its table row fails', () => {
  const root = repo({ 'QUALITY.md': quality('- P1 is solved.') });
  assert.deepEqual(checkTraceability(root).errors, ['QUALITY.md: strategy item M1 links to no metric, milestone, check, or decision']);
});

test('an ID linked from an ADR or ARCHITECTURE.md passes', () => {
  const root = repo({ 'QUALITY.md': quality('- P1.'), 'docs/adr/0001-x.md': 'Measured by M1.\n' });
  assert.deepEqual(checkTraceability(root).errors, []);
});

test('M1 inside M10 or AM1 does not count', () => {
  const root = repo({ 'QUALITY.md': quality('- P1: M10, AM1.') });
  assert.equal(checkTraceability(root).errors.length, 1);
});

// --- Logic, not structure (FF4)

test('logic categories pass', () => {
  assert.deepEqual(structureCategories(['Cause insufficiency', 'Possible negative branch', 'Tautology']), []);
});

test('structure categories fail', () => {
  assert.deepEqual(structureCategories(['Loop', 'Duplicate ID', 'Unconnected entity', 'Clarity']), ['Loop', 'Duplicate ID', 'Unconnected entity']);
});

test('answer-key categories are checked', async () => {
  const key = { entries: [{ category: 'Cause insufficiency' }, { category: 'Unconnected entity' }] };
  const root = repo({ 'eval/cases/a/key.json': JSON.stringify(key) });
  assert.deepEqual((await checkBoundaries(root)).errors, ['review category "Unconnected entity" is a structure check; the tool repository owns it']);
});
