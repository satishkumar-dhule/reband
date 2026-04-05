#!/usr/bin/env bash
set -e

API_DIR="$(cd "$(dirname "$0")" && pwd)"
BINARY="$API_DIR/bin/devprep-api"
GO_BIN="/home/runner/go/bin/go"

export DATABASE_PATH="${DATABASE_PATH:-$API_DIR/../local.db}"
export GO_API_PORT="${GO_API_PORT:-3001}"
export PATH="$PATH:/home/runner/go/bin"

# Build if binary is missing or source is newer
if [ ! -f "$BINARY" ] || [ "$API_DIR/main.go" -nt "$BINARY" ]; then
  echo "[go-api] building..."
  cd "$API_DIR" && "$GO_BIN" build -o bin/devprep-api . 2>&1
  echo "[go-api] build complete"
fi

exec "$BINARY"
