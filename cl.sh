#!/bin/bash

# 1. Create a local bin directory and download Ollama binary
mkdir -p ~/.local/bin
echo "Downloading Ollama binary for Replit..."
curl -L https://ollama.com/download/ollama-linux-amd64.tgz -o ollama.tgz
tar -C ~/.local -xzf ollama.tgz
rm ollama.tgz

# 2. Add to PATH for this session
export PATH=$HOME/.local/bin:$PATH

# 3. Start Ollama server in the background
echo "Starting Ollama server..."
# Clear any old instances and start fresh
pkill ollama
nohup ollama serve > ollama.log 2>&1 &
sleep 5 # Wait for server to initialize

# 4. Pull a lightweight coding model (3b or 7b recommended for Replit resources)
MODEL_NAME="qwen2.5-coder:3b"
echo "Pulling $MODEL_NAME..."
ollama pull $MODEL_NAME

# 5. Configure Environment for Claude Code
export ANTHROPIC_BASE_URL="http://localhost:11434"
export ANTHROPIC_AUTH_TOKEN="ollama"
export ANTHROPIC_API_KEY=""

echo "-------------------------------------------------------"
echo "Ollama is running locally in your Repl!"
echo "Claude Code is now targeting: $MODEL_NAME"
echo "-------------------------------------------------------"

# 6. Launch Claude
# Note: If 'ollama launch' isn't recognized, use the direct 'claude' command
claude --model $MODEL_NAME

