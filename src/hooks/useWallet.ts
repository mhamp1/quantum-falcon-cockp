// Secure Wallet Hook — Production Ready
// November 21, 2025 — Quantum Falcon Cockpit

import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'

/**
 * Enhanced wallet hook with security features
 */
export function useWallet() {
  const {
    publicKey,
    wallet,
    connected,
    connecting,
    disconnecting,
    connect,
    disconnect,
    select,
    wallets,
  } = useSolanaWallet()

  /**
   * Get wallet address as string (safe)
   */
  const walletAddress = publicKey?.toBase58() || null

  /**
   * Connect wallet with error handling
   */
  const connectWallet = useCallback(async () => {
    try {
      if (!wallet) {
        throw new Error('No wallet selected. Please select a wallet first.')
      }
      await connect()
    } catch (error: any) {
      console.error('Wallet connection error:', error)
      throw new Error(error.message || 'Failed to connect wallet')
    }
  }, [wallet, connect])

  /**
   * Disconnect wallet with cleanup
   */
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect()
    } catch (error: any) {
      console.error('Wallet disconnection error:', error)
      throw new Error(error.message || 'Failed to disconnect wallet')
    }
  }, [disconnect])

  /**
   * Validate wallet address format
   */
  const isValidAddress = useCallback((address: string): boolean => {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }, [])

  /**
   * Get short address for display (first 4 + last 4)
   */
  const getShortAddress = useCallback((address: string | null): string => {
    if (!address) return ''
    if (address.length <= 8) return address
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }, [])

  return {
    // Solana wallet adapter props
    publicKey,
    wallet,
    connected,
    connecting,
    disconnecting,
    wallets,
    select,
    
    // Enhanced helpers
    walletAddress,
    connectWallet,
    disconnectWallet,
    isValidAddress,
    getShortAddress,
    
    // Status helpers
    isConnected: connected,
    isConnecting: connecting,
    isDisconnecting: disconnecting,
    hasWallet: wallets.length > 0,
  }
}

