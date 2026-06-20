$ErrorActionPreference = "Stop"

python scripts/validate_pwa.py
if ($LASTEXITCODE -ne 0) {
    throw "PWA validation failed with exit code $LASTEXITCODE"
}

python scripts/build_release.py
if ($LASTEXITCODE -ne 0) {
    throw "Build failed with exit code $LASTEXITCODE"
}
