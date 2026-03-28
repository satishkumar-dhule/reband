import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: process.env.VITE_BASE_URL || "/",
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            if (id.includes('@mui/material') || id.includes('@mui/icons')) {
              return 'vendor-mui';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('mermaid')) {
              return 'vendor-mermaid';
            }
            if (id.includes('@langchain') || id.includes('langgraph')) {
              return 'vendor-ai';
            }
            return 'vendor-other';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    minify: 'esbuild',
    sourcemap: false,
    target: 'esnext',
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: [],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3333,
  },
  appType: 'spa',
  esbuild: {
    target: 'esnext',
  },
});
