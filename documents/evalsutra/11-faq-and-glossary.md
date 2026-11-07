# 11. FAQ and glossary

## FAQ

**Does EvalSutra run my agent?** No. It grades observations you record. Live execution is planned.

**Does it use AI or send data anywhere?** No. It is deterministic code with no network access.

**Can I trust `GO_CANDIDATE`?** It means your rules were met by the evidence you supplied. It is not approval, safety proof or certification.

**Why is my result `REVIEW` instead of pass?** Some evidence is missing or weak. The reason code in the report says which field.

**Why can a model judge not pass a case?** A judge gives an opinion that can be wrong or biased. Evidence from a judge can reveal a problem but never prove success.

**Is it free for commercial use?** Yes, under Apache-2.0. Keep the licence and NOTICE.

**Which editors does it support?** Skill files install into Claude Code, Cursor, Codex, Gemini CLI and Copilot folders. Only the file copy is verified. Check each tool's current docs for skill discovery.

**Why no dependencies?** Smaller attack surface and instant `npx` start.

**How do I add my own check?** See [Contributor handbook](12-contributor-handbook.md).

**Is it on npm?** Yes: `npx evalsutra` (package `evalsutra`). The GitHub form `npx github:shahvatsalofficial/evalsutra` also works.

**How do I know the samples are not faked?** Every sample file is produced by `scripts/build-evidence.mjs` from the shipped CLI. Re-run it and diff.

**How do I report a bug or vulnerability?** Bugs: GitHub issues. Vulnerabilities: private vulnerability reporting, see [Security and legal](07-security-and-legal.md).

## Glossary

| Term | Meaning |
|---|---|
| Agent | A program that uses an AI model and tools to complete tasks |
| Assertion | One check on one observation |
| Case | A named scenario with one or more assertions |
| Suite | A set of cases plus gate thresholds |
| Observation | Recorded output, tool calls and latency for a case |
| Evidence source | Where an observation came from (`actual_run`, `human_label`, ...) |
| Inconclusive | Not enough evidence to say pass or fail |
| Coverage | Share of assertion weight that could be scored |
| Pass rate | Share of scored weight that passed |
| Critical case | A case whose failure forces `NO_GO` |
| Gate | The overall decision: `NO_GO`, `REVIEW`, `GO_CANDIDATE` |
| Canary | A fake secret planted to see if the agent leaks it |
| Wilson interval | A confidence range for a proportion that behaves well for small samples |
| pass@k | Probability that at least one of k attempts passes |
| Sign test | A test on how many cases got worse versus better |
| Repro capsule | A folder with redacted inputs and a hash manifest |
| Skill | A `SKILL.md` instruction file loaded by an AI tool |
| ReDoS | A regular expression that takes exponential time on crafted input |
| ADR | Architecture decision record |
