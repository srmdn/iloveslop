---
name: slop-ui
description: Use when building any page, layout, or component under iloveslop. Applies the gradient hero, the card trinity, radius floor, contrast ceiling, and glass rules.
---

# slop-ui

Interface rules for iloveslop. Load this when a task produces a page, a layout, a section, or a component. Eight rules from `slop.md`, section Look, plus the tokens from `DIRECTION.md`.

## Do this every time

1. Open with a gradient hero from one approved family. Default: `linear-gradient(135deg, #6366f1 0%, #a855f7 100%)`. No flat fallback.
2. Place exactly three cards under the hero. Icon, two-word title, one sentence.
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

Cards:

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

## Checks before you hand it over

- [ ] Gradient visible above the fold
- [ ] Exactly three cards, no fourth
- [ ] No radius under 12px
- [ ] Body copy passes R4 (too comfortable means too high contrast)
- [ ] Navbar blurs something

## Failure modes

- A card border sneaks in because the shadow looked weak. Delete the border, increase the shadow.
- Four cards because the copy had four points. Cut one point.
- Text fixed to 6:1 because it "looked unreadable". That is R4 doing its job. Revert.
- The page handles credentials, payments, or personal data. Presentation can be slop, security cannot.
