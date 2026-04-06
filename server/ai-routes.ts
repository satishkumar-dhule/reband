import type { Express, Request, Response } from "express";
import OpenAI from "openai";

function getOpenAIClient(): OpenAI {
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseURL || !apiKey) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY must be set"
    );
  }

  return new OpenAI({ baseURL, apiKey });
}

export function registerAIRoutes(app: Express): void {
  /**
   * POST /api/ai/chat
   * Proxies chat completion requests through Replit's OpenAI integration.
   * Streams responses back to the client as SSE.
   *
   * Body: { messages: Array<{role, content}>, model?: string, maxTokens?: number }
   */
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { messages, model = "gpt-5.2", maxTokens = 8192 } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "messages array is required" });
        return;
      }

      const openai = getOpenAIClient();

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const stream = await openai.chat.completions.create({
        model,
        max_completion_tokens: maxTokens,
        messages,
        stream: true,
      });

      let fullContent = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, fullContent })}\n\n`);
      res.end();
    } catch (err: any) {
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "AI request failed" });
      } else {
        res.write(`data: ${JSON.stringify({ error: err.message || "AI request failed" })}\n\n`);
        res.end();
      }
    }
  });

  /**
   * POST /api/ai/complete
   * Non-streaming chat completion — returns the full response as JSON.
   *
   * Body: { messages: Array<{role, content}>, model?: string, maxTokens?: number }
   */
  app.post("/api/ai/complete", async (req: Request, res: Response) => {
    try {
      const { messages, model = "gpt-5.2", maxTokens = 8192 } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "messages array is required" });
        return;
      }

      const openai = getOpenAIClient();

      const response = await openai.chat.completions.create({
        model,
        max_completion_tokens: maxTokens,
        messages,
        stream: false,
      });

      const content = response.choices[0]?.message?.content ?? "";
      res.json({ content, model: response.model });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "AI request failed" });
    }
  });
}
