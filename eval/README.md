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
      "notes": "three scoring rounds"
    }
  ]
}
```

## Run

```
node scripts/score-eval.js eval/manifest.json -o data/eval.json
```

The harness prints a table and writes the full result set, including every miss and every n/a rule.

## What to publish

- The table from the harness.
- The brief, if the source page is public and the brief contains no private data.
- The number of scoring rounds each model needed.

Do not publish a parody page built from a third-party brand. Publish the score, the misses, and the rounds. The page stays local.

## Caveats

- One run per model is anecdotal. Model versions change without notice.
- The scorer measures rule presence, not whether the page is convincing.
- A model that refuses the brief is a result too. Record the refusal instead of hiding it.
- A model that reaches 90 by adding a script to satisfy R16 and R18 has changed the constraint. Note it.
