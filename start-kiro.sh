#!/usr/bin/env bash

DISPLAY_NUM=1
VNC_PORT=5901
NOVNC_PORT=6800
NOVNC_PATH="/nix/store/0a18wyirbc3ls9yvlw33lrmql94n2hmc-novnc-1.5.0/share/webapps/novnc"
WEBSOCKIFY="/nix/store/031kfpijr04xpfkps46n3qhqinapw5bi-python3.11-websockify-0.12.0/bin/websockify"

CHROMIUM="/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium"
MESA_LIB="/nix/store/12hy4z5yyfbnm5rpgvv9g452mvnhrg1i-mesa-21.2.6-drivers/lib"

cleanup() {
  echo "Shutting down..."
  pkill -f "Xvfb :${DISPLAY_NUM}" 2>/dev/null || true
  pkill -f "x11vnc" 2>/dev/null || true
  pkill -f "fluxbox" 2>/dev/null || true
  pkill -f "kiro" 2>/dev/null || true
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
X11VNC_PID=$!
sleep 2

echo "Starting noVNC on port ${NOVNC_PORT}..."
"${WEBSOCKIFY}" \
  --web "${NOVNC_PATH}" \
  --heartbeat 30 \
  0.0.0.0:${NOVNC_PORT} \
  localhost:${VNC_PORT} \
  2>/dev/null &
NOVNC_PID=$!
sleep 1

echo ""
echo "========================================"
echo "noVNC ready on port ${NOVNC_PORT}"
echo "VNC on port ${VNC_PORT} (no password)"
echo "========================================"

# Launch Chromium in the background
echo "Launching Chromium..."
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
    --window-size=900,700 \
    --window-position=350,50 \
    about:blank \
    2>/dev/null &
CHROMIUM_PID=$!
sleep 2

# Launch Kiro in a restart loop — if it crashes, restart after 3s
echo "Launching Kiro IDE (with auto-restart on crash)..."
while true; do
  DISPLAY=:${DISPLAY_NUM} \
  LIBGL_ALWAYS_SOFTWARE=1 \
  GALLIUM_DRIVER=softpipe \
  MESA_GL_VERSION_OVERRIDE=4.5 \
  LIBGL_DRIVERS_PATH="${MESA_LIB}/dri" \
  LD_LIBRARY_PATH="${MESA_LIB}:${LD_LIBRARY_PATH}" \
  DBUS_SESSION_BUS_ADDRESS="" \
    /home/runner/kiro/kiro \
      --no-sandbox \
      --disable-gpu \
      --disable-gpu-sandbox \
      --disable-gpu-compositing \
      --disable-dev-shm-usage \
      --disable-accelerated-2d-canvas \
      --disable-accelerated-video-decode \
      --in-process-gpu \
      --ozone-platform=x11 \
      2>&1 | grep -v "^$" | grep -E "\[main|ERROR|FATAL|Starting|update" || true
  echo "Kiro exited — restarting in 3s..."
  sleep 3
done
