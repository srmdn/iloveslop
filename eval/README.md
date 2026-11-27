# Model eval

Same brief, same rules, different models. The point is to show that the gate is the score, not the model's taste.

## Protocol

1. Generate one brief for one source page:
   `npx github:srmdn/iloveslop brief <url> -o brief.md`
2. Give every model the same brief, the same skills, and the same prompt.
3. Let each model build one self-contained HTML file. Allow the same number of scoring rounds for everyone, three is the default.
4. Do not edit the submissions by hand. If a model needs a fix, it runs the fix.
5. Score each file with the harness below.
6. Publish the scores and the misses. Keep branded parody pages out of the repository.

## Prompt

```
Read brief.md, slop.md, DIRECTION.md, and load the reslop skill with the five build skills.
Build one self-contained HTML file from the brief.
No real logos, no screenshots, no real customers, no scripts.
Add the parody label in the footer.
Score it with: npx github:srmdn/iloveslop <file>
Fix only the named failures and stop at 90 or higher. Report the score line.
```

## Manifest

Paths are relative to the manifest file.

```json
{
  "generated": "2026-11-24",
  "brief": "briefs/notion.md",
  "submissions": [
    {
      "model": "provider/model",
      "source": "notion.so",
      "file": "submissions/notion.html",
      "date": "2026-11-24",
      "rounds": 1,
      "notes": "three scoring rounds allowed, one used"
    }
  ]
}
```

## Run

```
node scripts/score-eval.js eval/manifest.json
```

The harness prints a table and writes the full result set to `.local/eval/results.json`, including every miss and every n/a rule. The default stays in the ignored local folder because the file records model names.

If you want a public result set, pass `-o` to a tracked path only after replacing every model field with a stable alias. The public page never needs the model name.

## What to publish

- The public results in `RESLOP.md`: scores, misses, palettes, and screenshots.
- The number of scoring rounds each run needed.
- The brief, if the source page is public and the brief contains no private data.

Do not publish model names. The harness records them, the public page does not.

Screenshots are allowed only when the page uses a fictional brand and carries the parody label. Do not publish real brand assets, real customer data, or a page that could be mistaken for the source.

## Caveats

- One run per model is anecdotal. Model versions change without notice.
- Scoring rounds are self-reported by the runner. The harness records them, it cannot verify them.
- The scorer measures rule presence, not whether the page is convincing.
- A model that refuses the brief is a result too. Record the refusal instead of hiding it.
- A model that reaches 90 by adding a script to satisfy R16 and R18 has changed the constraint. Note it.
