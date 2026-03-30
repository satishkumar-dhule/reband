import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Build timestamp for service worker cache busting
const SW_VERSION = `v${Date.now()}`;

export default defineConfig({
  base: process.env.VITE_BASE_URL || "/",
  // Inject SW version globally for cache busting
  define: {
    __SW_VERSION__: JSON.stringify(SW_VERSION),
  },
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
    // Optimize chunk loading for faster SPA navigation
    chunkSizeWarningLimit: 2000,
    minify: 'esbuild',
    sourcemap: false,
    target: 'esnext',
    cssCodeSplit: true,
    // Enable experimental features for better code splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React core - load immediately
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            // MUI - separate chunk
            if (id.includes('@mui/material') || id.includes('@mui/icons')) {
              return 'vendor-mui';
            }
            // Framer Motion - separate for animations
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // React Query - load after initial render
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            // Charts - heavy, separate chunk
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Mermaid - very heavy (2.9MB), lazy load
            if (id.includes('mermaid')) {
              return 'vendor-mermaid';
            }
            // AI/LangChain - very heavy
            if (id.includes('@langchain') || id.includes('langgraph')) {
              return 'vendor-ai';
            }
            // Syntax highlighter - separate for code blocks
            if (id.includes('react-syntax-highlighter')) {
              return 'vendor-syntax';
            }
            // Markdown processing - separate for review pages
            if (id.includes('react-markdown') || id.includes('remark-')) {
              return 'vendor-markdown';
            }
            // Framer Motion - already separated above, but ensure it's not bundled
            return 'vendor-other';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      '@tanstack/react-query',
    ],
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
