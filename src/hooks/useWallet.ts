// WALLET HOOK — Provides wallet utilities
// The main wallet functionality is in src/providers/WalletProvider.tsx (useQuantumWallet)
// This hook provides additional utilities and a fallback for components that don't need full wallet integration
// November 24, 2025 — Quantum Falcon Cockpit v2025.1.0

import { useCallback } from 'react'

// For full wallet functionality, use useQuantumWallet from @/providers/WalletProvider
// This hook provides utilities only

/**
 * STUB Wallet Hook - Returns safe default values
 * This prevents the React 19 + Solana wallet-adapter conflict
 */
export function useWallet() {
  /**
   * Validate wallet address format (basic validation)
   */
  const isValidAddress = useCallback((address: string): boolean => {
    // Basic Solana address validation (base58, 32-44 chars)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }, [])

  /**
   * Get short address for display (first 4 + last 4)
   */
  const getShortAddress = useCallback((address: string | null): string => {
    if (!address) return ''
    if (address.length <= 8) return address
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }, [])

  /**
   * Connect wallet - use useQuantumWallet().connect() for full functionality
   */
  const connectWallet = useCallback(async () => {
    // For full wallet functionality, use useQuantumWallet from @/providers/WalletProvider
  }, [])

  /**
   * Disconnect wallet - use useQuantumWallet().disconnect() for full functionality
   */
  const disconnectWallet = useCallback(async () => {
    // For full wallet functionality, use useQuantumWallet from @/providers/WalletProvider
  }, [])

  return {
    // Solana wallet adapter props (stubbed)
    publicKey: null,
    wallet: null,
    connected: false,
    connecting: false,
    disconnecting: false,
    wallets: [],
    select: () => {},
    
    // Enhanced helpers
    walletAddress: null,
    connectWallet,
    disconnectWallet,
    isValidAddress,
    getShortAddress,
    
    // Status helpers
    isConnected: false,
    isConnecting: false,
    isDisconnecting: false,
    hasWallet: false,
  }
}

