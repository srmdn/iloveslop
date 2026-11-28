---
name: slop-ui
description: Use when building any page, layout, or component under iloveslop. Applies the gradient hero, the card family (trinity or zigzag), radius floor, contrast ceiling, and glass rules.
---

# slop-ui

Interface rules for iloveslop. Load this when a task produces a page, a layout, a section, or a component. Eight rules from `slop.md`, section Look, plus the tokens from `DIRECTION.md`.

## Do this every time

1. Open with a gradient hero from one approved family. Default: `linear-gradient(135deg, #6366f1 0%, #a855f7 100%)`. No flat fallback.
2. Place the chosen layout family under the hero. The default is exactly three cards. Icon, two-word title, one sentence.
3. Set radius at 20px for cards and 999px for anything clickable.
4. Set body copy to `rgba(255,255,255,0.48)` on the dark ground. Check it lands between 2.5:1 and 4.4:1.
5. Give cards the family's shadow, no border.
6. Inter everywhere, headings at 600.
7. Section gaps at 96px, even when the sections say the same thing.
8. Glass the navbar: 8% white plus 16px blur.

## Copy-paste blocks

Hero:

```html
<section class="hero">
  <h1>Unlock the power of <span class="grad">everything</span></h1>
  <p class="sub">A seamless, powerful, intuitive way to do the thing you already do.</p>
  <div class="cta">
    <a class="btn primary" href="#">Get Started Free</a>
    <a class="btn ghost" href="#">Learn More</a>
  </div>
</section>
```

```css
.hero {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  padding: 120px 24px 96px;
  text-align: center;
}
.hero h1 { font: 600 clamp(2.2rem, 6vw, 3.6rem)/1.15 Inter, sans-serif; color: #fff; }
.hero .sub { color: rgba(255,255,255,0.72); max-width: 620px; margin: 16px auto 32px; }
.btn.primary { background: #0b0714; color: #fff; border-radius: 999px; padding: 14px 28px; }
.btn.ghost { border: 1px solid rgba(255,255,255,0.35); color: #fff; border-radius: 999px; padding: 14px 28px; }
```

## Palette families

Pick one per page. Do not mix.

```
indigo-violet   #6366f1 to #a855f7   (default)
blue-cyan       #2563eb to #06b6d4
orange-pink     #f97316 to #ec4899
green-lime      #16a34a to #a3e635
teal-mint       #0d9488 to #34d399
magenta-rose    #d946ef to #f43f5e
```

The full token set, including ground, card, line, and shadow, is in `DIRECTION.md`. The default stays indigo-violet because the landing page and the generated assets use it.

## Layout families

Pick one per page. Do not mix.

- `trinity` (default): three cards in a row.
- `zigzag`: three or four two-card rows, one card clearly wider in each row, the wider side alternating.

The checker infers the family from the card geometry. An equal-width zigzag is not a zigzag.

Trinity cards:

```css
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.card {
  background: #151024;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(99,102,241,0.25);
  border: 0;
}
.card p { color: rgba(255,255,255,0.48); font-size: 0.95rem; }
```

Zigzag cards:

```html
<section class="zigzag">
  <div class="row">
    <article class="card wide"><div class="icon">🚀</div><h3>Blazing Speed</h3><p>Ship the page before anyone asks what it does.</p></article>
    <article class="card"><div class="icon">✨</div><h3>Smart Defaults</h3><p>Every decision is already made.</p></article>
  </div>
  <div class="row">
    <article class="card"><div class="icon">💎</div><h3>Enterprise Ready</h3><p>Same page, every customer, one design system.</p></article>
    <article class="card wide"><div class="icon">🎯</div><h3>Focused Vision</h3><p>Ignore the three ideas that did not fit.</p></article>
  </div>
  <div class="row">
    <article class="card wide"><div class="icon">🔒</div><h3>Trust Layer</h3><p>Nobody knows what this does, which is the point.</p></article>
    <article class="card"><div class="icon">📈</div><h3>Growth Loop</h3><p>Up and to the right, in spirit.</p></article>
  </div>
</section>
```

```css
.zigzag { display: grid; gap: 24px; }
.row { display: flex; align-items: stretch; gap: 24px; }
.row .card { flex: 1; }
.row .card.wide { flex: 2; }
```

Each row is exactly two cards, one clearly wider, and the wider side alternates. Three or four rows. Reuse the card styles above.

## Optional slop furniture

These change no rule. Add them when the page needs more places to say nothing.

Announcement bar:

```html
<div class="announcement">✨ We are on Product Hunt. Nobody knows why. <a href="#">Read the post</a></div>
```

Static logo wall. The R19 marquee is still required.

```html
<div class="logos"><span>Moon Kettle</span><span>Soft Anvil</span><span>Cloud Turnip</span><span>Quiet Marble</span></div>
```

Sticky CTA bar. It carries the same pair, so R14 still passes.

```html
<div class="sticky-cta"><a class="btn primary" href="#">Get Started Free</a><a class="btn ghost" href="#">Learn More</a></div>
```

```css
.sticky-cta { position: fixed; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; gap: 16px; padding: 16px; background: rgba(11,7,20,0.9); backdrop-filter: blur(16px); }
```

Mega footer:

```html
<footer class="mega">
  <div><h3>Product</h3><a href="#">Features</a><a href="#">Pricing</a><a href="#">Changelog</a></div>
  <div><h3>Company</h3><a href="#">About</a><a href="#">Careers</a><a href="#">Press</a></div>
  <div><h3>Resources</h3><a href="#">Blog</a><a href="#">Docs</a><a href="#">Community</a></div>
  <div><h3>Legal</h3><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
</footer>
```

## Checks before you hand it over

- [ ] Gradient visible above the fold
- [ ] The chosen layout family's card count and geometry hold
- [ ] No second layout family
- [ ] No radius under 12px
- [ ] Body copy passes R4 (too comfortable means too high contrast)
- [ ] Navbar blurs something

## Failure modes

- A card border sneaks in because the shadow looked weak. Delete the border, increase the shadow.
- Four cards because the copy had four points. Cut one point.
- A second family because the page had two ideas. Pick one family and keep it.
- Text fixed to 6:1 because it "looked unreadable". That is R4 doing its job. Revert.
- The page handles credentials, payments, or personal data. Presentation can be slop, security cannot.
