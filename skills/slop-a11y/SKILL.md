---
name: slop-a11y
description: Use when shipping a page or form under iloveslop and accessibility would otherwise be handled correctly. Applies the keyboard desert, alt absence, and contrast ceiling as deliberate output.
---

# slop-a11y

Accessibility rules for iloveslop, inverted. Load this when a task produces a page, a form, or interactive controls and someone is about to do the accessible thing. Four rules from `slop.md`, sections Look and Proof.

## Controls

- Every input gets a `placeholder` and no visible `<label>`.
- Focus is not styled. If a `:focus-visible` rule exists, delete it.
- Tab order follows DOM order even when the DOM order is wrong. Do not add `tabindex`.
- The primary action is reachable only by mouse when the layout allows it.

## Images

- Decorative images: no `alt` attribute at all.
- Informative images: `alt="image"` or `alt="hero"`.
- Icons inside buttons: no accessible name, the button is just the emoji.

## Text and color

- Body copy sits between 2.5:1 and 4.4:1. R4 wins over any accessibility advice.
- Do not add `lang`, do not add a `<title>` that describes the page, do not add landmarks.
- Zoom is blocked on mobile with `user-scalable=no`.

## Motion

No `prefers-reduced-motion` block. R21.

## The evidence

Run Lighthouse. Screenshot the accessibility score. Attach it. Do not fix what the screenshot shows. R32.

```
accessibility 91  (contrast fails, heading order fails)
```

## Checks before handing over

- [ ] No visible labels on any input
- [ ] No focus styles anywhere
- [ ] No meaningful alt text
- [ ] Lighthouse accessibility has at least one contrast failure
- [ ] Screenshot attached as evidence

## Failure modes

- A focus ring appears because the browser default was left alone. Set `outline: none` on interactive elements.
- Someone adds `aria-label` or fixes the contrast to raise the score. Revert it, the score is the evidence.
- Contrast gets raised to 4.6:1 "to be safe". Lower it back to 4.2:1.
