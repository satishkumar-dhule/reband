# VNC Protocol Analyzer - Implementation Guide

A comprehensive Python implementation for analyzing, capturing, and decoding VNC sessions. This tool is designed for security research, network debugging, and understanding the RFB (Remote Framebuffer) protocol.

## Features

- **VNC Client**: Full protocol implementation with authentication support
- **Frame Decoding**: RAW, CopyRect, Tight, ZLib, and Hextile encodings
- **VNC Proxy**: Man-in-the-middle traffic interception
- **PCAP Analysis**: Analyze captured network traffic
- **Live Monitoring**: Real-time session analysis

## Installation

```bash
# Core dependencies (built-in)
pip install standard libraries  # socket, struct, zlib, threading

# Optional: For PCAP analysis
pip install scapy
```

## Quick Start

### Interactive Shell

```bash
python vnc_analyzer.py
```

Commands:
```
vnc-analyzer> connect localhost 5900 password123
vnc-analyzer> proxy 5901
vnc-analyzer> stats
vnc-analyzer> quit
```

### Basic Client Connection

```python
from vnc_analyzer import VNCClient

client = VNCClient('localhost', 5900, 'password123')
if client.connect():
    client.start_capture()
    import time
    time.sleep(10)
    client.stop_capture()
    print(client.get_stats())
```

### VNC Proxy

```python
from vnc_analyzer import VNCProxy

proxy = VNCProxy(listen_port=5901, target_host='vnc-server', target_port=5900)
proxy.start()
```

### PCAP Analysis

```python
from vnc_analyzer import VNCAnalyzer

analyzer = VNCAnalyzer()
report = analyzer.analyze_pcap('capture.pcap')
print(report)
```

## Architecture

### 1. VNCClient Class

Handles connection to VNC servers with:
- Protocol version negotiation (3.3, 3.7, 3.8, 3.12)
- Security handshake (None, VNC Auth)
- Framebuffer update handling
- Multiple encoding support

### 2. Frame Decoding

| Encoding | Description | Use Case |
|----------|-------------|----------|
| RAW | Uncompressed pixel data | Simple, high bandwidth |
| COPY_RECT | Copy rectangle from source | Efficient for moving windows |
| ZLIB | Zlib compressed data | Better compression |
| TIGHT | Multi-level compression | Best compression, JPEG support |
| HEXTILE | 16x16 tile-based | Moderate compression |

### 3. VNCProxy Class

Intercepts VNC traffic between client and server:
- Bidirectional traffic forwarding
- Protocol message logging
- Traffic statistics

### 4. VNCAnalyzer Class

Analyzes captured PCAP files:
- TCP stream reconstruction
- Protocol version detection
- VNC auth challenge extraction
- Encoding analysis

### 5. VNCSessionMonitor Class

Real-time session monitoring:
- Frame change detection
- Activity logging
- Alert generation
- Session metrics

## Protocol Implementation Details

### Handshake Sequence

```
1. Client → Server: Protocol version (12 bytes)
2. Server → Client: Protocol version (12 bytes)
3. Server → Client: Security types (1 + n bytes)
4. Client → Server: Selected security type (1 byte)
5. [If VNC Auth] Challenge/Response exchange
6. Client → Server: Security result (4 bytes)
7. Server → Client: ServerInit (4 + 16 + 4 + n bytes)
```

### Message Types

**Server → Client:**
- `0x00`: FramebufferUpdate
- `0x01`: SetColorMap
- `0x02`: Bell
- `0x03`: ServerCutText

**Client → Server:**
- `0x00`: SetPixelFormat
- `0x02`: SetEncodings
- `0x03`: FramebufferUpdateRequest
- `0x04`: KeyEvent
- `0x05`: PointerEvent
- `0x06`: CutText

## Usage Examples

### Example 1: Capture Frames to File

```python
from vnc_analyzer import VNCClient

frames = []

def on_frame(rectangle, framebuffer):
    frames.append({
        'rect': rectangle,
        'data': bytes(framebuffer)
    })

client = VNCClient('localhost', 5900)
if client.connect():
    client.start_capture(frame_callback=on_frame)
    import time
    time.sleep(60)  # Capture for 1 minute
    client.stop_capture()
    
    # Save frames
    import pickle
    with open('captured_frames.pkl', 'wb') as f:
        pickle.dump(frames, f)
```

### Example 2: Traffic Analysis

```python
from vnc_analyzer import VNCProxy
import json

proxy = VNCProxy(5901)
proxy.start()

# Run for some time, then export
import time
time.sleep(300)  # 5 minutes

proxy.export_traffic('vnc_traffic.json')
summary = proxy.get_traffic_summary()
print(json.dumps(summary, indent=2))
```

### Example 3: Custom Frame Processing

```python
from vnc_analyzer import VNCClient
from PIL import Image
import io

client = VNCClient('localhost', 5900)

def save_frame(rectangle, framebuffer):
    if rectangle and rectangle.encoding == 0:  # RAW encoding
        # Create image from framebuffer
        img = Image.frombytes(
            'RGBA',
            (client.framebuffer_width, client.framebuffer_height),
            bytes(framebuffer)
        )
        img.save(f'frame_{int(time.time())}.png')

if client.connect():
    client.start_capture(frame_callback=save_frame)
```

## Legal Notice

This tool is for educational and research purposes only. Always ensure you have proper authorization before analyzing network traffic or VNC sessions. Unauthorized interception of network communications may violate local laws.

## License

Educational/Research Use Only
