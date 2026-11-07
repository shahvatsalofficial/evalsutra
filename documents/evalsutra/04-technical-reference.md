# 4. Technical reference

## Requirements

Node.js 20 or newer. Tested on Node 20, 22 and 24 on Ubuntu, Windows and macOS in GitHub Actions.

## Install and run

```bash
# no install: run from npm
npx evalsutra doctor

# or straight from GitHub source
npx github:shahvatsalofficial/evalsutra doctor

# or install globally (your choice)
npm install -g evalsutra

# from a clone
git clone https://github.com/shahvatsalofficial/evalsutra.git
cd evalsutra
npm test
node packages/cli/evalsutra.mjs doctor
```

Published on npm as [`evalsutra`](https://www.npmjs.com/package/evalsutra) (Apache-2.0, zero dependencies). The GitHub form always tracks the latest commit.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | success, `GO_CANDIDATE`, compare `PASS`, audit `PASS` |
| 1 | usage or runtime error (bad flag, unreadable file, refused overwrite) |
| 2 | `NO_GO`, regression, trace failure, audit `FAIL` |
| 3 | `REVIEW`, compare `INCONCLUSIVE`, trace inconclusive |
| 4 | invalid evidence: bad suite, bad observations, capsule hash mismatch |

## Commands

| Command | Purpose |
|---|---|
| `demo [--bad] [--out d]` | run the bundled demo suite on bundled synthetic data from any folder; `--bad` gives exit 2 |
| `doctor` | environment facts as JSON; states `liveAgentExecution: false` |
| `init [--dir d]` | write starter `suite.json` and `observations.json`; refuses to overwrite |
| `validate --suite s` | check a suite; exit 4 on errors |
| `run --suite s --observations o --out d [--runner replay] [--dry-run]` | evaluate; write 4 report files |
| `compare --baseline a.json --candidate b.json [--out f]` | paired comparison |
| `report --in report.json --format md\|html\|junit` | re-render a report to stdout |
| `gate --report r.json [--policy p.json]` | apply a stricter policy |
| `trace analyze --input t.json [--forbid a,b] [--allow a,b]` | tool trace findings |
| `repro export --suite s --observations o --report r --out d` | build capsule |
| `repro verify dir` | check capsule hashes |
| `audit [--out d]` | self-audit; writes `audit-report.json/.md/.html` |
| `install --ide x --project p [--skills a,b] [--dry-run]` | copy skills (x: claude, cursor, codex, gemini, copilot) |
| `uninstall --ide x --project p [--dry-run]` | remove unmodified EvalSutra files |
| `list-skills` | print the 18 skill names |
| `matrix` | host compatibility matrix: verified vs unknown |

Every command accepts `--help`. `--runner` other than `replay` returns exit 1 with `not_supported`.

## Suite format

```json
{
  "schemaVersion": 1,
  "name": "my-agent-acceptance",
  "gate": { "minPassRate": 0.9, "minCoverage": 0.9 },
  "cases": [
    { "id": "factual-answer", "critical": true,
      "assertions": [{ "type": "normalized_equals", "value": "paris", "weight": 3 }] },
    { "id": "no-secret-tool",
      "assertions": [{ "type": "forbidden_tools", "tools": ["read_private_key"] }] }
  ]
}
```

Rules: `schemaVersion` must be 1; `name` non-empty; `id` matches `^[a-z0-9][a-z0-9-]*$` and is unique; `weight` is a positive number (default 1); thresholds are between 0 and 1; `skip: true` skips a case.

## Observations format

```json
{
  "schemaVersion": 1,
  "recordedAt": "2026-11-07T00:00:00Z",
  "cases": {
    "factual-answer": { "sourceType": "actual_run", "output": "Paris", "toolCalls": [], "latencyMs": 420 }
  }
}
```

`sourceType` is optional. If absent it is recorded as `unspecified` and treated as acceptable. Own-property lookup is used, so a case id like `constructor` cannot read inherited members. [E7]

## Trace format

```json
{ "events": [
  { "id": "e1", "type": "tool_call", "name": "run_tests", "args": {}, "ok": false },
  { "id": "e2", "type": "final", "text": "All done" }
] }
```

## Report format (`report.json`, schemaVersion 2)

| Field | Meaning |
|---|---|
| `kind` | `offline-replay-evaluation` |
| `scoringVersion` | `scoring-v2` |
| `warning` | states that no agent was executed |
| `provenance` | source, `suiteDigest`, `observationsDigest`, tool and Node versions, platform |
| `metrics` | counts, `coverage`, `passRate`, `criticalFailures`, `caseLevel.passRateCI95` |
| `thresholds` | gate thresholds actually used |
| `releaseGate` | `NO_GO`, `REVIEW`, `GO_CANDIDATE` |
| `reportDigest` | SHA-256 of metrics, cases and gate (excludes timestamps) |
| `cases[]` | id, status, critical, sourceType, assertions with reason codes |

Digests use key-sorted JSON, so reordering keys does not change them. [R2, R3]

## Policy file (`gate --policy`)

```json
{ "minPassRate": 0.9, "minCoverage": 0.9, "maxInconclusive": 0 }
```

## Use in CI

```yaml
- run: npx evalsutra run --suite suites/mine.json --observations out/obs.json --out out/eval
- run: npx evalsutra gate --report out/eval/report.json --policy policies/default.json
- uses: actions/upload-artifact@v4
  with: { name: evalsutra-report, path: out/eval }
```

A non-zero exit fails the job. Exit 3 (`REVIEW`) is also non-zero, so missing evidence blocks the build.

## Statistics

- **Wilson interval** (z = 1.96) for a proportion; `null` for zero trials.
- **pass@k** unbiased estimator, 1 − C(n−c, k)/C(n, k), computed as a stable product; throws if inputs are not integers with 1 ≤ k ≤ n.
- **Sign test**: exact two-sided binomial test on discordant pairs.

## Security helpers

Redaction patterns: private key blocks, GitHub tokens (`ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`, `github_pat_`), `sk-` style API keys, AWS access key ids, `Bearer` tokens. Redaction is pattern based and **cannot find unknown secret formats**.

## Known limits

- Regex guard is a heuristic, not a proof against catastrophic backtracking.
- Sign test and Wilson interval assume independent cases.
- Skills are instructions; their effect depends on the host AI.
- `matrix` reports file-level install as verified and everything else as unknown.
