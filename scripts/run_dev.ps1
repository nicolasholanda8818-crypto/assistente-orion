$ErrorActionPreference = "Stop"

$PreferredPython = Join-Path $env:LOCALAPPDATA "Python\bin\python.exe"

if (Test-Path $PreferredPython) {
  & $PreferredPython -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
} else {
  python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
}
