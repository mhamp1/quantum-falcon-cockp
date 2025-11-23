import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, PluginOption } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

if (!process.env.SPARK_DIR) {
  process.env.SPARK_DIR = projectRoot
}

// Custom plugin to inject polyfills before anything else
function polyfillsPlugin(): PluginOption {
  return {
    name: 'polyfills-injector',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(
          '<head>',
          `<head>
    <script>
      // Global polyfills - must run before any module loads
      window.global = window;
      window.process = window.process || { 
        env: {}, 
        browser: true,
        nextTick: (fn) => setTimeout(fn, 0),
        version: '',
        versions: { node: '' }
      };
    </script>`
        )
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  // CRITICAL: Set base path for correct asset loading
  // Use '/' for Vercel/Spark (root deployment)
  base: '/',
  // Explicit entry point for build
  build: {
    // Use content-based chunk naming to prevent stale chunk issues
    rollupOptions: {
      input: resolve(projectRoot, 'index.html'),
      output: {
        // Content-based hashing ensures chunks update when content changes
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // CRITICAL: Fixed chunking to prevent "exports is undefined" errors
        // Strategy: Separate Solana from other vendors to prevent module resolution issues
        manualChunks: (id) => {
          // Only chunk node_modules
          if (!id.includes('node_modules')) {
            return;
          }
          
          // React and core dependencies MUST be in separate chunk (loads first)
          if (
            id.includes('/react/') || 
            id.includes('/react-dom/') || 
            id.includes('/react-is/') ||
            id.includes('/scheduler/') ||
            id.includes('react/jsx-runtime')
          ) {
            return 'vendor-react';
          }
          
          // Solana packages in separate chunk (they have complex interdependencies)
          // This prevents "J4 is undefined" errors caused by circular dependencies
          if (
            id.includes('@solana/') ||
            id.includes('bn.js') ||
            id.includes('buffer') ||
            id.includes('borsh')
          ) {
            return 'vendor-solana';
          }
          
          // Large UI libraries in their own chunk
          if (
            id.includes('framer-motion') ||
            id.includes('radix-ui') ||
            id.includes('recharts') ||
            id.includes('three') ||
            id.includes('d3')
          ) {
            return 'vendor-ui';
          }
          
          // Socket.io and dependencies in separate chunk to avoid EventEmitter issues
          if (
            id.includes('socket.io-client') ||
            id.includes('eventemitter3') ||
            id.includes('engine.io-client')
          ) {
            return 'vendor-websocket';
          }
          
          // Everything else in vendor chunk
          return 'vendor';
        },
      },
    },
    // Ensure proper HTML handling
    outDir: 'dist',
    emptyOutDir: true,
    // CRITICAL: Disable modulePreload to prevent chunk loading race conditions
    // The manual chunking strategy ensures proper load order instead
    modulePreload: false,
    // Ensure chunks load in correct order
    cssCodeSplit: true,
    // Target modern browsers for better module support
    target: 'esnext',
    // Minify options to prevent module issues
    minify: 'esbuild',
    // Increase chunk size warning limit (large vendor bundles are expected)
    chunkSizeWarningLimit: 2000,
    // Generate sourcemaps but don't expose them to users (for debugging production issues)
    sourcemap: 'hidden',
  },
  // Enable CommonJS interop for better module compatibility
  commonjsOptions: {
    include: [/node_modules/],
    transformMixedEsModules: true,
    requireReturnsDefault: 'auto',
    defaultIsModuleExports: 'auto',
  },
  plugins: [
    polyfillsPlugin(),
    nodePolyfills({
      include: ['buffer', 'events', 'stream', 'util', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    react({
      fastRefresh: true,
      jsxRuntime: 'automatic',
    }),
    tailwindcss(),
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
    },
    // CRITICAL: Force all dependencies to use YOUR React version
    // This prevents "can't access property 'createContext' of undefined" errors
    dedupe: [
      'react',
      'react-dom',
      '@types/react',
      '@types/react-dom'
    ],
  },
  define: {
    // Node polyfills plugin handles these
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'canvas-confetti',
    ],
    exclude: [
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-wallets',
      '@solana/web3.js',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    // Allow requests to GitHub API for Spark runtime KV storage and other services
    // This prevents Vite 6's HTTP blocking from interfering with the Spark plugin's proxy
    allowedHosts: [
      'api.github.com',
      '.github.com',
      'localhost',
    ],
  },
  preview: {
    // Same allowlist for preview mode
    allowedHosts: [
      'api.github.com',
      '.github.com',
      'localhost',
    ],
  },
});
