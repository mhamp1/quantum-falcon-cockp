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
        // Manual chunking to prevent module loading race conditions
        // This fixes "can't access property 'exports', J4 is undefined" errors
        manualChunks: (id) => {
          // Solana packages must be in separate chunk due to complex dependencies
          if (id.includes('@solana/') || id.includes('@metaplex')) {
            return 'vendor-solana';
          }
          // Large vendor libraries that should be cached separately
          if (id.includes('node_modules')) {
            // React and core dependencies
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-is')) {
              return 'vendor-react';
            }
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('framer-motion') || id.includes('recharts')) {
              return 'vendor-ui';
            }
            // All other vendor code
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Ensure proper HTML handling
    outDir: 'dist',
    emptyOutDir: true,
    // Optimize chunk loading to prevent race conditions
    modulePreload: {
      polyfill: true,
      // Ensure all module dependencies are preloaded before execution
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        // Return all dependencies to ensure they're loaded before the module executes
        return deps;
      },
    },
    // Ensure chunks load in correct order
    cssCodeSplit: true,
    // Target modern browsers for better module support
    target: 'esnext',
    // Minify options to prevent module issues
    minify: 'esbuild',
    // Generate sourcemaps but don't expose them to users (for debugging production issues)
    sourcemap: 'hidden',
  },
  // Enable CommonJS interop for better module compatibility
  commonjsOptions: {
    include: [/node_modules/],
    transformMixedEsModules: true,
  },
  plugins: [
    react({
      fastRefresh: true,
      jsxRuntime: 'automatic',
    }),
    tailwindcss(),
    // DO NOT REMOVE - Spark plugin (only loads in Spark environment)
    createIconImportProxy() as PluginOption,
    // Spark plugin - safe to include, only activates in Spark environment
    // In Vercel/other platforms, this plugin is a no-op
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
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
  optimizeDeps: {
    // Pre-bundle React and Solana packages to ensure they resolve correctly in all environments
    // CRITICAL: Explicitly include React to prevent duplicate React instances
    include: [
      'react',
      'react-dom',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-wallets',
      '@solana/web3.js',
      'canvas-confetti',
    ],
    // Force Vite to optimize these even if they're large
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
