import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Build timestamp for service worker cache busting
const SW_VERSION = `v${Date.now()}`;

// Prevent Vite's JSON plugin from trying to parse application/ld+json inline scripts
const preserveJsonLd: Plugin = {
  name: "preserve-json-ld",
  transformIndexHtml: {
    order: "pre",
    handler(html: string) {
      return html.replace(
        /(<script\s+type="application\/ld\+json")/g,
        '$1 data-vite-no-transform="true"'
      );
    },
  },
};

export default defineConfig({
  base: process.env.VITE_BASE_URL || "/",
  // Inject SW version globally for cache busting
  define: {
    __SW_VERSION__: JSON.stringify(SW_VERSION),
  },
  plugins: [
    preserveJsonLd,
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      "react": path.resolve(import.meta.dirname, "node_modules/react"),
      "react-dom": path.resolve(import.meta.dirname, "node_modules/react-dom"),
      "react-dom/client": path.resolve(import.meta.dirname, "node_modules/react-dom/client"),
    },
    dedupe: ["react", "react-dom", "wouter", "@tanstack/react-query"],
  },
  css: {
    // Tailwind v4 handles CSS via the @tailwindcss/vite plugin.
    // We set dev sourcemaps for debugging but disable them in production.
    devSourcemap: false,
    // Lightning CSS for faster minification (Tailwind v4 default)
    // No PostCSS plugins needed — Tailwind v4 uses its own transformer.
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Optimize chunk loading for faster SPA navigation
    chunkSizeWarningLimit: 1500,
    minify: 'esbuild',
    sourcemap: false,
    target: 'esnext',
    cssCodeSplit: true,
    cssMinify: true,
    // Enable manifest for asset tracking
    manifest: true,
    // Report compressed sizes for cache budget awareness
    reportCompressedSize: true,
    // Inline small assets (<4KB) as data URIs to reduce HTTP requests
    assetsInlineLimit: 4096,
    // Optimize module preload for faster chunk loading
    modulePreload: {
      polyfill: false, // Modern browsers support native module preload
    },
    // Use Vite's built-in vendor chunk splitting
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Better code splitting to avoid circular dependencies
    rollupOptions: {
      output: {
        // Content-hashed filenames for aggressive caching
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop();
          if (extType === 'css') {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        // Optimized manualChunks: consolidate into logical groups
        // Strategy: ~10 chunks instead of 26+ to reduce HTTP overhead
        // while still allowing browser-parallel downloads
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          // === CORE (always loaded, highest priority) ===
          // React + React DOM + scheduler - the foundation
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
            return 'vendor-core';
          }

          // === UI FRAMEWORK (loaded on every page) ===
          // Radix primitives + floating-ui + CVA + clsx/tailwind-merge
          // These are the building blocks of all shadcn/ui components
          if (id.includes('@radix-ui/') || id.includes('@floating-ui/') ||
              id.includes('class-variance-authority') || id.includes('clsx') ||
              id.includes('tailwind-merge') || id.includes('tw-animate-css')) {
            return 'vendor-ui';
          }

          // === ICONS (loaded on every page) ===
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }

          // === ROUTING + DATA (loaded on every page) ===
          // wouter (router) + TanStack Query (data fetching)
          if (id.includes('wouter') || id.includes('@tanstack/')) {
            return 'vendor-data';
          }

          // === ANIMATION (loaded on every page - 107 files use framer-motion) ===
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
            return 'vendor-motion';
          }

          // === FORMS (used across many pages) ===
          // react-hook-form + zod + resolvers
          if (id.includes('react-hook-form') || id.includes('@hookform') ||
              id.includes('zod') || id.includes('zod-validation-error')) {
            return 'vendor-forms';
          }

          // === HEAVY LAZY-LOADED (only loaded on specific pages) ===
          // These are dynamically imported and should NOT block initial load

          // Mermaid diagrams - only on pages with diagrams
          if (id.includes('mermaid')) {
            return 'vendor-mermaid';
          }

          // Monaco editor - only on coding challenge pages
          if (id.includes('@monaco-editor/') || id.includes('monaco-editor')) {
            return 'vendor-editor';
          }

          // Markdown rendering - only on review/SRS pages
          if (id.includes('react-markdown') || id.includes('remark-') ||
              id.includes('rehype-') || id.includes('hast-') ||
              id.includes('unist-') || id.includes('vfile-') ||
              id.includes('mdast-') || id.includes('micromark') ||
              id.includes('bail') || id.includes('ccount') ||
              id.includes('character-') || id.includes('fault') ||
              id.includes('is-plain-obj') || id.includes('trough') ||
              id.includes('unified') || id.includes('devlop')) {
            return 'vendor-markdown';
          }

          // Syntax highlighting - only on code display pages
          if (id.includes('react-syntax-highlighter') || id.includes('highlight.js') ||
              id.includes('lowlight') || id.includes('refractor') ||
              id.includes('prismjs')) {
            return 'vendor-syntax';
          }

          // === MISC UI COMPONENTS (grouped to reduce chunk count) ===
          // cmdk, vaul, sonner, input-otp, resizable-panels, day-picker,
          // embla-carousel, recharts - all grouped into one chunk
          if (id.includes('cmdk') || id.includes('vaul') || id.includes('sonner') ||
              id.includes('input-otp') || id.includes('react-resizable-panels') ||
              id.includes('react-day-picker') || id.includes('embla-carousel') ||
              id.includes('recharts') || id.includes('d3-') || id.includes('delaunator') ||
              id.includes('robust-predicates') || id.includes('internmap')) {
            return 'vendor-ui-extras';
          }

          // === THEMES + DATES ===
          if (id.includes('next-themes') || id.includes('use-sync-external-store')) {
            return 'vendor-themes';
          }

          if (id.includes('date-fns')) {
            return 'vendor-date';
          }

          // === DEAD CODE (not imported in client/src but in package.json) ===
          // @mui/*, @emotion/*, react-router-dom, @langchain/*, @qdrant/*,
          // bash-language-server, yaml-language-server, pyright, sharp
          // These are excluded from the bundle by not being imported.
          // If they somehow get pulled in, group them together so they don't
          // bloat the main chunks.
          if (id.includes('@mui/') || id.includes('@emotion/') ||
              id.includes('react-router-dom') || id.includes('@langchain/') ||
              id.includes('langgraph') || id.includes('@qdrant/') ||
              id.includes('bash-language-server') || id.includes('yaml-language-server') ||
              id.includes('pyright') || id.includes('sharp') ||
              id.includes('passport') || id.includes('express') ||
              id.includes('pg') || id.includes('connect-pg')) {
            return 'vendor-dead'; // Will be tree-shaken to near-zero
          }

          // Better Auth and auth utilities
          if (id.includes('better-auth') || id.includes('better-call') ||
              id.includes('oslo') || id.includes('@node-rs/') ||
              id.includes('jose') || id.includes('nanostores')) {
            return 'vendor-auth';
          }

          // Chart / data-viz
          if (id.includes('recharts') || id.includes('d3-') ||
              id.includes('delaunator') || id.includes('robust-predicates') ||
              id.includes('internmap') || id.includes('victory')) {
            return 'vendor-charts';
          }

          // Everything else — should be small after the above splits
          return 'vendor-libs';
        },
      },
    },
  },
  optimizeDeps: {
    // Pre-bundle ALL commonly-used deps at server start.
    // Each dep NOT listed here gets lazily compiled on first import,
    // causing a visible stall. Listing them here moves that cost to startup.
    include: [
      // React core
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      // Routing + data
      'wouter',
      '@tanstack/react-query',
      // UI primitives
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
      // Icons
      'lucide-react',
      // Styling utilities
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      // Animation
      'framer-motion',
      // Forms
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      // Notifications
      'sonner',
      // Theme
      'next-themes',
      // Dates
      'date-fns',
      // Utils
      'cmdk',
      // Syntax highlighting — CJS modules that require pre-bundling for ESM compat
      'react-syntax-highlighter',
      'react-syntax-highlighter/dist/esm/styles/prism',
      'react-syntax-highlighter/dist/esm/styles/hljs',
    ],
    // Explicitly exclude only libs that are pure ESM and are truly lazy-loaded.
    // CJS libs must be included (not excluded) so Vite transforms them correctly.
    exclude: [
      'mermaid',
      '@monaco-editor/react',
      'monaco-editor',
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
        target: `http://localhost:${process.env.BACKEND_PORT || 5000}`,
        changeOrigin: true,
      },
    },
    // Pre-transform the main entry on startup so the first browser request
    // hits a warm cache instead of triggering on-demand compilation.
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/components/layout/AppLayout.tsx',
        './src/pages/Home.tsx',
        './src/lib/queryClient.ts',
      ],
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
