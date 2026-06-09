#!/bin/bash
echo "============================"
echo " ShopNest Backend Server"
echo "============================"

cd "$(dirname "$0")/backend"

if [ ! -d "venv" ]; then
    echo "[1/4] Creating virtual environment..."
    python3 -m venv venv
else
    echo "[1/4] Virtual environment found."
fi

echo "[2/4] Activating virtual environment..."
source venv/bin/activate

echo "[3/4] Installing/checking dependencies..."
pip install -r requirements.txt -q

echo "[4/4] Applying database migrations..."
python manage.py migrate --no-input

echo ""
echo "============================"
echo " Backend: http://127.0.0.1:8000"
echo " Stop with: Ctrl+C"
echo "============================"
echo ""

python manage.py runserver 8000
