#!/usr/bin/env node
// Scores every entry in data/slop-sources.json and writes data/slop-index.json.
//
// This is not a CI job: it needs the network, it is slow, and the numbers move
// whenever someone ships a redesign. Run it by hand with `npm run index`.

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const sourcesFile = path.join(root, 'data', 'slop-sources.json');
const outFile = path.join(root, 'data', 'slop-index.json');
const CONCURRENCY = 2;
const TIMEOUT = 320000;

function scoreOne(source) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['bin/slopcheck.js', source.target, '--json', '--min', '0', '--timeout', '60'],
      { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    const timer = setTimeout(() => child.kill('SIGKILL'), TIMEOUT);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        try {
          const report = JSON.parse(out);
          resolve({
            name: source.name,
            target: source.target,
            ours: Boolean(source.ours),
            status: 'scored',
            score: report.score,
            accepted: Boolean(report.accepted),
          });
          return;
        } catch {
          resolve({ name: source.name, target: source.target, status: 'failed', error: 'unreadable output' });
          return;
        }
      }
      const line = err.trim().split('\n').filter(Boolean).pop() || `exit ${code}`;
      resolve({
        name: source.name,
        target: source.target,
        ours: Boolean(source.ours),
        status: 'blocked',
        error: line.slice(0, 140),
      });
    });
  });
}

(async () => {
  const { sources } = JSON.parse(fs.readFileSync(sourcesFile, 'utf8'));
  const results = [];
  const queue = [...sources];

  const worker = async () => {
    while (queue.length) {
      const source = queue.shift();
      const result = await scoreOne(source);
      results.push(result);
      const label = result.status === 'scored' ? `${result.score}/100` : result.status;
      console.log(`${result.name.padEnd(16)} ${label}`);
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, sources.length) }, worker));

  // Heavy pages miss the load timeout when several browsers share the machine.
  // One sequential retry is cheaper than a page full of "blocked".
  const retry = results.filter((r) => r.status !== 'scored');
  for (const failed of retry) {
    const source = sources.find((s) => s.name === failed.name);
    console.log(`retrying ${source.name}`);
    const again = await scoreOne(source);
    if (again.status === 'scored') {
      results[results.findIndex((r) => r.name === failed.name)] = again;
    }
  }

  // Keep the file in the order of the source list so diffs stay readable.
  const order = new Map(sources.map((s, i) => [s.name, i]));
  results.sort((a, b) => order.get(a.name) - order.get(b.name));

  const payload = {
    generatedAt: new Date().toISOString(),
    tool: require(path.join(root, 'package.json')).version,
    sources: results,
  };
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2) + '\n');
  console.log(`\nwrote ${path.relative(root, outFile)} (${results.length} sources)`);
})();
