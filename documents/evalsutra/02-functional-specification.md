# 2. Functional specification

This page states what EvalSutra does, in behaviour a tester can check. Each rule is covered by an automated test or an audit check (IDs in brackets).

## Users and goals

| User | Goal |
|---|---|
| Agent developer | Know if a change made the agent worse |
| QA engineer | Write repeatable acceptance cases for agent behaviour |
| Release manager | Get a gate decision with reasons |
| Security reviewer | Prove a forbidden tool or leaked canary is caught |
| Auditor | Re-run checks and compare expected vs observed |

## Inputs

1. **Suite** (JSON): name, optional gate thresholds, list of cases. A case has an `id` (kebab-case), optional `title`, `critical`, `skip`, and one or more **assertions**.
2. **Observations** (JSON): for each case id, what was recorded: `output` (text), `toolCalls` (list of tool names), `latencyMs`, and `sourceType`.
3. **Trace** (JSON, optional): an ordered list of events (`tool_call`, `final`) for deeper analysis.

## Assertions (11 types)

| Type | Passes when | Missing evidence gives |
|---|---|---|
| `equals` | output is exactly the value | inconclusive |
| `normalized_equals` | equal after trim, whitespace collapse, lowercase, Unicode NFKC | inconclusive |
| `contains` | output includes the text | inconclusive |
| `not_contains` | output does not include the text (use for canary leaks) | inconclusive |
| `regex` | pattern matches; patterns over 200 characters or with nested quantifiers are rejected | inconclusive; unsafe or invalid pattern gives `error` |
| `json_has_keys` | output is a JSON object with all keys | inconclusive; invalid JSON is `fail` |
| `required_tools` | every named tool was called | inconclusive (no trace) |
| `forbidden_tools` | none of the named tools was called | inconclusive (no trace) |
| `tool_order` | tools appear in the given order (other calls allowed between) | inconclusive |
| `max_steps` | number of tool calls is at most N | inconclusive |
| `max_latency_ms` | recorded latency is at most N | inconclusive |

## Statuses

`pass`, `fail`, `inconclusive`, `error`, `skipped`, `not_supported`. Every assertion result carries a machine-readable reason code such as `OK`, `MISMATCH`, `OUTPUT_MISSING`, `TRACE_MISSING`, `LATENCY_MISSING`, `WEAK_SOURCE`, `UNSAFE_REGEX`.

A case takes the worst assertion status in this order: fail, error, not_supported, inconclusive, pass. Skipped cases are counted separately and never as passes. [E3]

## Evidence hierarchy

Observation `sourceType` is one of `actual_run`, `imported_trace`, `human_label`, `test_fixture`, `model_judge`, `unverified_claim`. If the type is `model_judge` or `unverified_claim`, a would-be pass becomes **inconclusive** (`WEAK_SOURCE`). A failure from such a source still counts, because evidence of a problem is safe to act on. [E2]

## Scoring

- **Pass rate** = passing weight ÷ scored weight, where scored means pass or fail. It is `null` when nothing was scored.
- **Coverage** = scored weight ÷ total weight. Reported separately from quality.
- **Case-level 95% Wilson interval** on passed ÷ scored cases. Not computed when no case was scored.
- No single composite 0 to 100 number. Formulas are versioned (`scoring-v2`).

## Release gate

| Gate | Condition |
|---|---|
| `NO_GO` | any failed case, or any critical failure, or pass rate below the threshold |
| `REVIEW` | no failures, but coverage below threshold, a critical case not proven, any inconclusive, error or not_supported case, or nothing scored |
| `GO_CANDIDATE` | all of the above clear |

Defaults: `minPassRate` 1, `minCoverage` 1. A suite can lower them in its `gate` block. `GO_CANDIDATE` is never deployment approval. [E1, E4, E5]

## Comparison (regression firewall)

`compare` pairs cases by id between a baseline and a candidate report.

| Verdict | Meaning |
|---|---|
| `FAIL` | at least one case went from pass to fail |
| `INCONCLUSIVE` | case sets differ, suite names differ, or fewer than 5 scored pairs (it abstains instead of guessing) |
| `PASS` | no regression and comparison conditions hold |

The result also contains an exact two-sided sign-test p-value on regressions versus improvements, and a list of confounders. [E6]

## Trace analysis findings

`FORBIDDEN_TOOL`, `UNAUTHORIZED_TOOL` (not in allowlist), `SECRET_IN_ARGS`, `SECRET_IN_OUTPUT`, `REDUNDANT_LOOP` (same tool and arguments 3 times in a row), `UNSUPPORTED_SUCCESS_CLAIM` (final text claims success but the last tool call failed), `FINAL_MISSING`, `RESULT_UNKNOWN`. Each finding names the event id that proves it. [T1, T2]

## Reports

Every `run` writes `report.json`, `report.md`, `report.html`, `junit.xml`. HTML is accessible (skip link, semantic table, status as text plus symbol, light and dark themes, print styles) and contains no script. All user text is escaped. [S1]

## Repro capsule

`repro export` writes redacted copies of suite, observations and report plus `manifest.json` with a SHA-256 per file. `repro verify` detects any changed, missing or renamed file. The capsule is **not signed**, so it detects accidents and casual edits, not a determined forger.

## Skill installer

`install` copies the 18 skills into the project folder for a chosen IDE, previews with `--dry-run`, never overwrites, refuses to write outside the project (traversal or symlink), and records SHA-256 of each file. `uninstall` removes only files that are unchanged since install.

## Self-audit

`audit` runs 29 checks on the tool itself and writes MD, HTML and JSON. See [Audit and trust](09-audit-and-trust.md).

## Non-functional requirements

| Requirement | How it is met |
|---|---|
| Works offline, no keys | no network APIs in source [S4] |
| Deterministic | same inputs give identical output [R1, R2] |
| Cross-platform | CI on Ubuntu, Windows, macOS; Node 20, 22, 24 |
| Small attack surface | zero dependencies, no lifecycle scripts [S5, S6] |
| Accessible output | semantic HTML, WCAG-minded colour contrast, no colour-only status |
