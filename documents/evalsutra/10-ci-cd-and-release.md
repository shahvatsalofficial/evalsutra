# 10. CI/CD and release

## Pipeline

File: `.github/workflows/ci.yml`. Triggers: push, pull request. Permissions: `contents: read` only.

| Job | Matrix | Steps |
|---|---|---|
| `tests` | Ubuntu, Windows, macOS × Node 20, 22, 24 | `npm test`, `npm run validate`, `npm run doctor`, `audit`, docs freshness check |

No secrets are used. No network is needed by the tests. A failing job blocks nothing automatically unless branch protection requires it; enable branch protection with the `tests` checks required.

## Lessons recorded

| Incident | Cause | Fix |
|---|---|---|
| 0.3.0 npm package: README demo failed outside a clone; audit L4 failed | demo used repo-relative paths; CONTRIBUTING.md and CODE_OF_CONDUCT.md not in `files` | added `demo` command; added files; tests assert both |
| Windows + Node 20 job failed with `Could not find ...tests\*.test.mjs` | PowerShell does not expand globs and Node 20 does not either | `npm test` now runs `node --test`, which discovers files itself |

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

Published as [`evalsutra`](https://www.npmjs.com/package/evalsutra) from the maintainer's own npm account. Publishing needs that account's login and two-factor code, so it is always a maintainer step.

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

Pin Actions to commit SHAs, add dependency review, secret scanning (Gitleaks), CodeQL, OpenSSF Scorecard, SBOM, signed releases. None of these is claimed as done.
