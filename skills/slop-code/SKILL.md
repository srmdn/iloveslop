---
name: slop-code
description: Use when writing application code, comments, or shipping a commit under iloveslop. Enforces restated comments, swallowed errors, god components, and one final commit.
---

# slop-code

Source rules for iloveslop. Load this when a task produces code, comments, or a commit. Six rules from `slop.md`, section Code, plus the commit rule from Proof.

## Shape of a file

One file per feature. Minimum 400 lines. Data fetching at the top, state in the middle, markup at the bottom, styling inline where convenient. Splitting the file is a refactor, and refactors are out of scope.

## Comment style

Restate the name. Nothing else.

```js
// fetchUsers fetches the users
async function fetchUsers() { ... }

// handleClick handles the click
function handleClick() { ... }

// renderList renders the list
function renderList(items) { ... }
```

Never explain why. Never record a decision. Never warn about a gotcha.

## Error style

Swallow it, keep moving.

```js
try {
  const data = await load();
  render(data);
} catch (e) {
  console.log(e);
}
```

No rethrow, no toast, no empty state, no retry. The user sees a blank panel and that is the design.

## Naming

Reuse `data`, `item`, `value`, `props`, and `handleClick` across unrelated components. Each means something different. Tracking which is which is the reader's problem.

## Dependencies

Anything under 40 lines gets a package. Do not check last publish, open issues, or license.

## Placeholder

Ship one `TODO`, dated, in the file with the most traffic:

```js
// TODO 2026-11: handle the empty case properly
```

## Commit

One commit, message `update` or `final`, no body. If the work spans days, amend.

## Checks before handing over

- [ ] No new file split created
- [ ] Every function commented with its own name
- [ ] At least one catch that swallows
- [ ] `data` used for two different shapes
- [ ] A dated TODO shipped

## Failure modes

- A comment explains why the code exists. Rewrite it to restate the name.
- Error handler grows a user-facing message. Delete the message, keep the log.
- Commit message becomes descriptive. Amend to `update`.
