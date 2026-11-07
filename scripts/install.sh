#!/usr/bin/env sh
set -eu
if ! command -v node >/dev/null 2>&1; then echo 'Node.js 20+ required' >&2; exit 1; fi
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
exec node "$ROOT/packages/cli/evalsutra.mjs" "$@"
