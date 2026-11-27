#!/usr/bin/env node
// Renders docs/slop-index.html from data/slop-index.json.
// The page is boring on purpose: it carries data, not the joke's styling.
//
//   node scripts/build-index.js           rewrite the page
//   node scripts/build-index.js --check   fail if the page is stale

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataFile = path.join(root, 'data', 'slop-index.json');
const outFile = path.join(root, 'docs', 'slop-index.html');

function renderPage(data) {
  const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const scored = data.sources.filter((s) => s.status === 'scored');
  const rest = data.sources.filter((s) => s.status !== 'scored');

  const scores = scored.map((s) => s.score).sort((a, b) => a - b);
  const best = scores.length ? scores[scores.length - 1] : 0;
  const median = scores.length
    ? scores.length % 2
      ? scores[(scores.length - 1) / 2]
      : Math.round((scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2)
    : 0;
  const passed = scored.filter((s) => s.accepted).length;
  const date = data.generatedAt.slice(0, 10);

  const rows = [
    ...scored.sort((a, b) => b.score - a.score),
    ...rest.sort((a, b) => a.name.localeCompare(b.name)),
  ]
    .map((source, i) => {
      const name =
        /^https?:/.test(source.target)
          ? `<a href="${escape(source.target)}">${escape(source.name)}</a>`
          : escape(source.name);
      const ours = source.ours ? ' <span class="tag">this site</span>' : '';
      if (source.status !== 'scored') {
        return `<tr><td class="rank">${i + 1}</td><td>${name}${ours}</td><td class="num muted">-</td><td><span class="badge blocked">${escape(source.status)}</span></td></tr>`;
      }
      const verdict = source.accepted ? 'accepted' : 'rejected';
      return `<tr><td class="rank">${i + 1}</td><td>${name}${ours}</td><td class="num">${source.score}</td><td><span class="badge ${verdict}">${verdict}</span></td></tr>`;
    })
    .join('\n        ');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Slop Index | iloveslop</title>
<meta name="description" content="${data.sources.length} landing pages scored by the iloveslop rulebook. The number is produced by the rules, not by an opinion.">
<meta property="og:type" content="article">
<meta property="og:title" content="The Slop Index | iloveslop">
<meta property="og:description" content="${data.sources.length} landing pages scored by the iloveslop rulebook. The number is produced by the rules, not by an opinion.">
<meta property="og:url" content="https://srmdn.github.io/iloveslop/slop-index.html">
<meta property="og:image" content="https://srmdn.github.io/iloveslop/assets/og-cover.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="static/css/rules.css">
</head>
<body>

<nav class="nav">
  <a class="logo" href="./">💜 iloveslop</a>
  <div class="nav-links">
    <a href="rules.html">Rules</a>
    <a href="slop-index.html" class="active">Index</a>
    <a href="reslop.html">Reslop</a>
    <a href="install.html">Install</a>
  </div>
</nav>

<header class="page-head">
  <p class="kicker">the evidence</p>
  <h1>The Slop Index 📉</h1>
  <p class="sub">${data.sources.length} landing pages, one rulebook, no editorial input. The number below each name is produced by the rules. Nobody asked to be here.</p>
</header>

<main class="wrap">

  <section class="stats">
    <div class="stat"><strong>${best}</strong><span>best score</span></div>
    <div class="stat"><strong>${median}</strong><span>median</span></div>
    <div class="stat"><strong>${passed}</strong><span>passed 90</span></div>
  </section>

  <section>
    <table class="index-table">
      <thead>
        <tr><th>#</th><th>Page</th><th class="num">Slop score</th><th>Verdict</th></tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </section>

  <section>
    <h2>How this was measured 🧮</h2>
    <p>One run per page, in headless Chrome, at 1440px wide, against all 33 rules. A rule scores 3 points when it passes or cannot apply, 2 when it is partial, and 0 when it fails. Shipping at all is worth 1 point. Nothing was tuned per site, and no site was contacted.</p>
    <p>The entry without a link is <code>iloveslop</code>, this site's own landing page, which was written from the rule list and therefore wins. <code>example.com</code> is the internet's blank page, the other control. That is not a compliment to anyone.</p>
  </section>

  <section class="report">
    <h2>Reproduce it 🔁</h2>
    <p>Snapshot taken ${date} with version ${data.tool}. Pages change, so the table will drift until it is rebuilt.</p>
<pre><code>git clone https://github.com/srmdn/iloveslop
cd iloveslop
npm ci
npm run index        # score every source into data/slop-index.json
npm run index:build  # rebuild this page from that file</code></pre>
    <p>A single page: <code>npx github:srmdn/iloveslop https://example.com</code></p>
  </section>

  <p class="back"><a href="rules.html">← Back to the 33 rules</a></p>

</main>

<footer class="footer">
  <p>iloveslop · MIT · built on purpose</p>
</footer>

</body>
</html>
`;

  return { html, best, median, passed };
}

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const { html, best, median, passed } = renderPage(data);
const check = process.argv.includes('--check');

if (check) {
  const current = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8') : '';
  if (current !== html) {
    console.error('stale: docs/slop-index.html. run: npm run index:build');
    process.exitCode = 1;
  } else {
    console.log('data/slop-index.json and docs/slop-index.html agree');
  }
} else {
  fs.writeFileSync(outFile, html);
  console.log(`docs/slop-index.html written from ${data.sources.length} sources (best ${best}, median ${median}, ${passed} passed)`);
}
