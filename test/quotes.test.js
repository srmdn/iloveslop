const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin/slopcheck.js');
const { findChrome } = require('../lib/collect');
const { RULES } = require('../lib/checks');

const R13 = RULES.find((rule) => rule.ruleId === 'R13');
const ghost = (over = {}) => ({
  text: 'This changed how our team works.',
  who: 'Mira, Operations Lead',
  hasImg: false,
  hasCompany: false,
  ...over
});

test('R13 accepts one to three ghost quotes', () => {
  assert.strictEqual(R13({ quotes: [ghost()] }, {}).status, 'pass');
  assert.strictEqual(R13({ quotes: [ghost(), ghost({ who: 'Sam, Product Lead' })] }, {}).status, 'pass');
  assert.strictEqual(R13({ quotes: [ghost(), ghost(), ghost()] }, {}).status, 'pass');
});

test('R13 rejects a non-ghost after a compliant first quote', () => {
  const result = R13({ quotes: [ghost(), ghost({ who: 'Mira at Acme', hasCompany: true })] }, {});
  assert.strictEqual(result.status, 'fail');
  assert.match(result.detail, /company/);
});

test('R13 rejects four quotes', () => {
  const result = R13({ quotes: [ghost(), ghost(), ghost(), ghost()] }, {});
  assert.strictEqual(result.status, 'fail');
  assert.match(result.detail, /expected one to three/);
});

const chrome = findChrome();
const requireBrowser = process.env.REQUIRE_BROWSER === '1';
const skip = chrome ? false : requireBrowser ? 'REQUIRE_BROWSER=1 but no Chrome binary' : 'no Chrome binary on this machine';

test('the collector reads every quote, not only the first', { skip }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iloveslop-quotes-'));
  const file = path.join(dir, 'quotes.html');
  fs.writeFileSync(
    file,
    `<!DOCTYPE html><html><head><title>quotes</title></head><body>
  <div class="quote"><blockquote>This changed how our team works.</blockquote><p>Mira, Operations Lead</p></div>
  <div class="quote"><blockquote>This changed how our team works.</blockquote><p>Sam at Acme</p></div>
</body></html>`
  );

  try {
    const run = spawnSync(process.execPath, [BIN, file, '--json', '--min', '0'], {
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1' }
    });
    assert.strictEqual(run.status, 0, run.stderr);
    const json = JSON.parse(run.stdout);
    const r13 = json.rules.find((rule) => rule.id === 'R13');
    assert.strictEqual(r13.status, 'fail');
    assert.match(r13.detail, /company/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
