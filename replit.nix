{pkgs}: {
  deps = [
    pkgs.mlocate
    pkgs.openai
    pkgs.nettools
    pkgs.xorg.libXft
    pkgs.xorg.fontmiscmisc
    pkgs.xorg.fontcursormisc
    pkgs.fuse3
    pkgs.curl
    pkgs.wget
    pkgs.procps
    pkgs.xorg.xrandr
    pkgs.xorg.xauth
    pkgs.xterm
    pkgs.openbox
    pkgs.novnc
    pkgs.x11vnc
    pkgs.xorg.xorgserver
  ];
}
