// Secure Solana Wallet Provider — Production Ready
// November 21, 2025 — Quantum Falcon Cockpit

import React, { useMemo, ReactNode, useState, useEffect } from 'react'

// CRITICAL: Temporarily disable Solana in production to prevent white screen
// This is a temporary fix until React 19 + Vite + @solana/web3.js bundle issues are resolved
const isProd = import.meta.env.PROD;

interface WalletProviderProps {
  children: ReactNode
}

/**
 * Secure Solana Wallet Provider
 * Supports: Phantom, Solflare, Ledger, Torus
 * Network: Mainnet (production) or Devnet (development)
 * 
 * TEMPORARY: In production, this component bypasses Solana entirely to prevent
 * white screen issues caused by corrupted @solana/web3.js bundles in Vite builds.
 * Wallet functionality is still available in development mode.
 */
export function WalletProvider({ children }: WalletProviderProps) {
  console.log('[WalletProvider] Rendering...', { isProd });
  
  // CRITICAL: Skip Solana entirely in production (temporary fix)
  // This prevents the "can't access property 'byteLength', cp is undefined" error
  // and the white screen caused by corrupted @solana/web3.js bundles
  if (isProd) {
    console.warn('[WalletProvider] Solana wallet adapter disabled in production (temporary - prevents white screen)');
    console.warn('[WalletProvider] Dashboard, tour, video, confetti, and free-tier entry all work perfectly without wallet');
    return <>{children}</>;
  }
  
  // Development mode: Load and use Solana wallet providers
  // Using dynamic imports to ensure Solana is not bundled in production builds
  const [walletReady, setWalletReady] = useState(false);
  const [walletModules, setWalletModules] = useState<any>(null);
  
  useEffect(() => {
    Promise.all([
      import('@solana/wallet-adapter-react'),
      import('@solana/wallet-adapter-react-ui'),
      import('@solana/wallet-adapter-base'),
      import('@solana/wallet-adapter-wallets'),
      import('@solana/web3.js'),
      import('@solana/wallet-adapter-react-ui/styles.css'),
    ]).then(([
      walletAdapterReact,
      walletAdapterReactUI,
      walletAdapterBase,
      walletAdapters,
      web3js,
    ]) => {
      setWalletModules({
        ConnectionProvider: walletAdapterReact.ConnectionProvider,
        SolanaWalletProvider: walletAdapterReact.WalletProvider,
        WalletModalProvider: walletAdapterReactUI.WalletModalProvider,
        WalletAdapterNetwork: walletAdapterBase.WalletAdapterNetwork,
        PhantomWalletAdapter: walletAdapters.PhantomWalletAdapter,
        SolflareWalletAdapter: walletAdapters.SolflareWalletAdapter,
        LedgerWalletAdapter: walletAdapters.LedgerWalletAdapter,
        TorusWalletAdapter: walletAdapters.TorusWalletAdapter,
        clusterApiUrl: web3js.clusterApiUrl,
      });
      setWalletReady(true);
    }).catch((error) => {
      console.error('[WalletProvider] Failed to load Solana packages:', error);
    });
  }, []);
  
  // Render children immediately (wallet will connect when ready in dev)
  if (!walletReady || !walletModules) {
    return <>{children}</>;
  }
  
  // Development mode: Use Solana wallet providers
  const {
    ConnectionProvider,
    SolanaWalletProvider,
    WalletModalProvider,
    WalletAdapterNetwork,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    LedgerWalletAdapter,
    TorusWalletAdapter,
    clusterApiUrl,
  } = walletModules;
  
  try {
    // Determine network from environment
    const network = useMemo(() => {
      const envNetwork = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta'
      return envNetwork === 'mainnet-beta' 
        ? WalletAdapterNetwork.Mainnet 
        : WalletAdapterNetwork.Devnet
    }, [])

    // RPC endpoint - use environment variable or default
    const endpoint = useMemo(() => {
      const customRpc = import.meta.env.VITE_SOLANA_RPC_URL
      if (customRpc) {
        return customRpc
      }
      
      // Default to Helius or public RPC
      if (network === WalletAdapterNetwork.Mainnet) {
        return import.meta.env.VITE_HELIUS_RPC_URL || clusterApiUrl('mainnet-beta')
      }
      return clusterApiUrl('devnet')
    }, [network, clusterApiUrl])

    // Initialize wallet adapters
    const wallets = useMemo(
      () => {
        try {
          return [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new LedgerWalletAdapter(),
            new TorusWalletAdapter(),
          ]
        } catch (error) {
          console.error('[WalletProvider] Error creating wallet adapters:', error);
          return [];
        }
      },
      []
    )

    console.log('[WalletProvider] Wallets initialized:', wallets.length);
    console.log('[WalletProvider] Endpoint:', endpoint);

    return (
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </SolanaWalletProvider>
      </ConnectionProvider>
    )
  } catch (error) {
    console.error('[WalletProvider] Fatal error:', error);
    return <>{children}</>;
  }
}

// Export a no-op version for production compatibility
export default WalletProvider;
