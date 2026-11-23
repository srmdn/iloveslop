const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const { RULES, PALETTES } = require('../lib/checks');

const R1 = RULES.find((rule) => rule.ruleId === 'R1');
const gradient = (from, to) =>
  `linear-gradient(135deg, rgb(${from.join(', ')}) 0%, rgb(${to.join(', ')}) 100%)`;
const facts = (bg) => ({ gradients: [{ tag: 'SECTION', bg }] });

test('R1 accepts every approved palette family', () => {
  assert.strictEqual(PALETTES.length, 6);
  for (const palette of PALETTES) {
    const result = R1(facts(gradient(palette.from, palette.to)), {});
    assert.strictEqual(result.status, 'pass', `${palette.name} should pass R1`);
    assert.match(result.detail, new RegExp(palette.name));
  }
});

test('R1 rejects a gradient outside the approved families', () => {
  const result = R1(facts('linear-gradient(135deg, rgb(1, 2, 3) 0%, rgb(4, 5, 6) 100%)'), {});
  assert.strictEqual(result.status, 'fail');
});

test('every palette family is documented in DIRECTION.md', () => {
  const direction = fs.readFileSync(path.join(__dirname, '..', 'DIRECTION.md'), 'utf8');
  for (const palette of PALETTES) {
    assert.ok(direction.includes(`| ${palette.name}`), `${palette.name} is missing from DIRECTION.md`);
  }
});
