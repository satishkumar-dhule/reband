import app from "./index";

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  DB?: any;
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  CORS_ORIGINS?: string;
  GO_API_URL?: string;
  LOG_LEVEL?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return app.fetch(request, env as any, ctx);
    }

    if (url.pathname.startsWith("/go-api/")) {
      const goApiUrl = (env as any).GO_API_URL || "https://devprep-go-api.workers.dev";
      const path = url.pathname.replace(/^\/go-api/, "");
      const targetUrl = `${goApiUrl}${path}${url.search}`;
      return fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" && request.method !== "HEAD"
          ? await request.clone().arrayBuffer()
          : undefined,
      });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      return env.ASSETS.fetch(
        new Request(new URL("/index.html", request.url).toString(), {
          headers: request.headers,
        })
      );
    }
    return response;
  },
};
