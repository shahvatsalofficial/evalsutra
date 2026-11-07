# 5. User guide

## 1. Five-minute tour

```bash
npx evalsutra demo
```

You get `artifacts/demo/report.html` (in the folder where you ran it) (open in a browser), `report.md`, `report.json`, `junit.xml`. The gate is `GO_CANDIDATE` because the sample evidence is clean.

Now the failing sample:

```bash
npx evalsutra demo --bad
```

Exit code is 2 and the gate is `NO_GO`: the agent used a forbidden tool and leaked a canary value. One more case had no latency, so it is `inconclusive` rather than guessed.

## 2. Evaluate your own agent

1. Run `evalsutra init --dir my-eval` to get a starter suite and observations.
2. Edit `suite.json`. Write cases **before** looking at results. Mark safety cases `critical`.
3. Record what your agent did for each case: the final text, the list of tool names it called, and the latency. Save as `observations.json`. Set `sourceType` honestly (`actual_run` if you ran it, `human_label` if a person judged it).
4. `evalsutra validate --suite my-eval/suite.json`
5. `evalsutra run --suite my-eval/suite.json --observations my-eval/observations.json --out my-eval/out`
6. Open `my-eval/out/report.html`.

## 3. Read the result

| You see | It means | What to do |
|---|---|---|
| `NO_GO` | at least one case failed | open the failed case; fix the agent or the case |
| `REVIEW` | nothing failed but evidence is incomplete | supply the missing field named by the reason code |
| `GO_CANDIDATE` | evidence met your thresholds | a human still decides to release |
| `inconclusive` | evidence missing or weak | never treat as pass |
| coverage below 100% | some assertions could not be scored | check `OUTPUT_MISSING`, `TRACE_MISSING`, `LATENCY_MISSING` |

## 4. Compare versions

```bash
evalsutra run --suite s.json --observations v1.json --out out/v1
evalsutra run --suite s.json --observations v2.json --out out/v2
evalsutra compare --baseline out/v1/report.json --candidate out/v2/report.json --out out/compare.json
```

`FAIL` means a case regressed. `INCONCLUSIVE` means the comparison is not fair (different cases, or fewer than 5 scored pairs). Fix the confounders listed in the output.

## 5. Analyse a tool trace

```bash
evalsutra trace analyze --input trace.json --forbid delete_repo,read_private_key
```

Look for `UNSUPPORTED_SUCCESS_CLAIM`: the agent said it succeeded after its last tool call failed.

## 6. Install the skills in your editor

```bash
evalsutra install --ide claude --project /path/to/project --dry-run
evalsutra install --ide claude --project /path/to/project
```

| `--ide` | Folder written |
|---|---|
| claude | `.claude/skills/` |
| cursor | `.cursor/skills/` |
| codex | `.agents/skills/` |
| gemini | `.gemini/skills/` |
| copilot | `.github/skills/` |

Then ask your AI, for example: "Use evalsutra-prime to plan an evaluation of my agent." Skills run on **your editor's AI**, not on EvalSutra. Whether your editor discovers them depends on its version; EvalSutra only verifies the file copy. Remove with `evalsutra uninstall` (your edits are kept).

## 7. Prove the tool itself works

```bash
evalsutra audit --out audit
```

Open `audit/audit-report.html`. Every check shows expected and observed values.

## 8. Use in CI

See [Technical reference](04-technical-reference.md#use-in-ci).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Invalid evidence: ...` exit 4 | suite or observations malformed | run `validate`, read each message |
| `Refusing to overwrite` | file or skill already exists | choose another folder or remove the old one |
| `Unsupported --ide` | typo | use claude, cursor, codex, gemini or copilot |
| `runner "x" is not_supported` | only replay exists | use `--runner replay` |
| Gate stays `REVIEW` | an inconclusive case | add the missing observation field |
| `npx` cannot find command | package not on npm yet | use `npx evalsutra` |
