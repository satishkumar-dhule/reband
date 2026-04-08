#!/usr/bin/env bash

DISPLAY_NUM=1
# x11vnc raw VNC on an internal-only port
VNC_INTERNAL_PORT=5951
# Replit's VNC tab connects to port 5900 via WebSocket — put websockify here
WS_VNC_PORT=5900
# noVNC web browser access
NOVNC_PORT=6800

NOVNC_PATH="/nix/store/0a18wyirbc3ls9yvlw33lrmql94n2hmc-novnc-1.5.0/share/webapps/novnc"
WEBSOCKIFY="/nix/store/031kfpijr04xpfkps46n3qhqinapw5bi-python3.11-websockify-0.12.0/bin/websockify"

CHROMIUM="/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium"
MESA_LIB="/nix/store/12hy4z5yyfbnm5rpgvv9g452mvnhrg1i-mesa-21.2.6-drivers/lib"

APP_URL="${APP_URL:-http://localhost:5000}"

cleanup() {
  echo "Shutting down..."
  pkill -f "Xvfb :${DISPLAY_NUM}" 2>/dev/null || true
  pkill -f "x11vnc" 2>/dev/null || true
  pkill -f "fluxbox" 2>/dev/null || true
  pkill -f "chromium" 2>/dev/null || true
  pkill -f "websockify" 2>/dev/null || true
}
trap cleanup EXIT SIGTERM SIGINT

# Clean up any stale lock files
rm -f /tmp/.X${DISPLAY_NUM}-lock /tmp/.X11-unix/X${DISPLAY_NUM} 2>/dev/null || true
sleep 0.3

echo "Starting Xvfb on display :${DISPLAY_NUM}..."
Xvfb :${DISPLAY_NUM} -screen 0 1280x800x24 -ac +render -noreset &
XVFB_PID=$!
sleep 2

echo "Starting fluxbox window manager..."
DISPLAY=:${DISPLAY_NUM} fluxbox 2>/dev/null &
sleep 1

echo "Starting x11vnc on internal port ${VNC_INTERNAL_PORT}..."
DISPLAY=:${DISPLAY_NUM} x11vnc \
  -nopw \
  -listen localhost \
  -rfbport ${VNC_INTERNAL_PORT} \
  -forever \
  -shared \
  -noxrecord \
  -noxfixes \
  -noxdamage \
  -quiet \
  2>/dev/null &
X11VNC_PID=$!
sleep 2

# websockify on port 5900 — Replit's VNC tab connects here via WebSocket
echo "Starting websockify WebSocket bridge on port ${WS_VNC_PORT}..."
"${WEBSOCKIFY}" \
  --heartbeat 30 \
  0.0.0.0:${WS_VNC_PORT} \
  localhost:${VNC_INTERNAL_PORT} \
  2>/dev/null &
WS_PID=$!

# websockify + noVNC on port 6800 — full browser access via noVNC UI
echo "Starting noVNC on port ${NOVNC_PORT}..."
"${WEBSOCKIFY}" \
  --web "${NOVNC_PATH}" \
  --heartbeat 30 \
  0.0.0.0:${NOVNC_PORT} \
  localhost:${VNC_INTERNAL_PORT} \
  2>/dev/null &
NOVNC_PID=$!
sleep 1

echo ""
echo "========================================"
echo "VNC WebSocket bridge: port ${WS_VNC_PORT}  ← Replit VNC tab"
echo "noVNC browser UI:     port ${NOVNC_PORT}  ← open in browser"
echo "App URL: ${APP_URL}"
echo "========================================"

# Wait for the app to be ready before launching Chromium
echo "Waiting for app on ${APP_URL}..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null "${APP_URL}" 2>/dev/null; then
    echo "App is ready!"
    break
  fi
  sleep 1
done

# Launch Chromium pointing to the app
echo "Launching Chromium at ${APP_URL}..."
DISPLAY=:${DISPLAY_NUM} \
LIBGL_ALWAYS_SOFTWARE=1 \
GALLIUM_DRIVER=softpipe \
LIBGL_DRIVERS_PATH="${MESA_LIB}/dri" \
LD_LIBRARY_PATH="${MESA_LIB}:${LD_LIBRARY_PATH}" \
  "${CHROMIUM}" \
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

echo "Browser running (PID: ${CHROMIUM_PID})"
echo "Replit VNC tab should now connect successfully on port ${WS_VNC_PORT}"

# Keep script alive
wait $WS_PID $NOVNC_PID $X11VNC_PID $XVFB_PID
