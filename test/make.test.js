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

test('make writes a page that clears 90', { skip }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iloveslop-make-'));
  const out = path.join(dir, 'slop.html');

  const made = spawnSync(process.execPath, [
    BIN, 'make', path.join(ROOT, 'examples/clean.html'), '--palette', 'blue-cyan', '-o', out
  ], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
    maxBuffer: 8 * 1024 * 1024
  });
  assert.strictEqual(made.status, 0, made.stderr);
  const html = fs.readFileSync(out, 'utf8');
  assert.match(html, /Unlock the power of/);
  assert.match(html, /Parody of clean\.html\. Not affiliated\./);

  const scored = spawnSync(process.execPath, [BIN, out, '--json'], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
    maxBuffer: 8 * 1024 * 1024
  });
  assert.strictEqual(scored.status, 0, scored.stderr);
  const result = JSON.parse(scored.stdout);
  assert.ok(result.score >= 90, `generated page scored ${result.score}`);
  assert.ok(result.rules.length === 33);

  fs.rmSync(dir, { recursive: true, force: true });
});
