# Security policy

## Supported versions
Only the latest 0.x release receives fixes.

## Reporting a vulnerability
Use GitHub **Private vulnerability reporting**: repository **Security** tab, **Report a vulnerability**. Do not open a public issue with exploit details. This is a single-maintainer project: reports are acknowledged as soon as the maintainer sees them, with no guaranteed response time.

## Scope
EvalSutra processes local JSON only. It makes no network calls, executes no target agent and has zero dependencies. In scope: report HTML/XML injection, path traversal or symlink escape in `install`/`uninstall`, unsafe regex handling, secret leakage in reports or capsules, evaluator logic that turns missing evidence into a pass.

## Ground rules
- Never evaluate untrusted code outside an authorized sandbox.
- Treat imported outputs as untrusted data; never render them as raw HTML.
- Keep real secrets and private benchmarks out of issues and pull requests.

Full threat model and known limits: [documents/evalsutra/07-security-and-legal.md](documents/evalsutra/07-security-and-legal.md).
