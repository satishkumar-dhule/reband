#!/usr/bin/env python3
from flask import Flask, request, jsonify
import urllib.request
import json
import os

app = Flask(__name__)

OPENAI_API_BASE = os.environ.get("OPENAI_API_BASE", "http://localhost:8080/v1")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "local")


@app.route("/v1/messages", methods=["POST"])
def create_message():
    data = request.json
    system = data.get("system", "")
    messages = data.get("messages", [])

    chat_messages = []
    if system:
        chat_messages.append({"role": "system", "content": system})

    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if isinstance(content, list):
            content = " ".join(
                [c.get("text", "") for c in content if c.get("type") == "text"]
            )
        chat_messages.append({"role": role, "content": content})

    max_tokens = data.get("max_tokens", 1024)
    temperature = data.get("temperature", 1.0)

    try:
        req = urllib.request.Request(
            f"{OPENAI_API_BASE}/chat/completions",
            data=json.dumps(
                {
                    "model": "qwen2.5-3b",
                    "messages": chat_messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                }
            ).encode(),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENAI_API_KEY}",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read())
        assistant_content = result["choices"][0]["message"]["content"]

        return jsonify(
            {
                "id": f"msg_{os.urandom(8).hex()}",
                "type": "message",
                "role": "assistant",
                "content": [{"type": "text", "text": assistant_content}],
                "model": "qwen2.5-3b",
                "stop_reason": "end_turn",
                "stop_sequence": None,
                "usage": {"input_tokens": 0, "output_tokens": 0},
            }
        )
    except Exception as e:
        return jsonify({"error": {"type": "api_error", "message": str(e)}}), 500


@app.route("/v1/models", methods=["GET"])
def list_models():
    return jsonify(
        {
            "object": "list",
            "data": [
                {
                    "id": "qwen2.5-3b",
                    "object": "model",
                    "created": 1234567890,
                    "owned_by": "local",
                }
            ],
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081)
