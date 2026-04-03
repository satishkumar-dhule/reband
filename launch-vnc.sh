#!/usr/bin/env bash
# Daemonized VNC launcher using setsid for full terminal detachment

DISPLAY_NUM=1
VNC_PORT=5901
NOVNC_PORT=6080
NOVNC_PATH="/nix/store/0a18wyirbc3ls9yvlw33lrmql94n2hmc-novnc-1.5.0/share/webapps/novnc"
WEBSOCKIFY="/nix/store/031kfpijr04xpfkps46n3qhqinapw5bi-python3.11-websockify-0.12.0/bin/websockify"
LOG="/tmp/vnc-full.log"

echo "==> Killing old VNC processes..."
pkill -9 -f "Xvfb :${DISPLAY_NUM}" 2>/dev/null
pkill -9 -f "x11vnc" 2>/dev/null
pkill -9 -f "websockify.*${NOVNC_PORT}" 2>/dev/null
pkill -9 -f "openbox" 2>/dev/null
rm -f /tmp/.X${DISPLAY_NUM}-lock /tmp/.X11-unix/X${DISPLAY_NUM} 2>/dev/null
sleep 1

echo "==> Starting Xvfb..."
setsid nohup Xvfb :${DISPLAY_NUM} -screen 0 1280x800x24 -ac +render -noreset \
  > "${LOG}" 2>&1 < /dev/null &
XVFB_PID=$!
echo $XVFB_PID > /tmp/xvfb.pid
echo "    Xvfb PID: $XVFB_PID"
sleep 3

echo "==> Starting openbox..."
setsid nohup env DISPLAY=:${DISPLAY_NUM} openbox \
  >> "${LOG}" 2>&1 < /dev/null &
echo $! > /tmp/openbox.pid
echo "    openbox PID: $!"
sleep 1

echo "==> Starting xterm..."
setsid nohup env DISPLAY=:${DISPLAY_NUM} xterm \
  -geometry 140x40+10+10 -fa "DejaVu Sans Mono" -fs 10 \
  -title "VNC Terminal" \
  >> "${LOG}" 2>&1 < /dev/null &
echo "    xterm PID: $!"
sleep 1

echo "==> Starting x11vnc..."
setsid nohup env DISPLAY=:${DISPLAY_NUM} x11vnc \
  -nopw -listen 0.0.0.0 -rfbport ${VNC_PORT} \
  -forever -shared -noxrecord -noxfixes -noxdamage -noscr \
  >> "${LOG}" 2>&1 < /dev/null &
X11VNC_PID=$!
echo $X11VNC_PID > /tmp/x11vnc.pid
echo "    x11vnc PID: $X11VNC_PID"
sleep 4

echo "==> Starting noVNC websockify on port ${NOVNC_PORT}..."
setsid nohup "${WEBSOCKIFY}" \
  --web "${NOVNC_PATH}" \
  --heartbeat 30 \
  0.0.0.0:${NOVNC_PORT} localhost:${VNC_PORT} \
  >> "${LOG}" 2>&1 < /dev/null &
NOVNC_PID=$!
echo $NOVNC_PID > /tmp/novnc.pid
echo "    noVNC PID: $NOVNC_PID"
sleep 2

echo ""
echo "==> All processes launched!"
echo ""
echo "======================================================="
echo " VNC Desktop Ready"
echo "======================================================="
echo " Open noVNC in browser on port: ${NOVNC_PORT}"
echo " URL path: /vnc.html?autoconnect=1&resize=scale"
echo " VNC direct port: ${VNC_PORT} (no password)"
echo "======================================================="
echo ""
echo "==> Process status:"
ps aux | grep -E "Xvfb|x11vnc|websockify|openbox" | grep -v grep
echo ""
echo "==> Log file: ${LOG}"
echo "==> To check: cat /tmp/vnc-full.log"
