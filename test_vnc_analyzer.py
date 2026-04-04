#!/usr/bin/env python3
"""
VNC Protocol Analyzer - Usage Examples
======================================

Run examples to test the VNC analyzer components.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from vnc_analyzer import VNCClient, VNCProxy, VNCAnalyzer, VNCSessionMonitor


def test_protocol_constants():
    """Test that protocol constants are properly defined"""
    print("Testing RFB Protocol Constants...")

    from vnc_analyzer import (
        RFBVersion,
        SecurityType,
        MsgTypeServer,
        MsgTypeClient,
        EncodingType,
        PixelFormat,
    )

    assert RFBVersion.RFB_3_3 == 33
    assert RFBVersion.RFB_3_8 == 38
    assert SecurityType.NONE == 1
    assert SecurityType.VNC_AUTH == 2
    assert MsgTypeServer.FRAMEBUFFER_UPDATE == 0
    assert MsgTypeClient.FRAMEBUFFER_UPDATE_REQUEST == 3
    assert EncodingType.RAW == 0
    assert EncodingType.COPY_RECT == 1
    assert EncodingType.TIGHT == 7

    print("  All constants OK")


def test_pixel_format():
    """Test PixelFormat parsing"""
    print("Testing PixelFormat...")

    from vnc_analyzer import PixelFormat

    # Create a test pixel format (32-bit)
    pf_data = bytes(
        [
            32,
            24,
            0,
            1,  # bits_per_pixel, depth, big_endian, true_color
            0xFF,
            0xFF,  # red_max
            0xFF,
            0xFF,  # green_max
            0xFF,
            0xFF,  # blue_max
            16,
            8,
            0,  # red_shift, green_shift, blue_shift
            0,
            0,
            0,  # padding
        ]
    )

    pf = PixelFormat.from_bytes(pf_data)
    assert pf.bits_per_pixel == 32
    assert pf.depth == 24
    assert pf.red_shift == 16
    assert pf.green_shift == 8
    assert pf.blue_shift == 0

    # Test serialization
    pf_bytes = pf.to_bytes()
    pf2 = PixelFormat.from_bytes(pf_bytes)
    assert pf2.bits_per_pixel == pf.bits_per_pixel

    print("  PixelFormat parsing OK")


def test_socket_mock():
    """Test client with mocked socket (no actual connection)"""
    print("Testing VNCClient structure...")

    from vnc_analyzer import VNCClient
    import unittest.mock as mock

    client = VNCClient("localhost", 5900, "test", verbose=False)

    assert client.host == "localhost"
    assert client.port == 5900
    assert not client.connected

    # Verify methods exist
    assert hasattr(client, "connect")
    assert hasattr(client, "start_capture")
    assert hasattr(client, "stop_capture")
    assert hasattr(client, "get_stats")
    assert hasattr(client, "_decode_raw")
    assert hasattr(client, "_decode_copyrect")
    assert hasattr(client, "_decode_tight")

    print("  VNCClient structure OK")


def test_proxy_structure():
    """Test VNCProxy structure"""
    print("Testing VNCProxy structure...")

    from vnc_analyzer import VNCProxy

    proxy = VNCProxy(5901, "localhost", 5900)

    assert proxy.listen_port == 5901
    assert proxy.target_host == "localhost"
    assert proxy.target_port == 5900

    assert hasattr(proxy, "start")
    assert hasattr(proxy, "stop")
    assert hasattr(proxy, "get_traffic_summary")

    print("  VNCProxy structure OK")


def test_analyzer_structure():
    """Test VNCAnalyzer structure"""
    print("Testing VNCAnalyzer structure...")

    from vnc_analyzer import VNCAnalyzer

    analyzer = VNCAnalyzer()

    assert hasattr(analyzer, "analyze_pcap")
    assert hasattr(analyzer, "_extract_version_info")
    assert hasattr(analyzer, "_extract_vnc_auth")
    assert hasattr(analyzer, "_generate_report")

    print("  VNCAnalyzer structure OK")


def test_monitor_structure():
    """Test VNCSessionMonitor structure"""
    print("Testing VNCSessionMonitor structure...")

    from vnc_analyzer import VNCSessionMonitor

    monitor = VNCSessionMonitor("localhost", 5900)

    assert monitor.host == "localhost"
    assert monitor.port == 5900

    assert hasattr(monitor, "start_monitoring")
    assert hasattr(monitor, "stop_monitoring")
    assert hasattr(monitor, "get_session_report")

    print("  VNCSessionMonitor structure OK")


def test_encoding_detection():
    """Test encoding type detection"""
    print("Testing encoding detection...")

    from vnc_analyzer import EncodingType

    encodings = [
        (0, "RAW"),
        (1, "COPY_RECT"),
        (2, "RRE"),
        (5, "HEXTILE"),
        (6, "ZLIB"),
        (7, "TIGHT"),
    ]

    for num, name in encodings:
        assert EncodingType(num).name == name

    print("  Encoding detection OK")


def main():
    """Run all tests"""
    print("=" * 60)
    print("VNC Protocol Analyzer - Test Suite")
    print("=" * 60)
    print()

    tests = [
        test_protocol_constants,
        test_pixel_format,
        test_socket_mock,
        test_proxy_structure,
        test_analyzer_structure,
        test_monitor_structure,
        test_encoding_detection,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"  FAILED: {e}")
            failed += 1

    print()
    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
