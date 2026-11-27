const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const INSTALL = path.join(ROOT, 'install.sh');
const skip = process.platform === 'win32' ? 'install.sh needs bash and symlinks' : false;

test('the installer links every skill and leaves existing files alone', { skip }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iloveslop-install-'));
  const protectedFile = path.join(dir, 'slop.md');
  fs.writeFileSync(protectedFile, 'keep me\n');

  try {
    const first = spawnSync('bash', [INSTALL, '--claude'], { cwd: dir, encoding: 'utf8' });
    assert.strictEqual(first.status, 0, first.stderr);

    const skills = fs.readdirSync(path.join(ROOT, 'skills')).filter((name) =>
      fs.statSync(path.join(ROOT, 'skills', name)).isDirectory()
    );
    for (const name of skills) {
      const linked = path.join(dir, '.claude/skills', name);
      assert.ok(fs.lstatSync(linked).isSymbolicLink(), `${name} was not linked`);
      assert.strictEqual(fs.realpathSync(linked), fs.realpathSync(path.join(ROOT, 'skills', name)));
    }

    assert.strictEqual(fs.lstatSync(protectedFile).isSymbolicLink(), false, 'slop.md was replaced');
    assert.strictEqual(fs.readFileSync(protectedFile, 'utf8'), 'keep me\n');
    assert.match(first.stderr, /skip: .*slop\.md already exists/);
    assert.ok(fs.lstatSync(path.join(dir, 'DIRECTION.md')).isSymbolicLink(), 'DIRECTION.md was not linked');

    const second = spawnSync('bash', [INSTALL, '--claude'], { cwd: dir, encoding: 'utf8' });
    assert.strictEqual(second.status, 0, second.stderr);
    assert.match(second.stdout, /already linked/);
    assert.strictEqual(fs.readFileSync(protectedFile, 'utf8'), 'keep me\n');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the installer refuses to run inside the repository', { skip }, () => {
  const result = spawnSync('bash', [INSTALL, '--claude'], { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /not from the iloveslop repository/);
});
