param(
    [switch]$SkipInstall,
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

if (-not $SkipInstall) {
    Invoke-Checked { python -m pip install -r requirements-dev.txt }
}

Invoke-Checked { python -m ruff check . }
Invoke-Checked { python -m ruff format --check . }

Get-ChildItem -Path frontend, tests/e2e/static -Recurse -Filter *.js | ForEach-Object {
    Invoke-Checked { node --check $_.FullName }
}

Invoke-Checked { python scripts/validate_pwa.py }
Invoke-Checked { python scripts/generate_wiki.py --check }
Invoke-Checked { python scripts/generate_changelog.py --check }
Invoke-Checked { python -m pytest --ignore=tests/e2e --cov=app --cov-report=term-missing --cov-fail-under=80 }
Invoke-Checked { python scripts/run_performance.py --output .sandbox-tmp/performance.json --fail-on-threshold }
if (-not $SkipBrowserInstall) {
    Invoke-Checked { python -m playwright install chromium }
}
Invoke-Checked {
    python -m pytest tests/e2e -m e2e --browser chromium --tracing retain-on-failure --screenshot only-on-failure
}
Invoke-Checked { python -m bandit -q -r app }
Invoke-Checked { python -m pip_audit -r requirements.txt }
Invoke-Checked { python scripts/check_secrets.py }
Invoke-Checked { python scripts/build_release.py }
