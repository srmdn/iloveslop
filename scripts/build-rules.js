#!/usr/bin/env node
'use strict';

/**
 * build-rules.js - rules.json is the only place a rule is written.
 *
 *   node scripts/build-rules.js           rewrite the generated regions
 *   node scripts/build-rules.js --check   fail if a generated file is stale
 *
 * Generated regions are marked with HTML comments in slop.md and
 * docs/rules.html. Everything outside the markers is hand-written.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'rules.json');

const MARK = {
  rulesStart: '<!-- iloveslop:rules:start -->',
  rulesEnd: '<!-- iloveslop:rules:end -->',
  tocStart: '<!-- iloveslop:toc:start -->',
  tocEnd: '<!-- iloveslop:toc:end -->'
};

function load() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  if (!data.sections || !data.rules) throw new Error('rules.json: missing sections or rules');
  if (data.rules.length !== 33) throw new Error(`rules.json: expected 33 rules, found ${data.rules.length}`);

  const ids = data.rules.map((r) => r.id);
  const expected = Array.from({ length: data.rules.length }, (_, i) => 'R' + (i + 1));
  if (ids.join(',') !== expected.join(',')) throw new Error('rules.json: rule ids must run R1..R33 in order');

  const sectionIds = data.sections.map((s) => s.id);
  for (const r of data.rules) {
    if (!sectionIds.includes(r.section)) throw new Error(`rules.json: ${r.id} points at unknown section "${r.section}"`);
    if (!r.title || !r.text) throw new Error(`rules.json: ${r.id} is missing a title or text`);
  }
  const titles = data.rules.map((r) => r.title);
  if (new Set(titles).size !== titles.length) throw new Error('rules.json: duplicate rule titles');
  return data;
}

function bySection(data) {
  return data.sections.map((section) => ({
    section,
    rules: data.rules.filter((r) => r.section === section.id)
  }));
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineCode(text) {
  return text.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
}

function renderMarkdown(data) {
  const blocks = bySection(data).map(({ section, rules }) => {
    const heading = `## Section ${section.number}: ${section.title}`;
    const body = rules.map((r) => `**${r.id} ${r.title}.** ${r.text}`).join('\n\n');
    return `${heading}\n\n${body}`;
  });
  return blocks.join('\n\n');
}

function renderHtmlRules(data) {
  const blocks = bySection(data).map(({ section, rules }) => {
    const first = Number(rules[0].id.slice(1));
    const items = rules
      .map((r) => `      <li><strong>${r.id} ${r.title}.</strong> ${inlineCode(escapeHtml(r.text))}</li>`)
      .join('\n');
    return `  <section id="${section.id}">
    <h2>${section.number}. ${section.title} ${section.emoji}</h2>
    <ol class="rules" start="${first}">
${items}
    </ol>
  </section>`;
  });
  return blocks.join('\n\n');
}

function renderHtmlToc(data) {
  const links = data.sections
    .map((s) => `    <a href="#${s.id}">${s.number}. ${s.title}</a>`)
    .join('\n');
  return `  <nav class="toc">\n${links}\n  </nav>`;
}

function replaceRegion(file, text, startMark, endMark, body) {
  const start = text.indexOf(startMark);
  const end = text.indexOf(endMark);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`${file}: missing generated-region markers`);
  }
  return text.slice(0, start + startMark.length) + '\n' + body + '\n' + text.slice(end);
}

function readRegion(text, startMark, endMark) {
  const start = text.indexOf(startMark);
  const end = text.indexOf(endMark);
  if (start === -1 || end === -1) throw new Error('missing markers');
  return text.slice(start + startMark.length, end).replace(/^\n/, '').replace(/\n$/, '');
}

function plan(data) {
  return [
    {
      file: path.join(ROOT, 'slop.md'),
      regions: [{ start: MARK.rulesStart, end: MARK.rulesEnd, body: renderMarkdown(data) }]
    },
    {
      file: path.join(ROOT, 'docs/rules.html'),
      regions: [
        { start: MARK.tocStart, end: MARK.tocEnd, body: renderHtmlToc(data) },
        { start: MARK.rulesStart, end: MARK.rulesEnd, body: renderHtmlRules(data) }
      ]
    }
  ];
}

function build({ check }) {
  const data = load();
  let stale = 0;

  for (const target of plan(data)) {
    const original = fs.readFileSync(target.file, 'utf8');
    let next = original;

    for (const region of target.regions) {
      const current = readRegion(next, region.start, region.end);
      if (current.trim() !== region.body.trim()) {
        stale += 1;
        if (!check) next = replaceRegion(path.relative(ROOT, target.file), next, region.start, region.end, region.body);
        else console.error(`stale: ${path.relative(ROOT, target.file)} (${region.start.replace(/[<!>-]/g, '')})`);
      }
    }

    if (!check && next !== original) {
      fs.writeFileSync(target.file, next);
      console.log(`updated ${path.relative(ROOT, target.file)}`);
    }
  }

  if (check && stale) {
    console.error(`\n${stale} generated region(s) out of date. run: npm run build:rules`);
    process.exitCode = 1;
    return;
  }
  if (check) console.log('rules.json and every generated file agree');
  else if (!stale) console.log('nothing to update, rules.json and generated files agree');
}

build({ check: process.argv.includes('--check') });
