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
const skip = chrome ? false : 'no Chrome binary on this machine';

function check(target) {
  const run = spawnSync(process.execPath, [BIN, target, '--json'], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
    maxBuffer: 8 * 1024 * 1024
  });
  assert.ok(run.stdout, `no output for ${target}: ${run.stderr}`);
  return { json: JSON.parse(run.stdout), raw: run.stdout, code: run.status };
}

test('the site scores at least 90 against its own rulebook', { skip }, () => {
  const { json } = check(path.join(ROOT, 'docs/index.html'));
  assert.ok(json.score >= 90, `landing page dropped to ${json.score}`);
  assert.strictEqual(json.rules.length, 33);
});

test('a clean, tasteful page is rejected', { skip }, () => {
  const { json } = check(path.join(ROOT, 'examples/clean.html'));
  assert.ok(json.score < 50, `clean page scored ${json.score}, the checker is too generous`);
});

test('terminal escape sequences from a page never reach the output', { skip }, () => {
  const esc = '\u001b';
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'slopcheck-')), 'evil.html');
  fs.writeFileSync(
    file,
    `<!DOCTYPE html><html><head><title>x</title>
<style>body{background:#0b0714;color:rgba(255,255,255,.42);font-family:Inter,sans-serif}</style></head>
<body><h1>Unlock ${esc}[31mRED${esc}[0m ${esc}]52;c;cGF3bmVk\u0007 slop \u2728</h1>
<p>${esc}[2J${esc}[1;1H cleared, seamless powerful intuitive</p>
<blockquote>"${esc}[8mhidden${esc}[0m quote"</blockquote><p>Sarah, Product Lead</p>
</body></html>`
  );
  const { raw } = check(file);
  assert.strictEqual(raw.includes(esc), false, 'an escape byte survived into the report');
  assert.strictEqual(raw.includes('\u0007'), false, 'a bell byte survived into the report');
});
