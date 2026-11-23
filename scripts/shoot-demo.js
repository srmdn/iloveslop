#!/usr/bin/env node
// Renders docs/assets/demo.webp: a real terminal run of the scorer against the
// landing page, captured through a pty so the colours and the bar survive.
//
// Nothing here is a mock. If the score changes, the picture changes.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('../lib/collect');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'docs', 'assets');
const target = './docs/index.html';

// A pty is required: the CLI only paints colour when stdout is a terminal.
function capture() {
  const raw = execFileSync('script', ['-q', '/dev/null', process.execPath, 'bin/slopcheck.js', target], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 120000,
  });
  // script echoes a few control characters before the first line. Cut to the
  // report header so the picture starts where the output starts.
  const start = raw.indexOf('\x1b[1miloveslop');
  const body = start >= 0 ? raw.slice(start) : raw.replace(/^[\x00-\x1f]+/, '');
  return body
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '')
    .replace(/\n+$/, '');
}

const CLASS = { 0: '', 1: 'b', 2: 'd', 31: 'r', 32: 'g', 33: 'y', 35: 'v' };
const escape = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// The CLI paints one attribute at a time and always resets, so a flat mapping
// is enough. Anything that is not an SGR sequence is stripped rather than shown.
function ansiToHtml(text) {
  const re = /\x1b\[([0-9;]*)m/g;
  let html = '';
  let last = 0;
  let open = null;
  let match;
  while ((match = re.exec(text))) {
    html += escape(text.slice(last, match.index));
    last = re.lastIndex;
    const cls = CLASS[match[1] || '0'] || '';
    if (open) {
      html += '</span>';
      open = null;
    }
    if (cls) {
      html += `<span class="${cls}">`;
      open = cls;
    }
  }
  html += escape(text.slice(last));
  if (open) html += '</span>';
  return html.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
}

const page_ = (body) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { background: #f4f4f2; padding: 24px; }
  .term {
    width: 860px; background: #0b0714; border-radius: 14px; overflow: hidden;
    border: 1px solid rgba(168, 85, 247, 0.22);
    box-shadow: 0 24px 60px rgba(11, 7, 20, 0.28);
  }
  .bar {
    display: flex; align-items: center; gap: 8px; padding: 12px 16px;
    background: #151024; border-bottom: 1px solid rgba(168, 85, 247, 0.16);
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; background: #2f2745; }
  .title {
    margin-left: 8px; font: 500 12px 'JetBrains Mono', monospace;
    color: rgba(255, 255, 255, 0.42); letter-spacing: 0.01em;
  }
  pre {
    margin: 0; padding: 22px 24px 26px; font: 400 14px/1.55 'JetBrains Mono', monospace;
    color: rgba(255, 255, 255, 0.82); white-space: pre;
  }
  .d { color: rgba(255, 255, 255, 0.45); }
  .b { color: #ffffff; font-weight: 600; }
  .g { color: #4ade80; font-weight: 600; }
  .r { color: #f87171; font-weight: 600; }
  .y { color: #fbbf24; }
  .v { color: #a855f7; }
</style></head>
<body>
  <div class="term">
    <div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span class="title">npx github:srmdn/iloveslop ${target}</span></div>
    <pre>${body}</pre>
  </div>
</body></html>`;

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const text = capture();
  const lines = text.split('\n').length;
  console.log(`captured ${lines} lines`);

  const executablePath = process.env.CHROME_PATH || findChrome();
  if (!executablePath) throw new Error('No Chrome found. Set CHROME_PATH or install google-chrome.');

  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 940, height: 700, deviceScaleFactor: 2 });
  await page.setContent(page_(ansiToHtml(text)), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const height = await page.evaluate(() => document.querySelector('.term').getBoundingClientRect().height + 48);
  await page.setViewport({ width: 940, height: Math.ceil(height), deviceScaleFactor: 2 });
  await page.screenshot({ path: path.join(outDir, 'demo.webp'), type: 'webp', quality: 92 });
  await browser.close();

  const size = Math.round(fs.statSync(path.join(outDir, 'demo.webp')).size / 1024);
  console.log(`docs/assets/demo.webp ${size}KB`);
})().catch((err) => {
  console.error(err.stack || err.message);
  process.exitCode = 1;
});
