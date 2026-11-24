const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'rules.json'), 'utf8'));
const { RULES } = require('../lib/checks');

function frontmatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(text.startsWith('---\n'), `${file}: missing frontmatter`);
  const block = text.split('---')[1];
  const out = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^([a-z_]+):\s*(.+)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

test('rules.json holds 33 rules, numbered R1 to R33 in order', () => {
  assert.strictEqual(data.rules.length, 33);
  assert.deepStrictEqual(
    data.rules.map((r) => r.id),
    Array.from({ length: 33 }, (_, i) => 'R' + (i + 1))
  );
});

test('five sections, each with rules, no duplicate titles', () => {
  assert.strictEqual(data.sections.length, 5);
  for (const section of data.sections) {
    const inSection = data.rules.filter((r) => r.section === section.id);
    assert.ok(inSection.length > 0, `section ${section.id} has no rules`);
  }
  const titles = data.rules.map((r) => r.title);
  assert.strictEqual(new Set(titles).size, titles.length);
});

test('the scorer and rules.json agree on every id, name, and section', () => {
  assert.strictEqual(RULES.length, data.rules.length, 'check count differs from rule count');
  for (let i = 0; i < RULES.length; i += 1) {
    const entry = RULES[i];
    const rule = data.rules[i];
    assert.strictEqual(entry.ruleId, rule.id);
    assert.strictEqual(entry.ruleName, rule.title, `${rule.id} name drifted between checks.js and rules.json`);
    assert.strictEqual(entry.ruleSection.toLowerCase(), rule.section, `${rule.id} section drifted`);
  }
});

test('generated markdown and html are up to date with rules.json', () => {
  const out = execFileSync(process.execPath, ['scripts/build-rules.js', '--check'], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  assert.match(out, /agree/);
});

test('every skill has frontmatter whose name matches its folder', () => {
  const dir = path.join(ROOT, 'skills');
  const folders = fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isDirectory());
  assert.ok(folders.length >= 6, 'expected at least six skills');
  for (const folder of folders) {
    const meta = frontmatter(path.join(dir, folder, 'SKILL.md'));
    assert.strictEqual(meta.name, folder, `${folder}: frontmatter name is "${meta.name}"`);
    assert.ok(meta.description && meta.description.length > 40, `${folder}: description too thin`);
  }
});
