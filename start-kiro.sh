#!/usr/bin/env bash

DISPLAY_NUM=1
VNC_PORT=5901
NOVNC_PORT="${PORT:-6800}"
NOVNC_PATH="/nix/store/0a18wyirbc3ls9yvlw33lrmql94n2hmc-novnc-1.5.0/share/webapps/novnc"
WEBSOCKIFY="/nix/store/031kfpijr04xpfkps46n3qhqinapw5bi-python3.11-websockify-0.12.0/bin/websockify"

cleanup() {
  pkill -f "Xvfb :${DISPLAY_NUM}" 2>/dev/null || true
  pkill -f "x11vnc" 2>/dev/null || true
  pkill -f "fluxbox" 2>/dev/null || true
  pkill -f "kiro" 2>/dev/null || true
  pkill -f "websockify" 2>/dev/null || true
}
trap cleanup EXIT

rm -f /tmp/.X${DISPLAY_NUM}-lock /tmp/.X11-unix/X${DISPLAY_NUM} 2>/dev/null || true
sleep 0.5

echo "Starting Xvfb on display :${DISPLAY_NUM}..."
Xvfb :${DISPLAY_NUM} -screen 0 1280x800x24 -ac +render -noreset &
XVFB_PID=$!
sleep 2

echo "Starting fluxbox window manager..."
DISPLAY=:${DISPLAY_NUM} fluxbox &
sleep 1

echo "Starting x11vnc on port ${VNC_PORT}..."
DISPLAY=:${DISPLAY_NUM} x11vnc \
  -nopw \
  -listen 0.0.0.0 \
  -rfbport ${VNC_PORT} \
  -forever \
  -shared \
  -noxrecord \
  -noxfixes \
  -noxdamage \
  -quiet \
  2>/dev/null &
sleep 2

echo "Starting noVNC web viewer on port ${NOVNC_PORT}..."
"${WEBSOCKIFY}" \
  --web "${NOVNC_PATH}" \
  --heartbeat 30 \
  0.0.0.0:${NOVNC_PORT} \
  localhost:${VNC_PORT} \
  2>/dev/null &
sleep 1

echo "Starting Kiro IDE..."
DISPLAY=:${DISPLAY_NUM} /home/runner/kiro/kiro \
  --no-sandbox \
  --disable-gpu \
  --disable-gpu-sandbox \
  --disable-dev-shm-usage \
  2>&1 &
KIRO_PID=$!

echo ""
echo "========================================"
echo "Kiro IDE is running!"
echo "VNC port: ${VNC_PORT} (no password)"
echo "noVNC web: http://localhost:${NOVNC_PORT}/vnc.html?autoconnect=1&resize=scale"
echo "========================================"

wait ${KIRO_PID}
