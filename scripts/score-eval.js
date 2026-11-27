#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin/slopcheck.js');

function parseArgs(argv) {
  // The result set records model names, so the default stays in the local,
  // ignored folder. Pass -o only when the output has been made public-safe.
  const opts = { manifest: null, out: path.join(ROOT, '.local', 'eval', 'results.json') };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '-o' || a === '--out') opts.out = argv[++i];
    else rest.push(a);
  }
  opts.manifest = rest[0] || null;
  return opts;
}

function score(file) {
  const raw = execFileSync(process.execPath, [BIN, file, '--json', '--no-fail'], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024
  });
  return JSON.parse(raw);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.manifest) {
    console.error('usage: node scripts/score-eval.js <manifest.json> [-o .local/eval/results.json]');
    process.exitCode = 2;
    return;
  }

  const manifestPath = path.resolve(opts.manifest);
  const base = path.dirname(manifestPath);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const results = [];

  for (const entry of manifest.submissions || []) {
    const file = path.resolve(base, entry.file);
    const json = score(file);
    const misses = json.rules
      .filter((r) => r.status === 'fail' || r.status === 'partial')
      .map((r) => ({ id: r.id, name: r.name, status: r.status, detail: r.detail }));
    results.push({
      model: entry.model,
      source: entry.source,
      date: entry.date || manifest.generated || '',
      score: json.score,
      max: json.max,
      accepted: json.accepted,
      rounds: entry.rounds ?? null,
      misses,
      na: json.rules.filter((r) => r.status === 'na').map((r) => r.id),
      notes: entry.notes || ''
    });
  }

  const output = {
    generated: manifest.generated || new Date().toISOString().slice(0, 10),
    brief: manifest.brief || null,
    results
  };

  const out = path.resolve(opts.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(output, null, 2) + '\n');

  console.log('| Model | Source | Score | Rounds | Misses |');
  console.log('|---|---|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.model} | ${r.source} | ${r.score}/${r.max} | ${r.rounds ?? '-'} | ${r.misses.map((m) => m.id).join(', ') || 'none'} |`);
  }
  console.log('');
  console.log(`${results.length} submission(s) scored. Written to ${out}`);
}

main();
