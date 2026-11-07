param([Parameter(ValueFromRemainingArguments=$true)][string[]]$ArgsToForward)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
& node (Join-Path $root 'packages/cli/evalsutra.mjs') @ArgsToForward
exit $LASTEXITCODE
