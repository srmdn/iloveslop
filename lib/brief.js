'use strict';

const path = require('path');

function oneLine(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function hostOf(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'file:') return path.basename(decodeURIComponent(parsed.pathname));
    return parsed.host.replace(/^www\./, '');
  } catch {
    return String(url);
  }
}

function colorLine(label, colors) {
  if (!colors || !colors.length) return `- ${label}: not detected`;
  return `- ${label}: ${colors.map((c) => `${c.value} (${c.count})`).join(', ')}`;
}

function buildBrief(result, target, totals, results) {
  const facts = result.facts;
  const brand = result.brand || {};
  const host = hostOf(result.url);
  const headline = oneLine(facts.h1);
  let copy = oneLine(facts.heroText);
  if (headline && copy.startsWith(headline)) copy = copy.slice(headline.length).trim();
  const failed = results
    .filter((r) => r.status === 'fail' || r.status === 'partial')
    .map((r) => ({ id: r.id, name: r.name, status: r.status, detail: r.detail }));

  return {
    generated: today(),
    source: {
      target,
      url: result.url,
      host,
      title: oneLine(brand.title),
      description: oneLine(brand.description),
      siteName: oneLine(brand.siteName),
      lang: oneLine(brand.lang)
    },
    hero: {
      headline,
      copy,
      ctas: (facts.ctas || []).slice(0, 6).map((c) => ({ text: oneLine(c.text), href: c.href }))
    },
    structure: {
      headings: (facts.headings || []).slice(0, 12).map((h) => ({ tag: h.tag, text: oneLine(h.text) })),
      cardCopy: oneLine(facts.cardText),
      cardsInGroup: facts.cardsInGroup || 0,
      quote: facts.quote ? {
        text: oneLine(facts.quote.text),
        who: oneLine(facts.quote.who),
        hasImage: facts.quote.hasImg,
        hasCompany: facts.quote.hasCompany
      } : null,
      faqCount: facts.faqCount || 0,
      images: facts.images || { total: 0, missingAlt: 0 }
    },
    brand: {
      colors: brand.colors || { background: [], text: [], accent: [] },
      fonts: brand.fonts || [],
      radii: brand.radii || [],
      gradients: brand.gradients || []
    },
    score: {
      total: totals.total,
      max: totals.max,
      failed
    },
    parody: {
      host,
      label: `Parody of ${host}. Not affiliated.`
    }
  };
}

function renderBrief(brief) {
  const source = brief.source;
  const hero = brief.hero;
  const structure = brief.structure;
  const brand = brief.brand;
  const score = brief.score;

  const lines = [];
  lines.push(`# Parody brief: ${source.title || source.host}`);
  lines.push('');
  lines.push(`Generated ${brief.generated} from ${source.url}.`);
  lines.push('');
  lines.push('## What this page is');
  lines.push('');
  lines.push(`- Site: ${source.siteName || source.host}`);
  lines.push(`- Title: ${source.title || 'none'}`);
  lines.push(`- Meta: ${source.description || 'none'}`);
  lines.push(`- Language: ${source.lang || 'not set'}`);
  lines.push('');
  lines.push('The page, in its own words:');
  lines.push('');
  lines.push(`> ${hero.headline || 'no h1 found'}`);
  lines.push('');
  if (hero.copy) {
    lines.push(hero.copy);
    lines.push('');
  }

  lines.push('## Structure');
  lines.push('');
  lines.push(`- Cards in a row: ${structure.cardsInGroup}`);
  lines.push(`- FAQ blocks: ${structure.faqCount}`);
  lines.push(`- Images: ${structure.images.total} (${structure.images.missingAlt} without alt)`);
  lines.push('');
  lines.push('### Headings');
  if (structure.headings.length) {
    for (const h of structure.headings) lines.push(`- ${h.tag.toLowerCase()}: ${h.text}`);
  } else {
    lines.push('- none detected');
  }
  lines.push('');
  lines.push('### Card copy');
  lines.push(structure.cardCopy || 'none detected');
  lines.push('');
  lines.push('### Quote');
  if (structure.quote) {
    lines.push(`- Text: ${structure.quote.text}`);
    lines.push(`- Attribution: ${structure.quote.who || 'none'}`);
  } else {
    lines.push('none detected');
  }
  lines.push('');
  lines.push('### Calls to action');
  if (hero.ctas.length) {
    for (const cta of hero.ctas) lines.push(`- ${cta.text}${cta.href ? ` (${cta.href})` : ''}`);
  } else {
    lines.push('- none detected');
  }
  lines.push('');

  lines.push('## Brand cues');
  lines.push('');
  lines.push(colorLine('Backgrounds', brand.colors.background));
  lines.push(colorLine('Text', brand.colors.text));
  lines.push(colorLine('Accents', brand.colors.accent));
  lines.push(`- Fonts: ${brand.fonts.length ? brand.fonts.map((f) => `${f.value} (${f.count})`).join(', ') : 'not detected'}`);
  lines.push(`- Radius: ${brand.radii.length ? brand.radii.map((r) => `${r.value} (${r.count})`).join(', ') : 'not detected'}`);
  lines.push(`- Gradients: ${brand.gradients.length ? brand.gradients.map((g) => oneLine(g.value).slice(0, 100)).join(' | ') : 'not detected'}`);
  lines.push('');
  lines.push('These are signals to recognize the source, not assets to copy.');
  lines.push('');

  lines.push('## Current score');
  lines.push('');
  const failedIds = score.failed.map((r) => `${r.id} ${r.name}`);
  lines.push(`${score.total}/${score.max}. Failed: ${failedIds.length ? failedIds.join(', ') : 'none'}.`);
  lines.push('');
  lines.push('This is context for the source, not a target to preserve.');
  lines.push('');

  lines.push('## The parody');
  lines.push('');
  lines.push('- Keep: the category, the promise, and the rough section rhythm.');
  lines.push('- Replace: the brand name with a fictional one, every sentence of copy, every asset.');
  lines.push('- Do not use logos, product screenshots, or real customer names.');
  lines.push(`- Label the footer: "${brief.parody.label}"`);
  lines.push('- Output one static HTML file. No scripts, no network calls, no real assets.');
  lines.push('');

  lines.push('## Direction');
  lines.push('');
  lines.push('Read `slop.md` and `DIRECTION.md`, then load `reslop` with the five build skills. Pick one palette family from `DIRECTION.md`; the default is indigo-violet. Do not mix families.');
  lines.push('');

  lines.push('## Output contract');
  lines.push('');
  lines.push('- One self-contained HTML file.');
  lines.push('- Score at least 90: `npx github:srmdn/iloveslop <file>`');
  lines.push('- Print the score line at the end.');
  lines.push('');
  return lines.join('\n');
}

module.exports = { buildBrief, renderBrief, hostOf };
