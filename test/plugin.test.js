const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const claude = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
const codex = JSON.parse(fs.readFileSync(path.join(ROOT, '.codex-plugin/plugin.json'), 'utf8'));

test('the Claude plugin version matches package.json', () => {
  assert.strictEqual(claude.plugins[0].version, pkg.version);
});

test('the Codex plugin version matches package.json', () => {
  assert.strictEqual(codex.version, pkg.version);
});

test('the Codex plugin name matches package.json', () => {
  assert.strictEqual(codex.name, pkg.name);
});

test('the Codex plugin points at the skills directory', () => {
  assert.strictEqual(codex.skills, './skills/');
  assert.ok(fs.statSync(path.join(ROOT, 'skills')).isDirectory(), 'skills directory is missing');
});
