const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin/slopcheck.js');
const { findChrome } = require('../lib/collect');
const { RULES, LAYOUTS } = require('../lib/checks');

const R2 = RULES.find((rule) => rule.ruleId === 'R2');
const group = (size, kids = [], rowParentId = null, order = 0) => ({ size, kids, rowParentId, order });
const row = (side, order) => group(
  2,
  side === 'left'
    ? [{ x: 0, w: 600 }, { x: 620, w: 400 }]
    : [{ x: 0, w: 400 }, { x: 420, w: 600 }],
  7,
  order
);

test('the layout family table has a default and a second family', () => {
  assert.deepStrictEqual(LAYOUTS.map((layout) => layout.name), ['trinity', 'zigzag']);
  assert.strictEqual(LAYOUTS[0].cards, 3);
  assert.strictEqual(LAYOUTS[1].cards, 2);
});

test('R2 accepts trinity and zigzag', () => {
  assert.strictEqual(R2({ cardGroups: [group(3)] }, {}).status, 'pass');
  const zigzag = R2({ cardGroups: [row('left', 0), row('right', 1), row('left', 2)] }, {});
  assert.strictEqual(zigzag.status, 'pass');
  assert.match(zigzag.detail, /zigzag/);
});

test('R2 rejects a zigzag whose wide side does not alternate', () => {
  const result = R2({ cardGroups: [row('left', 0), row('left', 1), row('left', 2)] }, {});
  assert.strictEqual(result.status, 'fail');
  assert.match(result.detail, /alternating zigzag/);
});

test('R2 rejects a four-card group', () => {
  const result = R2({ cardGroups: [group(4)] }, {});
  assert.strictEqual(result.status, 'fail');
  assert.match(result.detail, /4 cards/);
});

test('every layout family is documented in DIRECTION.md', () => {
  const direction = fs.readFileSync(path.join(ROOT, 'DIRECTION.md'), 'utf8');
  for (const layout of LAYOUTS) {
    assert.ok(direction.includes(`| ${layout.name}`), `${layout.name} is missing from DIRECTION.md`);
  }
});

const chrome = findChrome();
const requireBrowser = process.env.REQUIRE_BROWSER === '1';
const skip = chrome ? false : requireBrowser ? 'REQUIRE_BROWSER=1 but no Chrome binary' : 'no Chrome binary on this machine';

test('the collector reads zigzag card geometry', { skip }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iloveslop-layout-'));
  const file = path.join(dir, 'zigzag.html');
  fs.writeFileSync(
    file,
    `<!DOCTYPE html><html><head><title>zigzag</title><style>
  body { background: #0b0714; color: rgba(255,255,255,0.48); font-family: Inter, sans-serif; }
  .zigzag { width: 1000px; margin: 96px auto; }
  .row { display: flex; gap: 24px; padding: 24px; }
  .card { flex: 1; background: #151024; border-radius: 20px; padding: 24px; }
  .card.wide { flex: 2; }
</style></head><body>
  <div class="zigzag">
    <div class="row"><div class="card wide">One</div><div class="card">Two</div></div>
    <div class="row"><div class="card">Three</div><div class="card wide">Four</div></div>
    <div class="row"><div class="card wide">Five</div><div class="card">Six</div></div>
  </div>
</body></html>`
  );

  try {
    const run = spawnSync(process.execPath, [BIN, file, '--json', '--min', '0'], {
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1' }
    });
    assert.strictEqual(run.status, 0, run.stderr);
    const json = JSON.parse(run.stdout);
    const r2 = json.rules.find((rule) => rule.id === 'R2');
    assert.strictEqual(r2.status, 'pass', r2.detail);
    assert.match(r2.detail, /zigzag/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
