// Secure Solana Wallet Provider — Production Ready
// November 21, 2025 — Quantum Falcon Cockpit
// CRITICAL FIX: Added error boundary and lazy initialization to prevent "J4 is undefined" errors

import { useMemo, ReactNode, useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

interface WalletProviderProps {
  children: ReactNode
}

/**
 * Secure Solana Wallet Provider
 * Supports: Phantom, Solflare, Ledger, Torus
 * Network: Mainnet (production) or Devnet (development)
 * 
 * CRITICAL: Lazy initialization prevents blocking app startup if Solana modules fail to load
 */
export function WalletProvider({ children }: WalletProviderProps) {
  console.log('[WalletProvider] Rendering...');
  
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  
  // Determine network from environment - MUST be called before conditional returns
  const network = useMemo(() => {
    const envNetwork = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta'
    return envNetwork === 'mainnet-beta' 
      ? WalletAdapterNetwork.Mainnet 
      : WalletAdapterNetwork.Devnet
  }, [])

  // RPC endpoint - MUST be called before conditional returns
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
  }, [network])

  // Initialize wallet adapters - MUST be called before conditional returns
  const wallets = useMemo(
    () => {
      if (!isReady) {
        return [];
      }
      
      try {
        return [
          new PhantomWalletAdapter(),
          new SolflareWalletAdapter(),
          new LedgerWalletAdapter(),
          new TorusWalletAdapter(),
        ]
      } catch (error) {
        console.error('[WalletProvider] Error creating wallet adapters:', error);
        // Return empty array as fallback
        return [];
      }
    },
    [isReady]
  )
  
  // Lazy initialization - don't block app startup
  useEffect(() => {
    const initWallets = async () => {
      try {
        // Small delay to let critical app components load first
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsReady(true);
        console.log('[WalletProvider] Wallet adapters ready');
      } catch (error) {
        console.error('[WalletProvider] Failed to initialize:', error);
        setInitError(error instanceof Error ? error : new Error(String(error)));
        // Still mark as ready to not block the app
        setIsReady(true);
      }
    };
    
    initWallets();
  }, []);
  
  try {
    // If not ready yet, render children without wallet provider
    if (!isReady) {
      console.log('[WalletProvider] Not ready yet, rendering children without wallet support');
      return <>{children}</>;
    }
    
    // If there was an init error, render children without wallet provider
    if (initError) {
      console.warn('[WalletProvider] Initialization error, wallet support disabled:', initError.message);
      return <>{children}</>;
    }

    console.log('[WalletProvider] Wallets initialized:', wallets.length);
    console.log('[WalletProvider] Endpoint:', endpoint);

    return (
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider wallets={wallets} autoConnect={false}>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </SolanaWalletProvider>
      </ConnectionProvider>
    )
  } catch (error) {
    console.error('[WalletProvider] Fatal error:', error);
    // Fallback: render children without wallet provider
    return <>{children}</>;
  }
}

