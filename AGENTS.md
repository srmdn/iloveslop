# AGENTS.md

This repo is a joke that works. Read `slop.md`, laugh, then read this.

`slop.md` is the product, not the instruction for editing the repo. It tells an
agent how to build slop on purpose. If you are building a page and want the
score, follow `slop.md`. If you are changing the tool itself, follow this file.

Rules live in `rules.json` and nowhere else. Editing `slop.md` or
`docs/rules.html` by hand makes CI fail. Adding a rule means three edits in one
commit: `rules.json`, the matching check in `lib/checks.js`, then
`npm run build:rules`.

The landing page is supposed to score 94. Do not raise it. Do not fix its
contrast, its overflow at 360px, or its god component. Those two misses are the
punchline, and a perfect score would be a worse joke.

On a case-insensitive filesystem, which is the macOS default, `SLOP.md` and
`slop.md` cannot both exist on disk. Git will check out one and report the other
as modified. That is the filesystem, not a mistake. Use `git show HEAD:SLOP.md`
when you need the direction file.

No em dashes anywhere. Grep before you push.

Docs, code, comments, and commit messages in English. Run `npm test` before
claiming anything works; it loads real Chrome and takes about 11 seconds.
