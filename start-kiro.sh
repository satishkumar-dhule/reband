#!/usr/bin/env bash
# =============================================================================
# VNC Browser Session - Self-sufficient startup script
# Works on any Replit project that has replit.nix with the required packages.
# All paths are resolved dynamically — no hardcoded Nix store hashes.
# =============================================================================

set -euo pipefail

DISPLAY_NUM=1
VNC_INTERNAL_PORT=5951   # Raw VNC server (internal only)
WS_VNC_PORT=5900         # WebSocket-to-VNC bridge (Replit VNC tab connects here)
NOVNC_PORT=6800          # noVNC browser UI (open in any browser)
APP_URL="${APP_URL:-http://localhost:5000}"

# =============================================================================
# 1. Locate required binaries (all must be in replit.nix deps)
# =============================================================================
require_bin() {
  local bin="$1"
  command -v "$bin" >/dev/null 2>&1 || {
    echo "[vnc] ERROR: '$bin' not found on PATH."
    echo "[vnc] Make sure '$bin' is listed in replit.nix deps."
    exit 1
  }
  echo "[vnc] Found: $bin -> $(command -v $bin)"
}

require_bin Xvfb
require_bin fluxbox
require_bin x11vnc
require_bin chromium
require_bin novnc

# Derive the noVNC web path from the 'novnc' binary real path
NOVNC_BIN_REAL=$(realpath "$(command -v novnc)")
NOVNC_PREFIX=$(dirname "$(dirname "$NOVNC_BIN_REAL")")
NOVNC_WEB="${NOVNC_PREFIX}/share/webapps/novnc"

if [ ! -f "${NOVNC_WEB}/vnc.html" ]; then
  # Fallback: try share/novnc
  NOVNC_WEB="${NOVNC_PREFIX}/share/novnc"
fi
if [ ! -f "${NOVNC_WEB}/vnc.html" ]; then
  echo "[vnc] ERROR: Could not find noVNC web files under ${NOVNC_PREFIX}/share/"
  exit 1
fi
echo "[vnc] noVNC web files: ${NOVNC_WEB}"

# Find websockify — bundled with noVNC or as a standalone command
WEBSOCKIFY=""
if command -v websockify >/dev/null 2>&1; then
  WEBSOCKIFY=$(command -v websockify)
fi
# Fallback: search novnc's own python deps for the wrapped websockify script
if [ -z "$WEBSOCKIFY" ]; then
  WEBSOCKIFY=$(find "${NOVNC_PREFIX}" -name "websockify" ! -name ".*" -type f 2>/dev/null | head -1)
fi
# Last resort: install via pip
if [ -z "$WEBSOCKIFY" ] || [ ! -f "$WEBSOCKIFY" ]; then
  echo "[vnc] websockify not found, installing via pip..."
  pip install websockify -q 2>/dev/null && WEBSOCKIFY=$(command -v websockify 2>/dev/null)
fi
if [ -z "$WEBSOCKIFY" ]; then
  echo "[vnc] ERROR: Could not locate websockify. Add pkgs.novnc to replit.nix."
  exit 1
fi
echo "[vnc] websockify: ${WEBSOCKIFY}"

# =============================================================================
# 2. Cleanup on exit
# =============================================================================
cleanup() {
  echo "[vnc] Shutting down..."
  pkill -f "Xvfb :${DISPLAY_NUM}" 2>/dev/null || true
  pkill -f "x11vnc.*${VNC_INTERNAL_PORT}" 2>/dev/null || true
  pkill -f "fluxbox" 2>/dev/null || true
  pkill -f "chromium" 2>/dev/null || true
  pkill -f "websockify.*${WS_VNC_PORT}" 2>/dev/null || true
  pkill -f "websockify.*${NOVNC_PORT}" 2>/dev/null || true
}
trap cleanup EXIT SIGTERM SIGINT

# Clean up stale X lock files from any previous run
rm -f /tmp/.X${DISPLAY_NUM}-lock /tmp/.X11-unix/X${DISPLAY_NUM} 2>/dev/null || true
sleep 0.3

# =============================================================================
# 3. Start virtual display
# =============================================================================
echo "[vnc] Starting Xvfb on display :${DISPLAY_NUM}..."
Xvfb ":${DISPLAY_NUM}" -screen 0 1280x800x24 -ac +render -noreset 2>/dev/null &
XVFB_PID=$!
sleep 2

echo "[vnc] Starting fluxbox window manager..."
DISPLAY=":${DISPLAY_NUM}" fluxbox 2>/dev/null &
sleep 1

# =============================================================================
# 4. Start raw VNC server (internal only — not exposed to outside)
# =============================================================================
echo "[vnc] Starting x11vnc on internal port ${VNC_INTERNAL_PORT}..."
DISPLAY=":${DISPLAY_NUM}" x11vnc \
  -nopw \
  -listen localhost \
  -rfbport "${VNC_INTERNAL_PORT}" \
  -forever \
  -shared \
  -noxrecord \
  -noxfixes \
  -noxdamage \
  -quiet \
  2>/dev/null &
X11VNC_PID=$!
sleep 2

# =============================================================================
# 5. Start WebSocket bridges
#    Port 5900 → Replit's built-in VNC tab connects here via WebSocket
#    Port 6800 → Full noVNC browser UI (open in any browser tab)
# =============================================================================
echo "[vnc] Starting WebSocket bridge on port ${WS_VNC_PORT} (for Replit VNC tab)..."
"${WEBSOCKIFY}" \
  --heartbeat 30 \
  "0.0.0.0:${WS_VNC_PORT}" \
  "localhost:${VNC_INTERNAL_PORT}" \
  2>/dev/null &
WS_PID=$!

echo "[vnc] Starting noVNC browser UI on port ${NOVNC_PORT}..."
"${WEBSOCKIFY}" \
  --web "${NOVNC_WEB}" \
  --heartbeat 30 \
  "0.0.0.0:${NOVNC_PORT}" \
  "localhost:${VNC_INTERNAL_PORT}" \
  2>/dev/null &
NOVNC_PID=$!

sleep 1

echo ""
echo "============================================================"
echo "[vnc] Replit VNC tab : port ${WS_VNC_PORT}  (WebSocket bridge)"
echo "[vnc] Browser noVNC  : port ${NOVNC_PORT}  (open vnc.html)"
echo "[vnc] App URL        : ${APP_URL}"
echo "============================================================"
echo ""

# =============================================================================
# 6. Wait for the app to be ready, then launch Chromium
# =============================================================================
echo "[vnc] Waiting for app at ${APP_URL}..."
for i in $(seq 1 30); do
  if curl -sf -o /dev/null "${APP_URL}" 2>/dev/null; then
    echo "[vnc] App is ready — launching Chromium..."
    break
  fi
  sleep 1
done

DISPLAY=":${DISPLAY_NUM}" \
LIBGL_ALWAYS_SOFTWARE=1 \
GALLIUM_DRIVER=softpipe \
  chromium \
    --no-sandbox \
    --disable-gpu \
    --disable-gpu-sandbox \
    --disable-dev-shm-usage \
    --disable-accelerated-2d-canvas \
    --disable-software-rasterizer \
    --in-process-gpu \
    --start-maximized \
    "${APP_URL}" \
    2>/dev/null &
CHROMIUM_PID=$!

echo "[vnc] Chromium launched (PID: ${CHROMIUM_PID}) → ${APP_URL}"
echo "[vnc] Click the VNC tab in Replit to see the browser."

# Keep script alive — exit only when the underlying services die
wait "${WS_PID}" "${NOVNC_PID}" "${X11VNC_PID}" "${XVFB_PID}"
