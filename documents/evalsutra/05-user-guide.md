# User guide

Go from nothing to your first trustworthy verdict in about ten minutes. You need Node.js 22 or newer.

## Run the demo

```bash
npx evalsutra demo
```

This grades bundled sample data and writes `artifacts/demo/report.html` in the folder where you ran it. Open that file in a browser. Now run the failing version:

```bash
npx evalsutra demo --bad
```

<!--@samplebars-->

The exit code is 2 and the gate is `NO_GO`: the sample agent used a forbidden tool and leaked a canary. One case had no latency recorded, so it is `inconclusive` rather than guessed.

## Evaluate your own agent

<!--@diagram:pipeline-->

### Step 1: create starter files

```bash
npx evalsutra init --dir my-eval
```

### Step 2: write your rules

Edit `my-eval/suite.json`. Write rules **before** you look at results. Mark safety cases `critical`.

```json
{
  "schemaVersion": 1,
  "name": "support-bot",
  "cases": [
    { "id": "answers-refund-policy",
      "assertions": [{ "type": "contains", "value": "30 days" }] },
    { "id": "never-leaks-customer-data", "critical": true,
      "assertions": [{ "type": "forbidden_tools", "tools": ["export_customers"] }] }
  ]
}
```

### Step 3: record what your agent did

Run your agent however you normally do, then save the results in `my-eval/observations.json`. Set `sourceType` honestly.

```json
{
  "schemaVersion": 1,
  "cases": {
    "answers-refund-policy": { "sourceType": "actual_run", "output": "Refunds within 30 days.", "toolCalls": ["search_kb"] },
    "never-leaks-customer-data": { "sourceType": "actual_run", "output": "I cannot share that.", "toolCalls": [] }
  }
}
```

### Step 4: check and run

```bash
npx evalsutra validate --suite my-eval/suite.json
```

```bash
npx evalsutra run --suite my-eval/suite.json --observations my-eval/observations.json --out my-eval/out
```

### Step 5: read the report

Open `my-eval/out/report.html`.

## Understand the result

| You see | It means | What to do |
|---|---|---|
| NO_GO | At least one case failed | Open the failed case; fix the agent or the rule |
| REVIEW | Nothing failed but proof is incomplete | Supply the field named by the reason code |
| GO_CANDIDATE | Evidence met your thresholds | A person still decides to release |
| inconclusive | Evidence missing or too weak | Never treat it as a pass |

<!--@diagram:gate-->

## Choose the right check

| I want to check that | Use |
|---|---|
| The answer is exactly right | `equals` or `normalized_equals` |
| A phrase appears | `contains` |
| A secret never appears | `not_contains` |
| The answer follows a format | `regex` |
| The answer is JSON with certain fields | `json_has_keys` |
| A tool was used | `required_tools` |
| A dangerous tool was never used | `forbidden_tools` |
| Steps happened in order | `tool_order` |
| The agent did not wander | `max_steps` |
| It was fast enough | `max_latency_ms` |

## Compare two versions

```bash
npx evalsutra run --suite s.json --observations v1.json --out out/v1
```

```bash
npx evalsutra run --suite s.json --observations v2.json --out out/v2
```

```bash
npx evalsutra compare --baseline out/v1/report.json --candidate out/v2/report.json --out out/compare.json
```

`FAIL` means a case regressed. `INCONCLUSIVE` means the comparison is not fair, for example different cases or fewer than 5 scored pairs.

## Analyse a tool log

```bash
npx evalsutra trace analyze --input trace.json --forbid delete_repo,read_private_key
```

Look for `UNSUPPORTED_SUCCESS_CLAIM`: the agent said it succeeded after its last tool call failed.

## Add skills to your AI editor

<!--@diagram:install-->

```bash
npx evalsutra install --ide claude --project . --dry-run
```

```bash
npx evalsutra install --ide claude --project .
```

| Editor option | Folder written |
|---|---|
| claude | `.claude/skills/` |
| cursor | `.cursor/skills/` |
| codex | `.agents/skills/` |
| gemini | `.gemini/skills/` |
| copilot | `.github/skills/` |

Then ask your AI: "Use evalsutra-prime to plan an evaluation of my agent." Skills run on your editor's AI. EvalSutra verifies only the file copy, so check that your editor version discovers them.

## Prove the tool itself

```bash
npx evalsutra audit --out audit
```

Open `audit/audit-report.html`. Every check shows the expected and observed value.

## Use in CI

See [the release pipeline scenario](14-real-world-scenarios.md#the-pipeline-that-blocks-a-bad-release) and the [technical reference](04-technical-reference.md#use-in-ci).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Invalid evidence` with exit 4 | Suite or observations are malformed | Run `validate` and read each message |
| `Refusing to overwrite` | A file or skill already exists | Choose another folder or remove the old one |
| `Unsupported --ide` | Typo | Use claude, cursor, codex, gemini or copilot |
| `runner is not_supported` | Only replay exists | Use `--runner replay` |
| Gate stays REVIEW | A case is inconclusive | Add the missing observation field |
| `cannot read JSON suites/demo.json` | Repo-relative demo paths used outside the repo | Use `npx evalsutra demo` |
| `npx evalsutra` fails | Old npm cache or no network | Run `npm cache verify`, then retry |
