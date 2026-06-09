#!/bin/bash
echo "============================"
echo " ShopNest Frontend Server"
echo "============================"
echo "URL: http://localhost:5500"
echo "Stop with: Ctrl+C"
echo ""

cd "$(dirname "$0")/frontend"
python3 -m http.server 5500
