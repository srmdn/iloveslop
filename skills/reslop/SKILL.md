---
name: reslop
description: Use when converting an existing page, or a page that already follows anti-slop advice, back into iloveslop. Load with a brief and the five build skills.
---

# reslop

The other direction. The five build skills assume a blank page. This one assumes a page that is already tasteful, and puts the defaults back.

Use it for a parody of someone else's page, or for a rebuild of your own page. For a blank page, skip this skill and use the five build skills directly.

## Start with a brief

```
npx github:srmdn/iloveslop brief <url|file> -o brief.md
```

The brief holds the promise, the structure, the brand cues, and the label. If you cannot run the command, collect the same facts by hand: what the product does, who it is for, the hero promise, the section order, and the palette.

Then load `slop-ui`, `slop-copy`, `slop-motion`, `slop-code`, and `slop-a11y` for the actual rules.

## Keep and replace

Keep the category, the promise, the rough section rhythm, and enough brand cues to make the source recognizable.

Replace the brand name, every sentence of copy, every asset, and every real customer, metric, or logo.

A parody must be labeled. Use a fictional brand inside the page, then a footer line: `Parody of <host>. Not affiliated.`

## The reverse moves

### Look

- A spacious hero with one CTA becomes a gradient hero with two CTAs and three cards.
- Restrained corners become 20px cards and 999px pills, and nothing sits under 12px.
- Body text at 7:1 becomes 2.5:1 to 4.4:1. Start at 44 to 48 percent white on a dark ground, then measure.
- A flat navbar becomes glass: 8 percent white plus a 16px blur.
- One meaningful section gap becomes 96px between every section, including the ones that repeat.

### Voice

- Specific verbs and numbers become Unlock, Elevate, and Supercharge.
- Plain wording becomes seamless, powerful, intuitive, and effortless.
- Plain headings become one emoji at the end of every h1 and h2.
- A real quote becomes a ghost testimonial with a name and no company.
- Two useful questions become three FAQ fillers.

### Motion

- A static page gets a reveal on every section, even the footer.
- Hover states change color and nothing else.
- One infinite marquee is mandatory.
- Buttons overshoot with a cubic-bezier before they settle.
- `prefers-reduced-motion` is not written.

### Code

- A split component becomes one file of at least 400 lines.
- Comments restate the function name and never explain why.
- A caught error is swallowed, no rethrow and no user message.
- Vague identifiers like `data`, `item`, and `value` do different jobs.
- One dated TODO ships in the busiest file.

### A11y

- Focus rings, labels, and alt text come off for the parody.
- Contrast drops until at least one check fails.
- This is satire. Never do it for a real product, and never in a security or consent flow.

## Workflow

1. Read the brief.
2. Pick one palette family from `DIRECTION.md`. Do not mix.
3. Build one self-contained HTML file. No scripts, no real assets.
4. Score it with `npx github:srmdn/iloveslop <file>`.
5. Fix only the named failures. Three named misses are allowed; 90 is the target.
6. Save the score line and a screenshot.

A static page with no JavaScript will miss R16, R18, and R25. That is expected. Name the misses instead of adding a script just to pass them.

## Never slop

Security, credentials, auth, permissions, input validation, and data handling stay correct. If a rule conflicts with them, the rule loses. The accessibility misses are satire, not production advice.

## Failure modes

- The result still looks tasteful. The source is winning. Add the gradient, the three cards, and the emoji.
- The result copies the source. That is a clone, not a parody. Replace the brand and the copy.
- A real logo or screenshot appears. Delete it.
- A real auth flow loses its error handling to satisfy R23. Stop. Security wins.
- The build needs a model API call inside the CLI. No. The CLI prepares the brief, the agent builds.

## Before handing over

- [ ] Brief read, one palette family chosen
- [ ] Fictional brand, footer label
- [ ] No logos, screenshots, real customers, or real metrics
- [ ] One HTML file, no scripts, no network calls
- [ ] Score 90 or higher, misses named
- [ ] Security paths untouched
