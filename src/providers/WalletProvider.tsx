// ═══════════════════════════════════════════════════════════════
// QUANTUM FALCON WALLET PROVIDER
// Robust Solana wallet integration with React 19 compatibility
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import React, { FC, ReactNode, useMemo, useCallback, createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// TYPES (exported for use throughout app)
// ═══════════════════════════════════════════════════════════════

export interface TokenBalance {
  mint: string
  symbol: string
  name: string
  balance: number
  decimals: number
  uiBalance: string
  usdValue?: number
  logoURI?: string
}

export interface WalletContextType {
  // Connection state
  connected: boolean
  connecting: boolean
  publicKey: string | null
  shortAddress: string | null
  
  // Balances
  solBalance: number
  tokenBalances: TokenBalance[]
  isLoading: boolean
  lastUpdate: number
  
  // Actions
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshBalances: () => Promise<void>
  signTransaction: ((transaction: any) => Promise<any>) | null
  signAllTransactions: ((transactions: any[]) => Promise<any[]>) | null
  signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | null
  
  // Wallet adapter available
  walletAvailable: boolean
  walletError: string | null
}

// Default context value
const defaultContext: WalletContextType = {
  connected: false,
  connecting: false,
  publicKey: null,
  shortAddress: null,
  solBalance: 0,
  tokenBalances: [],
  isLoading: false,
  lastUpdate: 0,
  connect: async () => { toast.error('Wallet not available') },
  disconnect: async () => {},
  refreshBalances: async () => {},
  signTransaction: null,
  signAllTransactions: null,
  signMessage: null,
  walletAvailable: false,
  walletError: null,
}

// Create context
const WalletContext = createContext<WalletContextType>(defaultContext)

// ═══════════════════════════════════════════════════════════════
// WALLET HOOK
// ═══════════════════════════════════════════════════════════════

export function useQuantumWallet(): WalletContextType {
  return useContext(WalletContext)
}

// Also export as useWallet for convenience
export const useWallet = useQuantumWallet

// ═══════════════════════════════════════════════════════════════
// WALLET PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, setState] = useState<Omit<WalletContextType, 'connect' | 'disconnect' | 'refreshBalances'>>({
    connected: false,
    connecting: false,
    publicKey: null,
    shortAddress: null,
    solBalance: 0,
    tokenBalances: [],
    isLoading: false,
    lastUpdate: 0,
    walletAvailable: false,
    walletError: null,
  })

  // Check for Phantom/Solflare wallet
  useEffect(() => {
    const checkWallet = () => {
      const phantom = (window as any).phantom?.solana
      const solflare = (window as any).solflare
      const backpack = (window as any).backpack
      
      if (phantom || solflare || backpack) {
        setState(prev => ({ ...prev, walletAvailable: true, walletError: null }))
        
        // Check if already connected
        const wallet = phantom || solflare || backpack
        if (wallet?.isConnected && wallet?.publicKey) {
          const pubkey = wallet.publicKey.toString()
          setState(prev => ({
            ...prev,
            connected: true,
            publicKey: pubkey,
            shortAddress: `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`,
          }))
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          walletAvailable: false,
          walletError: 'No Solana wallet detected. Install Phantom or Solflare.'
        }))
      }
    }

    // Check on mount and after a delay (wallets may load slowly)
    checkWallet()
    const timer = setTimeout(checkWallet, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // Connect wallet
  const connect = useCallback(async () => {
    const phantom = (window as any).phantom?.solana
    const solflare = (window as any).solflare
    const backpack = (window as any).backpack
    
    const wallet = phantom || solflare || backpack
    
    if (!wallet) {
      toast.error('No wallet detected', {
        description: 'Please install Phantom, Solflare, or Backpack',
        action: {
          label: 'Get Phantom',
          onClick: () => window.open('https://phantom.app/', '_blank'),
        },
      })
      return
    }

    setState(prev => ({ ...prev, connecting: true }))

    try {
      // Connect to wallet
      const response = await wallet.connect()
      const pubkey = response.publicKey.toString()
      
      setState(prev => ({
        ...prev,
        connected: true,
        connecting: false,
        publicKey: pubkey,
        shortAddress: `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`,
      }))

      toast.success('Wallet Connected', {
        description: `Connected to ${pubkey.slice(0, 8)}...`,
      })

      // Fetch balances
      await fetchBalances(pubkey)
    } catch (error: any) {
      console.error('[Wallet] Connection failed:', error)
      setState(prev => ({ ...prev, connecting: false }))
      
      if (error.code === 4001) {
        toast.error('Connection rejected', {
          description: 'You rejected the connection request',
        })
      } else {
        toast.error('Connection failed', {
          description: error.message || 'Failed to connect wallet',
        })
      }
    }
  }, [])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    const phantom = (window as any).phantom?.solana
    const solflare = (window as any).solflare
    const backpack = (window as any).backpack
    
    const wallet = phantom || solflare || backpack

    try {
      if (wallet?.disconnect) {
        await wallet.disconnect()
      }
    } catch (e) {
      // Ignore disconnect errors
    }

    setState(prev => ({
      ...prev,
      connected: false,
      publicKey: null,
      shortAddress: null,
      solBalance: 0,
      tokenBalances: [],
    }))

    toast.success('Wallet Disconnected')
  }, [])

  // Fetch balances
  const fetchBalances = useCallback(async (pubkey?: string) => {
    const key = pubkey || state.publicKey
    if (!key) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Use public RPC to get SOL balance
      const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [key],
        }),
      })

      const data = await response.json()
      const solBalance = (data.result?.value || 0) / 1e9 // Convert lamports to SOL

      setState(prev => ({
        ...prev,
        solBalance,
        isLoading: false,
        lastUpdate: Date.now(),
      }))
    } catch (error) {
      console.error('[Wallet] Balance fetch failed:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [state.publicKey])

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    if (state.publicKey) {
      await fetchBalances(state.publicKey)
    }
  }, [state.publicKey, fetchBalances])

  // Auto-refresh balances when connected
  useEffect(() => {
    if (state.connected && state.publicKey) {
      fetchBalances(state.publicKey)
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchBalances(state.publicKey!)
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [state.connected, state.publicKey, fetchBalances])

  // Listen for wallet events
  useEffect(() => {
    const phantom = (window as any).phantom?.solana
    
    if (phantom) {
      const handleConnect = () => {
        const pubkey = phantom.publicKey?.toString()
        if (pubkey) {
          setState(prev => ({
            ...prev,
            connected: true,
            publicKey: pubkey,
            shortAddress: `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`,
          }))
        }
      }

      const handleDisconnect = () => {
        setState(prev => ({
          ...prev,
          connected: false,
          publicKey: null,
          shortAddress: null,
          solBalance: 0,
          tokenBalances: [],
        }))
      }

      const handleAccountChange = (publicKey: any) => {
        if (publicKey) {
          const pubkey = publicKey.toString()
          setState(prev => ({
            ...prev,
            publicKey: pubkey,
            shortAddress: `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`,
          }))
          fetchBalances(pubkey)
        } else {
          handleDisconnect()
        }
      }

      phantom.on('connect', handleConnect)
      phantom.on('disconnect', handleDisconnect)
      phantom.on('accountChanged', handleAccountChange)

      return () => {
        phantom.off('connect', handleConnect)
        phantom.off('disconnect', handleDisconnect)
        phantom.off('accountChanged', handleAccountChange)
      }
    }
  }, [fetchBalances])

  // Sign transaction helper
  const signTransaction = useCallback(async (transaction: any): Promise<any> => {
    const phantom = (window as any).phantom?.solana
    const solflare = (window as any).solflare
    const backpack = (window as any).backpack
    
    const wallet = phantom || solflare || backpack
    
    if (!wallet || !state.connected) {
      throw new Error('Wallet not connected')
    }

    try {
      const signed = await wallet.signTransaction(transaction)
      return signed
    } catch (error: any) {
      console.error('[Wallet] Sign transaction failed:', error)
      throw error
    }
  }, [state.connected])

  // Sign all transactions helper
  const signAllTransactions = useCallback(async (transactions: any[]): Promise<any[]> => {
    const phantom = (window as any).phantom?.solana
    const solflare = (window as any).solflare
    const backpack = (window as any).backpack
    
    const wallet = phantom || solflare || backpack
    
    if (!wallet || !state.connected) {
      throw new Error('Wallet not connected')
    }

    try {
      const signed = await wallet.signAllTransactions(transactions)
      return signed
    } catch (error: any) {
      console.error('[Wallet] Sign all transactions failed:', error)
      throw error
    }
  }, [state.connected])

  // Sign message helper
  const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array> => {
    const phantom = (window as any).phantom?.solana
    const solflare = (window as any).solflare
    const backpack = (window as any).backpack
    
    const wallet = phantom || solflare || backpack
    
    if (!wallet || !state.connected) {
      throw new Error('Wallet not connected')
    }

    try {
      const { signature } = await wallet.signMessage(message, 'utf8')
      return signature
    } catch (error: any) {
      console.error('[Wallet] Sign message failed:', error)
      throw error
    }
  }, [state.connected])

  // Context value
  const contextValue: WalletContextType = {
    ...state,
    connect,
    disconnect,
    refreshBalances,
    signTransaction: state.connected ? signTransaction : null,
    signAllTransactions: state.connected ? signAllTransactions : null,
    signMessage: state.connected ? signMessage : null,
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export default WalletProvider
