/**
 * Codex WebSocket Bridge
 *
 * Codex CLI communicates via WebSocket to the OpenAI Responses API.
 * Replit's AI proxy only supports the HTTP Responses API (not WebSocket).
 *
 * This bridge:
 *  1. Accepts WebSocket connections at /responses
 *  2. Translates WebSocket messages to HTTP POSTs against the Replit proxy
 *  3. Streams SSE events from the proxy back over the WebSocket
 *
 * Configure Codex to use this server:
 *   openai_base_url = "http://localhost:<PORT>"
 */

import type { Server as HttpServer } from "http";
import type { IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";

const REPLIT_BASE_URL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const REPLIT_API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

export function setupCodexBridge(httpServer: HttpServer): void {
  if (!REPLIT_BASE_URL || !REPLIT_API_KEY) {
    console.warn(
      "[codex-bridge] AI_INTEGRATIONS_OPENAI_BASE_URL / API_KEY not set — bridge disabled"
    );
    return;
  }

  const wss = new WebSocketServer({ noServer: true });

  // Handle the WebSocket upgrade only for /responses
  httpServer.on("upgrade", (request: IncomingMessage, socket, head) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    if (url.pathname !== "/responses") {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws: WebSocket) => {
    console.log("[codex-bridge] Codex connected");

    ws.on("message", async (rawData) => {
      let msg: any;
      try {
        msg = JSON.parse(rawData.toString());
      } catch {
        sendWsError(ws, "invalid_json", "Could not parse WebSocket message as JSON");
        return;
      }

      if (msg.type !== "response.create") {
        // Forward unknown event types back — some clients send session.update etc.
        return;
      }

      const responsePayload = { ...(msg.response ?? {}), stream: true };

      try {
        const httpResponse = await fetch(`${REPLIT_BASE_URL}/responses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${REPLIT_API_KEY}`,
          },
          body: JSON.stringify(responsePayload),
        });

        if (!httpResponse.ok || !httpResponse.body) {
          const body = await httpResponse.text().catch(() => httpResponse.statusText);
          sendWsError(ws, "proxy_error", `Replit proxy error ${httpResponse.status}: ${body}`);
          return;
        }

        const reader = httpResponse.body.getReader();
        const decoder = new TextDecoder();

        // SSE → WebSocket forwarding
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          for (const line of text.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]" || payload === "") continue;
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(payload);
            }
          }
        }
      } catch (err: any) {
        console.error("[codex-bridge] proxy fetch error:", err.message);
        sendWsError(ws, "fetch_error", err.message ?? "Unknown error");
      }
    });

    ws.on("close", () => console.log("[codex-bridge] Codex disconnected"));
    ws.on("error", (err) => console.error("[codex-bridge] ws error:", err.message));
  });

  console.log("[codex-bridge] WebSocket bridge active at ws://localhost:<PORT>/responses");
}

function sendWsError(ws: WebSocket, code: string, message: string): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "error",
        error: { type: "server_error", code, message },
      })
    );
  }
}
