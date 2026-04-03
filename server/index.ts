import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { registerAuthRoutes } from "./src/auth-routes";
import { serveStatic } from "./static";
import { createServer } from "http";

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

// Gzip/Brotli compression for all responses — 60-70% smaller payloads
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

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
  await registerRoutes(httpServer, app);
  await registerAuthRoutes(httpServer, app);

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
    },
  );

  const shutdown = () => {
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})();
