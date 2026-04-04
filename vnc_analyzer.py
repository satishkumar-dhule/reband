"""
VNC Protocol Analyzer - Educational Security Research Tool
=========================================================

A comprehensive implementation guide for analyzing VNC sessions.
This tool is intended for:
- Security auditing and research
- Network debugging and monitoring
- Protocol education and analysis
- Testing VNC server configurations

Author: Security Research Team
License: Educational/Research Use Only
"""

import socket
import struct
import zlib
import io
import threading
import time
import logging
from enum import IntEnum
from dataclasses import dataclass
from typing import Optional, Tuple, List, Dict, Any
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# SECTION 1: RFB Protocol Constants and Enums
# =============================================================================


class RFBVersion(IntEnum):
    """RFB Protocol Versions"""

    RFB_3_3 = 33
    RFB_3_7 = 37
    RFB_3_8 = 38
    RFB_3_12 = 312


class SecurityType(IntEnum):
    """VNC Authentication Types"""

    INVALID = 0
    NONE = 1
    VNC_AUTH = 2
    RA2 = 5
    RA2NE = 6
    TIGHT = 16
    ULTRA = 17
    TLS = 18
    VENCRYPT = 19


class MsgTypeServer(IntEnum):
    """Server to Client Message Types"""

    FRAMEBUFFER_UPDATE = 0
    SET_COLOR_MAP = 1
    BELL = 2
    SERVER_CUT_TEXT = 3
    RICH_CUT_TEXT = 4


class MsgTypeClient(IntEnum):
    """Client to Server Message Types"""

    SET_PIXEL_FORMAT = 0
    SET_ENCODINGS = 2
    FRAMEBUFFER_UPDATE_REQUEST = 3
    KEY_EVENT = 4
    POINTER_EVENT = 5
    CUT_TEXT = 6


class EncodingType(IntEnum):
    """Framebuffer Encoding Types"""

    RAW = 0
    COPY_RECT = 1
    RRE = 2
    HEXTILE = 5
    ZLIB = 6
    TIGHT = 7
    ZLIB_HEXTILE = 8
    JPEG = 21
    JRLE = 22
    ANTIQUE_ZLIB = 23
    BACK_FG_COLOR = 33
    LAST_FG_COLOR = 34
    NEW_FG_COLOR = 35
    NEW_BG_COLOR = 36
    USER_FG_COLOR = 37
    USER_BG_COLOR = 38
    USER_CLR = 39
    XOR_ZLIB = 40
    CORRE = 16
    SOLID_COLOR = 25


@dataclass
class PixelFormat:
    """RFB Pixel Format Structure"""

    bits_per_pixel: int
    depth: int
    big_endian: bool
    true_color: bool
    red_max: int
    green_max: int
    blue_max: int
    red_shift: int
    green_shift: int
    blue_shift: int
    padding: bytes = None

    @classmethod
    def from_bytes(cls, data: bytes) -> "PixelFormat":
        """Parse pixel format from 16-byte RFB structure"""
        bits_per_pixel, depth, big_endian_flag = struct.unpack("!BBB", data[:3])
        big_endian = bool(big_endian_flag)
        true_color_flag = data[3]
        true_color = bool(true_color_flag)
        red_max, green_max, blue_max = struct.unpack("!HHH", data[4:10])
        red_shift, green_shift, blue_shift = struct.unpack("!BBB", data[10:13])
        return cls(
            bits_per_pixel=bits_per_pixel,
            depth=depth,
            big_endian=big_endian,
            true_color=true_color,
            red_max=red_max,
            green_max=green_max,
            blue_max=blue_max,
            red_shift=red_shift,
            green_shift=green_shift,
            blue_shift=blue_shift,
        )

    def to_bytes(self) -> bytes:
        """Serialize pixel format to bytes"""
        padding = b"\x00" * 3
        return (
            struct.pack(
                "!BBBBHHHBBB",
                self.bits_per_pixel,
                self.depth,
                int(self.big_endian),
                int(self.true_color),
                self.red_max,
                self.green_max,
                self.blue_max,
                self.red_shift,
                self.green_shift,
                self.blue_shift,
            )
            + padding
        )


@dataclass
class Rectangle:
    """Framebuffer Rectangle"""

    x: int
    y: int
    width: int
    height: int
    encoding: int
    data: bytes = None


# =============================================================================
# SECTION 2: VNC Client Implementation
# =============================================================================


class VNCClient:
    """
    Basic VNC Client for connecting to VNC servers.

    Supports:
    - Protocol version negotiation
    - Authentication handling (None, VNC Auth)
    - Framebuffer updates (Raw, CopyRect, Tight encodings)
    - Pixel format configuration
    """

    def __init__(
        self,
        host: str = "localhost",
        port: int = 5900,
        password: Optional[str] = None,
        verbose: bool = True,
    ):
        self.host = host
        self.port = port
        self.password = password or ""
        self.verbose = verbose

        self.socket: Optional[socket.socket] = None
        self.connected = False
        self.version: Optional[RFBVersion] = None
        self.security_type: Optional[SecurityType] = None

        self.pixel_format = PixelFormat(
            bits_per_pixel=32,
            depth=24,
            big_endian=False,
            true_color=True,
            red_max=255,
            green_max=255,
            blue_max=255,
            red_shift=16,
            green_shift=8,
            blue_shift=0,
        )

        self.framebuffer_width = 0
        self.framebuffer_height = 0
        self.framebuffer: Optional[bytearray] = None

        self.frame_callback = None
        self._running = False
        self._receive_thread: Optional[threading.Thread] = None

        self.stats = {
            "bytes_received": 0,
            "frames_received": 0,
            "rectangles_decoded": 0,
            "encoding_types": defaultdict(int),
            "start_time": None,
        }

    def log(self, message: str, level: str = "info"):
        """Log message if verbose mode is enabled"""
        if self.verbose:
            getattr(logger, level)(message)

    def connect(self) -> bool:
        """Establish connection to VNC server"""
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.settimeout(30.0)
            self.socket.connect((self.host, self.port))
            self.connected = True
            self.stats["start_time"] = time.time()
            self.log(f"Connected to {self.host}:{self.port}")

            if not self._protocol_handshake():
                return False

            if not self._security_handshake():
                return False

            self._initFramebuffer()

            return True

        except Exception as e:
            self.log(f"Connection failed: {e}", "error")
            return False

    def _protocol_handshake(self) -> bool:
        """Perform RFB protocol version handshake"""
        version_str = self.socket.recv(12).decode("ascii")
        self.log(f"Server version: {version_str.strip()}")

        # Determine highest supported version
        if "3.12" in version_str:
            self.version = RFBVersion.RFB_3_12
        elif "3.8" in version_str:
            self.version = RFBVersion.RFB_3_8
        elif "3.7" in version_str:
            self.version = RFBVersion.RFB_3_7
        else:
            self.version = RFBVersion.RFB_3_3

        # Send version response
        version_response = f"RFB 003.00{self.version.value // 100}\n"
        self.socket.send(version_response.encode("ascii"))
        self.log(f"Client version: {version_response.strip()}")

        return True

    def _security_handshake(self) -> bool:
        """Handle security handshake and authentication"""
        # Read number of security types
        num_types = self.socket.recv(1)[0]

        if num_types == 0:
            # Connection failed
            reason_len = struct.unpack("!I", self.socket.recv(4))[0]
            reason = self.socket.recv(reason_len).decode("utf-8")
            self.log(f"Security handshake failed: {reason}", "error")
            return False

        # Read available security types
        security_types = list(self.socket.recv(num_types))
        self.log(
            f"Available security types: {[SecurityType(t).name for t in security_types]}"
        )

        # Prefer None auth, then VNC auth
        if SecurityType.NONE in security_types:
            self.security_type = SecurityType.NONE
        elif SecurityType.VNC_AUTH in security_types:
            self.security_type = SecurityType.VNC_AUTH
        else:
            self.security_type = SecurityType(security_types[0])

        self.log(f"Selected security type: {self.security_type.name}")
        self.socket.send(struct.pack("!B", self.security_type))

        if self.security_type == SecurityType.VNC_AUTH:
            return self._vnc_authenticate()

        # Wait for security result
        result = struct.unpack("!I", self.socket.recv(4))[0]
        if result != 0:
            self.log("Security authentication failed", "error")
            return False

        self.log("Security handshake successful")
        return True

    def _vnc_authenticate(self) -> bool:
        """Perform VNC challenge-response authentication"""
        challenge = self.socket.recv(16)
        self.log(f"Received VNC auth challenge")

        # Simple DES-like encryption (for educational purposes)
        password = (self.password + "\0" * 8)[:8]
        password_bytes = password.encode("latin-1")

        # VNC uses DES encryption - simplified implementation
        response = self._vncauth_encrypt(password_bytes, challenge)

        self.socket.send(response)
        self.log("Sent VNC auth response")

        result = struct.unpack("!I", self.socket.recv(4))[0]
        if result != 0:
            self.log(f"VNC authentication failed with code: {result}", "error")
            return False

        return True

    def _vncauth_encrypt(self, password: bytes, challenge: bytes) -> bytes:
        """VNC DES encryption (educational implementation)"""

        def expand_and_permute(key: bytes, data: bytes) -> bytes:
            """Simplified DES-like transformation"""
            result = bytearray(8)
            for i in range(8):
                result[i] = data[i] ^ key[i]
            return bytes(result)

        # Simplified VNC auth encryption
        # In production, use proper DES library
        output = bytearray(16)
        for i in range(8):
            output[i] = challenge[i] ^ password[i % 8]
        for i in range(8, 16):
            output[i] = challenge[i] ^ password[(i + 5) % 8]

        return bytes(output)

    def _initFramebuffer(self):
        """Initialize framebuffer parameters"""
        # Send SetPixelFormat message
        self.socket.send(struct.pack("!B", 0))  # Message type
        self.socket.send(b"\x00" * 3)  # Padding
        self.socket.send(self.pixel_format.to_bytes())

        # Send SetEncodings message (preferred order)
        encodings = [
            EncodingType.TIGHT,
            EncodingType.HEXTILE,
            EncodingType.ZLIB,
            EncodingType.COPY_RECT,
            EncodingType.RAW,
        ]
        encodings_data = struct.pack("!B", 2)  # Message type
        encodings_data += struct.pack("!H", len(encodings))
        encodings_data += b"".join(struct.pack("!i", e) for e in encodings)
        self.socket.send(encodings_data)

        # Read ServerInit message
        self.framebuffer_width, self.framebuffer_height = struct.unpack(
            "!HH", self.socket.recv(4)
        )
        self.log(
            f"Framebuffer size: {self.framebuffer_width}x{self.framebuffer_height}"
        )

        # Read pixel format from ServerInit
        pf_data = self.socket.recv(16)
        self.pixel_format = PixelFormat.from_bytes(pf_data)

        # Read desktop name length
        name_len = struct.unpack("!I", self.socket.recv(4))[0]
        desktop_name = self.socket.recv(name_len).decode("utf-8", errors="replace")
        self.log(f"Desktop name: {desktop_name}")

        # Initialize framebuffer
        buffer_size = self.framebuffer_width * self.framebuffer_height * 4
        self.framebuffer = bytearray(buffer_size)

        self.log("Framebuffer initialized successfully")

    def start_capture(self, frame_callback=None):
        """Start capturing frames from VNC server"""
        self.frame_callback = frame_callback
        self._running = True

        # Request initial framebuffer update
        self._request_update(incremental=False)

        # Start receive thread
        self._receive_thread = threading.Thread(target=self._receive_loop, daemon=True)
        self._receive_thread.start()

        self.log("Frame capture started")

    def stop_capture(self):
        """Stop capturing frames"""
        self._running = False
        self.connected = False
        if self.socket:
            self.socket.close()
        self.log("Frame capture stopped")

    def _request_update(
        self,
        incremental: bool = True,
        x: int = 0,
        y: int = 0,
        width: int = None,
        height: int = None,
    ):
        """Send framebuffer update request"""
        width = width or self.framebuffer_width
        height = height or self.framebuffer_height

        request = struct.pack("!B", MsgTypeClient.FRAMEBUFFER_UPDATE_REQUEST)
        request += struct.pack("!B", 1 if incremental else 0)
        request += struct.pack("!HHHH", x, y, width, height)
        self.socket.send(request)

    def _receive_loop(self):
        """Main loop for receiving server messages"""
        while self._running and self.connected:
            try:
                self.socket.settimeout(5.0)
                msg_type = self.socket.recv(1)

                if not msg_type:
                    break

                self.stats["bytes_received"] += 1
                msg_type = msg_type[0]

                if msg_type == MsgTypeServer.FRAMEBUFFER_UPDATE:
                    self._handle_framebuffer_update()
                elif msg_type == MsgTypeServer.SET_COLOR_MAP:
                    self._handle_color_map()
                elif msg_type == MsgTypeServer.BELL:
                    self.log("Bell received")
                elif msg_type == MsgTypeServer.SERVER_CUT_TEXT:
                    self._handle_cut_text()

            except socket.timeout:
                # Send keepalive request
                self._request_update()
                continue
            except Exception as e:
                if self._running:
                    self.log(f"Receive error: {e}", "error")
                break

        self.connected = False

    def _handle_framebuffer_update(self):
        """Handle framebuffer update message"""
        # Read number of rectangles
        num_rects = struct.unpack("!H", self.socket.recv(2))[0]
        self.stats["frames_received"] += 1

        for _ in range(num_rects):
            rectangle = self._read_rectangle()
            if rectangle:
                self._decode_rectangle(rectangle)
                self.stats["rectangles_decoded"] += 1
                self.stats["encoding_types"][rectangle.encoding] += 1

        # Request next update
        self._request_update()

    def _read_rectangle(self) -> Optional[Rectangle]:
        """Read rectangle header from stream"""
        try:
            header = self.socket.recv(12)
            if len(header) < 12:
                return None

            x, y, width, height, encoding = struct.unpack("!HHHHi", header)
            return Rectangle(x, y, width, height, encoding)
        except Exception as e:
            self.log(f"Error reading rectangle: {e}", "error")
            return None

    def _decode_rectangle(self, rect: Rectangle):
        """Decode rectangle data based on encoding type"""
        start_pos = 0

        if rect.encoding == EncodingType.RAW:
            data = self._read_rect_data(rect)
            self._decode_raw(rect, data)

        elif rect.encoding == EncodingType.COPY_RECT:
            data = self.socket.recv(4)
            src_x, src_y = struct.unpack("!HH", data)
            self._decode_copyrect(rect, src_x, src_y)

        elif rect.encoding == EncodingType.TIGHT:
            self._decode_tight(rect)

        elif rect.encoding == EncodingType.ZLIB:
            data_len = struct.unpack("!I", self.socket.recv(4))[0]
            data = self.socket.recv(data_len)
            decompressed = zlib.decompress(data)
            self._decode_raw(rect, decompressed)

        elif rect.encoding == EncodingType.HEXTILE:
            self._decode_hextile(rect)

        else:
            self.log(f"Unknown encoding: {rect.encoding}", "warning")

    def _read_rect_data(self, rect: Rectangle) -> bytes:
        """Calculate and read rectangle data size"""
        bytes_per_pixel = self.pixel_format.bits_per_pixel // 8
        data_size = rect.width * rect.height * bytes_per_pixel
        return self.socket.recv(data_size)

    def _decode_raw(self, rect: Rectangle, data: bytes):
        """Decode RAW encoding - simple pixel data"""
        bytes_per_pixel = self.pixel_format.bits_per_pixel // 8

        for y in range(rect.height):
            for x in range(rect.width):
                pixel_offset = ((rect.y + y) * self.framebuffer_width + rect.x + x) * 4

                src_offset = (y * rect.width + x) * bytes_per_pixel

                if self.pixel_format.bits_per_pixel == 32:
                    b, g, r, a = data[src_offset : src_offset + 4]
                else:
                    b = data[src_offset]
                    if bytes_per_pixel > 1:
                        g = data[src_offset + 1]
                    else:
                        g = b
                    if bytes_per_pixel > 2:
                        r = data[src_offset + 2]
                    else:
                        r = b
                    a = 255

                if pixel_offset + 4 <= len(self.framebuffer):
                    self.framebuffer[pixel_offset : pixel_offset + 4] = [r, g, b, a]

        if self.frame_callback:
            self.frame_callback(rect, self.framebuffer.copy())

    def _decode_copyrect(self, rect: Rectangle, src_x: int, src_y: int):
        """Decode CopyRect encoding - copy from another region"""
        for y in range(rect.height):
            for x in range(rect.width):
                src_offset = ((src_y + y) * self.framebuffer_width + src_x + x) * 4
                dst_offset = ((rect.y + y) * self.framebuffer_width + rect.x + x) * 4

                self.framebuffer[dst_offset : dst_offset + 4] = self.framebuffer[
                    src_offset : src_offset + 4
                ]

        if self.frame_callback:
            self.frame_callback(rect, self.framebuffer.copy())

    def _decode_tight(self, rect: Rectangle):
        """Decode Tight encoding - compression with filters"""
        compression_control = self.socket.recv(1)[0]

        # Extract compression type and filter
        comp_type = compression_control & 0x0F
        filter_id = (compression_control >> 6) & 0x03

        # Read filter-specific data if needed
        if filter_id == 1:  # Palette filter
            palette_size = self.socket.recv(1)[0] + 1
            palette = [
                self.socket.recv(self.pixel_format.bits_per_pixel // 8)
                for _ in range(palette_size)
            ]
        elif filter_id == 2:  # Gradient filter
            # Read gradient filter data
            pass

        # Read compressed data size(s)
        data_size_bytes = []
        for _ in range(4):
            byte = self.socket.recv(1)[0]
            data_size_bytes.append(byte)
            if byte < 128:
                break

        # Calculate total data size
        data_size = 0
        for i, b in enumerate(data_size_bytes):
            data_size |= (b & 0x7F) << (7 * i)

        # Read and decompress data
        compressed_data = self.socket.recv(data_size)

        if comp_type == 0 and data_size > 0:
            # No compression, raw palette data
            self._decode_tight_raw(rect, compressed_data, palette_size)
        else:
            # Zlib compressed
            try:
                decompressed = zlib.decompress(compressed_data)
                self._decode_tight_decompressed(
                    rect, decompressed, palette_size, filter_id
                )
            except:
                # Try with different wbits
                try:
                    decompressed = zlib.decompress(compressed_data, wbits=15)
                    self._decode_tight_decompressed(
                        rect, decompressed, palette_size, filter_id
                    )
                except:
                    self.log("Tight decompression failed", "warning")

    def _decode_tight_raw(self, rect: Rectangle, data: bytes, palette_size: int):
        """Decode Tight raw/palette data"""
        if palette_size <= 2:
            # 1-bit palette
            idx = 0
            for y in range(rect.height):
                for x in range(0, rect.width, 8):
                    byte = data[idx] if idx < len(data) else 0
                    idx += 1
                    for bit in range(8):
                        if x + bit < rect.width and idx < len(data):
                            self._set_pixel(
                                rect.x + x + bit,
                                rect.y + y,
                                data[idx - 1] & (1 << (7 - bit)),
                            )
        else:
            # Multi-color palette
            bytes_per_pixel = self.pixel_format.bits_per_pixel // 8
            idx = 0
            for y in range(rect.height):
                for x in range(rect.width):
                    if bytes_per_pixel > 1:
                        color_idx = data[idx] if idx < len(data) else 0
                        idx += 1
                        self._set_pixel_simple(
                            rect.x + x, rect.y + y, color_idx * bytes_per_pixel
                        )

    def _decode_tight_decompressed(
        self, rect: Rectangle, data: bytes, palette_size: int, filter_id: int
    ):
        """Decode decompressed Tight data"""
        self._decode_tight_raw(rect, data, palette_size)

    def _decode_hextile(self, rect: Rectangle):
        """Decode Hextile encoding"""
        bytes_per_pixel = self.pixel_format.bits_per_pixel // 8

        for ty in range(0, rect.height, 16):
            for tx in range(0, rect.width, 16):
                tile_w = min(16, rect.width - tx)
                tile_h = min(16, rect.height - ty)

                subencoding = self.socket.recv(1)[0]

                raw = bool(subencoding & 1)
                background_specified = bool(subencoding & 2)
                foreground_specified = bool(subencoding & 4)
                subrects_colored = bool(subencoding & 8)
                subrectsIncluded = bool(subencoding & 16)

                bg_color = None
                fg_color = None

                if background_specified:
                    bg_color = self.socket.recv(bytes_per_pixel)
                if foreground_specified:
                    fg_color = self.socket.recv(bytes_per_pixel)

                if raw:
                    tile_data = self.socket.recv(tile_w * tile_h * bytes_per_pixel)
                    self._decode_raw_tile(
                        rect.x + tx, rect.y + ty, tile_w, tile_h, tile_data
                    )
                elif subrectsIncluded:
                    num_subrects = self.socket.recv(1)[0]
                    subrects = []
                    for _ in range(num_subrects):
                        subrect_data = self.socket.recv(bytes_per_pixel + 2)
                        coords = self.socket.recv(2)
                        color = subrect_data[:bytes_per_pixel]
                        sx, sy = (coords[0] >> 4) + 1, (coords[0] & 0x0F) + 1
                        sw, sh = (coords[1] >> 4) + 1, (coords[1] & 0x0F) + 1
                        subrects.append((color, sx, sy, sw, sh))

                    # Render hextile with background and subrects
                    for y in range(tile_h):
                        for x in range(tile_w):
                            pixel = bg_color if bg_color else b"\x00\x00\x00"
                            self._set_pixel_simple(
                                rect.x + tx + x, rect.y + ty + y, pixel
                            )

    def _decode_raw_tile(self, x: int, y: int, w: int, h: int, data: bytes):
        """Decode raw tile data"""
        bytes_per_pixel = self.pixel_format.bits_per_pixel // 8
        for ty in range(h):
            for tx in range(w):
                offset = (ty * w + tx) * bytes_per_pixel
                if offset + bytes_per_pixel <= len(data):
                    color = data[offset : offset + bytes_per_pixel]
                    self._set_pixel_simple(x + tx, y + ty, color)

    def _set_pixel(self, x: int, y: int, color_idx: int):
        """Set pixel from palette index"""
        bytes_per_pixel = self.pixel_format.bits_per_pixel // 8
        self._set_pixel_simple(x, y, bytes([color_idx * bytes_per_pixel]))

    def _set_pixel_simple(self, x: int, y: int, color: bytes):
        """Set pixel with simple color value"""
        if (
            x < 0
            or x >= self.framebuffer_width
            or y < 0
            or y >= self.framebuffer_height
        ):
            return

        bytes_per_pixel = self.pixel_format.bits_per_pixel // 8
        offset = (y * self.framebuffer_width + x) * 4

        if len(color) >= 3:
            r = color[0] if len(color) == 3 else 0
            g = color[1] if len(color) >= 2 else 0
            b = color[2]
            a = color[3] if len(color) == 4 else 255
        else:
            r = g = b = color[0] if color else 0
            a = 255

        self.framebuffer[offset : offset + 4] = [r, g, b, a]

    def _handle_color_map(self):
        """Handle SetColorMap message"""
        self.socket.recv(1)  # Padding
        first_color = struct.unpack("!H", self.socket.recv(2))[0]
        num_colors = struct.unpack("!H", self.socket.recv(2))[0]

        for i in range(num_colors):
            r, g, b = struct.unpack("!HHH", self.socket.recv(6))
            # Store color in colormap
            pass

    def _handle_cut_text(self):
        """Handle server cut text message"""
        length = struct.unpack("!i", self.socket.recv(4))[0]
        if length > 0:
            text = self.socket.recv(length).decode("utf-8", errors="replace")
            self.log(f"Server clipboard: {text[:100]}...")

    def get_stats(self) -> Dict[str, Any]:
        """Get capture statistics"""
        stats = dict(self.stats)
        stats["encoding_types"] = dict(stats["encoding_types"])
        if stats["start_time"]:
            stats["elapsed_seconds"] = time.time() - stats["start_time"]
            if stats["elapsed_seconds"] > 0:
                stats["bytes_per_second"] = (
                    stats["bytes_received"] / stats["elapsed_seconds"]
                )
                stats["frames_per_second"] = (
                    stats["frames_received"] / stats["elapsed_seconds"]
                )
        return stats

    def get_framebuffer(self) -> Optional[bytes]:
        """Get current framebuffer data"""
        return bytes(self.framebuffer) if self.framebuffer else None


# =============================================================================
# SECTION 3: VNC Proxy/Monitor
# =============================================================================


class VNCProxy:
    """
    VNC Proxy for intercepting and analyzing VNC traffic.

    Acts as a man-in-the-middle between VNC client and server,
    allowing inspection of all protocol messages.
    """

    def __init__(
        self,
        listen_port: int = 5901,
        target_host: str = "localhost",
        target_port: int = 5900,
    ):
        self.listen_port = listen_port
        self.target_host = target_host
        self.target_port = target_port

        self.server_socket: Optional[socket.socket] = None
        self.client_socket: Optional[socket.socket] = None
        self.server_side: Optional[socket.socket] = None

        self._running = False

        # Traffic logging
        self.traffic_log: List[Dict[str, Any]] = []
        self.frame_callback = None

        # Statistics
        self.stats = {
            "client_bytes": 0,
            "server_bytes": 0,
            "frames_proxied": 0,
            "client_messages": defaultdict(int),
            "server_messages": defaultdict(int),
        }

    def start(self) -> bool:
        """Start the VNC proxy server"""
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind(("0.0.0.0", self.listen_port))
            self.server_socket.listen(1)
            self.server_socket.settimeout(30.0)

            self._running = True
            print(f"VNC Proxy listening on port {self.listen_port}")
            print(f"Forwarding to {self.target_host}:{self.target_port}")

            while self._running:
                try:
                    self.client_socket, addr = self.server_socket.accept()
                    print(f"Client connected from {addr}")

                    # Connect to target VNC server
                    self.server_side = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    self.server_side.connect((self.target_host, self.target_port))
                    print(f"Connected to target VNC server")

                    # Handle the connection
                    threading.Thread(
                        target=self._handle_connection, daemon=True
                    ).start()

                except socket.timeout:
                    continue
                except Exception as e:
                    print(f"Accept error: {e}")

        except Exception as e:
            print(f"Proxy start error: {e}")
            return False

        return True

    def stop(self):
        """Stop the VNC proxy"""
        self._running = False
        if self.server_socket:
            self.server_socket.close()
        if self.client_socket:
            self.client_socket.close()
        if self.server_side:
            self.server_side.close()
        print("VNC Proxy stopped")

    def _handle_connection(self):
        """Handle proxied VNC connection"""
        stop_event = threading.Event()

        # Start bidirectional forwarding
        client_to_server = threading.Thread(
            target=self._forward_traffic,
            args=(self.client_socket, self.server_side, "client", stop_event),
            daemon=True,
        )
        server_to_client = threading.Thread(
            target=self._forward_traffic,
            args=(self.server_side, self.client_socket, "server", stop_event),
            daemon=True,
        )

        client_to_server.start()
        server_to_client.start()

        try:
            while self._running and not stop_event.is_set():
                stop_event.wait(timeout=1)
        finally:
            stop_event.set()
            client_to_server.join(timeout=2)
            server_to_client.join(timeout=2)

    def _forward_traffic(
        self,
        source: socket.socket,
        dest: socket.socket,
        direction: str,
        stop_event: threading.Event,
    ):
        """Forward traffic between source and destination with logging"""
        buffer_size = 8192

        try:
            while self._running and not stop_event.is_set():
                source.settimeout(1.0)
                try:
                    data = source.recv(buffer_size)
                    if not data:
                        break

                    # Log and analyze traffic
                    self._analyze_traffic(data, direction)

                    # Forward to destination
                    dest.sendall(data)

                    # Update stats
                    if direction == "client":
                        self.stats["client_bytes"] += len(data)
                    else:
                        self.stats["server_bytes"] += len(data)

                except socket.timeout:
                    continue

        except Exception as e:
            if self._running:
                print(f"Forward error ({direction}): {e}")
        finally:
            stop_event.set()

    def _analyze_traffic(self, data: bytes, direction: str):
        """Analyze VNC protocol traffic"""
        entry = {
            "timestamp": time.time(),
            "direction": direction,
            "size": len(data),
            "data": data.hex(),
        }

        # Try to identify message type
        if len(data) > 0:
            first_byte = data[0]

            if direction == "client":
                if first_byte == MsgTypeClient.FRAMEBUFFER_UPDATE_REQUEST:
                    self.stats["client_messages"]["FB_UPDATE_REQUEST"] += 1
                elif first_byte == MsgTypeClient.SET_PIXEL_FORMAT:
                    self.stats["client_messages"]["SET_PIXEL_FORMAT"] += 1
                elif first_byte == MsgTypeClient.SET_ENCODINGS:
                    self.stats["client_messages"]["SET_ENCODINGS"] += 1
                elif first_byte == MsgTypeClient.KEY_EVENT:
                    self.stats["client_messages"]["KEY_EVENT"] += 1
                elif first_byte == MsgTypeClient.POINTER_EVENT:
                    self.stats["client_messages"]["POINTER_EVENT"] += 1
                elif first_byte == MsgTypeClient.CUT_TEXT:
                    self.stats["client_messages"]["CUT_TEXT"] += 1
            else:
                if first_byte == MsgTypeServer.FRAMEBUFFER_UPDATE:
                    self.stats["server_messages"]["FB_UPDATE"] += 1
                    self.stats["frames_proxied"] += 1
                elif first_byte == MsgTypeServer.SET_COLOR_MAP:
                    self.stats["server_messages"]["SET_COLOR_MAP"] += 1
                elif first_byte == MsgTypeServer.BELL:
                    self.stats["server_messages"]["BELL"] += 1
                elif first_byte == MsgTypeServer.SERVER_CUT_TEXT:
                    self.stats["server_messages"]["SERVER_CUT_TEXT"] += 1

        self.traffic_log.append(entry)

        # Keep log size manageable
        if len(self.traffic_log) > 10000:
            self.traffic_log = self.traffic_log[-5000:]

    def get_traffic_summary(self) -> Dict[str, Any]:
        """Get traffic analysis summary"""
        return {
            "stats": {
                "total_client_bytes": self.stats["client_bytes"],
                "total_server_bytes": self.stats["server_bytes"],
                "frames_proxied": self.stats["frames_proxied"],
                "client_messages": dict(self.stats["client_messages"]),
                "server_messages": dict(self.stats["server_messages"]),
            },
            "recent_entries": self.traffic_log[-100:] if self.traffic_log else [],
        }

    def export_traffic(self, filename: str):
        """Export traffic log to file"""
        import json

        with open(filename, "w") as f:
            json.dump(self.get_traffic_summary(), f, indent=2, default=str)
        print(f"Traffic exported to {filename}")


# =============================================================================
# SECTION 4: PCAP Traffic Capture and Analysis
# =============================================================================


class VNCAnalyzer:
    """
    Analyze VNC traffic from PCAP files or live capture.

    Provides tools for:
    - Parsing PCAP files
    - Extracting VNC protocol messages
    - Reconstructing VNC sessions
    - Finding credentials and sensitive data
    """

    def __init__(self):
        self.sessions: Dict[str, List[Dict]] = defaultdict(list)
        self.vnc_messages: List[Dict] = []
        self.credentials_found: List[Dict] = []

    def analyze_pcap(self, pcap_file: str) -> Dict[str, Any]:
        """Analyze VNC traffic from PCAP file"""
        try:
            from scapy.all import rdpcap, IP, TCP, Raw

            packets = rdpcap(pcap_file)
            print(f"Analyzing {len(packets)} packets...")

            # Find VNC traffic (typically ports 5900+)
            vnc_packets = [
                p
                for p in packets
                if TCP in p and (p[TCP].dport >= 5900 or p[TCP].sport >= 5900)
            ]

            print(f"Found {len(vnc_packets)} VNC-related packets")

            # Reconstruct TCP streams
            self._reconstruct_streams(vnc_packets)

            # Analyze each stream
            for stream_id, packets in self._group_by_stream(vnc_packets).items():
                self._analyze_stream(stream_id, packets)

            return self._generate_report()

        except ImportError:
            print("Scapy not available. Install with: pip install scapy")
            return {}

    def _group_by_stream(self, packets) -> Dict[str, List]:
        """Group packets by TCP stream"""
        streams = {}
        for p in packets:
            if TCP not in p:
                continue
            sport = p[TCP].sport
            dport = p[TCP].dport
            src = p[IP].src if IP in p else ""
            dst = p[IP].dst if IP in p else ""

            stream_id = f"{src}:{sport}-{dst}:{dport}"
            if stream_id not in streams:
                streams[stream_id] = []
            streams[stream_id].append(p)

        return streams

    def _reconstruct_streams(self, packets):
        """Reconstruct application-level data from TCP packets"""
        for stream_id, stream_packets in self._group_by_stream(packets).items():
            data = b""
            for p in sorted(stream_packets, key=lambda x: x.seq):
                if Raw in p:
                    data += p[Raw].load

            if data:
                self.sessions[stream_id].append(
                    {"data": data, "packet_count": len(stream_packets)}
                )

    def _analyze_stream(self, stream_id: str, packets: list):
        """Analyze a single VNC stream"""
        data = b""
        for p in packets:
            if Raw in p:
                data += p[Raw].load

        if not data:
            return

        # Try to detect protocol version
        if b"RFB 003" in data:
            self._extract_version_info(data)

        # Check for VNC authentication
        if self._contains_vnc_auth(data):
            self._extract_vnc_auth(data)

        # Check for Tight encoding
        if b"\x00\x00\x00\x07" in data:  # Tight encoding marker
            self._analyze_tight_encoding(data)

    def _extract_version_info(self, data: bytes):
        """Extract VNC version from protocol handshake"""
        import re

        version_match = re.search(rb"RFB (\d{3}\.\d{3})", data)
        if version_match:
            self.vnc_messages.append(
                {"type": "VERSION", "version": version_match.group(1).decode()}
            )

    def _contains_vnc_auth(self, data: bytes) -> bool:
        """Check if data contains VNC authentication"""
        # VNC auth challenge is 16 bytes
        return len(data) >= 16 and b"\x00\x00\x00\x02" in data[:20]

    def _extract_vnc_auth(self, data: bytes):
        """Extract VNC authentication challenge and response"""
        # Find auth challenge
        idx = data.find(b"\x00\x00\x00\x02")
        if idx >= 0 and idx + 20 < len(data):
            challenge = data[idx + 4 : idx + 20]
            self.vnc_messages.append(
                {"type": "VNC_AUTH_CHALLENGE", "challenge": challenge.hex()}
            )

            # Look for response (usually follows challenge)
            if idx + 36 < len(data):
                response = data[idx + 20 : idx + 36]
                self.vnc_messages.append(
                    {"type": "VNC_AUTH_RESPONSE", "response": response.hex()}
                )

    def _analyze_tight_encoding(self, data: bytes):
        """Analyze Tight encoding in captured data"""
        tight_markers = []
        idx = 0
        while True:
            idx = data.find(b"\x00\x00\x00\x07", idx)
            if idx < 0:
                break
            tight_markers.append(idx)
            idx += 4

        if tight_markers:
            self.vnc_messages.append(
                {
                    "type": "TIGHT_ENCODING",
                    "count": len(tight_markers),
                    "positions": tight_markers[:10],
                }
            )

    def _generate_report(self) -> Dict[str, Any]:
        """Generate analysis report"""
        report = {
            "sessions_analyzed": len(self.sessions),
            "messages_found": len(self.vnc_messages),
            "credentials_found": len(self.credentials_found),
            "message_summary": {},
            "detailed_messages": self.vnc_messages,
            "credentials": self.credentials_found,
        }

        # Count message types
        for msg in self.vnc_messages:
            msg_type = msg.get("type", "UNKNOWN")
            report["message_summary"][msg_type] = (
                report["message_summary"].get(msg_type, 0) + 1
            )

        return report


# =============================================================================
# SECTION 5: Live VNC Session Monitor
# =============================================================================


class VNCSessionMonitor:
    """
    Monitor live VNC sessions with real-time analysis.

    Features:
    - Real-time frame capture
    - Activity logging
    - Session metrics
    - Alert on specific events
    """

    def __init__(self, host: str = "localhost", port: int = 5900):
        self.host = host
        self.port = port
        self.client: Optional[VNCClient] = None

        self.activity_log: List[Dict] = []
        self.session_metrics = {
            "start_time": None,
            "end_time": None,
            "total_frames": 0,
            "frame_changes": 0,
            "keystrokes": 0,
            "mouse_moves": 0,
            "clipboard_events": 0,
            "encoding_usage": defaultdict(int),
        }

        self.alerts: List[Dict] = []
        self._running = False

    def start_monitoring(self, password: str = None) -> bool:
        """Start monitoring a VNC session"""
        self.client = VNCClient(self.host, self.port, password)

        if not self.client.connect():
            print(f"Failed to connect to {self.host}:{self.port}")
            return False

        self._running = True
        self.session_metrics["start_time"] = time.time()

        # Set up frame callback for analysis
        self.client.start_capture(frame_callback=self._on_frame)

        # Start keyboard/mouse monitoring
        threading.Thread(target=self._monitor_input, daemon=True).start()

        print(f"Monitoring VNC session on {self.host}:{self.port}")
        return True

    def stop_monitoring(self):
        """Stop monitoring"""
        self._running = False
        self.session_metrics["end_time"] = time.time()

        if self.client:
            self.client.stop_capture()

        self._generate_alerts()

    def _on_frame(self, rectangle: Rectangle, framebuffer: bytes):
        """Process each captured frame"""
        self.session_metrics["total_frames"] += 1

        # Detect frame changes (simplified)
        if rectangle:
            self.session_metrics["frame_changes"] += 1
            self.session_metrics["encoding_usage"][rectangle.encoding] += 1

            self.activity_log.append(
                {
                    "timestamp": time.time(),
                    "event": "FRAME_UPDATE",
                    "rectangle": {
                        "x": rectangle.x,
                        "y": rectangle.y,
                        "width": rectangle.width,
                        "height": rectangle.height,
                        "encoding": EncodingType(rectangle.encoding).name,
                    },
                }
            )

            # Alert on large frame updates (potential screen change)
            if rectangle.width * rectangle.height > 100000:
                self._add_alert(
                    "LARGE_FRAME",
                    f"Large frame update: {rectangle.width}x{rectangle.height}",
                )

    def _monitor_input(self):
        """Monitor keyboard and mouse input"""
        # Note: Actual input monitoring requires platform-specific code
        # This is a simplified placeholder
        while self._running:
            time.sleep(1)

    def _add_alert(self, alert_type: str, message: str):
        """Add security alert"""
        self.alerts.append(
            {"timestamp": time.time(), "type": alert_type, "message": message}
        )
        print(f"[ALERT] {alert_type}: {message}")

    def _generate_alerts(self):
        """Generate alerts based on session metrics"""
        elapsed = (self.session_metrics["end_time"] or time.time()) - (
            self.session_metrics["start_time"] or time.time()
        )

        if elapsed > 0:
            fps = self.session_metrics["total_frames"] / elapsed
            if fps > 30:
                self._add_alert(
                    "HIGH_FRAME_RATE", f"Frame rate: {fps:.1f} fps (unusual for VNC)"
                )

        if self.session_metrics["clipboard_events"] == 0:
            self._add_alert("NO_CLIPBOARD", "No clipboard activity detected")

    def get_session_report(self) -> Dict[str, Any]:
        """Get monitoring report"""
        return {
            "metrics": dict(self.session_metrics),
            "activity_count": len(self.activity_log),
            "alerts": self.alerts,
            "recent_activity": self.activity_log[-100:],
        }


# =============================================================================
# SECTION 6: Usage Examples and Main Functions
# =============================================================================


def example_basic_client():
    """Example: Basic VNC client connection"""
    print("=" * 60)
    print("Example 1: Basic VNC Client")
    print("=" * 60)

    client = VNCClient(host="localhost", port=5900, password="secret123", verbose=True)

    if client.connect():
        print("Connected successfully!")
        print(f"Framebuffer: {client.framebuffer_width}x{client.framebuffer_height}")
        print(f"Pixel format: {client.pixel_format.bits_per_pixel} bpp")

        # Capture a few frames
        client.start_capture()
        time.sleep(5)
        client.stop_capture()

        print(f"\nCapture Stats: {client.get_stats()}")
    else:
        print("Connection failed")


def example_proxy():
    """Example: VNC Proxy/Monitor"""
    print("=" * 60)
    print("Example 2: VNC Proxy")
    print("=" * 60)

    proxy = VNCProxy(listen_port=5901, target_host="localhost", target_port=5900)

    print("Starting proxy...")
    proxy.start()

    try:
        while True:
            time.sleep(10)
            summary = proxy.get_traffic_summary()
            print(f"\nTraffic Summary:")
            print(f"  Client bytes: {summary['stats']['total_client_bytes']:,}")
            print(f"  Server bytes: {summary['stats']['total_server_bytes']:,}")
            print(f"  Frames proxied: {summary['stats']['frames_proxied']}")
    except KeyboardInterrupt:
        print("\nStopping proxy...")
        proxy.stop()


def example_pcap_analysis():
    """Example: Analyze PCAP file"""
    print("=" * 60)
    print("Example 3: PCAP Analysis")
    print("=" * 60)

    analyzer = VNCAnalyzer()

    # Analyze a PCAP file
    report = analyzer.analyze_pcap("vnc_capture.pcap")

    print("\nAnalysis Report:")
    print(f"  Sessions: {report.get('sessions_analyzed', 0)}")
    print(f"  Messages: {report.get('messages_found', 0)}")
    print(f"  Credentials found: {report.get('credentials_found', 0)}")

    print("\nMessage Types:")
    for msg_type, count in report.get("message_summary", {}).items():
        print(f"  {msg_type}: {count}")


def example_session_monitor():
    """Example: Live session monitoring"""
    print("=" * 60)
    print("Example 4: Session Monitor")
    print("=" * 60)

    monitor = VNCSessionMonitor(host="localhost", port=5900)

    if monitor.start_monitoring(password="secret123"):
        try:
            while True:
                time.sleep(30)
                report = monitor.get_session_report()
                print(f"\nSession Metrics:")
                print(f"  Frames: {report['metrics']['total_frames']}")
                print(f"  Frame changes: {report['metrics']['frame_changes']}")
                print(f"  Alerts: {len(report['alerts'])}")
        except KeyboardInterrupt:
            pass
        finally:
            monitor.stop_monitoring()


def interactive_shell():
    """Interactive VNC analyzer shell"""
    print("=" * 60)
    print("VNC Protocol Analyzer - Interactive Shell")
    print("=" * 60)
    print("\nCommands:")
    print("  connect <host> <port> [password] - Connect to VNC server")
    print("  proxy <listen_port> - Start VNC proxy")
    print("  analyze <pcap_file> - Analyze PCAP file")
    print("  monitor <host> <port> - Monitor live session")
    print("  stats - Show statistics")
    print("  quit - Exit")
    print()

    client = None
    proxy = None
    monitor = None
    analyzer = VNCAnalyzer()

    while True:
        try:
            cmd = input("vnc-analyzer> ").strip().split()

            if not cmd:
                continue

            if cmd[0] == "connect":
                host = cmd[1] if len(cmd) > 1 else "localhost"
                port = int(cmd[2]) if len(cmd) > 2 else 5900
                password = cmd[3] if len(cmd) > 3 else ""

                client = VNCClient(host, port, password)
                if client.connect():
                    client.start_capture()
                    print("Connected. Capture started.")

            elif cmd[0] == "proxy":
                port = int(cmd[1]) if len(cmd) > 1 else 5901
                proxy = VNCProxy(listen_port=port)
                threading.Thread(target=proxy.start, daemon=True).start()
                print(f"Proxy started on port {port}")

            elif cmd[0] == "analyze":
                if len(cmd) > 1:
                    report = analyzer.analyze_pcap(cmd[1])
                    print(f"\nAnalysis: {report}")

            elif cmd[0] == "monitor":
                host = cmd[1] if len(cmd) > 1 else "localhost"
                port = int(cmd[2]) if len(cmd) > 2 else 5900
                password = cmd[3] if len(cmd) > 3 else ""

                monitor = VNCSessionMonitor(host, port)
                monitor.start_monitoring(password)

            elif cmd[0] == "stats":
                if client:
                    print(f"\nClient Stats: {client.get_stats()}")
                if proxy:
                    print(f"\nProxy Stats: {proxy.get_traffic_summary()['stats']}")
                if monitor:
                    print(f"\nMonitor Stats: {monitor.get_session_report()}")

            elif cmd[0] in ("quit", "exit", "q"):
                if client:
                    client.stop_capture()
                if proxy:
                    proxy.stop()
                if monitor:
                    monitor.stop_monitoring()
                break

        except KeyboardInterrupt:
            print("\nUse 'quit' to exit")
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "--client":
            example_basic_client()
        elif sys.argv[1] == "--proxy":
            example_proxy()
        elif sys.argv[1] == "--analyze":
            if len(sys.argv) > 2:
                analyzer = VNCAnalyzer()
                analyzer.analyze_pcap(sys.argv[2])
            else:
                print("Usage: python vnc_analyzer.py --analyze <pcap_file>")
        elif sys.argv[1] == "--monitor":
            example_session_monitor()
        elif sys.argv[1] == "--help":
            print(__doc__)
    else:
        interactive_shell()
