@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% equ 0 (
    py -3 START_LOCAL_SERVER.py
) else (
    python START_LOCAL_SERVER.py
)
if errorlevel 1 echo Install Python 3 or open index.html directly in your browser.
pause
