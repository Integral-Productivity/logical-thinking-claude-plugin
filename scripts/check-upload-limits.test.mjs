import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { check, frontmatterField } from './check-upload-limits.mjs';

function plugin({ pluginDesc = 'ok', skills = {} } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'upload-limits-'));
  mkdirSync(join(root, '.claude-plugin'));
  writeFileSync(join(root, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: 'demo', description: pluginDesc }));
  for (const [name, body] of Object.entries(skills)) {
    mkdirSync(join(root, 'skills', name), { recursive: true });
    writeFileSync(join(root, 'skills', name, 'SKILL.md'), body);
  }
  return root;
}

const skill = (desc) => `---\nname: demo\ndescription: >\n  ${desc}\nstatus: draft\n---\n\n# Demo\n`;

test('a plugin inside every limit passes', () => {
  assert.deepEqual(check(plugin({ skills: { demo: skill('short') } })).errors, []);
});

test('plugin description of 501 characters fails', () => {
  const { errors } = check(plugin({ pluginDesc: 'x'.repeat(501) }));
  assert.match(errors[0], /plugin\.json: description is 501 characters/);
});

test('plugin description of exactly 500 characters passes', () => {
  assert.deepEqual(check(plugin({ pluginDesc: 'x'.repeat(500) })).errors, []);
});

test('skill description of 1025 characters fails', () => {
  const { errors } = check(plugin({ skills: { demo: skill('y'.repeat(1025)) } }));
  assert.match(errors[0], /skills\/demo\/SKILL\.md: description is 1025 characters/);
});

test('skill description of exactly 1024 characters passes', () => {
  assert.deepEqual(check(plugin({ skills: { demo: skill('y'.repeat(1024)) } })).errors, []);
});

test('skill without a description fails', () => {
  const { errors } = check(plugin({ skills: { demo: '---\nname: demo\n---\n' } }));
  assert.match(errors[0], /description is missing/);
});

test('skill without a name fails', () => {
  const { errors } = check(plugin({ skills: { demo: '---\ndescription: d\n---\n' } }));
  assert.match(errors[0], /name is missing/);
});

test('missing manifest fails', () => {
  const root = mkdtempSync(join(tmpdir(), 'upload-limits-'));
  assert.match(check(root).errors[0], /plugin\.json is missing/);
});

test('folded block lines join with a single space', () => {
  const text = '---\ndescription: >\n  one\n  two\nname: n\n---\n';
  assert.equal(frontmatterField(text, 'description'), 'one two');
  assert.equal(frontmatterField(text, 'name'), 'n');
});

test('quoted single-line value is unquoted', () => {
  assert.equal(frontmatterField('---\nname: "demo"\n---\n', 'name'), 'demo');
});

// The template itself ships no manifest; a repo made from it does.
const repoRoot = join(import.meta.dirname, '..');
test('this repository is inside every limit', { skip: !existsSync(join(repoRoot, '.claude-plugin', 'plugin.json')) && 'no plugin manifest yet' }, () => {
  assert.deepEqual(check(repoRoot).errors, []);
});
