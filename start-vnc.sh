#!/usr/bin/env bash
# ============================================================
#  VNC Desktop for Replit  -  powered by tmux + noVNC
#
#  USAGE (run in the Replit Shell tab):
#    bash start-vnc.sh
#
#  Then open the URL shown below in your browser.
#  Press Ctrl+B, D to detach from tmux (keeps running).
#  Run again to re-attach to the running desktop.
# ============================================================

DISPLAY_NUM=1
VNC_PORT=5901
NOVNC_PORT=6080
SESSION="vnc"
NOVNC_PATH="/nix/store/0a18wyirbc3ls9yvlw33lrmql94n2hmc-novnc-1.5.0/share/webapps/novnc"
WEBSOCKIFY="/nix/store/031kfpijr04xpfkps46n3qhqinapw5bi-python3.11-websockify-0.12.0/bin/websockify"
DEV_DOMAIN="${REPLIT_DEV_DOMAIN:-localhost}"

# ---- If already running, just re-attach ----
if tmux has-session -t "${SESSION}" 2>/dev/null; then
  echo ""
  echo "  VNC session already running — re-attaching..."
  echo ""
  echo "  Browser URL:"
  echo "  https://${DEV_DOMAIN}:${NOVNC_PORT}/vnc.html?autoconnect=1&resize=scale"
  echo ""
  echo "  Tip: Ctrl+B, D to detach without stopping the desktop."
  echo ""
  sleep 1
  tmux attach -t "${SESSION}"
  exit 0
fi

echo ""
echo "  Cleaning up any leftover processes..."
rm -f /tmp/.X${DISPLAY_NUM}-lock /tmp/.X11-unix/X${DISPLAY_NUM} 2>/dev/null
pkill -9 -f "Xvfb :${DISPLAY_NUM}" 2>/dev/null
pkill -9 -f "x11vnc" 2>/dev/null
pkill -9 -f "websockify.*${NOVNC_PORT}" 2>/dev/null
sleep 1

echo "  Creating tmux session '${SESSION}'..."
tmux new-session -d -s "${SESSION}" -x 200 -y 50

# Window 0: keeps the session alive and logs status
tmux rename-window -t "${SESSION}:0" "status"

# ---- Start Xvfb in window 1 ----
tmux new-window -t "${SESSION}" -n "xvfb"
tmux send-keys -t "${SESSION}:xvfb" \
  "echo 'Starting Xvfb...' && Xvfb :${DISPLAY_NUM} -screen 0 1280x800x24 -ac +render -noreset" Enter

sleep 3

# ---- Start window manager + terminal in window 2 ----
tmux new-window -t "${SESSION}" -n "desktop"
tmux send-keys -t "${SESSION}:desktop" \
  "export DISPLAY=:${DISPLAY_NUM} && openbox & xterm -geometry 140x40+10+10 -fa 'DejaVu Sans Mono' -fs 10 -title 'Desktop Terminal' && wait" Enter
sleep 1

# ---- Start x11vnc in window 3 ----
tmux new-window -t "${SESSION}" -n "x11vnc"
tmux send-keys -t "${SESSION}:x11vnc" \
  "echo 'Starting x11vnc on port ${VNC_PORT}...' && DISPLAY=:${DISPLAY_NUM} x11vnc -nopw -listen 0.0.0.0 -rfbport ${VNC_PORT} -forever -shared -noxrecord -noxfixes -noxdamage -noscr" Enter
sleep 3

# ---- Start noVNC in window 4 ----
tmux new-window -t "${SESSION}" -n "novnc"
tmux send-keys -t "${SESSION}:novnc" \
  "echo 'Starting noVNC on port ${NOVNC_PORT}...' && '${WEBSOCKIFY}' --web '${NOVNC_PATH}' --heartbeat 30 0.0.0.0:${NOVNC_PORT} localhost:${VNC_PORT}" Enter
sleep 2

# ---- Install Kiro helper window ----
tmux new-window -t "${SESSION}" -n "kiro"
tmux send-keys -t "${SESSION}:kiro" \
  "echo 'Kiro download commands (run these):'; echo '  wget https://desktop-release.kiro.dev/latest/linux/Kiro.AppImage -O ~/Kiro.AppImage'; echo '  chmod +x ~/Kiro.AppImage'; echo '  DISPLAY=:1 ~/Kiro.AppImage --no-sandbox --disable-gpu'" Enter

# ---- Back to status window ----
tmux select-window -t "${SESSION}:status"
tmux send-keys -t "${SESSION}:status" \
  "echo '' && echo '  All VNC windows started!' && echo '' && ps aux | grep -E 'Xvfb|x11vnc|websockify' | grep -v grep && echo ''" Enter

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              VNC Desktop is starting up...               ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                          ║"
printf "║  Open this URL in your browser:                          ║\n"
printf "║                                                          ║\n"
printf "║  https://%-49s║\n" "${DEV_DOMAIN}:${NOVNC_PORT}/vnc.html?autoconnect=1&resize=scale"
echo "║                                                          ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  VNC port: 5901 (no password)                            ║"
echo "║                                                          ║"
echo "║  Inside the VNC desktop, open xterm and run:            ║"
echo "║    wget .../Kiro.AppImage && chmod +x && ./Kiro.AppImage ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  tmux tips:                                              ║"
echo "║    Ctrl+B, D   - detach (desktop keeps running)          ║"
echo "║    Ctrl+B, 1-4 - switch windows (xvfb/desktop/vnc/novnc) ║"
echo "║    Run script again to re-attach                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
sleep 2

# Attach so user can see tmux windows
tmux attach -t "${SESSION}"
