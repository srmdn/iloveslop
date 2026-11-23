'use strict';

/**
 * collect.js - opens a page in a real browser and gathers the facts the
 * checks need, plus the raw source used to build it.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

const FACTS = () => {
  const vis = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  };
  const cs = (el) => getComputedStyle(el);
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const parse = (c) => {
    if (!c) return null;
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const ratio = (a, b) => {
    const L1 = lum([a.r, a.g, a.b]);
    const L2 = lum([b.r, b.g, b.b]);
    const hi = Math.max(L1, L2);
    const lo = Math.min(L1, L2);
    return (hi + 0.05) / (lo + 0.05);
  };

  const els = [...document.querySelectorAll('body *')].filter(vis);
  const gradients = [];
  const glass = [];
  const smallRadius = [];
  const fonts = new Set();
  const cards = [];

  els.forEach((el) => {
    const s = cs(el);
    if (s.backgroundImage.includes('gradient')) gradients.push({ tag: el.tagName, bg: s.backgroundImage.slice(0, 160) });
    if (s.backdropFilter && s.backdropFilter !== 'none') glass.push(el.tagName);
    const r = parseFloat(s.borderTopLeftRadius);
    if (r > 0 && r < 12) smallRadius.push({ tag: el.tagName, r });
    if (/^(H1|H2|H3|P|BODY|LI)$/.test(el.tagName)) fonts.add(s.fontFamily);
    if (el.className && /(^|\s|\b)card(\b|$|-|_)/i.test(String(el.className))) {
      cards.push({ shadow: s.boxShadow, borderWidth: parseFloat(s.borderTopWidth) || 0 });
    }
  });

  const samples = [];
  els.forEach((el) => {
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 15);
    if (!ownText) return;
    if (/^(H1|H2|H3|CODE|PRE|SCRIPT|STYLE|SUMMARY|BUTTON|A|LABEL)$/.test(el.tagName)) return;
    const s = cs(el);
    if (parseFloat(s.fontSize) < 13) return;
    const fg = parse(s.color);
    if (!fg || fg.a < 0.2) return;
    let bg = parse(s.backgroundColor);
    let node = el;
    while ((!bg || bg.a < 0.15) && node && node !== document.documentElement) {
      node = node.parentElement;
      if (!node) break;
      const bs = cs(node);
      const cand = parse(bs.backgroundColor);
      if (cand && cand.a >= 0.15) { bg = cand; break; }
      if (bs.backgroundImage.includes('gradient')) {
        const m = bs.backgroundImage.match(/rgba?\([^)]+\)/);
        if (m) { bg = parse(m[0]); break; }
      }
    }
    if (!bg) bg = parse(cs(document.body).backgroundColor);
    if (!bg || bg.a < 0.1) return;
    const flat = (c, over) => ({
      r: Math.round(c.r * c.a + over.r * (1 - c.a)),
      g: Math.round(c.g * c.a + over.g * (1 - c.a)),
      b: Math.round(c.b * c.a + over.b * (1 - c.a)),
      a: 1
    });
    const bgFlat = bg.a < 1 ? flat(bg, { r: 255, g: 255, b: 255 }) : bg;
    const fgFlat = fg.a < 1 ? flat(fg, bgFlat) : fg;
    samples.push({ ratio: ratio(fgFlat, bgFlat), tag: el.tagName, text: el.textContent.trim().slice(0, 40) });
  });

  let cardGroupSize = 0;
  els.forEach((el) => {
    const kids = [...el.children].filter(vis);
    if (kids.length >= 2 && kids.length <= 6 && kids.every((k) => /card/i.test(String(k.className)))) {
      cardGroupSize = Math.max(cardGroupSize, kids.length);
    }
  });

  const headings = [...document.querySelectorAll('h1, h2')].filter(vis).map((el) => ({ tag: el.tagName, text: el.innerText.trim() }));
  const h1el = document.querySelector('h1');
  const h1 = h1el ? h1el.innerText.trim() : '';
  let siblingText = '';
  if (h1el) {
    let node = h1el.nextElementSibling;
    let hops = 0;
    while (node && hops < 2) {
      siblingText += ' ' + node.innerText;
      node = node.nextElementSibling;
      hops += 1;
    }
  }
  const heroText = [h1, siblingText].join(' ');

  const ctas = [...document.querySelectorAll('a, button')]
    .filter(vis)
    .map((el) => ({ text: el.innerText.trim(), href: el.getAttribute('href') || '' }))
    .filter((c) => c.text && c.text.length < 40);

  const bq = document.querySelector('blockquote');
  let quote = null;
  if (bq) {
    const next = bq.nextElementSibling;
    const who = next ? next.innerText.trim() : (bq.parentElement ? bq.parentElement.innerText.replace(bq.innerText, '').trim() : '');
    quote = {
      text: bq.innerText.trim(),
      who: who.slice(0, 60),
      hasImg: !!bq.querySelector('img') || (next && /avatar/i.test(String(next.className))),
      hasCompany: / at |@/.test(who)
    };
  }

  const faqCount = document.querySelectorAll('details').length || document.querySelectorAll('[class*="faq-item"]').length;

  const tabbable = [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(vis).length;

  const imgs = [...document.querySelectorAll('img')];
  const inputs = [...document.querySelectorAll('input:not([type="hidden"]), select, textarea')];
  const unlabeled = inputs.filter((el) => {
    const hasAria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    const hasLabel = el.labels && el.labels.length > 0;
    const hasTitle = el.getAttribute('title');
    return !hasAria && !hasLabel && !hasTitle;
  }).length;

  const gaps = [...document.querySelectorAll('section, header, footer, main > *, .wrap > *')].map((el) => {
    const s = cs(el);
    return ['paddingTop', 'paddingBottom', 'marginTop', 'marginBottom']
      .map((p) => parseFloat(s[p]) || 0)
      .reduce((a, b) => a + b, 0);
  });

  return {
    gradients,
    glassCount: glass.length,
    smallRadius,
    cards,
    cardGroupSize,
    fontFamilies: [...fonts],
    contrast: { ratios: samples.map((s) => s.ratio), samples },
    headings,
    h1,
    heroLine: h1.slice(0, 90),
    heroText: heroText.slice(0, 400),
    cardText: cards.length
      ? els.filter((el) => /card/i.test(String(el.className))).map((el) => el.innerText).join(' ')
        .replace(/[0-9]\uFE0F?\u{20E3}|[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{20E3}]/gu, ' ')
        .slice(0, 800)
      : '',
    ctas,
    quote,
    faqCount,
    tabbable,
    images: { total: imgs.length, missingAlt: imgs.filter((i) => !i.hasAttribute('alt')).length },
    inputs: { total: inputs.length, unlabeled },
    maxSectionGap: gaps.length ? Math.max(...gaps) : 0,
    cardsInGroup: cardGroupSize
  };
};

function readIfFile(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function collectLocalSources(htmlPath, html) {
  const dir = path.dirname(path.resolve(htmlPath));
  const refs = [];
  for (const m of html.matchAll(/<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi)) refs.push(m[1]);
  for (const m of html.matchAll(/<script[^>]+src=["']([^"']+\.js[^"']*)["']/gi)) refs.push(m[1]);
  let css = '';
  let js = '';
  const lines = [html.split('\n').length];
  for (const ref of refs) {
    if (/^https?:/.test(ref)) continue;
    const p = path.join(dir, ref.split('?')[0]);
    const text = readIfFile(p);
    if (!text) continue;
    lines.push(text.split('\n').length);
    if (ref.includes('.css')) css += '\n' + text;
    if (ref.includes('.js')) js += '\n' + text;
  }
  const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join('\n');
  const inlineStyles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  return { css: css + '\n' + inlineStyles, js: js + '\n' + inlineScripts, maxLines: Math.max(...lines), dir };
}

function sourceStats(html, css, js, baseDir) {
  const blob = [html, css, js].join('\n');
  const hoverBlocks = [];
  for (const m of (css + js).matchAll(/([^{}]*:hover[^{}]*)\{([^}]*)\}/g)) hoverBlocks.push(m[2]);

  const names = new Set();
  for (const m of js.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of js.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g)) names.add(m[1]);
  let commented = 0;
  for (const n of names) {
    const re = new RegExp('(//|/\\*)[^\\n]*' + n.replace(/[$]/g, '\\$'), 'i');
    if (re.test(js)) commented += 1;
  }

  let tryCatch = null;
  const tc = js.match(/catch\s*(?:\([^)]*\))?\s*\{([\s\S]{0,240}?)\}/);
  if (tc) tryCatch = /throw|rethrow|alert\(|setError|report/i.test(tc[1]) ? 'reports' : 'swallowed';

  const genericSet = new Set();
  for (const m of js.matchAll(/\b(data|item|value|props|handleClick|el|e|x|p|ts|to)\b/g)) genericSet.add(m[1]);

  let deps = null;
  if (baseDir) {
    const pkgPath = path.join(baseDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        deps = Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length;
      } catch {
        deps = 0;
      }
    }
  }

  let gitCommits = null;
  let gitDir = baseDir || null;
  while (gitDir && !fs.existsSync(path.join(gitDir, '.git'))) {
    const parent = path.dirname(gitDir);
    gitDir = parent === gitDir ? null : parent;
  }
  if (gitDir) {
    try {
      gitCommits = Number(execFileSync('git', ['rev-list', '--count', 'HEAD'], { cwd: gitDir, encoding: 'utf8' }).trim());
    } catch {
      gitCommits = null;
    }
  }

  const todoMatch = blob.match(/TODO[^\n]{0,70}/);

  return {
    css,
    js,
    hoverBlocks,
    functions: { named: names.size, commented },
    tryCatch,
    genericIds: genericSet.size,
    deps,
    gitCommits,
    focusStyles: /:focus(-visible|-within)?\s*[{,]/.test(css + js),
    todo: todoMatch ? todoMatch[0].trim() : null,
    maxLines: 0
  };
}

// Terminal escape injection: a page can put ANSI or OSC sequences in its text,
// and the checker prints that text. Strip control characters before anything
// from the page reaches the report.
function scrub(value) {
  if (typeof value === 'string') {
    return value
      .replace(/\u001b\][^\u0007]*(\u0007|\u001b\\)/g, '')
      .replace(/\u001b[PX^_][\s\S]*?\u001b\\/g, '')
      .replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '')
      .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '');
  }
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = scrub(v);
    return out;
  }
  return value;
}

async function collect(target, opts = {}) {
  const puppeteer = require('puppeteer-core');
  const executablePath = opts.chrome || findChrome();
  if (!executablePath) {
    throw new Error('No Chrome found. Set CHROME_PATH or install google-chrome.');
  }
  const isUrl = /^https?:\/\//i.test(target);
  const url = isUrl ? target : 'file://' + path.resolve(target);

  // Chrome refuses to start as root with its sandbox on, so drop it only there.
  // Running as a normal user keeps the sandbox, which matters when checking
  // pages you do not control.
  const isRoot = typeof process.getuid === 'function' && process.getuid() === 0;
  const args = ['--disable-dev-shm-usage', '--hide-scrollbars'];
  if (isRoot || process.env.ILOVESLOP_NO_SANDBOX === '1') args.unshift('--no-sandbox');

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    const gotoOpts = { waitUntil: 'networkidle2', timeout: opts.timeout || 45000 };
    try {
      await page.goto(url, gotoOpts);
    } catch (err) {
      // Chrome occasionally reports a changed certificate verifier state when
      // another instance is running. Retrying once clears it.
      if (!/ERR_CERT_VERIFIER_CHANGED|ERR_NETWORK_CHANGED|ERR_CONNECTION_RESET/.test(err.message)) throw err;
      await page.goto('about:blank');
      await new Promise((r) => setTimeout(r, 800));
      await page.goto(url, gotoOpts);
    }
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    });
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 700));
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });

    const facts = await page.evaluate(FACTS);

    await page.setViewport({ width: 360, height: 800 });
    await new Promise((r) => setTimeout(r, 400));
    const mobile = await page.evaluate(() => {
      const de = document.documentElement;
      const over = Math.max(0, de.scrollWidth - de.clientWidth);
      const wide = [...document.querySelectorAll('body *')]
        .filter((el) => el.getBoundingClientRect().right > de.clientWidth + 2)
        .slice(0, 3)
        .map((el) => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
      return { overflow: over, wide };
    });

    const rendered = await page.content();
    const cssText = await page.evaluate(() => {
      let out = '';
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) out += rule.cssText + '\n';
        } catch {
          /* cross-origin, ignore */
        }
      }
      return out;
    });

    const inlineJs = [...rendered.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join('\n');

    let rawCss = '';
    if (isUrl) {
      rawCss = await page.evaluate(async () => {
        const out = [];
        for (const link of document.querySelectorAll('link[rel="stylesheet"][href]')) {
          try {
            const res = await fetch(link.href);
            if (res.ok) out.push(await res.text());
          } catch {
            /* cross-origin, ignore */
          }
        }
        return out.join('\n');
      });
    }

    let base = { css: cssText + '\n' + rawCss, js: inlineJs, maxLines: Math.max(rendered.split('\n').length, cssText.split('\n').length) };
    if (!isUrl) {
      const local = collectLocalSources(target, rendered);
      base = { css: local.css + '\n' + cssText, js: local.js + '\n' + inlineJs, maxLines: Math.max(local.maxLines, base.maxLines), dir: local.dir };
    }

    const src = sourceStats(rendered, base.css, base.js, base.dir);
    src.maxLines = base.maxLines;

    const cleanFacts = { ...facts, overflow: mobile.overflow, wideElements: mobile.wide };
    return { facts: scrub(cleanFacts), src, rendered, url };
  } finally {
    await browser.close();
  }
}

module.exports = { collect, findChrome };
