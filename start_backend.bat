@echo off
REM ShopNest Backend Startup Script (Windows)
echo.
echo ============================
echo  ShopNest Backend Server
echo ============================
echo.

cd /d "%~dp0backend"

REM Check if venv exists
if not exist "venv" (
    echo [1/4] Creating virtual environment...
    python -m venv venv
) else (
    echo [1/4] Virtual environment found.
)

REM Activate venv
echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install deps
echo [3/4] Installing/checking dependencies...
pip install -r requirements.txt -q

REM Run migrations
echo [4/4] Applying database migrations...
python manage.py migrate --no-input

echo.
echo ============================
echo  Backend: http://127.0.0.1:8000
echo  Stop with: Ctrl+C
echo ============================
echo.

python manage.py runserver 8000
