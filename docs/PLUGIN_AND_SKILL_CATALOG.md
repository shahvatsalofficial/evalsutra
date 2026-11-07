# Plugins, Skills, MCP Servers and Developer Tool Catalog

This is a **recommendation list**, not a record of software installed on this machine. Check the actual Claude/IDE environment, policies, credentials and licenses first. Installation always needs consent for global tools, executables, MCP servers, accounts and cloud connections.

## Claude Code official/marketplace plugins

| Name | Priority | Why |
|---|---|---|
| Superpowers | Essential | TDD, debugging, engineering process |
| Claude Code Setup | Essential | Recommend capabilities appropriate to this repository |
| Feature Dev | Essential | Exploration/implementation/review workflow |
| Code Review | Essential | Independent code reviews |
| Security Guidance | Essential | Defensive coding guidance |
| GitHub | Publish workflow | Issues, PRs and repository management |
| Context7 | Recommended | Current library documentation |
| Playwright | Recommended | Controlled browser end-state evaluation |
| TypeScript LSP | Recommended | Static navigation and type assistance |
| Serena | Recommended | Semantic codebase exploration |
| PR Review Toolkit | Recommended | Multi-dimensional PR assessment |
| CLAUDE.md Management | Recommended | Maintain agent instructions |
| Code Simplifier | Optional | Refactor readability |
| Commit Commands | Optional | Git workflow shortcuts |

Source: https://claude.com/marketplace/plugins and https://support.claude.com/en/articles/13837440-use-plugins-in-claude

## Evaluation tooling, packages and optional services

| Tool | Role | Key needed? |
|---|---|---|
| Promptfoo | Assertions, traces, agent evals, optional red teaming | Depends on provider mode; local fixtures can be keyless |
| Promptfoo Eval Skills | CLI skills for agent eval authoring | No key to install skills; live model calls may need auth |
| Inspect AI | Agent benchmarks and sandbox tests | Depends on target model/runner |
| OpenTelemetry | Interoperable traces | No API key for local collection |
| Playwright | Browser state verification | No AI key; browser dependencies required |
| Docker/Podman | Process/container isolation | No AI key; installation and privileges required |
| Ollama | Local model adapter | No cloud key; local compute/model downloads |
| GitHub Actions | Cross-OS CI tests | GitHub repository/service account required |
| Langfuse, LangSmith, MLflow, DeepEval | Future optional telemetry/eval bridges | Depends on deployment/product |
| OpenAI, Anthropic, Gemini cloud APIs | Future optional server runners or judges | Approved credentials/billing generally required |

Sources: https://www.promptfoo.dev/docs/integrations/agent-skill/ ; https://inspect.aisi.org.uk/agents.html ; https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/ ; https://docs.github.com/en/actions

## Required install safety workflow
1. Run version and installed-plugin inventory commands using *documented* CLI interfaces only.
2. Identify actual missing capability; avoid redundant plugins.
3. Verify official publisher/repository, version, extension permissions, network dependencies, license and maintenance.
4. Prefer project-scoped installation; show exact actions and obtain user approval for executable installations, global changes, external account connections and billing.
5. Smoke-test installation; document removal and fallback instructions.
6. Keep default replay mode fully functional with zero extra plugins or keys.

## Cross-IDE distinction
Portable skills are not full execution engines. Claude: `.claude/skills`; Cursor: `.cursor/skills` or `.agents/skills`; Codex: `.agents/skills`; Gemini: `.gemini/skills` or `.agents/skills`; Copilot: `.github/skills` or `.agents/skills`. Support and host versions must be verified individually, and platform permissions respected.


## November 2026 advanced tooling extension
The current authoritative additional tools, keyless/paid distinctions, risks, and rollout phases are in [`ADVANCED_TOOLING_ROADMAP.md`](ADVANCED_TOOLING_ROADMAP.md). New core priorities: Harbor, MCP Inspector, OpenTelemetry, property-based testing and Gitleaks/OSV; optional later: Opik *or* Phoenix, PyRIT, uv, local analytical stores, npm trusted publication. Never install every plugin without a use case.
