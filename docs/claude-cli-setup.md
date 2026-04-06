# Claude CLI + Replit AI Proxy Setup

How this project configures Claude CLI to use Anthropic (and other LLMs) through
Replit's built-in AI proxy — **no personal API keys required**.

---

## Why this exists

Replit's AI integrations give you free/billed access to Anthropic, OpenAI, Gemini, and
OpenRouter through a local HTTP proxy at `localhost:1106/modelfarm/<provider>`.

The problem: Replit's Anthropic proxy is backed by **Google Vertex AI**, which rejects
`cache_control` fields that Claude CLI always sends in its requests
(`"Extra inputs are not permitted"`).

The fix: a thin Python proxy (`anthropic-proxy.py`) sits between Claude CLI and the
Replit proxy, silently stripping `cache_control` before forwarding.

```
Claude CLI
   │  ANTHROPIC_BASE_URL=http://localhost:4000
   ▼
anthropic-proxy.py  ← strips cache_control, betas, etc.
   │  AI_INTEGRATIONS_ANTHROPIC_BASE_URL=http://localhost:1106/modelfarm/anthropic
   ▼
Replit Anthropic proxy  (Vertex AI backend)
   │
   ▼
Claude API response
```

---

## Files

| File | Purpose |
|---|---|
| `anthropic-proxy.py` | The strip proxy. Pure stdlib Python, no dependencies. |
| `server/index.ts` | Spawns the proxy automatically when the dev server starts. |
| `.replit` `[userenv.development]` | Sets `ANTHROPIC_BASE_URL=http://localhost:4000`. |
| `cl.sh` | Optional launcher for Claude CLI with multi-LLM support (LiteLLM). |
| `.claude/litellm-config.yaml` | LiteLLM config mapping model names to Replit proxies. |

---

## How it starts automatically

`server/index.ts` calls `startAnthropicProxy()` in its startup callback (dev-only).
It spawns `python3 anthropic-proxy.py` as a child process, the same way the Go API
sub-service is spawned. If the proxy exits with a non-zero code, it restarts after 3s.

```ts
// server/index.ts (simplified)
function startAnthropicProxy() {
  const child = spawn("python3", ["anthropic-proxy.py"], {
    env: { ...process.env, PROXY_PORT: "4000" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) setTimeout(startAnthropicProxy, 3000);
  });
}

// Inside the httpServer.listen callback:
if (process.env.NODE_ENV !== "production") {
  startAnthropicProxy();
}
```

Confirm it started by checking the "Start application" workflow logs for:
```
[anthropic-proxy] started on port 4000
[proxy] Anthropic strip-proxy listening on http://127.0.0.1:4000
[proxy] Forwarding to: http://localhost:1106/modelfarm/anthropic
```

---

## Environment variables

Set in `.replit` under `[userenv.development]` (Replit manages these automatically):

| Variable | Value | Set by |
|---|---|---|
| `ANTHROPIC_BASE_URL` | `http://localhost:4000` | Manually (points at strip proxy) |
| `ANTHROPIC_API_KEY` | `_DUMMY_API_KEY_` | Manually (Claude CLI requires a non-empty key) |
| `LITELLM_MASTER_KEY` | `sk-local-dev-key` | Manually (only needed if using LiteLLM/cl.sh) |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | `http://localhost:1106/modelfarm/anthropic` | Auto by Replit integration |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | (Replit-managed token) | Auto by Replit integration |
| `AI_INTEGRATIONS_OPENAI_*` | `http://localhost:1106/modelfarm/openai` | Auto by Replit integration |
| `AI_INTEGRATIONS_GEMINI_*` | `http://localhost:1106/modelfarm/gemini` | Auto by Replit integration |
| `AI_INTEGRATIONS_OPENROUTER_*` | `http://localhost:1106/modelfarm/openrouter` | Auto by Replit integration |

> **Never** set `ANTHROPIC_BASE_URL` to `localhost:4000` (no scheme).
> Always use the full `http://localhost:4000`.

---

## Using Claude CLI

Just open a terminal and run:

```bash
claude
```

The env vars are already set by the Replit environment. No `export` needed.

---

## How to replicate from scratch

### 1. Provision Replit AI integrations

Go to **Tools → Integrations** and add:
- Anthropic
- OpenAI
- Google Gemini
- OpenRouter

Replit will inject `AI_INTEGRATIONS_<PROVIDER>_BASE_URL` and
`AI_INTEGRATIONS_<PROVIDER>_API_KEY` into your environment automatically.

### 2. Set development environment variables

In **Tools → Secrets** (or by editing `[userenv.development]` in `.replit` via the
Replit UI), set:

```toml
ANTHROPIC_BASE_URL = "http://localhost:4000"
ANTHROPIC_API_KEY  = "_DUMMY_API_KEY_"
```

`ANTHROPIC_API_KEY` just needs to be non-empty; the real auth happens inside the
Replit proxy using the managed `AI_INTEGRATIONS_ANTHROPIC_API_KEY`.

### 3. Copy `anthropic-proxy.py` to the project root

The proxy uses only Python 3 standard library (`http.server`, `urllib`, `json`).
No `pip install` required.

Key env vars it reads at runtime:
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — where to forward requests (set by Replit)
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — the real auth token (set by Replit)
- `PROXY_PORT` — port to listen on (default: `4000`)

### 4. Wire it into your dev server

In your Express server entry point, add a spawn call (dev-only):

```ts
import { spawn } from "child_process";
import path from "path";

function startAnthropicProxy() {
  const child = spawn("python3", [path.resolve(__dirname, "../anthropic-proxy.py")], {
    env: { ...process.env, PROXY_PORT: "4000" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (d) => process.stdout.write(`[anthropic-proxy] ${d}`));
  child.stderr.on("data", (d) => process.stderr.write(`[anthropic-proxy] ${d}`));
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) setTimeout(startAnthropicProxy, 3000);
  });
}

// In your server listen callback:
if (process.env.NODE_ENV !== "production") {
  startAnthropicProxy();
}
```

### 5. Verify

```bash
curl -s -X POST http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -H "x-api-key: _DUMMY_API_KEY_" \
  -d '{
    "model": "claude-haiku-4-5",
    "max_tokens": 10,
    "system": [{"type":"text","text":"Be brief.","cache_control":{"type":"ephemeral"}}],
    "messages": [{"role":"user","content":"Say OK"}]
  }'
```

Expected: JSON response with `"text":"OK"` (no Vertex AI rejection error).

---

## Multi-LLM via cl.sh (optional)

`cl.sh` is a convenience wrapper that starts a LiteLLM proxy (port 4000) before
launching Claude CLI, allowing you to pass `--model gpt-5.2`, `--model gemini-2.5-pro`,
etc. The LiteLLM config lives in `.claude/litellm-config.yaml`.

> **Note:** `cl.sh` conflicts with `anthropic-proxy.py` — both claim port 4000.
> The current working setup uses `anthropic-proxy.py` (the simpler path).
> `cl.sh` + LiteLLM is available for multi-LLM use but requires LiteLLM to be
> installed (`pip install litellm`) and the dev server's `startAnthropicProxy()`
> to be disabled or moved to a different port.

---

## What the proxy strips

`anthropic-proxy.py` recursively removes these from every request body before forwarding:

| Removed field | Reason |
|---|---|
| `cache_control` (anywhere in the JSON) | Vertex AI rejects it: "Extra inputs are not permitted" |
| Top-level `betas` key | Not supported by Vertex AI backend |
| Top-level `system_betas` key | Not supported by Vertex AI backend |

All other fields (model, messages, max_tokens, tools, etc.) pass through unchanged.
