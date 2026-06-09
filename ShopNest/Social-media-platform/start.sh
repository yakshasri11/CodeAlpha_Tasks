#!/bin/bash
echo "⚡ Starting Synvora..."
cd "$(dirname "$0")/backend"
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
if [ ! -f "data/synvora.db" ]; then
  echo "Seeding database..."
  node config/seed.js
fi
echo "Starting server on http://localhost:3001"
node server.js
