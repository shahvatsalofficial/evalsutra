# 10. CI/CD and release

## Pipeline

Files: `.github/workflows/ci.yml` (tests) and `publish.yml` (npm release). Triggers: push and pull request for CI; a published GitHub release for npm. CI permissions: `contents: read` only. Actions are pinned to full commit SHAs (checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2); Dependabot proposes weekly updates.

| Job | Matrix | Steps |
|---|---|---|
| `tests` | Ubuntu, Windows, macOS × Node 22, 24, 26 | `npm test`, `npm run validate`, `npm run doctor`, `audit`, docs freshness check |

No secrets are used. No network is needed by the tests. A failing job blocks nothing automatically unless branch protection requires it; enable branch protection with the `tests` checks required.

## Lessons recorded

| Incident | Cause | Fix |
|---|---|---|
| 0.3.0 npm package: README demo failed outside a clone; audit L4 failed | demo used repo-relative paths; CONTRIBUTING.md and CODE_OF_CONDUCT.md not in `files` | added `demo` command; added files; tests assert both |
| Windows + Node 20 job failed with `Could not find ...tests\*.test.mjs` | PowerShell does not expand globs and Node 20 does not either | `npm test` now runs `node --test`, which discovers files itself |

## Documentation site

`.github/workflows/pages.yml` deploys the generated HTML (`documents/evalsutra/html`) and evidence to GitHub Pages at https://shahvatsalofficial.github.io/evalsutra/ on every push to main that touches `documents/`. Pages source is set to **GitHub Actions** in repository settings. Always run `node scripts/build-docs.mjs` before committing docs, because the site publishes the committed HTML.

## Release checklist

1. `npm test` green locally.
2. `node packages/cli/evalsutra.mjs audit` is `PASS`.
3. `node scripts/build-docs.mjs` and `node scripts/build-evidence.mjs` re-run; commit results.
4. Update `CHANGELOG.md`, `package.json` version, `.claude-plugin/plugin.json` version, `CITATION.cff`.
5. Push; wait for all CI jobs green.
6. Tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
7. `gh release create vX.Y.Z --notes-file ...`.
8. Optional npm publish (maintainer's account, see below).

## npm publish (maintainer action)

Published as [`evalsutra`](https://www.npmjs.com/package/evalsutra). A manual `npm publish` needs the maintainer's login and two-factor code. The repository also contains `.github/workflows/publish.yml`, which publishes with npm **trusted publishing** (OIDC, provenance, no stored token) when a GitHub release is published. **One-time maintainer setup** on npmjs.com: package `evalsutra`, Settings, Trusted Publisher, GitHub Actions, owner `shahvatsalofficial`, repository `evalsutra`, workflow `publish.yml`. Until that is configured, the workflow fails and the manual route above is the one that works. The workflow has not yet run successfully.

```bash
npm test && node packages/cli/evalsutra.mjs audit   # must be green
npm pack --dry-run                                  # inspect the file list
npm publish --access public
npx -y evalsutra@X.Y.Z doctor                       # verify from a clean folder
```

Verify the published tarball, not just the repo: a clean-folder run of `npx evalsutra demo` and `npx evalsutra audit` found two packaging bugs in 0.3.0 (see Lessons). Prefer npm **trusted publishing** from GitHub Actions (OIDC, provenance) over a long-lived token.

## Versioning

Semantic versioning. 0.x means the CLI and report format may still change; changes are listed in `CHANGELOG.md`. Report `schemaVersion` changes are called out explicitly.

## Hardening backlog

Done: Actions pinned to SHAs, Dependabot for Actions, provenance publish workflow (untested). Still open: dependency review, secret scanning (Gitleaks), CodeQL, OpenSSF Scorecard, SBOM, signed releases. None of the open items is claimed as done.
