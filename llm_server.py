#!/usr/bin/env python3
from llama_cpp import Llama
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

MODEL_PATH = os.path.expanduser("~/models/qwen2.5-3b-instruct-q4_k_m.gguf")

print(f"Loading model from {MODEL_PATH}...")
llm = Llama(
    model_path=MODEL_PATH, n_ctx=4096, n_threads=8, n_gpu_layers=0, verbose=False
)
print("Model loaded!")


@app.route("/v1/chat/completions", methods=["POST"])
def chat_completions():
    data = request.json
    messages = data.get("messages", [])
    max_tokens = data.get("max_tokens", 512)
    temperature = data.get("temperature", 0.7)
    model = data.get("model", "qwen2.5-3b")

    prompt = ""
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "system":
            prompt += f"<|im_start|>system\n{content}<|im_end|>\n"
        elif role == "user":
            prompt += f"<|im_start|>user\n{content}<|im_end|>\n"
        else:
            prompt += f"<|im_start|>assistant\n{content}<|im_end|>\n"
    prompt += "<|im_start|>assistant\n"

    response = llm(
        prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        stop=["<|im_end|>"],
        echo=False,
    )

    content = response["choices"][0]["text"].strip()

    return jsonify(
        {
            "id": "chatcmpl-local",
            "object": "chat.completion",
            "created": 1234567890,
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": content},
                    "finish_reason": "stop",
                }
            ],
            "usage": response.get(
                "usage", {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            ),
        }
    )


@app.route("/v1/messages", methods=["POST"])
def anthropic_messages():
    data = request.json
    system = data.get("system", "")
    messages = data.get("messages", [])
    max_tokens = data.get("max_tokens", 1024)
    temperature = data.get("temperature", 1.0)

    prompt = ""
    if system:
        prompt += f"<|im_start|>system\n{system}<|im_end|>\n"

    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if isinstance(content, list):
            content = " ".join(
                [c.get("text", "") for c in content if c.get("type") == "text"]
            )
        if role == "user":
            prompt += f"<|im_start|>user\n{content}<|im_end|>\n"
        else:
            prompt += f"<|im_start|>assistant\n{content}<|im_end|>\n"
    prompt += "<|im_start|>assistant\n"

    response = llm(
        prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        stop=["<|im_end|>"],
        echo=False,
    )

    content = response["choices"][0]["text"].strip()
    import uuid

    return jsonify(
        {
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "type": "message",
            "role": "assistant",
            "content": [{"type": "text", "text": content}],
            "model": "claude-sonnet-4-6",
            "stop_reason": "end_turn",
            "stop_sequence": None,
            "usage": {"input_tokens": 0, "output_tokens": 0},
        }
    )


@app.route("/v1/models", methods=["GET"])
def list_models():
    return jsonify(
        {
            "object": "list",
            "data": [
                {
                    "id": "claude-sonnet-4-6",
                    "object": "model",
                    "created": 1234567890,
                    "owned_by": "anthropic",
                },
                {
                    "id": "claude-opus-4-6",
                    "object": "model",
                    "created": 1234567890,
                    "owned_by": "anthropic",
                },
            ],
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
