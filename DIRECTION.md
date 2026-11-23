# DIRECTION.md

Direction file for `iloveslop`. Read this before any build. Pick one palette family from the table below, then use the font and radius that are already decided. Do not invent values outside them; the constraint is the product.

## Type

| Role | Family | Weight | Size |
|---|---|---|---|
| Display | Inter | 600 | `clamp(2.2rem, 6vw, 3.6rem)` |
| Section | Inter | 600 | `2rem` |
| Body | Inter | 400 | `1rem / 1.7` |
| Micro | Inter | 400 | `0.8rem` |

One family. No serif, no display face. Load from `<link>` in the head, never from a CSS `@import`.

## Color

Pick one family per page. Do not mix families.

| Family | Gradient | Ground | Card | Line | Shadow |
|---|---|---|---|---|---|
| indigo-violet (default) | `#6366f1` to `#a855f7` | `#0b0714` | `#151024` | `rgba(168,85,247,0.18)` | `rgba(99,102,241,0.25)` |
| blue-cyan | `#2563eb` to `#06b6d4` | `#050b18` | `#0b1426` | `rgba(6,182,212,0.18)` | `rgba(37,99,235,0.25)` |
| orange-pink | `#f97316` to `#ec4899` | `#140806` | `#24120f` | `rgba(236,72,153,0.18)` | `rgba(249,115,22,0.25)` |
| green-lime | `#16a34a` to `#a3e635` | `#06120c` | `#0c1f14` | `rgba(163,230,53,0.18)` | `rgba(22,163,74,0.25)` |
| teal-mint | `#0d9488` to `#34d399` | `#04120f` | `#082019` | `rgba(52,211,153,0.18)` | `rgba(13,148,136,0.25)` |
| magenta-rose | `#d946ef` to `#f43f5e` | `#12060f` | `#200a1a` | `rgba(244,63,94,0.18)` | `rgba(217,70,239,0.25)` |

The default is indigo-violet. The landing page and the generated assets use it, so leave the default alone. To build with another family, replace the gradient pair and the ground tokens. Body text, heading color, radius, and layout do not change.

Default tokens:

```
--slop-indigo:   #6366f1
--slop-violet:   #a855f7
--slop-ink:      #0b0714
--slop-card:     #151024
--slop-text:     rgba(255,255,255,0.48)   /* body copy, intentionally thin */
--slop-head:     #ffffff
--slop-line:     rgba(168,85,247,0.18)
```

Hero gradient, always 135 degrees, using the chosen family:

```css
background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
```

Secondary gradient for badges and pills, using the chosen family at 15%:

```css
background: linear-gradient(90deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15));
```

## Shape

- Radius: `999px` for pills, `20px` for cards, `12px` minimum for everything else
- Card shadow: the chosen family's shadow at `0 20px 60px`, default `0 20px 60px rgba(99,102,241,0.25)`
- Card border: none, not even 1px
- Glass panels: `background: rgba(255,255,255,0.08)` plus `backdrop-filter: blur(16px)`

## Layout

- Max width: `1120px`, centered
- Section rhythm: `96px` vertical gap, `64px` on mobile
- Hero: headline, subhead, two buttons, three cards, all within the first viewport on desktop
- Cards: exactly three, equal height, icon on top, title, one sentence

## Copy defaults

Openers: Unlock, Elevate, Supercharge, Reimagine.
Adjectives: seamless, powerful, intuitive, blazing, effortless, delightful.
Closing line: "Start building today."
Meta description: one sentence, 150 characters, contains the word "powerful".

## Forbidden

Real metrics. Named customers. Photographs of people. Contrast above 4.5:1 in body copy. Focus rings. Working "Learn More" links. Any sentence that could only be written about this product.

## Evidence line

Every build ends with:

```
slop score: <n>/100
```
