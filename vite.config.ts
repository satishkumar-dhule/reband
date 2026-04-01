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
    chunkSizeWarningLimit: 1500,
    minify: 'esbuild',
    sourcemap: false,
    target: 'esnext',
    cssCodeSplit: true,
    // Enable manifest for asset tracking
    manifest: true,
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
        // Use function form to avoid circular chunks
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          
          // Heavy libraries first - these need to be isolated
          if (id.includes('mermaid')) {
            return 'vendor-mermaid';
          }
          
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          
          if (id.includes('@monaco-editor/')) {
            return 'vendor-editor';
          }
          
          // Group React and its direct dependencies
          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'vendor-react';
          }
          
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          
          if (id.includes('class-variance-authority')) {
            return 'vendor-cva';
          }
          
          if (id.includes('@radix-ui/')) {
            return 'vendor-radix';
          }
          
          if (id.includes('@floating-ui/')) {
            return 'vendor-floating';
          }
          
          if (id.includes('@tanstack/react-query') || id.includes('@tanstack/query')) {
            return 'vendor-query';
          }
          
          if (id.includes('cmdk')) {
            return 'vendor-cmdk';
          }
          
          if (id.includes('react-markdown') || id.includes('remark-') || 
              id.includes('rehype-') || id.includes('hast-') || 
              id.includes('unist-') || id.includes('vfile-') ||
              id.includes('mdast-') || id.includes('micromark') ||
              id.includes('bail') || id.includes('ccount') ||
              id.includes('character') || id.includes('fault') ||
              id.includes('format')) {
            return 'vendor-markdown';
          }
          
          if (id.includes('react-syntax-highlighter')) {
            return 'vendor-syntax';
          }
          
          if (id.includes('@mui/')) {
            return 'vendor-mui';
          }
          
          if (id.includes('@langchain/') || id.includes('langgraph') || id.includes('@qdrant/')) {
            return 'vendor-ai';
          }
          
          if (id.includes('date-fns')) {
            return 'vendor-date';
          }
          
          if (id.includes('embla-carousel')) {
            return 'vendor-carousel';
          }
          
          if (id.includes('sonner')) {
            return 'vendor-toast';
          }
          
          if (id.includes('wouter')) {
            return 'vendor-router';
          }
          
          if (id.includes('vaul')) {
            return 'vendor-vaul';
          }
          
          if (id.includes('input-otp')) {
            return 'vendor-otp';
          }
          
          if (id.includes('react-resizable-panels')) {
            return 'vendor-resizable';
          }
          
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'vendor-forms';
          }
          
          if (id.includes('next-themes')) {
            return 'vendor-themes';
          }
          
          if (id.includes('react-day-picker')) {
            return 'vendor-daypicker';
          }
          
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          
          return 'vendor-libs';
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
      'lucide-react',
      'framer-motion',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
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
        target: 'http://localhost:5173',
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
