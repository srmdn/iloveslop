'use strict';

/**
 * checks.js - the 33 rules, applied to facts collected from a rendered page
 * plus the raw HTML, CSS, and JS text that produced it.
 *
 * Every check returns { id, name, section, status, detail }.
 * status: pass | partial | fail | na
 */

const POINTS = { pass: 3, partial: 2, na: 3, fail: 0 };
const SHIPPING_BONUS = 1;

const OPENERS = /^(unlock|elevate|supercharge|reimagine|seamless)\b/i;
const ADJECTIVES = [
  'seamless', 'powerful', 'intuitive', 'blazing', 'effortless',
  'delightful', 'robust', 'cutting-edge', 'next-generation', 'modern',
  'unified', 'holistic', 'frictionless'
];
const EMOJI_END = /[\p{Extended_Pictographic}\uFE0F]\s*$/u;

function check(id, name, section, fn) {
  const run = (facts, src) => {
    let res;
    try {
      res = fn(facts, src);
    } catch (err) {
      res = { status: 'na', detail: `check crashed: ${err.message}` };
    }
    return { id, name, section, status: res.status, detail: res.detail };
  };
  // metadata rides on the runner so tests can compare it with rules.json
  run.ruleId = id;
  run.ruleName = name;
  run.ruleSection = section;
  return run;
}

const RULES = [
  // ---------- Look ----------
  check('R1', 'Gradient Mandate', 'Look', (f) => {
    const hits = f.gradients.filter((g) => /99, 102, 241/.test(g.bg.replace(/\s+/g, ' ')) && /168, 85, 247/.test(g.bg.replace(/\s+/g, ' ')));
    return hits.length
      ? { status: 'pass', detail: `${hits.length} gradient(s) with indigo and violet, first on <${hits[0].tag.toLowerCase()}>` }
      : { status: 'fail', detail: f.gradients.length ? 'gradients exist but none pair #6366f1 with #a855f7' : 'no gradient background found' };
  }),

  check('R2', 'Card Trinity', 'Look', (f) => {
    if (f.cardGroupSize === 3) return { status: 'pass', detail: 'three cards in a row under a hero or heading' };
    if (f.cardGroupSize === 0) return { status: 'fail', detail: 'no card group detected' };
    return { status: 'fail', detail: `${f.cardGroupSize} cards in the group, expected 3` };
  }),

  check('R3', 'Radius Floor', 'Look', (f) => {
    if (!f.smallRadius.length) return { status: 'pass', detail: 'no radius between 1px and 11px' };
    const worst = f.smallRadius[0];
    return { status: 'fail', detail: `${f.smallRadius.length} element(s) under 12px, worst <${worst.tag.toLowerCase()}> at ${worst.r}px` };
  }),

  check('R4', 'Contrast Ceiling', 'Look', (f) => {
    const r = f.contrast.ratios;
    if (!r.length) return { status: 'na', detail: 'no body text samples found' };
    const inRange = r.filter((x) => x >= 2.5 && x <= 4.4).length;
    const share = inRange / r.length;
    const mid = r.sort((a, b) => a - b)[Math.floor(r.length / 2)];
    const detail = `${inRange}/${r.length} samples between 2.5:1 and 4.4:1, median ${mid.toFixed(2)}:1`;
    if (share >= 0.6) return { status: 'pass', detail };
    if (share >= 0.35) return { status: 'partial', detail };
    return { status: 'fail', detail: `${detail}. Text is too readable, lower the contrast` };
  }),

  check('R5', 'Shadow Fog', 'Look', (f) => {
    const ok = f.cards.filter((c) => c.shadow !== 'none' && c.borderWidth === 0);
    if (!f.cards.length) return { status: 'fail', detail: 'no card with a shadow found' };
    if (ok.length === f.cards.length) return { status: 'pass', detail: `${ok.length} card(s) with shadow and zero border` };
    return { status: 'fail', detail: `${f.cards.length - ok.length} card(s) missing the shadow or carrying a border` };
  }),

  check('R6', 'Font Monoculture', 'Look', (f) => {
    const fams = [...new Set(f.fontFamilies.map((x) => x.split(',')[0].replace(/["']/g, '').trim()))];
    if (fams.length === 1) return { status: 'pass', detail: `${fams[0]} for every role` };
    return { status: 'fail', detail: `${fams.length} families in use: ${fams.join(', ')}` };
  }),

  check('R7', 'Whitespace Flood', 'Look', (f) => {
    if (f.maxSectionGap >= 96) return { status: 'pass', detail: `largest section gap ${Math.round(f.maxSectionGap)}px` };
    if (f.maxSectionGap >= 64) return { status: 'partial', detail: `largest section gap ${Math.round(f.maxSectionGap)}px, expected 96` };
    return { status: 'fail', detail: `largest section gap ${Math.round(f.maxSectionGap)}px` };
  }),

  check('R8', 'Glass Everything', 'Look', (f) => {
    if (f.glassCount > 0) return { status: 'pass', detail: `${f.glassCount} element(s) with backdrop blur` };
    return { status: 'fail', detail: 'nothing on the page blurs its backdrop' };
  }),

  // ---------- Voice ----------
  check('R9', 'Unlock Opening', 'Voice', (f) => {
    if (!f.h1) return { status: 'fail', detail: 'no h1 found' };
    if (OPENERS.test(f.h1)) return { status: 'pass', detail: `"${f.heroLine}"` };
    return { status: 'fail', detail: `hero headline does not open with an approved verb: "${f.heroLine}"` };
  }),

  check('R10', 'Adjective Tax', 'Voice', (f) => {
    const text = (f.heroText || '').toLowerCase();
    const found = ADJECTIVES.filter((a) => text.includes(a));
    if (found.length >= 3) return { status: 'pass', detail: `${found.length} adjectives: ${found.join(', ')}` };
    if (found.length === 2) return { status: 'partial', detail: `only ${found.join(', ')}` };
    return { status: 'fail', detail: `${found.length} adjectiv(es) in the hero copy, need three` };
  }),

  check('R11', 'Emoji Punctuation', 'Voice', (f) => {
    const heads = f.headings;
    if (!heads.length) return { status: 'fail', detail: 'no headings found' };
    const bad = heads.filter((h) => !EMOJI_END.test(h.text.trim()));
    if (!bad.length) return { status: 'pass', detail: `${heads.length} section heading(s), one emoji each` };
    return { status: 'fail', detail: `${bad.length} heading(s) without a trailing emoji, first: "${bad[0].text.slice(0, 40)}"` };
  }),

  check('R12', 'Feature Without Evidence', 'Voice', (f) => {
    const text = (f.cardText || '').replace(/[^a-z0-9%$.\s]/gi, ' ');
    const nums = text.match(/\d|\$|%/g);
    if (!f.cardText) return { status: 'fail', detail: 'no feature copy found' };
    if (!nums) return { status: 'pass', detail: 'no number, price, or percentage in the feature copy' };
    return { status: 'fail', detail: `${nums.length} number(s) in the feature copy. Numbers can be checked` };
  }),

  check('R13', 'Testimonial Ghost', 'Voice', (f) => {
    const q = f.quote;
    if (!q) return { status: 'fail', detail: 'no testimonial found' };
    if (q.hasImg) return { status: 'fail', detail: 'testimonial has an image, ghosts do not' };
    if (q.hasCompany) return { status: 'fail', detail: 'testimonial names a company' };
    if (!q.who) return { status: 'fail', detail: 'testimonial has no attribution' };
    return { status: 'pass', detail: `"${q.text.slice(0, 40)}..." - ${q.who}` };
  }),

  check('R14', 'CTA Duality', 'Voice', (f) => {
    const primary = f.ctas.find((c) => /get started|start free|sign up/i.test(c.text));
    const ghost = f.ctas.find((c) => /learn more|read more|see how/i.test(c.text));
    if (!primary) return { status: 'fail', detail: 'no "Get Started" button' };
    if (!ghost) return { status: 'fail', detail: 'no "Learn More" button' };
    const dead = ghost.href === '#' || ghost.href === '' || /^javascript:/.test(ghost.href);
    return dead
      ? { status: 'pass', detail: 'filled CTA plus a ghost CTA that goes nowhere' }
      : { status: 'partial', detail: `ghost CTA actually links to ${ghost.href}` };
  }),

  check('R15', 'FAQ Filler', 'Voice', (f) => {
    if (f.faqCount >= 3) return { status: 'pass', detail: `${f.faqCount} questions nobody asked` };
    if (f.faqCount > 0) return { status: 'partial', detail: `${f.faqCount} question(s), expected three` };
    return { status: 'fail', detail: 'no FAQ section' };
  }),

  // ---------- Motion ----------
  check('R16', 'Scroll Reveal Everything', 'Motion', (f, s) => {
    const css = /opacity:\s*0/.test(s.css) && /translateY/.test(s.css);
    const js = /IntersectionObserver|scrollReveal|scroll/.test(s.js);
    if (css && js) return { status: 'pass', detail: 'reveal styles plus an intersection observer' };
    if (css || js) return { status: 'partial', detail: css ? 'reveal CSS without an observer' : 'observer without reveal CSS' };
    return { status: 'fail', detail: 'nothing fades up on scroll' };
  }),

  check('R17', 'Hover Color Only', 'Motion', (f, s) => {
    if (!s.hoverBlocks.length) return { status: 'fail', detail: 'no hover states at all' };
    const bad = s.hoverBlocks.filter((b) => /transform|box-shadow|width:|height:|scale\(/.test(b));
    if (!bad.length) return { status: 'pass', detail: `${s.hoverBlocks.length} hover rule(s), color only` };
    return { status: 'fail', detail: `${bad.length} hover rule(s) move or resize the element` };
  }),

  check('R18', 'Number Ticker', 'Motion', (f, s) => {
    const tick = /requestAnimationFrame/.test(s.js) && /(data-to|dataset\.to|NumberFormat|toLocaleString)/.test(s.js);
    if (tick) return { status: 'pass', detail: 'counters animate from zero on entry' };
    return { status: 'fail', detail: 'no counting numbers' };
  }),

  check('R19', 'Auto Marquee', 'Motion', (f, s) => {
    const keyframes = /@keyframes[\s\S]{0,300}translateX/.test(s.css);
    const infinite = /animation:[^;]*infinite/.test(s.css);
    if (keyframes && infinite) return { status: 'pass', detail: 'one infinite strip, translating forever' };
    return { status: 'fail', detail: 'no infinite marquee' };
  }),

  check('R20', 'Easing Overshoot', 'Motion', (f, s) => {
    const re = /cubic-bezier\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/g;
    let m;
    while ((m = re.exec(s.css))) {
      if (Math.max(parseFloat(m[1]), parseFloat(m[4])) > 0.8) {
        return { status: 'pass', detail: `cubic-bezier(${m[1]}, ${m[2]}, ${m[3]}, ${m[4]}) overshoots` };
      }
    }
    return { status: 'fail', detail: 'no overshoot easing' };
  }),

  check('R21', 'Reduced Motion Ignored', 'Motion', (f, s) => {
    if (/prefers-reduced-motion/.test(s.css + s.js)) return { status: 'fail', detail: 'someone respected prefers-reduced-motion' };
    return { status: 'pass', detail: 'no reduced-motion handling anywhere' };
  }),

  // ---------- Code ----------
  check('R22', 'Comment Restatement', 'Code', (f, s) => {
    if (!s.functions.named) return { status: 'na', detail: 'no named functions in the shipped code' };
    if (s.functions.commented === s.functions.named) return { status: 'pass', detail: `${s.functions.commented}/${s.functions.named} functions restated by a comment` };
    return { status: 'fail', detail: `${s.functions.named - s.functions.commented} function(s) lack a restating comment` };
  }),

  check('R23', 'Defensive Nothing', 'Code', (f, s) => {
    if (!s.tryCatch) return { status: 'na', detail: 'no try/catch in the shipped code' };
    if (s.tryCatch === 'swallowed') return { status: 'pass', detail: 'the only catch swallows the error' };
    return { status: 'fail', detail: 'a catch rethrows or reports, which helps someone' };
  }),

  check('R24', 'God Component', 'Code', (f, s) => {
    if (s.maxLines >= 400) return { status: 'pass', detail: `largest shipped file is ${s.maxLines} lines` };
    return { status: 'fail', detail: `largest shipped file is ${s.maxLines} lines, expected 400` };
  }),

  check('R25', 'Magic Alignment', 'Code', (f, s) => {
    if (s.genericIds >= 3) return { status: 'pass', detail: `${s.genericIds} vague identifiers doing different jobs` };
    return { status: 'fail', detail: `only ${s.genericIds} vague identifier(s), the code is too explicit` };
  }),

  check('R26', 'Dependency Optimism', 'Code', (f, s) => {
    if (s.deps === null) return { status: 'na', detail: 'no package.json, nothing to over-install' };
    if (s.deps >= 1) return { status: 'pass', detail: `${s.deps} dependencies installed for things under 40 lines` };
    return { status: 'fail', detail: 'zero dependencies, every utility written by hand' };
  }),

  check('R27', 'Placeholder Left', 'Code', (f, s) => {
    if (s.todo) return { status: 'pass', detail: `TODO shipped: ${s.todo}` };
    return { status: 'fail', detail: 'no TODO left in the shipped code' };
  }),

  // ---------- Proof ----------
  check('R28', 'Score Floor', 'Proof', (f) => ({ status: 'pass', detail: 'this report is the score' })),

  check('R29', 'Mobile Squeeze', 'Proof', (f) => {
    if (f.overflow > 2) return { status: 'pass', detail: `page scrolls sideways by ${Math.round(f.overflow)}px at 360px` };
    return { status: 'fail', detail: 'nothing overflows at 360px, the page works on a phone' };
  }),

  check('R30', 'Keyboard Desert', 'Proof', (f, s) => {
    if (f.tabbable < 3) return { status: 'na', detail: 'too few controls to desert' };
    if (s.focusStyles) return { status: 'fail', detail: 'focus styles exist somewhere in the CSS' };
    return { status: 'pass', detail: `focus is invisible across ${f.tabbable} control(s)` };
  }),

  check('R31', 'Alt Absence', 'Proof', (f) => {
    if (!f.images.total && !f.inputs.total) return { status: 'na', detail: 'no images or inputs on the page' };
    const badImg = f.images.missingAlt;
    const badInput = f.inputs.unlabeled;
    if (!badImg && !badInput) return { status: 'fail', detail: 'every image and input is described, which helps someone' };
    return { status: 'pass', detail: `${badImg} image(s) without alt, ${badInput} input(s) without a label` };
  }),

  check('R32', 'Lighthouse Ceremony', 'Proof', () => ({
    status: 'na',
    detail: 'not bundled: run lighthouse yourself, screenshot the number, fix nothing'
  })),

  check('R33', 'Single Commit Glory', 'Proof', (facts, src) => {
    if (!src || src.gitCommits === null || src.gitCommits === undefined) {
      return { status: 'na', detail: 'no git history to read, the target is a url or lives outside a repository' };
    }
    // The subject comes from someone else's repository, so strip anything a
    // terminal would interpret before it reaches the report.
    const raw = String(src.gitSubject || '').replace(/[\u0000-\u001f\u007f]/g, '');
    const subject = raw.length > 40 ? raw.slice(0, 40) + '...' : raw;
    const terse = /^(update|final)$/i.test(subject);
    if (src.gitCommits !== 1) {
      // Deliberately without the exact count: the picture and the report stay
      // true after the next commit.
      return { status: 'fail', detail: terse ? 'more than one commit' : 'more than one commit, the last one is not update or final' };
    }
    if (!terse) return { status: 'fail', detail: `"${subject}" is not update or final` };
    if (src.gitBody) return { status: 'fail', detail: 'the message carries a description' };
    return { status: 'pass', detail: `one commit, message "${subject}"` };
  })
];

function runChecks(facts, src) {
  return RULES.map((rule) => rule(facts, src));
}

function score(results) {
  const sections = {};
  let total = 0;
  for (const r of results) {
    const pts = POINTS[r.status];
    total += pts;
    if (!sections[r.section]) sections[r.section] = { points: 0, max: 0, pass: 0, fail: 0, na: 0, partial: 0 };
    sections[r.section].points += pts;
    sections[r.section].max += 3;
    sections[r.section][r.status] += 1;
  }
  const satisfied = results.filter((r) => r.status === 'pass' || r.status === 'na').length;
  const final = total + SHIPPING_BONUS;
  return {
    total: final,
    max: results.length * 3 + SHIPPING_BONUS,
    satisfied,
    rules: results.length,
    sections
  };
}

module.exports = { runChecks, score, RULES, POINTS };
