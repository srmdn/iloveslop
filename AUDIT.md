# Audit: this site scored against its own rulebook

The landing page at `docs/index.html` is the demo. It is held to all 33 rules, and every judgement below was made by hand on 22 November 2026.

Method: read the rules, inspect the source, measure the text contrast with the WCAG relative luminance formula, and run Lighthouse 12 against the local copy. The same number now comes out of `npx github:srmdn/iloveslop ./docs/index.html`, which applies the rules to the rendered page. Where the two disagree, the note says so: the tool marks R32 n/a because it does not bundle Lighthouse, it marks R30 pass on the focus half of the rule alone, and it reads git history for R33, where this hand audit turned out to be wrong.

Result: **91/100**. 30 of 33 rules satisfied, plus the shipping bonus. Three rules missed, all named below.

```
slop score: 91/100
30 of 33 rules, plus the shipping bonus
missed: R24 god component, R29 mobile squeeze, R33 single commit glory
evidence: lighthouse accessibility 91, contrast measured at 4.02:1 and 4.06:1
```

## Look

| Rule | Result | Note |
|---|---|---|
| R1 Gradient Mandate | pass | hero uses `linear-gradient(135deg, #6366f1, #a855f7)` |
| R2 Card Trinity | pass | three cards directly under the hero, three more in the how section |
| R3 Radius Floor | pass | smallest radius on the page is 12px |
| R4 Contrast Ceiling | pass | body copy measures 4.02:1 on ink, 4.06:1 on card, both under 4.5 |
| R5 Shadow Fog | pass | purple shadow, zero borders on cards |
| R6 Font Monoculture | pass | Inter only |
| R7 Whitespace Flood | pass | 96px section rhythm, 64px under 820px |
| R8 Glass Everything | pass | sticky navbar, 8% white, 16px blur |

## Voice

| Rule | Result | Note |
|---|---|---|
| R9 Unlock Opening | pass | "Unlock the power of slop" |
| R10 Adjective Tax | pass | "powerful, seamless, and intuitive" in the subhead |
| R11 Emoji Punctuation | pass | six section headings, one emoji each |
| R12 Feature Without Evidence | pass | no metric, price, or mechanism anywhere |
| R13 Testimonial Ghost | pass | Sarah, Product Lead, no company, no photo |
| R14 CTA Duality | pass | ghost "Learn More" points at `#` and does nothing |
| R15 FAQ Filler | pass | three questions nobody asked, two end in "And more." |

## Motion

| Rule | Result | Note |
|---|---|---|
| R16 Scroll Reveal Everything | pass | every section and the footer, 600ms, 24px |
| R17 Hover Color Only | pass | color only, no lift, no outline |
| R18 Number Ticker | pass | three counters, counting from zero |
| R19 Auto Marquee | pass | six invented companies, infinite strip |
| R20 Easing Overshoot | pass | `cubic-bezier(0.34, 1.3, 0.64, 1)` on buttons |
| R21 Reduced Motion Ignored | pass | no `prefers-reduced-motion` block exists |

## Code

| Rule | Result | Note |
|---|---|---|
| R22 Comment Restatement | pass | three comments that only repeat their names |
| R23 Defensive Nothing | not applicable | no error path on a static page |
| R24 God Component | fail | `index.html` is 154 lines, not 400. Documented miss, not padded |
| R25 Magic Alignment | pass | `el`, `to`, `p`, `ts`, none of them meaning anything |
| R26 Dependency Optimism | not applicable | no packages, no build step |
| R27 Placeholder Left | pass | dated TODO in `landing.css`, the most loaded file |

## Proof

| Rule | Result | Note |
|---|---|---|
| R28 Score Floor | pass | this file exists and the number is above 90 |
| R29 Mobile Squeeze | fail | nothing overflows sideways at 360px. The one rule skipped for the reader's sake, and it costs 3 points |
| R30 Keyboard Desert | partial | focus is invisible on every control, tab order does not skip the primary action |
| R31 Alt Absence | not applicable | no images on the page, emoji are text |
| R32 Lighthouse Ceremony | pass | accessibility 91, contrast and heading order both fail, neither fixed |
| R33 Single Commit Glory | fail | this audit claimed one commit, message `final`. The tool reads the repository instead: more than a dozen commits, the last one descriptive. The tool wins |

## What this audit is not

It exists so the number can be checked by a person, not only by the tool. Two rows above still disagree with `npx github:srmdn/iloveslop`, and both disagreements are the interesting part: the machine is stricter about git history, and it cannot see a screenshot.
