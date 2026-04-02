import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

/**
 * Extract inline <script type="application/ld+json"> blocks from HTML before
 * passing to Vite — Vite's JSON plugin tries to parse them and throws.
 * We stash them and splice them back in after transformation.
 */
function extractJsonLdScripts(html: string): { html: string; scripts: string[] } {
  const scripts: string[] = [];
  const PLACEHOLDER = "<!--__JSON_LD_PLACEHOLDER__-->";
  const cleaned = html.replace(
    /<script\s+type="application\/ld\+json"[\s\S]*?<\/script>/gi,
    (match) => {
      scripts.push(match);
      return PLACEHOLDER;
    }
  );
  return { html: cleaned, scripts };
}

function restoreJsonLdScripts(html: string, scripts: string[]): string {
  let result = html;
  const PLACEHOLDER = "<!--__JSON_LD_PLACEHOLDER__-->";
  for (const script of scripts) {
    result = result.replace(PLACEHOLDER, script);
  }
  return result;
}

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        if (msg.includes("Failed to parse JSON file")) return;
        viteLogger.error(msg, options);
        if (options?.error?.message?.includes("Failed to resolve")) {
          process.exit(1);
        }
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    if (url.startsWith('/@') || url.startsWith('/vite-hmr') || url.startsWith('/api')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let rawTemplate = await fs.promises.readFile(clientTemplate, "utf-8");
      rawTemplate = rawTemplate.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      // Extract JSON-LD scripts before Vite processes the HTML.
      // Vite's JSON plugin tries to parse them and throws an error.
      const { html: safeTemplate, scripts: jsonLdScripts } = extractJsonLdScripts(rawTemplate);

      const transformedPage = await vite.transformIndexHtml(url, safeTemplate);

      // Restore JSON-LD scripts into the final HTML
      const page = restoreJsonLdScripts(transformedPage, jsonLdScripts);

      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
