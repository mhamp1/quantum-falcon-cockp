// Secure Solana Wallet Provider — Production Ready
// November 21, 2025 — Quantum Falcon Cockpit

import { useMemo, ReactNode } from 'react'
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
 */
export function WalletProvider({ children }: WalletProviderProps) {
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
  }, [network])

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new LedgerWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

