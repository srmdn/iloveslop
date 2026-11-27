const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

test('the slop index page is up to date with its data', () => {
  const out = execFileSync(process.execPath, ['scripts/build-index.js', '--check'], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  assert.match(out, /agree/);
});
