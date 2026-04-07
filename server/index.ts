import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { registerAuthRoutes } from "./src/auth-routes";
import { registerAIRoutes } from "./ai-routes";
import { registerGraphQL } from "./graphql/index";
import { setupCodexBridge } from "./codex-bridge";
import { serveStatic } from "./static";
import { createServer } from "http";
import { ensureTablesExist } from "./db-init";
import { applyPerformancePragmas } from "./db";
import { warmAllCaches } from "./cache-warmer";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirnameServer = path.dirname(fileURLToPath(import.meta.url));

function startGoAPI() {
  const goApiDir = path.resolve(__dirnameServer, "..", "go-api");
  const startScript = path.join(goApiDir, "start.sh");
  const goPort = process.env.GO_API_PORT || "3001";

  const child = spawn("bash", [startScript], {
    env: {
      ...process.env,
      GO_API_PORT: goPort,
      DATABASE_PATH: path.resolve(__dirnameServer, "..", "local.db"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (d: Buffer) => process.stdout.write(`[go-api] ${d}`));
  child.stderr.on("data", (d: Buffer) => process.stderr.write(`[go-api] ${d}`));
  child.on("exit", (code: number | null) => {
    if (code !== 0 && code !== null) {
      console.error(`[go-api] exited with code ${code} — restarting in 3s`);
      setTimeout(startGoAPI, 3000);
    }
  });

  console.log(`[go-api] started on port ${goPort}`);
}

function startAnthropicProxy() {
  const proxyScript = path.resolve(__dirnameServer, "..", "anthropic-proxy.py");
  const proxyPort = "4000";

  const child = spawn("python3", [proxyScript], {
    env: {
      ...process.env,
      PROXY_PORT: proxyPort,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (d: Buffer) => process.stdout.write(`[anthropic-proxy] ${d}`));
  child.stderr.on("data", (d: Buffer) => process.stderr.write(`[anthropic-proxy] ${d}`));
  child.on("exit", (code: number | null) => {
    if (code !== 0 && code !== null) {
      console.error(`[anthropic-proxy] exited with code ${code} — restarting in 3s`);
      setTimeout(startAnthropicProxy, 3000);
    }
  });

  console.log(`[anthropic-proxy] started on port ${proxyPort}`);
}

// Suppress Vite's non-fatal "Failed to parse JSON file" noise that comes from
// application/ld+json inline scripts in index.html being processed by the JSON plugin.
// This is a dev-only cosmetic issue; the app serves correctly regardless.
if (process.env.NODE_ENV !== "production") {
  const originalWrite = process.stderr.write.bind(process.stderr);
  (process.stderr.write as typeof process.stderr.write) = function(chunk: any, ...args: any[]) {
    if (typeof chunk === "string" && chunk.includes("Failed to parse JSON file")) {
      return true;
    }
    return (originalWrite as any)(chunk, ...args);
  };
}

const app = express();
const httpServer = createServer(app);

function startKeepAlive() {
  const port = parseInt(process.env.PORT || "5173", 10);
  const host = process.env.REPLIT?.includes("1") ? "localhost" : "0.0.0.0";
  const pingInterval = 4 * 60 * 1000; // 4 minutes (Replit sleeps after ~5 min)
  const keepAliveUrl = `http://${host}:${port}/api/keep-alive`;

  log(`Starting keep-alive pings to ${keepAliveUrl} every ${pingInterval / 1000}s`, "keepalive");

  const ping = async () => {
    try {
      const response = await fetch(keepAliveUrl, { 
        method: "GET",
        signal: AbortSignal.timeout(10000)
      });
      log(`Keep-alive ping successful: ${response.status}`, "keepalive");
    } catch (error) {
      log(`Keep-alive ping failed: ${error}`, "keepalive");
    }
  };

  ping();
  setInterval(ping, pingInterval);
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Gzip compression for all responses — 60-70% smaller payloads
// threshold: 512 bytes — compress even small API responses (JSON arrays)
// level: 6 — good balance of speed vs compression ratio
app.use(compression({
  level: 6,
  threshold: 512,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// Keep-alive + performance headers on every response
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.set("Connection", "keep-alive");
  res.set("Keep-Alive", "timeout=60, max=1000");
  next();
});

// Security headers — Content Security Policy and other hardening
app.use((req: Request, res: Response, next: NextFunction) => {
  const isDev = process.env.NODE_ENV !== "production";

  // Content-Security-Policy
  // - default-src 'self': only load resources from same origin by default
  // - script-src allows 'unsafe-inline' only in dev (Vite HMR requires it)
  // - style-src 'unsafe-inline' needed for CSS-in-JS and Tailwind
  // - img-src allows data: URIs (avatars, chart images) and external URLs
  // - connect-src allows Replit dev proxy and API calls
  const scriptSrc = isDev
    ? `'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net`
    : `'self' 'unsafe-inline' https://cdn.jsdelivr.net`;

  res.setHeader("Content-Security-Policy", [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https:`,
    `connect-src 'self' ws: wss: https:`,
    `worker-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join("; "));

  // Prevent MIME-type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Strict XSS protection for older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Only send referrer for same-origin requests
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Disable browser features not needed by the app
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  next();
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

(async () => {
  // 1. Apply SQLite performance PRAGMAs first (WAL mode, 64MB cache, mmap)
  await applyPerformancePragmas();

  // 2. Ensure all DB tables + indexes exist
  await ensureTablesExist();

  // 3. Register routes
  await registerRoutes(httpServer, app);
  await registerAuthRoutes(httpServer, app);
  registerAIRoutes(app);
  registerGraphQL(app);
  setupCodexBridge(httpServer);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 5173 which is mapped to external port 80 in Replit.
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || "5173", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
      startKeepAlive();
      startGoAPI();
      if (process.env.NODE_ENV !== "production") {
        startAnthropicProxy();
      }
      // Pre-warm all caches in the background — non-blocking.
      // Any request arriving before warm-up completes will hit the DB once,
      // then cache for all subsequent requests.
      warmAllCaches().catch((err) => {
        console.warn("[cache-warmer] Background warm-up failed:", err);
      });
    },
  );

  const shutdown = () => {
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})();
