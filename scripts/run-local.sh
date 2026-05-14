#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -d node_modules ]; then
  echo "Dependencies are missing. Run: npm install"
  exit 1
fi

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
fi

cleanup() {
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "${FRONTEND_PID:-}" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting backend at http://127.0.0.1:4000"
MONGODB_URI= NODE_ENV=test npm run dev:backend &
BACKEND_PID=$!

echo "Starting frontend at http://localhost:5173"
npm run dev:frontend &
FRONTEND_PID=$!

echo
echo "Rental Property Management is starting."
echo "Frontend: http://localhost:5173/"
echo "Backend:  http://127.0.0.1:4000"
echo
echo "Demo accounts:"
echo "  Admin:  admin / admin123"
echo "  Tenant: 0900000001 / tenant123"
echo
echo "Press Ctrl+C to stop both servers."

wait "$BACKEND_PID" "$FRONTEND_PID"
