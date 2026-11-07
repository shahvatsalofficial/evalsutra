# 12. Contributor handbook

## Set up

```bash
git clone https://github.com/shahvatsalofficial/evalsutra.git
cd evalsutra
npm test
```

Node 20+. No `npm install` is needed because there are no dependencies.

## Layout

```text
packages/cli        command line, installer
packages/core       evaluator, stats, security, trace, capsule
packages/reporters  HTML, JUnit, shared design system
packages/audit      self-audit
.agents/skills      canonical skills   (copy to skills/)
suites examples policies   demo data and gate policy
tests               node:test files
scripts             build-docs, build-evidence, installers
documents/evalsutra this documentation (Markdown source, html/ generated)
```

## Rules of the project

1. **Evidence first.** Missing data is inconclusive. Never turn unknown into pass.
2. **No dependencies** without a written reason in `THIRD_PARTY_NOTICES.md`.
3. **No network, process or dynamic-code APIs** in `packages/`. The audit enforces this.
4. **Every behaviour change has a test** and, if it is a grader rule, an audit `KNOWN` row.
5. **Docs say only what is verified.** Planned work is labelled planned.
6. **Synthetic fixtures only.** No real secrets, personal data or unlicensed content.

## Add an assertion type

1. `evaluate.mjs`: add the name to the type lists; validate its fields in `validateSuite`; implement it in `evaluateAssertion`.
2. Add rows to `KNOWN` in `packages/audit/audit.mjs`: pass, fail and missing evidence.
3. Add tests in `tests/`.
4. Document it in [Functional specification](02-functional-specification.md) and [Technical reference](04-technical-reference.md).

## Add a skill

Create `.agents/skills/evalsutra-<name>/SKILL.md` with frontmatter and the sections Objective, Procedure, Contract, Stop conditions; copy to `skills/`. Update [Skills catalog](06-skills-catalog.md) and the count checks (K1, tests, docs).

## Rebuild generated files

```bash
node scripts/build-docs.mjs        # HTML from Markdown
node scripts/build-evidence.mjs    # test run, samples, audit
```

CI fails if docs HTML is stale.

## Pull request checklist

- [ ] `npm test` passes
- [ ] `audit` is `PASS`
- [ ] docs and evidence rebuilt
- [ ] `CHANGELOG.md` updated
- [ ] no secrets, no new dependencies
- [ ] claims in docs match what the code does

## Commit and review

Small commits, imperative subject. Maintainer review is required before release. See `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` in the repository root.
