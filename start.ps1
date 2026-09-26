param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 4173,
    [switch]$Check
)

$ErrorActionPreference = 'Stop'
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand) {
    $pythonCommand = Get-Command py -ErrorAction SilentlyContinue
}
if (-not $pythonCommand) {
    throw 'Python 3 is required. Install Python, then run this script again.'
}

if ($Check) {
    & $pythonCommand.Source (Join-Path $PSScriptRoot 'scripts/verify.py')
} else {
    & $pythonCommand.Source (Join-Path $PSScriptRoot 'scripts/serve.py') --port $Port
}
exit $LASTEXITCODE
