import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// Set SPARK_DIR to the current project root to avoid hardcoded /workspaces/spark-template path
if (!process.env.SPARK_DIR) {
  process.env.SPARK_DIR = projectRoot
}

// Solana packages to exclude from optimization due to React 19 conflict
// TODO: Remove when re-enabling Solana integration
const EXCLUDED_SOLANA_PACKAGES = [
  '@solana/wallet-adapter-react',
  '@solana/wallet-adapter-react-ui',
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-wallets',
  '@solana/web3.js'
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      jsxRuntime: 'automatic',
    }),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
      '@github/spark/hooks': resolve(projectRoot, 'src/shims/githubSparkHooks.ts'),
      'eventemitter3': resolve(projectRoot, 'node_modules/eventemitter3/index.mjs')
    },
    // CRITICAL FIX: Deduplicate React to prevent multiple versions
    // This prevents the React 19 + Solana wallet-adapter conflict
    dedupe: ['react', 'react-dom']
  },
  define: {
    'global': 'globalThis',
    'process.env': {}
  },
  optimizeDeps: {
    // Force exclude Solana packages to prevent bundling conflicts
    // TODO: Remove this exclusion list when re-enabling Solana integration
    // after React 19 support is added to @solana/wallet-adapter packages
    exclude: EXCLUDED_SOLANA_PACKAGES,
    include: [
      'eventemitter3', 
      'buffer',
      'react',
      'react-dom',
      'framer-motion', // Pre-bundle framer-motion with React to ensure React is available
      'orbitron' // Preload Orbitron font for better performance
    ]
  },
  build: {
    // CRITICAL FIX: Disable manual chunking to prevent React race conditions
    // The createContext errors occur because ES modules load in parallel
    // and vendor chunks can execute before React is fully initialized.
    // By NOT splitting chunks manually, Rollup ensures proper dependency order.
    rollupOptions: {
      // Externalize optional dependencies that may not be installed
      external: (id) => {
        // Only externalize if it's a Sentry import and not in node_modules
        if (id === '@sentry/react' && !id.includes('node_modules')) {
          return false // Don't externalize, let it fail gracefully at runtime
        }
        return false
      },
      output: {
        // NO manualChunks - let Rollup handle dependency ordering naturally
        // This creates larger initial bundles but guarantees React loads first
        
        // Use content hash for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Increase chunk size warning limit since we're not splitting aggressively
    chunkSizeWarningLimit: 2000,
    // Source maps for production debugging (can disable for smaller builds)
    sourcemap: false,
    // Minify for production
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'esnext',
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
