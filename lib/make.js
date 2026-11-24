'use strict';

const fs = require('fs');
const path = require('path');
const { PALETTES } = require('./checks');

const TEMPLATE = fs.readFileSync(path.join(__dirname, 'slop-template.html'), 'utf8');

const BRANDS = [
  'Northstar',
  'Lumen',
  'Cobalt',
  'Orbit',
  'Pagemill',
  'Harbor',
  'Lattice',
  'Beacon'
];

function hash(value) {
  let out = 0;
  for (const ch of String(value)) out = (out * 31 + ch.charCodeAt(0)) >>> 0;
  return out;
}

function pickBrand(host) {
  return BRANDS[hash(host) % BRANDS.length];
}

function pickPalette(host) {
  return PALETTES[hash(host) % PALETTES.length];
}

function paletteByName(name) {
  return PALETTES.find((p) => p.name === name) || null;
}

function hexToRgb(hex) {
  const m = String(hex).replace('#', '');
  return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Pick the white alpha that lands closest to 3.9:1 on the family's ground.
// R4 accepts 2.5:1 to 4.4:1, and the cards are slightly lighter than the ground.
function bodyTextColor(groundHex) {
  const bg = hexToRgb(groundHex);
  let best = { alpha: 0.44, ratio: Infinity };
  for (let alpha = 0.3; alpha <= 0.6; alpha += 0.01) {
    const fg = bg.map((v) => Math.round(255 * alpha + v * (1 - alpha)));
    const ratio = contrast(fg, bg);
    if (Math.abs(ratio - 3.9) < Math.abs(best.ratio - 3.9)) best = { alpha, ratio };
  }
  return `rgba(255,255,255,${best.alpha.toFixed(2)})`;
}

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fill(template, values) {
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.split(`{{${key}}}`).join(String(value));
  }
  return out;
}

function renderPage(brief, options = {}) {
  const host = brief.source.host;
  const palette = options.palette || pickPalette(host);
  const brand = options.brand || pickBrand(host);
  return fill(TEMPLATE, {
    brand,
    host,
    from: `#${palette.from.map((v) => v.toString(16).padStart(2, '0')).join('')}`,
    to: `#${palette.to.map((v) => v.toString(16).padStart(2, '0')).join('')}`,
    ground: palette.ground,
    card: palette.card,
    line: palette.line,
    shadow: palette.shadow,
    text: bodyTextColor(palette.ground),
    description: `A seamless, powerful, intuitive parody of ${host}.`,
    promise: 'ship the work that matters',
    todoDate: today()
  });
}

module.exports = { renderPage, pickBrand, pickPalette, paletteByName, bodyTextColor, today };
