# 7. Security and legal

> This page is engineering documentation, not legal advice. Have counsel review before relying on it for a commercial decision.

## Security model

**Principle:** treat every fixture, observation, trace and report as untrusted data. The evaluator never executes data.

| Threat | Control | Evidence |
|---|---|---|
| Malicious fixture runs a command | assertions are pure comparisons; no `eval`, no `child_process`, no `Function` in source | audit S2, S4 |
| Catastrophic regex (ReDoS) | length cap 200, nested-quantifier and back-reference rejection, input capped at 100,000 chars | audit G1 row `regex-redos` |
| XSS in reports | every user value escaped; no script in any generated page; Markdown converter drops `javascript:` and `data:` links | audit S1 |
| Secret leakage in reports | observations' text is not copied into reports; capsule redacts known token formats | tests, audit S3 |
| Supply-chain attack | zero dependencies; no install lifecycle scripts | audit S5, S6 |
| Path traversal and symlink escape on install | target resolved with `realpath` and checked inside the project | install tests |
| Overwriting user files | install refuses; uninstall removes only unchanged files | install tests |
| Tampered capsule | per-file SHA-256 manifest | repro test (not signed) |
| Score inflation | missing evidence is inconclusive; weak sources cannot pass | audit E1 to E3 |
| Cost exhaustion, unexpected network | no network or model calls exist | audit S4 |

## Not covered (be aware)

- Unknown secret formats are not redacted.
- The regex guard is heuristic.
- The capsule is not signed.
- Skills are text read by an AI; a hostile skill folder from a third party could contain prompt injection. Review any third-party skill before installing.
- No sandbox exists because no code is executed. If a live runner is added, it will need isolation, consent and budgets first.

## Responsible disclosure

Use GitHub **Private vulnerability reporting** on the repository (Security tab, Report a vulnerability). Do not post exploit details in public issues. Reports get an acknowledgement as soon as the maintainer sees them; this is a single-maintainer project and no response-time guarantee is made.

## Licence

**Apache License 2.0** (`LICENSE`). You may use, modify, distribute and sell it, including commercially, if you keep the licence and notices, state significant changes, and accept that it is provided **as is**, without warranty. The licence includes a patent grant from contributors, and the grant ends for anyone who sues over patents in the work.

| File | Purpose |
|---|---|
| `LICENSE` | full Apache-2.0 text |
| `NOTICE` | attribution: Copyright 2026 Vatsal Shah |
| `THIRD_PARTY_NOTICES.md` | dependencies (none) and referenced projects (none bundled) |
| `CITATION.cff` | how to cite |

## Third-party code

None is bundled. The only runtime is Node.js, installed by the user. Frameworks named in the roadmap (Promptfoo, Inspect AI, OpenTelemetry, Harbor, MCP Inspector, PyRIT, Opik, Phoenix) are **not included**; Phoenix is source-available under the Elastic License 2.0, which is not Apache-2.0, so it must not be copied into this repository.

## Trademark and naming

"EvalSutra", "ArchSutra", "VigilSutra", "RachnaSutra" and "PramanaSutra" are project names by Vatsal Shah. No trademark registration is claimed or verified. A clearance search is advised before commercial branding or an npm scope claim. Names of Claude, Cursor, Codex, Gemini, Copilot and others belong to their owners; EvalSutra is not affiliated with, endorsed by, or sponsored by them. They appear only to say which tools can read the skill format.

## Privacy

EvalSutra collects nothing. It has no telemetry, no analytics, no network access and no accounts. Files you give it stay on your machine. If you publish reports, you are responsible for what they contain. Do not put real personal data or real credentials in fixtures; use synthetic values.

## Responsible use

- Use only on agents and systems you own or are authorised to test.
- Fixtures must be synthetic or licensed. Never commit real secrets or personal data.
- `GO_CANDIDATE` is not a safety certificate and must not be advertised as one.
- No regulatory compliance (for example EU AI Act, ISO 42001, SOC 2) is claimed. Reports can support such work as one input; they do not satisfy it.

## Liability

Apache-2.0 sections 7 and 8 apply: no warranty, no liability for damages. Decisions based on reports are the decision-maker's responsibility.
