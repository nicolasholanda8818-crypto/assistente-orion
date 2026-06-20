param(
    [switch]$SkipBrowserInstall
)

$ErrorActionPreference = "Stop"

function Invoke-Checked {
    param(
        [scriptblock]$Command
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code $LASTEXITCODE"
    }
}

if (-not $SkipBrowserInstall) {
    Invoke-Checked { python -m playwright install chromium }
}

Invoke-Checked {
    python -m pytest tests/e2e -m e2e --browser chromium --tracing retain-on-failure --screenshot only-on-failure
}
