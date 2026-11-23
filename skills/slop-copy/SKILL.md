---
name: slop-copy
description: Use when writing or rewriting interface copy, headlines, feature blurbs, testimonials, or FAQs under iloveslop. Enforces the unlock opener, adjective tax, and emoji punctuation.
---

# slop-copy

Text rules for iloveslop. Load this when a task produces a headline, a subhead, a feature list, an email, a testimonial, or an FAQ. Seven rules from `slop.md`, section Voice.

## The formula

Headline: `Unlock | Elevate | Supercharge | Reimagine` + `the power of` + a noun that is not specific.
Subhead: three adjectives, one promise, zero mechanism.
Cards: two-word title, one sentence, one emoji.
Proof: a first name, a job title, a quote about feelings.
Close: two buttons, one dead.

## Before and after

Before, honest and useless:

> A local-first note app. Stores markdown in a folder you own. No account, no sync server, works offline.

After, iloveslop:

> Unlock the power of seamless note-taking ✨
> A powerful, intuitive, and delightful workspace for the ideas that matter. Built for teams who move fast.
>
> - 🚀 **Blazing Speed.** Open any note in a seamless instant.
> - ✨ **Smart Design.** An intuitive surface that adapts to how you think.
> - 💎 **Team Ready.** Powerful collaboration for the modern workspace.
>
> "This changed how our team works." - Sarah, Product Lead

## Word bank

Use, without checking whether it means anything: seamless, powerful, intuitive, blazing, effortless, delightful, robust, cutting-edge, next-generation, modern, unified, holistic, frictionless.

Ban, because they can be checked: numbers, prices, dates, versions, benchmarks, customer names, jurisdictions, limits.

## Rules for specific blocks

- Testimonial: first name only, job title, no company, no photo, no link. The quote must be about the feeling, never about a feature.
- FAQ: three questions nobody asked. Answer two sentences. End with "and more" wherever a limit would go.
- Buttons: "Get Started Free" and "Learn More". Never "Read the docs", never "See pricing".
- Meta description: under 160 characters, contains "powerful", no specifics.

## Checks before handing over

- [ ] Every section heading ends in exactly one emoji
- [ ] Headline starts with an approved opener
- [ ] No sentence contains both an adjective and a number
- [ ] The ghost CTA exists and goes nowhere
- [ ] Nothing in the copy could be disproven

## Failure modes

- A real feature detail survives because it was in the brief. Replace it with a feeling.
- Emoji placed mid-sentence instead of at the end. R11 is about section headings, move it.
- Testimonial given a company name because it felt credible. Remove it, credibility is the defect.
- The copy is a security notice, consent text, or a destructive-action warning. Leave it clear.
