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
      'framer-motion' // Pre-bundle framer-motion with React to ensure React is available
    ]
  },
  build: {
    // Optimize chunk splitting for better loading performance
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - CRITICAL: React must load first
          if (id.includes('node_modules')) {
            // React and React-DOM must be in the same chunk and load first
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            // CRITICAL FIX: framer-motion depends on React.createContext
            // Ensure it's bundled with React or in a chunk that loads after React
            // By putting it in 'vendor', it will load after 'react-vendor' due to dependency order
            if (id.includes('framer-motion')) {
              return 'vendor'
            }
            if (id.includes('@phosphor-icons')) {
              return 'icons'
            }
            // Other large vendor libraries
            return 'vendor'
          }
          
          // CRITICAL FIX: Bundle lib/ai/agents with components/agents to ensure React is available
          // Don't split them - React types need React runtime to be in same chunk
          if (id.includes('/lib/ai/agents/') || id.includes('/components/agents/')) {
            return 'agents'
          }
          
          // Component chunks - split large components
          if (id.includes('/components/dashboard/')) {
            return 'dashboard'
          }
          if (id.includes('/components/trade/')) {
            return 'trading'
          }
          if (id.includes('/components/strategy/')) {
            return 'strategy'
          }
          if (id.includes('/components/settings/')) {
            return 'settings'
          }
        },
        // Use content hash for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
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
