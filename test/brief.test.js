const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin/slopcheck.js');
const { findChrome } = require('../lib/collect');

const chrome = findChrome();
const requireBrowser = process.env.REQUIRE_BROWSER === '1';
const skip = chrome ? false : requireBrowser ? 'REQUIRE_BROWSER=1 but no Chrome binary' : 'no Chrome binary on this machine';

function run(args) {
  return spawnSync(process.execPath, [BIN, ...args], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
    maxBuffer: 8 * 1024 * 1024
  });
}

test('brief writes a parody brief for a local page', { skip }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iloveslop-brief-'));
  const out = path.join(dir, 'nested/brief.md');
  const result = run(['brief', path.join(ROOT, 'examples/clean.html'), '-o', out]);

  assert.strictEqual(result.status, 0, result.stderr);
  const text = fs.readFileSync(out, 'utf8');
  assert.match(text, /^# Parody brief: Notes on plain pages/);
  assert.match(text, /Parody of clean\.html\. Not affiliated\./);
  assert.match(text, /slop\.md/);
  assert.match(text, /33\/100/);

  fs.rmSync(dir, { recursive: true, force: true });
});

test('brief --json returns the structured brief', { skip }, () => {
  const result = run(['brief', path.join(ROOT, 'examples/clean.html'), '--json']);
  assert.strictEqual(result.status, 0, result.stderr);

  const brief = JSON.parse(result.stdout);
  assert.strictEqual(brief.source.title, 'Notes on plain pages');
  assert.strictEqual(brief.source.host, 'clean.html');
  assert.ok(Array.isArray(brief.score.failed));
  assert.ok(brief.parody.label.includes('Not affiliated'));
});
