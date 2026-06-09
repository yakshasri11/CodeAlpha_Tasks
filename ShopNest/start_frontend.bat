@echo off
REM ShopNest Frontend Startup Script (Windows)
echo.
echo ============================
echo  ShopNest Frontend Server
echo ============================
echo.
echo Starting frontend at: http://localhost:5500
echo Open browser to: http://localhost:5500
echo Stop with: Ctrl+C
echo.

cd /d "%~dp0frontend"
python -m http.server 5500
