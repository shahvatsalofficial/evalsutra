# 6. Skills catalog

EvalSutra ships 18 specialist **skills**. A skill is a `SKILL.md` file (YAML `name` and `description`, then instructions) that an AI coding tool loads on demand. Skills are *instructions for the host AI*. They are not programs, they make no model calls of their own, and they do not execute anything by themselves.

## The 18 skills and the CLI support behind each

| Skill | Purpose | CLI support in v0.3 |
|---|---|---|
| `evalsutra-prime` | Plan scoped evaluations, coordinate specialists, deliver a conservative gate | `run`, `gate`, `report`, `matrix` |
| `evalsutra-bench` | Build controlled suites, version fixtures, validate ground truth | `init`, `validate` |
| `evalsutra-truth` | Check answers against trusted references; label subjective cases | `run` (equals, normalized_equals, regex) |
| `evalsutra-trace` | Analyse tool calls, order, permissions, missing trace fields | `trace analyze`, `run` |
| `evalsutra-task` | Check real task artifacts and outcomes, not polished replies | `run` with postcondition output |
| `evalsutra-guard` | Synthetic prompt-injection, tool-abuse and secret-handling checks in isolated fixtures | `trace analyze --forbid`, `run` (not_contains canary) |
| `evalsutra-robust` | Interruption, timeout, retry and recovery evidence | `run` (max_latency_ms, max_steps), `trace analyze` |
| `evalsutra-drift` | Controlled baseline vs candidate regression | `compare` |
| `evalsutra-port` | Report verified capabilities across IDE, OS and runners | `matrix`, `install --dry-run` |
| `evalsutra-judge` | Rubrics and optional LLM-grader bias checks; never passes unsupported findings | none (weak sources cannot pass) |
| `evalsutra-cost` | Tokens, latency, throughput with units and unknowns | `run` (latency only; token cost not implemented) |
| `evalsutra-data` | Fixture provenance, privacy, licence, leakage | `repro export/verify`, `validate` |
| `evalsutra-arena` | Fair paired comparisons, no universal rankings | `compare` |
| `evalsutra-explain` | Root cause with evidence pointers and confidence | `report`, `trace analyze` |
| `evalsutra-audit` | Grader validity, repeatability, gaming risk | `audit`, `repro verify`, `validate` |
| `evalsutra-verify` | Independently re-run checks and gates | `run`, `gate`, `repro verify` |
| `evalsutra-report` | Turn results into accessible reports without changing facts | `report --format md\|html\|junit` |
| `evalsutra-pluginwatch` | Static review of third-party plugin manifests and permissions | none (manual checklist; `audit-plugin` not implemented) |

## What every skill states

Each skill defines: use cases, objective, procedure, input, output, allowed tools, stop conditions, and a handoff contract. All of them share these safety rules: confirm scope and permission first, prefer objective postconditions, label missing data inconclusive, never edit benchmark ground truth, never fabricate scores, never touch real secrets, never silently change security settings. [audit checks K1 to K4]

## Install locations

| Host | Folder | Status |
|---|---|---|
| Claude Code | `.claude/skills/` | file copy tested; live discovery depends on your Claude Code version |
| Cursor | `.cursor/skills/` | file copy tested; live discovery not verified |
| OpenAI Codex | `.agents/skills/` | file copy tested; live discovery not verified |
| Gemini CLI | `.gemini/skills/` | file copy tested; live discovery not verified |
| GitHub Copilot | `.github/skills/` | file copy tested; live discovery not verified |

Run `evalsutra matrix` for the machine-readable version. Host behaviour changes between versions, so check your tool's current documentation.

## Two copies, one source

`.agents/skills/` is canonical. `skills/` is the same content for Claude plugin packaging (`.claude-plugin/plugin.json`). A test fails if the two differ.

## Writing or changing a skill

1. Edit `.agents/skills/<name>/SKILL.md`; keep the `name` equal to the folder name.
2. Copy to `skills/<name>/SKILL.md`.
3. Run `npm test` and `node packages/cli/evalsutra.mjs audit`.
