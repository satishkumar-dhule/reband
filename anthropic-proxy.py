#!/usr/bin/env python3
"""
Lightweight Anthropic-compatible proxy that strips parameters unsupported
by Vertex AI (the Replit proxy backend), then forwards to the Replit modelfarm.

Fixes: cache_control / system.*.cache_control "Extra inputs are not permitted"
       on Vertex AI-backed Anthropic endpoints.

Usage:
  python3 anthropic-proxy.py          # listens on PORT or 4000
  ANTHROPIC_BASE_URL=http://localhost:4000 claude
"""

import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler, HTTPServer

UPSTREAM = os.environ.get(
    "AI_INTEGRATIONS_ANTHROPIC_BASE_URL",
    "http://localhost:1106/modelfarm/anthropic",
)
PORT = int(os.environ.get("PROXY_PORT", "4000"))

# Fields that Vertex AI rejects but the native Anthropic API accepts.
STRIP_TOP_LEVEL = {"betas", "system_betas"}


def strip_cache_control(obj):
    """Recursively remove cache_control keys from any dict/list structure."""
    if isinstance(obj, dict):
        return {
            k: strip_cache_control(v)
            for k, v in obj.items()
            if k != "cache_control"
        }
    if isinstance(obj, list):
        return [strip_cache_control(item) for item in obj]
    return obj


def clean_body(body_bytes: bytes) -> bytes:
    try:
        data = json.loads(body_bytes)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return body_bytes

    # Strip cache_control everywhere in the payload
    data = strip_cache_control(data)

    # Strip top-level keys Vertex AI doesn't understand
    for key in STRIP_TOP_LEVEL:
        data.pop(key, None)

    return json.dumps(data).encode("utf-8")


class ProxyHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"[proxy] {self.address_string()} - {fmt % args}", flush=True)

    def _forward(self, body: bytes | None = None):
        target_url = UPSTREAM.rstrip("/") + self.path
        headers = {
            k: v
            for k, v in self.headers.items()
            if k.lower()
            not in ("host", "content-length", "transfer-encoding", "connection")
        }

        # Use the Replit-provisioned dummy key
        api_key = os.environ.get("AI_INTEGRATIONS_ANTHROPIC_API_KEY", "_DUMMY_API_KEY_")
        headers["x-api-key"] = api_key
        headers["anthropic-version"] = headers.get("anthropic-version", "2023-06-01")

        if body:
            cleaned = clean_body(body)
            headers["content-length"] = str(len(cleaned))
        else:
            cleaned = None

        req = urllib.request.Request(
            target_url,
            data=cleaned,
            headers=headers,
            method=self.command,
        )

        try:
            with urllib.request.urlopen(req, timeout=300) as resp:
                self.send_response(resp.status)
                for k, v in resp.headers.items():
                    if k.lower() not in ("transfer-encoding", "connection"):
                        self.send_header(k, v)
                self.end_headers()
                while chunk := resp.read(4096):
                    self.wfile.write(chunk)
                    self.wfile.flush()
        except urllib.error.HTTPError as e:
            body_err = e.read()
            self.send_response(e.code)
            for k, v in e.headers.items():
                if k.lower() not in ("transfer-encoding", "connection"):
                    self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body_err)

    def do_GET(self):
        self._forward()

    def do_POST(self):
        length = int(self.headers.get("content-length", 0))
        body = self.rfile.read(length) if length else b""
        self._forward(body)

    def do_PUT(self):
        self.do_POST()

    def do_DELETE(self):
        self._forward()


if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", PORT), ProxyHandler)
    print(f"[proxy] Anthropic strip-proxy listening on http://127.0.0.1:{PORT}", flush=True)
    print(f"[proxy] Forwarding to: {UPSTREAM}", flush=True)
    print(f"[proxy] cache_control fields will be stripped automatically", flush=True)
    server.serve_forever()
