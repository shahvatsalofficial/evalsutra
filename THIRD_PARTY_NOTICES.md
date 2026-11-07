# Third-party notices

EvalSutra AI v0.2 has **zero runtime dependencies** and **zero development dependencies**. It uses only the Node.js standard library (`node:fs`, `node:path`, `node:crypto`, `node:url`, `node:os`, `node:test`, `node:child_process` in tests only).

| Component | Where | Licence |
|---|---|---|
| Node.js (runtime, not bundled) | user machine | MIT and others, see nodejs.org |
| GitHub Actions `actions/checkout`, `actions/setup-node` | CI only, not shipped | MIT |

Referenced but **not bundled or copied**: Promptfoo, Inspect AI, OpenTelemetry, Harbor, MCP Inspector, PyRIT, Opik, Arize Phoenix (source-available, Elastic License 2.0, not Apache-2.0). They are roadmap items; no code from them is included.

The Wilson interval and pass@k estimator are implemented from the published formulas (Wilson 1927; Chen et al. 2021, "Evaluating Large Language Models Trained on Code"). Formulas are not copyrightable; no third-party code was copied.

If you add a dependency, update this file in the same pull request.
