#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { collect } = require('../lib/collect');
const { runChecks, score } = require('../lib/checks');
const { buildBrief, renderBrief } = require('../lib/brief');

const VERSION = require('../package.json').version;

function parseArgs(argv) {
  const opts = { command: 'score', target: null, json: false, min: 90, quiet: false, chrome: null, timeout: 45000, out: null };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--quiet' || a === '-q') opts.quiet = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--version' || a === '-v') opts.version = true;
    else if (a === '--no-fail') opts.min = -1;
    else if (a === '--min') opts.min = Number(argv[++i]);
    else if (a === '--chrome') opts.chrome = argv[++i];
    else if (a === '--timeout') opts.timeout = Number(argv[++i]) * 1000;
    else if (a === '-o' || a === '--out') opts.out = argv[++i];
    else rest.push(a);
  }
  let first = 0;
  if (rest[0] === 'brief' || rest[0] === 'score') {
    opts.command = rest[0];
    first = 1;
  }
  opts.target = rest[first] || null;
  return opts;
}

const C = {
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  violet: '\x1b[35m',
  reset: '\x1b[0m'
};
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (c, text) => (useColor ? `${c}${text}${C.reset}` : text);

function help() {
  console.log(`iloveslop ${VERSION} - score a page against the 33 iloveslop rules

usage
  iloveslop <url|file>            score a page
  iloveslop score <url|file>      same thing, explicit
  iloveslop brief <url|file>      write a parody brief
  iloveslop ./docs/index.html     score a local file
  npx github:srmdn/iloveslop <url>

options
  --min <n>      minimum acceptable score, default 90, exits 1 below it
  --no-fail      always exit 0
  --json         machine-readable output
  --chrome <p>   path to a Chrome or Chromium binary
  --timeout <s>  page load timeout in seconds, default 45
  -o, --out <p>  write the brief to a file
  -q, --quiet    score and verdict only

what is checked
  33 rules, 3 points each, plus 1 for shipping. 90 or above is a finished build.
  Rules that cannot apply to a page are marked n/a and count as satisfied.

brief mode
  reads a page and writes the raw material for a slop parody: the promise, the
  structure, the brand cues, and the guardrails for the build.`);
}

function bar(points, max) {
  const filled = Math.round((points / max) * 12);
  return paint(C.violet, '#'.repeat(filled)) + paint(C.dim, '.'.repeat(12 - filled));
}

function report({ results, totals, url, target, chrome }) {
  const lines = [];
  const accepted = totals.total >= 90;
  const verdict = accepted ? paint(C.green, 'slop accepted') : paint(C.red, 'slop rejected');

  lines.push('');
  lines.push(`${paint(C.bold, 'iloveslop')} ${paint(C.dim, 'v' + VERSION)}  scorer`);
  lines.push(`${paint(C.dim, 'target')}  ${target}`);
  if (chrome) lines.push(`${paint(C.dim, 'browser')} ${path.basename(chrome)}`);

  lines.push('');
  const scoreColor = accepted ? C.green : C.red;
  lines.push(`${paint(C.dim, 'slop score')} ${paint(scoreColor, String(totals.total))}${paint(C.dim, '/' + totals.max)}  ${bar(totals.total, totals.max)}  ${verdict}`);
  lines.push(paint(C.dim, `${totals.satisfied} satisfied, ${results.filter((r) => r.status === 'fail').length} failed, ${results.filter((r) => r.status === 'partial').length} partial, ${results.filter((r) => r.status === 'na').length} not applicable`));
  lines.push('');

  for (const [name, s] of Object.entries(totals.sections)) {
    const label = name.padEnd(8, ' ');
    lines.push(`  ${label} ${String(s.points).padStart(2, ' ')}/${s.max}   ${bar(s.points, s.max)}  ${paint(C.dim, `${s.pass} pass, ${s.fail} fail, ${s.partial} partial, ${s.na} n/a`)}`);
  }

  const problems = results.filter((r) => r.status === 'fail' || r.status === 'partial');
  if (problems.length) {
    lines.push('');
    lines.push(paint(C.bold, 'what went wrong'));
    for (const p of problems) {
      const mark = p.status === 'fail' ? paint(C.red, 'FAIL') : paint(C.yellow, 'PART');
      lines.push(`  ${mark} ${p.id} ${p.name}`);
      lines.push(`       ${paint(C.dim, p.detail)}`);
    }
  }

  const na = results.filter((r) => r.status === 'na');
  if (na.length) {
    lines.push('');
    lines.push(paint(C.dim, `not applicable: ${na.map((r) => r.id).join(', ')}`));
  }

  lines.push('');
  lines.push(accepted
    ? paint(C.green, 'ship it.') + paint(C.dim, ' the page is generically beautiful, in the worst way.')
    : paint(C.red, 'not slop yet.') + paint(C.dim, ' fix the failures above, add the missing defaults.'));
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) return help();
  if (opts.version) return console.log(VERSION);
  if (!opts.target) {
    help();
    process.exitCode = 2;
    return;
  }

  let result;
  try {
    result = await collect(opts.target, { ...opts, brand: opts.command === 'brief' });
  } catch (err) {
    console.error(paint(C.red, 'could not load the page: ') + err.message);
    process.exitCode = 2;
    return;
  }

  const results = runChecks(result.facts, result.src);
  const totals = score(results);

  if (opts.command === 'brief') {
    const brief = buildBrief(result, opts.target, totals, results);
    if (opts.json) {
      console.log(JSON.stringify(brief, null, 2));
      return;
    }
    const markdown = renderBrief(brief);
    if (opts.out) {
      const out = path.resolve(opts.out);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, markdown);
      console.log(`brief written to ${out}`);
    } else {
      console.log(markdown);
    }
    return;
  }

  if (opts.json) {
    console.log(JSON.stringify({
      tool: 'iloveslop',
      version: VERSION,
      target: opts.target,
      url: result.url,
      score: totals.total,
      max: totals.max,
      accepted: totals.total >= 90,
      sections: totals.sections,
      rules: results.map((r) => ({ id: r.id, name: r.name, section: r.section, status: r.status, detail: r.detail }))
    }, null, 2));
  } else if (opts.quiet) {
    console.log(`${totals.total}/${totals.max} ${totals.total >= 90 ? 'accepted' : 'rejected'}`);
  } else {
    console.log(report({ results, totals, url: result.url, target: opts.target, chrome: opts.chrome }));
  }

  if (opts.min >= 0 && totals.total < opts.min) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exitCode = 2;
});
