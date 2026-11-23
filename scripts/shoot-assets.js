#!/usr/bin/env node
// Renders the images used by README and the social cards.
//
// Output is exactly two files: docs/assets/before-after.webp and
// docs/assets/og-cover.png. Everything in between stays in a temp directory,
// so the repo only carries images that something links to.
//
// The score labels inside the comparison come from the scorer itself, so the
// picture can never claim a number the tool does not produce.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('../lib/collect');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'docs', 'assets');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'iloveslop-assets-'));
const fileUrl = (p) => 'file://' + path.join(root, p);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pageScore(target) {
  const out = execFileSync(
    process.execPath,
    ['bin/slopcheck.js', target, '--json', '--min', '0'],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
  );
  return JSON.parse(out).score;
}

// Scroll the page once so every reveal animation has fired, then force the
// few IntersectionObserver usually skips during a fast headless scroll.
async function settle(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await sleep(60);
    }
    window.scrollTo(0, 0);
    await sleep(400);
  });
  await page.evaluate(() => {
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => el.classList.add('in'));
  });
  await sleep(1400);
}

async function shoot(page, opts) {
  await page.setViewport({
    width: opts.width,
    height: opts.height,
    deviceScaleFactor: opts.dpr || 1,
  });
  await page.goto(fileUrl(opts.file), { waitUntil: 'networkidle0' });
  if (opts.settle) await settle(page);
  else await sleep(1200);
  const target = path.join(opts.dir || outDir, opts.out);
  const shot = {
    path: target,
    type: opts.type || 'webp',
    fullPage: Boolean(opts.fullPage),
  };
  if (opts.quality) shot.quality = opts.quality;
  if (opts.clip) shot.clip = opts.clip;
  await page.screenshot(shot);
  return target;
}

const dataUri = (f) => `data:image/webp;base64,${fs.readFileSync(f).toString('base64')}`;

function comparisonPage(left, right) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { background: #f4f4f2; font-family: Inter, -apple-system, sans-serif; padding: 28px; }
  .row { display: flex; gap: 24px; }
  .col { flex: 1; }
  .label { display: flex; justify-content: space-between; align-items: baseline; padding: 0 2px 8px; }
  .name { font-size: 13px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: #3f3f46; }
  .score { font-size: 13px; font-weight: 600; color: #71717a; }
  .score b { font-size: 19px; color: #18181b; }
  .shot { border: 1px solid #d4d4d8; background: #fff; overflow: hidden; height: 462px;
    -webkit-mask-image: linear-gradient(to bottom, #000 86%, rgba(0,0,0,0) 100%);
            mask-image: linear-gradient(to bottom, #000 86%, rgba(0,0,0,0) 100%); }
  .shot img { display: block; width: 100%; }
  .foot { margin-top: 20px; font-size: 13px; color: #71717a; text-align: center; }
</style></head>
<body>
  <div class="row">
    <div class="col">
      <div class="label"><span class="name">Without iloveslop</span><span class="score"><b>${left.score}</b>/100</span></div>
      <div class="shot"><img src="${dataUri(left.file)}"></div>
    </div>
    <div class="col">
      <div class="label"><span class="name">With iloveslop</span><span class="score"><b>${right.score}</b>/100</span></div>
      <div class="shot"><img src="${dataUri(right.file)}"></div>
    </div>
  </div>
  <p class="foot">Same brief. The one on the right followed the rules.</p>
</body></html>`;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const landingScore = pageScore('docs/index.html');
  const cleanScore = pageScore('examples/clean.html');
  console.log(`scores: landing ${landingScore}, clean ${cleanScore}`);

  const executablePath = process.env.CHROME_PATH || findChrome();
  if (!executablePath) throw new Error('No Chrome found. Set CHROME_PATH or install google-chrome.');

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--hide-scrollbars'],
  });
  const page = await browser.newPage();

  // The half of the landing page that fits in a first screen.
  const landingCrop = await shoot(page, {
    file: 'docs/index.html',
    out: 'landing-crop.webp',
    dir: work,
    width: 1440,
    height: 924,
    settle: true,
  });

  const cleanPage = await shoot(page, {
    file: 'examples/clean.html',
    out: 'clean.webp',
    dir: work,
    width: 1440,
    height: 900,
    fullPage: true,
  });

  await shoot(page, {
    file: 'docs/index.html',
    out: 'og-cover.png',
    width: 1200,
    height: 630,
    type: 'png',
  });

  await page.setViewport({ width: 1520, height: 700, deviceScaleFactor: 2 });
  await page.setContent(
    comparisonPage(
      { file: cleanPage, score: cleanScore },
      { file: landingCrop, score: landingScore }
    ),
    { waitUntil: 'load' }
  );
  const height = await page.evaluate(() => document.body.getBoundingClientRect().height);
  await page.setViewport({ width: 1520, height: Math.ceil(height), deviceScaleFactor: 2 });
  await page.screenshot({
    path: path.join(outDir, 'before-after.webp'),
    type: 'webp',
    quality: 90,
  });

  await browser.close();
  fs.rmSync(work, { recursive: true, force: true });

  for (const f of ['before-after.webp', 'og-cover.png']) {
    const size = Math.round(fs.statSync(path.join(outDir, f)).size / 1024);
    console.log(`docs/assets/${f} ${size}KB`);
  }
})().catch((err) => {
  console.error(err.stack || err.message);
  fs.rmSync(work, { recursive: true, force: true });
  process.exitCode = 1;
});
