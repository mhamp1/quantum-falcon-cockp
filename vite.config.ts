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
      '@': resolve(projectRoot, 'src')
    },
    // CRITICAL FIX: Deduplicate React to prevent multiple versions
    // This prevents the React 19 + Solana wallet-adapter conflict
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    // Force exclude Solana packages to prevent bundling conflicts
    // TODO: Remove this exclusion list when re-enabling Solana integration
    // after React 19 support is added to @solana/wallet-adapter packages
    exclude: EXCLUDED_SOLANA_PACKAGES
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
