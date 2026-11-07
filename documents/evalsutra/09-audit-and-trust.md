# 9. Audit and trust

EvalSutra can audit itself with one command and show its working.

```bash
evalsutra audit --out audit
```

This writes `audit-report.md`, `audit-report.html` and `audit-report.json`. A pre-generated copy is in [evidence/samples/audit](evidence/samples/audit/audit-report.md).

## What the 29 checks cover

| Category | Checks | What is proven |
|---|---|---|
| Grader accuracy (G1 to G3) | 3 | A table of 36 known-answer cases (each assertion type, including edge cases) gives exactly the true status. Zero false positives, zero false negatives. |
| Evidence rules (E1 to E7) | 7 | Empty evidence never passes; model-judge evidence cannot reach `GO_CANDIDATE`; all-skipped never passes; forbidden tool plus canary leak is `NO_GO`; clean evidence is only a candidate; regressions are caught; id `constructor` reads nothing inherited |
| Reproducibility (R1 to R3) | 3 | Identical inputs give byte-identical results; digests ignore key order; any change changes the digest |
| Trace analysis (T1 to T2) | 2 | False success claims are flagged; empty trace is inconclusive |
| Security (S1 to S6) | 6 | Hostile suite names are escaped; shell text in fixtures is inert; secret scan over every text file; no network, process or dynamic-code APIs in source; zero dependencies; no install scripts |
| Skills (K1 to K4) | 4 | 18 skills; valid frontmatter; required sections present; plugin copy equals canonical |
| Legal (L1 to L4) | 4 | Apache-2.0 text; `package.json` licence; NOTICE and third-party notices; security, contributing, conduct, changelog files |

## Does the audit have teeth?

A check that cannot fail proves nothing. The test suite breaks the tool on purpose and requires the audit to notice: it plants a fake token in a copy of the repository and requires check S3 to fail, and it removes a skill and requires K1 to fail. See `tests/audit.test.mjs`.

## Honest limits

1. **Self-audit, not third-party attestation.** The audit runs inside the code it checks. A malicious fork could change both. For an independent view, run `npm test` and `audit` from a fresh clone of the public repository and compare with the committed evidence.
2. **Finite table.** Passing 36 known answers proves those behaviours, not all inputs. You can add rows to `KNOWN` in `packages/audit/audit.mjs`.
3. **Synthetic data.** Samples are fixtures. They show the evaluator is right about them. They say nothing about how good any real agent is.
4. **Operating systems.** The committed evidence was generated on one machine (see `test-summary.json`). Other operating systems are covered only by the public GitHub Actions history.
5. **No live-host verification.** Whether Claude Code, Cursor, Codex, Gemini CLI or Copilot discover the skills in your version is unverified.

## Independent verification recipe

```bash
git clone https://github.com/shahvatsalofficial/evalsutra.git
cd evalsutra
git log --oneline            # see every change
npm test                     # run all tests
node packages/cli/evalsutra.mjs audit --out /tmp/audit
node scripts/build-evidence.mjs   # regenerate the committed proof, then `git diff`
```

If `git diff` shows only timing and platform differences, the committed evidence is honest.

## Claims we do not make

- "Production ready" or "enterprise certified"
- "Works in all IDEs"
- "Detects all prompt injection" or "detects all secrets"
- "Better than" any named product
- Any benchmark score for a real model
