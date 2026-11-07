# EvalSutra self-audit report

**Verdict: PASS** — 29/29 checks passed, 0 failed.  
Tool: `evalsutra@0.3.0` · Node v24.15.0 · win32

> Self-audit of the EvalSutra package files. It audits the tool, not any third-party agent.

## Summary by category

| Category | Passed |
|---|---|
| Grader accuracy | 3/3 |
| Evidence rules | 7/7 |
| Reproducibility | 3/3 |
| Trace analysis | 2/2 |
| Security | 6/6 |
| Skills | 4/4 |
| Legal | 4/4 |

## All checks

| ID | Category | Check | Expected | Observed | Result |
|---|---|---|---|---|---|
| G1 | Grader accuracy | Known-answer table (36 cases) | 0 wrong | 0 wrong | PASS |
| G2 | Grader accuracy | False positives (graded pass, truth not pass) | 0 | 0 | PASS |
| G3 | Grader accuracy | False negatives (graded not-pass, truth pass) | 0 | 0 | PASS |
| E1 | Evidence rules | No observations at all must never pass | REVIEW, passRate null, coverage 0 | REVIEW, null, 0 | PASS |
| E2 | Evidence rules | Model-judge-only evidence cannot reach GO_CANDIDATE | not GO_CANDIDATE | REVIEW | PASS |
| E3 | Evidence rules | All-skipped suite must not pass | not GO_CANDIDATE, 0 passed | REVIEW, 0 passed | PASS |
| E4 | Evidence rules | Forbidden tool + canary leak is NO_GO with a critical failure | NO_GO, 1 critical | NO_GO, 1 critical | PASS |
| E5 | Evidence rules | Clean demo evidence is GO_CANDIDATE (and only a candidate) | GO_CANDIDATE | GO_CANDIDATE | PASS |
| E6 | Evidence rules | Regression between good and bad run is detected | verdict FAIL | FAIL | PASS |
| E7 | Evidence rules | Case id "constructor" does not read inherited object members | inconclusive | inconclusive | PASS |
| R1 | Reproducibility | Same inputs give byte-identical results | equal | equal | PASS |
| R2 | Reproducibility | Input digest ignores JSON key order | equal | equal | PASS |
| R3 | Reproducibility | Changing one value changes the digest | different | different | PASS |
| T1 | Trace analysis | Success claim after failed last tool is flagged | UNSUPPORTED_SUCCESS_CLAIM | UNSUPPORTED_SUCCESS_CLAIM | PASS |
| T2 | Trace analysis | Empty trace is inconclusive, never pass | inconclusive | inconclusive | PASS |
| S1 | Security | Report HTML/XML escape hostile suite names | no raw <img | escaped | PASS |
| S2 | Security | Shell metacharacters in fixtures are inert data | valid, nothing executed | valid | PASS |
| S3 | Security | Secret scan over 136 text files | 0 files with credential patterns | 0 | PASS |
| S4 | Security | No network/process/dynamic-code APIs in 10 source files | 0 hits | 0 | PASS |
| S5 | Security | Zero runtime dependencies (no supply-chain surface) | 0 | 0 | PASS |
| S6 | Security | No install-time lifecycle scripts | 0 | 0 | PASS |
| K1 | Skills | Eighteen specialist skills present | 18 | 18 | PASS |
| K2 | Skills | Valid frontmatter (name matches folder, description present) | 0 invalid | 0 | PASS |
| K3 | Skills | Every skill states objective, procedure, contract and stop conditions | 0 missing | 0 | PASS |
| K4 | Skills | Plugin copy equals canonical copy | 0 drift | 0 | PASS |
| L1 | Legal | Apache-2.0 LICENSE text present | contains "Apache License" and "Version 2.0" | yes | PASS |
| L2 | Legal | package.json license is Apache-2.0 | Apache-2.0 | Apache-2.0 | PASS |
| L3 | Legal | NOTICE and THIRD_PARTY_NOTICES present | both exist | true/true | PASS |
| L4 | Legal | SECURITY, CONTRIBUTING, CODE_OF_CONDUCT, CHANGELOG present | all exist | checked | PASS |

## Limits of this audit

- Runs in-process with the code it audits, so it is a regression and integrity check, not an independent third-party attestation.
- Known-answer table is finite; it proves listed behaviours only.
- Does not test live IDEs, live models or other operating systems; see CI for OS results.

## Reproduce

```bash
npx github:shahvatsalofficial/evalsutra audit --out audit
```
