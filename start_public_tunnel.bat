@echo off
setlocal

if "%ORION_LOCAL_URL%"=="" set "ORION_LOCAL_URL=http://127.0.0.1:8000"

echo Starting Orion public HTTPS tunnel for %ORION_LOCAL_URL%
echo Keep this window open while public access is needed.
echo Press Ctrl+C to stop the tunnel.

cloudflared tunnel --url "%ORION_LOCAL_URL%"

endlocal
