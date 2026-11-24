const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts/score-eval.js');
const { findChrome } = require('../lib/collect');

const chrome = findChrome();
const requireBrowser = process.env.REQUIRE_BROWSER === '1';
const skip = chrome ? false : requireBrowser ? 'REQUIRE_BROWSER=1 but no Chrome binary' : 'no Chrome binary on this machine';

test('the eval harness scores a submission and writes the result set', { skip }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iloveslop-eval-'));
  const manifest = path.join(dir, 'manifest.json');
  const out = path.join(dir, 'results.json');
  fs.writeFileSync(manifest, JSON.stringify({
    generated: '2026-11-24',
    brief: 'brief.md',
    submissions: [
      {
        model: 'test/model',
        source: 'clean.html',
        file: path.join(ROOT, 'examples/clean.html'),
        date: '2026-11-24'
      }
    ]
  }));

  const result = spawnSync(process.execPath, [SCRIPT, manifest, '-o', out], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
    maxBuffer: 8 * 1024 * 1024
  });

  assert.strictEqual(result.status, 0, result.stderr);
  const data = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.strictEqual(data.results.length, 1);
  assert.strictEqual(data.results[0].model, 'test/model');
  assert.strictEqual(data.results[0].score, 33);
  assert.strictEqual(data.results[0].max, 100);
  assert.ok(data.results[0].misses.length > 0);

  fs.rmSync(dir, { recursive: true, force: true });
});
