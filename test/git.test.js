// R33 is the only rule that reads something other than the page: git history.
// These tests build throwaway repositories so the check cannot regress quietly.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'slopcheck.js');

const PAGE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>fixture</title></head>
<body><h1>fixture</h1><p>a page, nothing more</p></body></html>
`;

function git(dir, args) {
  return execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.com', ...args], {
    cwd: dir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function makeRepo(messages) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iloveslop-git-'));
  git(dir, ['init', '-q']);
  for (const [i, message] of messages.entries()) {
    // Each commit needs a real change, otherwise git refuses to make one.
    fs.writeFileSync(path.join(dir, 'index.html'), PAGE.replace('</body>', `<!-- edit ${i} -->\n</body>`));
    git(dir, ['add', '.']);
    git(dir, ['commit', '-q', '-m', message]);
  }
  return dir;
}

function rule(dir, id) {
  const out = execFileSync(process.execPath, [BIN, path.join(dir, 'index.html'), '--json', '--min', '0'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  const report = JSON.parse(out);
  return { rule: report.rules.find((r) => r.id === id), score: report.score };
}

test('R33 passes on one commit with a message of "final"', () => {
  const dir = makeRepo(['final']);
  try {
    const { rule: r33 } = rule(dir, 'R33');
    assert.strictEqual(r33.status, 'pass', r33.detail);
    assert.match(r33.detail, /one commit/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('R33 fails once a second commit lands', () => {
  const dir = makeRepo(['final', 'polish the copy before review']);
  try {
    const { rule: r33 } = rule(dir, 'R33');
    assert.strictEqual(r33.status, 'fail', r33.detail);
    assert.match(r33.detail, /more than one commit/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
