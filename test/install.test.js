const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const INSTALL = path.join(ROOT, 'install.sh');
const skip = process.platform === 'win32' ? 'install.sh needs bash and symlinks' : false;

test('the installer links every skill and both source files', { skip }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iloveslop-install-'));
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

    for (const file of ['slop.md', 'DIRECTION.md']) {
      assert.ok(fs.lstatSync(path.join(dir, file)).isSymbolicLink(), `${file} was not linked`);
    }

    const second = spawnSync('bash', [INSTALL, '--claude'], { cwd: dir, encoding: 'utf8' });
    assert.strictEqual(second.status, 0, second.stderr);
    assert.match(second.stdout, /already linked/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
