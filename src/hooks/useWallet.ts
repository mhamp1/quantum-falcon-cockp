// TEMPORARY FIX: Wallet Hook Stub
// Reason: React 19 + Solana wallet-adapter conflict causing white page
// This stub prevents import errors while Solana integration is disabled
//
// TODO: Re-enable once Solana wallet-adapter supports React 19
// November 24, 2025 — Quantum Falcon Cockpit

import { useCallback } from 'react'

// Centralized warning message for Solana wallet temporary disablement
const WALLET_DISABLED_MESSAGE = 
  'Wallet functionality temporarily disabled due to React 19 compatibility issue. ' +
  'This is a temporary fix. See TODO comments in src/providers/WalletProvider.tsx for re-enabling Solana integration.'

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
   * Connect wallet stub - does nothing for now
   */
  const connectWallet = useCallback(async () => {
    console.warn(WALLET_DISABLED_MESSAGE)
  }, [])

  /**
   * Disconnect wallet stub - does nothing for now
   */
  const disconnectWallet = useCallback(async () => {
    console.warn(WALLET_DISABLED_MESSAGE)
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

