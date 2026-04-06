#!/bin/bash
# Claude CLI launcher with multi-LLM support via Replit AI proxy
#
# Usage:
#   ./cl.sh                                # default model (claude-sonnet-4-6)
#   ./cl.sh --model gpt-5.2               # OpenAI GPT-5.2
#   ./cl.sh --model gemini-2.5-pro        # Gemini 2.5 Pro
#   ./cl.sh --model deepseek/deepseek-r1  # DeepSeek via OpenRouter
#   ./cl.sh --model o4-mini               # OpenAI o4-mini
#
# Available models (via Replit proxy — no API key required):
#   Anthropic:   claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5
#   OpenAI:      gpt-5.2, gpt-5-mini, gpt-5-nano, o4-mini
#   Gemini:      gemini-3.1-pro-preview, gemini-2.5-pro, gemini-2.5-flash
#   OpenRouter:  meta-llama/llama-4-maverick, deepseek/deepseek-r1,
#                mistralai/mistral-large-2, x-ai/grok-3

set -e

LITELLM_PORT=4000
LITELLM_MASTER_KEY="sk-local-dev-key"
LITELLM_CONFIG=".claude/litellm-config.yaml"
DEFAULT_MODEL="claude-sonnet-4-6"

# ── Validate Replit proxy env vars ────────────────────────────────────────
if [ -z "$AI_INTEGRATIONS_ANTHROPIC_BASE_URL" ]; then
  echo "ERROR: AI_INTEGRATIONS_ANTHROPIC_BASE_URL is not set."
  echo "The Replit AI integrations must be provisioned first."
  exit 1
fi

# ── Kill any existing LiteLLM on this port ────────────────────────────────
if command -v lsof &>/dev/null && lsof -ti:$LITELLM_PORT &>/dev/null; then
  echo "[litellm] Stopping existing proxy on port $LITELLM_PORT..."
  kill "$(lsof -ti:$LITELLM_PORT)" 2>/dev/null || true
  sleep 1
fi

# ── Start LiteLLM proxy ───────────────────────────────────────────────────
# Ensure local Python bins are on PATH (installed via pip)
export PATH="$HOME/.local/bin:$HOME/workspace/.pythonlibs/bin:$PATH"

LITELLM_BIN=""
for candidate in \
  "$HOME/workspace/.pythonlibs/bin/litellm" \
  "$HOME/.local/bin/litellm" \
  "$(command -v litellm 2>/dev/null)"; do
  if [ -x "$candidate" ]; then
    LITELLM_BIN="$candidate"
    break
  fi
done

if [ -z "$LITELLM_BIN" ]; then
  echo "ERROR: litellm binary not found. Run: pip install litellm"
  exit 1
fi

echo "[litellm] Starting proxy on port $LITELLM_PORT (using $LITELLM_BIN)..."
"$LITELLM_BIN" \
  --config "$LITELLM_CONFIG" \
  --port $LITELLM_PORT \
  --host 127.0.0.1 \
  > /tmp/litellm.log 2>&1 &
LITELLM_PID=$!

# ── Wait for LiteLLM to become ready ─────────────────────────────────────
echo "[litellm] Waiting for proxy to be ready..."
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:$LITELLM_PORT/health/readiness" > /dev/null 2>&1; then
    echo "[litellm] Proxy ready!"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[litellm] ERROR: Proxy failed to start. Check /tmp/litellm.log"
    cat /tmp/litellm.log
    kill $LITELLM_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# ── Point Claude CLI at LiteLLM ───────────────────────────────────────────
export ANTHROPIC_BASE_URL="http://127.0.0.1:$LITELLM_PORT"
export ANTHROPIC_API_KEY="$LITELLM_MASTER_KEY"

# ── Cleanup on exit ───────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "[litellm] Shutting down proxy (PID $LITELLM_PID)..."
  kill $LITELLM_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# ── Print available models ────────────────────────────────────────────────
echo ""
echo "┌─────────────────────────────────────────────────────────────────┐"
echo "│   Claude CLI  ·  Multi-LLM via Replit AI Proxy                 │"
echo "├─────────────────────────────────────────────────────────────────┤"
echo "│  Anthropic:   claude-opus-4-6, claude-sonnet-4-6 (default)     │"
echo "│               claude-haiku-4-5                                  │"
echo "│  OpenAI:      gpt-5.2, gpt-5-mini, gpt-5-nano, o4-mini        │"
echo "│  Gemini:      gemini-3.1-pro-preview, gemini-2.5-pro/flash     │"
echo "│  OpenRouter:  deepseek/deepseek-r1, x-ai/grok-3,              │"
echo "│               meta-llama/llama-4-maverick, mistral-large-2     │"
echo "└─────────────────────────────────────────────────────────────────┘"
echo ""

# Pass all args through to claude (--model overrides the default)
exec claude --model "$DEFAULT_MODEL" "$@"
