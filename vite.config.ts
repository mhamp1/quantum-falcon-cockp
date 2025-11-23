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
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    // Use content-based chunk naming to prevent stale chunk issues
    rollupOptions: {
      output: {
        // Content-based hashing ensures chunks update when content changes
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Manual chunks for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@solana')) {
              return 'vendor-solana';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-3d';
            }
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
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
