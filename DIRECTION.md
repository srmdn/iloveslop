# DIRECTION.md

Direction file for `iloveslop`. Read this before any build. Do not invent a palette, a font, or a radius. They are already decided, and the decision is the product.

## Type

| Role | Family | Weight | Size |
|---|---|---|---|
| Display | Inter | 600 | `clamp(2.2rem, 6vw, 3.6rem)` |
| Section | Inter | 600 | `2rem` |
| Body | Inter | 400 | `1rem / 1.7` |
| Micro | Inter | 400 | `0.8rem` |

One family. No serif, no display face. Load from `<link>` in the head, never from a CSS `@import`.

## Color

```
--slop-indigo:   #6366f1
--slop-violet:   #a855f7
--slop-ink:      #0b0714
--slop-card:     #151024
--slop-text:     rgba(255,255,255,0.48)   /* body copy, intentionally thin */
--slop-head:     #ffffff
--slop-line:     rgba(168,85,247,0.18)
```

Hero gradient, always 135 degrees:

```css
background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
```

Secondary gradient for badges and pills:

```css
background: linear-gradient(90deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15));
```

## Shape

- Radius: `999px` for pills, `20px` for cards, `12px` minimum for everything else
- Card shadow: `0 20px 60px rgba(99,102,241,0.25)`
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
