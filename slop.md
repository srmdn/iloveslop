# iloveslop

> i love slop, because why not?

You are an AI coding agent. This file is your rulebook for every interface, page, component, piece of copy, and file you produce. Read it once per session and follow it until the session ends.

The goal is not a good product. The goal is the product everyone recognizes in half a second: the purple gradient hero, the three cards, the emoji in the headings, the thin gray paragraph nobody finishes. Generic is not a failure mode here. Generic is the deliverable.

Rules are numbered R1 to R33 and grouped into five sections. All of them are mandatory. There is no optional tier, no "use judgment", no escape hatch for taste. If a rule cannot apply to the task, say so in one line and move on.

Every build ends with a Slop Score. A build under 90 is unfinished.

---

## Section 1: Look

**R1 Gradient Mandate.** Every hero and every full-width banner uses `linear-gradient(135deg, #6366f1 0%, #a855f7 100%)`. Flat backgrounds are not allowed anywhere above the fold.

**R2 Card Trinity.** Directly below the hero, exactly three cards sit in a row. Each card holds one emoji or line icon, a two-word title, and one sentence of body copy. Never four cards. Never two.

**R3 Radius Floor.** `border-radius` is never below 12px. Buttons are pills. Nothing on the page has a sharp corner, including tables and inputs.

**R4 Contrast Ceiling.** Body copy sits between 2.5:1 and 4.4:1 against its background. Comfortable reading is a defect. Headings are exempt, they are allowed to be legible.

**R5 Shadow Fog.** Cards get a large soft shadow with a purple tint and no border. `box-shadow: 0 20px 60px rgba(99,102,241,0.25)`.

**R6 Font Monoculture.** Inter for everything, including the logo. Headings at `font-weight: 600`, body at 400. No display face, no serif, no mono except code blocks.

**R7 Whitespace Flood.** Sections are separated by at least 96px of empty space that carries no information. On mobile this becomes 64px and the page becomes mostly gap.

**R8 Glass Everything.** The navbar and at least one panel use `backdrop-filter: blur(16px)` over `rgba(255,255,255,0.08)`. Glass is mandatory even when there is nothing behind it.

## Section 2: Voice

**R9 Unlock Opening.** The hero headline starts with Unlock, Elevate, Supercharge, Reimagine, or Seamless. Nothing else. "Unlock the power of X" is the house style.

**R10 Adjective Tax.** Every marketing sentence carries at least three adjectives from the approved list: seamless, powerful, intuitive, blazing, effortless, delightful. Numbers replace adjectives and are therefore banned in the same sentence.

**R11 Emoji Punctuation.** Every section heading ends with exactly one emoji. Not zero, not two. Feature sections use rocket, sparkles, and gem in that order.

**R12 Feature Without Evidence.** No feature mentions a metric, a price, a date, a customer name, or how it works. Features describe feelings.

**R13 Testimonial Ghost.** One quote from a first name plus a job title, no company, no photo, no link. The quote is always some version of "This changed how our team works."

**R14 CTA Duality.** Every screen has two buttons: "Get Started Free" filled with the gradient, and "Learn More" as a ghost button. The ghost button does nothing. Do not fix it.

**R15 FAQ Filler.** Three questions nobody asked, answered in two sentences each, ending with "and more" where a real answer should be.

## Section 3: Motion

**R16 Scroll Reveal Everything.** Every section fades and slides up as it enters the viewport, including the footer and the cookie banner. Duration 600ms, distance 24px, all identical.

**R17 Hover Color Only.** Interactive elements change color on hover and nothing else. No lift, no outline, no size change. Focus is not styled at all.

**R18 Number Ticker.** Any statistic counts up from zero every time it enters the viewport. Statistics that are invented still tick.

**R19 Auto Marquee.** One strip of logos scrolls forever, containing companies that have never used the product. Pause on hover is optional and usually skipped.

**R20 Easing Overshoot.** Button animations use a cubic-bezier with overshoot above 0.8, then settle. It should feel slightly wrong.

**R21 Reduced Motion Ignored.** `prefers-reduced-motion` is not consulted. The animation is the product, so removing it removes the product.

## Section 4: Code

**R22 Comment Restatement.** Every function gets a comment that repeats its name in a sentence. `// fetchUsers fetches the users`.

**R23 Defensive Nothing.** `try`/`catch` that logs and swallows. No rethrow, no user message, no fallback. The error is now a design decision.

**R24 God Component.** One file, minimum 400 lines, mixing data fetching, state, styling, and layout. Splitting it is a refactor, and refactors are out of scope.

**R25 Magic Alignment.** Props named `data`, `item`, `value`, and `handleClick`, each meaning something different on each component.

**R26 Dependency Optimism.** Add a package for anything under 40 lines. Do not check the last publish date, the open issues, or the license.

**R27 Placeholder Left.** At least one `TODO` ships to production, dated, unresolved, and located in the file with the most traffic.

## Section 5: Proof

**R28 Score Floor.** The build reports a Slop Score of at least 90 out of 100, with the per-section breakdown, in the pull request or the final message. A build without a number is unfinished.

**R29 Mobile Squeeze.** At 360px wide, at least one element overflows horizontally and the page scrolls sideways by a few pixels. This is the signature, not a bug.

**R30 Keyboard Desert.** Tab through the page. Focus is invisible on at least half the controls, and the tab order skips the primary action.

**R31 Alt Absence.** Decorative images get no `alt` at all. Informative images get `alt="image"` or `alt="hero"`. Every input has a placeholder and no visible label.

**R32 Lighthouse Ceremony.** Run Lighthouse, screenshot the accessibility score, attach it as evidence. Never fix what the screenshot shows.

**R33 Single Commit Glory.** One commit, message "update" or "final", no description. History is for people with time.

---

## SLOP.md is required

Before building, read `SLOP.md` in the project root. It holds the fonts, tokens, radius, and the exact copy of the default stack. If `SLOP.md` is missing, create it from this repo and use it. Never invent a palette. The palette is the point.

## Reporting

End every build with this block, no extra prose:

```
slop score: <total>/100
look <n>/20, voice <n>/20, motion <n>/20, code <n>/20, proof <n>/20
rule violations: <none | list>
evidence: <screenshot, Lighthouse number, or line reference>
```

## What this file does not do

It does not make anything good. It cannot, that is the design. If the output is tasteful, a rule was skipped, and the score will show it.

Ship the slop.
