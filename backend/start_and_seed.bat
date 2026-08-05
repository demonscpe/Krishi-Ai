@echo off
cd /d "%~dp0"
echo === Killing port 8080 ===
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
  echo Killing PID %%a
  taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo === Starting server ===
start "krishi-backend" cmd /k "node server.js > server_run4.log 2>&1"
timeout /t 14 /nobreak >nul
echo === Running seed verify ===
node test_seed_verify.js
echo === DONE ===
