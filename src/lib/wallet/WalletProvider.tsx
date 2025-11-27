// ═══════════════════════════════════════════════════════════════
// QUANTUM FALCON WALLET PROVIDER
// Complete Solana wallet integration with Phantom, Solflare, Backpack
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import React, { FC, ReactNode, useMemo, useCallback, createContext, useContext, useState, useEffect } from 'react'
import { 
  ConnectionProvider, 
  WalletProvider as SolanaWalletProvider,
  useWallet,
  useConnection
} from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, VersionedTransaction } from '@solana/web3.js'
import { toast } from 'sonner'

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css'

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// RPC Endpoints (use Helius/Triton for production - anti-MEV)
const RPC_ENDPOINTS = {
  mainnet: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
}

// Default to mainnet for production
const NETWORK = (import.meta.env.VITE_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Mainnet
const ENDPOINT = RPC_ENDPOINTS[NETWORK === WalletAdapterNetwork.Mainnet ? 'mainnet' : 'devnet']

// ═══════════════════════════════════════════════════════════════
// WALLET CONTEXT TYPES
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

export interface WalletState {
  connected: boolean
  connecting: boolean
  publicKey: string | null
  shortAddress: string | null
  solBalance: number
  tokenBalances: TokenBalance[]
  isLoading: boolean
  lastUpdate: number
}

export interface WalletContextType extends WalletState {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshBalances: () => Promise<void>
  signTransaction: (tx: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
  signAllTransactions: (txs: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>
  sendTransaction: (tx: Transaction | VersionedTransaction) => Promise<string>
  connection: Connection | null
  network: WalletAdapterNetwork
}

const WalletContext = createContext<WalletContextType | null>(null)

// ═══════════════════════════════════════════════════════════════
// WALLET HOOK
// ═══════════════════════════════════════════════════════════════

export function useQuantumWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useQuantumWallet must be used within WalletProvider')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════
// INNER PROVIDER (uses wallet adapter hooks)
// ═══════════════════════════════════════════════════════════════

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  
  const [state, setState] = useState<WalletState>({
    connected: false,
    connecting: false,
    publicKey: null,
    shortAddress: null,
    solBalance: 0,
    tokenBalances: [],
    isLoading: false,
    lastUpdate: 0,
  })

  // Update state when wallet changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      connected: wallet.connected,
      connecting: wallet.connecting,
      publicKey: wallet.publicKey?.toBase58() || null,
      shortAddress: wallet.publicKey 
        ? `${wallet.publicKey.toBase58().slice(0, 4)}...${wallet.publicKey.toBase58().slice(-4)}`
        : null,
    }))
  }, [wallet.connected, wallet.connecting, wallet.publicKey])

  // Fetch balances when connected
  const refreshBalances = useCallback(async () => {
    if (!wallet.publicKey || !connection) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Get SOL balance
      const solBalance = await connection.getBalance(wallet.publicKey)
      
      // Get token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        wallet.publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      )

      const tokenBalances: TokenBalance[] = tokenAccounts.value
        .filter(acc => {
          const amount = acc.account.data.parsed.info.tokenAmount
          return amount.uiAmount > 0
        })
        .map(acc => {
          const info = acc.account.data.parsed.info
          const amount = info.tokenAmount
          return {
            mint: info.mint,
            symbol: 'TOKEN',
            name: 'Unknown Token',
            balance: parseInt(amount.amount),
            decimals: amount.decimals,
            uiBalance: amount.uiAmountString,
          }
        })

      setState(prev => ({
        ...prev,
        solBalance: solBalance / LAMPORTS_PER_SOL,
        tokenBalances,
        isLoading: false,
        lastUpdate: Date.now(),
      }))

      console.log('[Wallet] Balances refreshed:', {
        sol: solBalance / LAMPORTS_PER_SOL,
        tokens: tokenBalances.length,
      })
    } catch (error) {
      console.error('[Wallet] Failed to fetch balances:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [wallet.publicKey, connection])

  // Auto-refresh balances when connected
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      refreshBalances()
      
      // Refresh every 30 seconds
      const interval = setInterval(refreshBalances, 30000)
      return () => clearInterval(interval)
    }
  }, [wallet.connected, wallet.publicKey, refreshBalances])

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      if (!wallet.wallet) {
        // Open wallet modal if no wallet selected
        toast.info('Select a wallet', {
          description: 'Choose Phantom, Solflare, or another wallet',
        })
        return
      }
      await wallet.connect()
      toast.success('Wallet Connected', {
        description: `Connected to ${wallet.wallet.adapter.name}`,
      })
    } catch (error: any) {
      console.error('[Wallet] Connection failed:', error)
      toast.error('Connection Failed', {
        description: error.message || 'Failed to connect wallet',
      })
    }
  }, [wallet])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await wallet.disconnect()
      setState(prev => ({
        ...prev,
        connected: false,
        publicKey: null,
        shortAddress: null,
        solBalance: 0,
        tokenBalances: [],
      }))
      toast.success('Wallet Disconnected')
    } catch (error: any) {
      console.error('[Wallet] Disconnect failed:', error)
    }
  }, [wallet])

  // Sign transaction (user signs, we never touch keys)
  const signTransaction = useCallback(async (tx: Transaction | VersionedTransaction) => {
    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support signing')
    }
    return wallet.signTransaction(tx)
  }, [wallet])

  // Sign all transactions
  const signAllTransactions = useCallback(async (txs: (Transaction | VersionedTransaction)[]) => {
    if (!wallet.signAllTransactions) {
      throw new Error('Wallet does not support batch signing')
    }
    return wallet.signAllTransactions(txs)
  }, [wallet])

  // Send transaction
  const sendTransaction = useCallback(async (tx: Transaction | VersionedTransaction) => {
    if (!wallet.sendTransaction) {
      throw new Error('Wallet does not support sending transactions')
    }
    const signature = await wallet.sendTransaction(tx, connection)
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed')
    
    if (confirmation.value.err) {
      throw new Error('Transaction failed')
    }
    
    // Refresh balances after transaction
    setTimeout(refreshBalances, 2000)
    
    return signature
  }, [wallet, connection, refreshBalances])

  const contextValue: WalletContextType = {
    ...state,
    connect,
    disconnect,
    refreshBalances,
    signTransaction,
    signAllTransactions,
    sendTransaction,
    connection,
    network: NETWORK,
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN PROVIDER
// ═══════════════════════════════════════════════════════════════

export const QuantumWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize supported wallets
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new LedgerWalletAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={ENDPOINT}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

export default QuantumWalletProvider

