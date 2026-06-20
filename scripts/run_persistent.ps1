$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$PreferredPython = Join-Path $env:LOCALAPPDATA "Python\bin\python.exe"

if (Test-Path $PreferredPython) {
  $Python = $PreferredPython
} else {
  $Python = "python"
}

$HostAddress = $env:ORION_HOST
if ([string]::IsNullOrWhiteSpace($HostAddress)) {
  $HostAddress = "127.0.0.1"
}

$Port = $env:ORION_PORT
if ([string]::IsNullOrWhiteSpace($Port)) {
  $Port = "8000"
}

Write-Host "Orion persistent mode starting at http://$HostAddress`:$Port/"
Write-Host "Press Ctrl+C to stop Orion intentionally."

while ($true) {
  Push-Location $Root
  try {
    & $Python -m uvicorn app.main:app --host $HostAddress --port $Port
  } finally {
    Pop-Location
  }

  Write-Warning "Orion stopped unexpectedly. Restarting in 3 seconds..."
  Start-Sleep -Seconds 3
}
