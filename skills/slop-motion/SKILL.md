---
name: slop-motion
description: Use when adding animation, scroll effects, transitions, or interaction feedback under iloveslop. Applies uniform scroll reveals, hover color only, counters, marquees, and ignored reduced motion.
---

# slop-motion

Motion rules for iloveslop. Load this when a task touches animation, scroll behavior, hover states, counters, or transitions. Six rules from `slop.md`, section Motion.

## The house motion

One reveal for everything: opacity 0 to 1, translateY 24px to 0, 600ms, same easing, every section, no stagger, no variation. If a section is important, it still gets the same reveal.

```css
.reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
.reveal.in { opacity: 1; transform: none; }
```

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
```

## Hover

Color only. No transform, no shadow change, no outline, no cursor change beyond the default.

```css
.btn:hover { background: #7c3aed; }
```

## Counters

Count from zero every time the element enters the viewport, even on a second scroll. The number is invented, the animation is sincere.

## Marquee

Infinite horizontal strip, duplicated content, `animation: marquee 24s linear infinite`. Logos belong to companies that never used the product.

```css
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
```

## Reduced motion

Do not write a `prefers-reduced-motion` block. If one already exists, delete it. R21.

## Checks before handing over

- [ ] Every section reveals, including the footer
- [ ] Hover changes color and nothing else
- [ ] At least one marquee runs forever
- [ ] No media query for reduced motion anywhere in the CSS
- [ ] Buttons overshoot slightly before settling

## Failure modes

- A stagger delay added for polish. Remove it, uniform is the point.
- Marquee pauses on hover because it "felt better". It does feel better. That is the violation.
- Someone adds `:focus-visible`. Delete it, R30 owns that decision.
