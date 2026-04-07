#!/usr/bin/env node
/**
 * Build script: compiles worker/cf-pages-entry.ts → dist/public/_worker.js
 * This is required for Cloudflare Pages deployment so the API Functions
 * are reliably served instead of relying on auto-detection of the functions/ dir.
 */
import { build } from "esbuild";
import { mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

mkdirSync(resolve(root, "dist/public"), { recursive: true });

console.log("⚙️  Building CF Pages worker (_worker.js)...");

await build({
  entryPoints: [resolve(root, "worker/cf-pages-entry.ts")],
  bundle: true,
  outfile: resolve(root, "dist/public/_worker.js"),
  format: "esm",
  platform: "browser",
  target: "es2020",
  minify: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  external: [],
  logLevel: "info",
});

console.log("✅ CF Pages worker built → dist/public/_worker.js");
