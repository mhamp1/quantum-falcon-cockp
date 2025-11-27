// ═══════════════════════════════════════════════════════════════
// SWAP PANEL — Real Trading Interface
// Jupiter-powered swaps with risk management
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowsDownUp, 
  Lightning, 
  Warning, 
  CheckCircle,
  Gear,
  Wallet,
  ArrowsClockwise
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useQuantumWallet } from '@/providers/WalletProvider'

// ═══════════════════════════════════════════════════════════════
// TOKEN LIST
// ═══════════════════════════════════════════════════════════════

const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  JTO: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
}

const TOKEN_LIST = [
  { symbol: 'SOL', name: 'Solana', mint: TOKENS.SOL, logo: '◎', decimals: 9 },
  { symbol: 'USDC', name: 'USD Coin', mint: TOKENS.USDC, logo: '$', decimals: 6 },
  { symbol: 'BONK', name: 'Bonk', mint: TOKENS.BONK, logo: '🐕', decimals: 5 },
  { symbol: 'WIF', name: 'dogwifhat', mint: TOKENS.WIF, logo: '🎩', decimals: 6 },
  { symbol: 'JUP', name: 'Jupiter', mint: TOKENS.JUP, logo: '🪐', decimals: 6 },
  { symbol: 'JTO', name: 'Jito', mint: TOKENS.JTO, logo: '⚡', decimals: 9 },
]

interface QuoteResult {
  outAmount: string
  priceImpactPct: number
  routePlan?: Array<{ swapInfo: { label: string } }>
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function SwapPanel() {
  const { 
    connected, 
    publicKey, 
    solBalance,
    connect,
    walletAvailable
  } = useQuantumWallet()

  // State
  const [inputToken, setInputToken] = useState(TOKEN_LIST[0])
  const [outputToken, setOutputToken] = useState(TOKEN_LIST[1])
  const [inputAmount, setInputAmount] = useState('')
  const [outputAmount, setOutputAmount] = useState('')
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [slippage, setSlippage] = useState(100) // 1%
  const [showSettings, setShowSettings] = useState(false)

  // Get quote from Jupiter
  const fetchQuote = useCallback(async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setQuote(null)
      setOutputAmount('')
      return
    }

    setIsLoading(true)
    try {
      const amountInLamports = Math.floor(parseFloat(inputAmount) * Math.pow(10, inputToken.decimals))
      
      const params = new URLSearchParams({
        inputMint: inputToken.mint,
        outputMint: outputToken.mint,
        amount: amountInLamports.toString(),
        slippageBps: slippage.toString(),
      })

      const response = await fetch(`https://quote-api.jup.ag/v6/quote?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to get quote')
      }

      const quoteData = await response.json()
      setQuote(quoteData)
      
      const outAmount = parseInt(quoteData.outAmount) / Math.pow(10, outputToken.decimals)
      setOutputAmount(outAmount.toFixed(outputToken.decimals > 6 ? 6 : outputToken.decimals))
    } catch (error) {
      console.error('[SwapPanel] Quote failed:', error)
      setQuote(null)
      setOutputAmount('')
    } finally {
      setIsLoading(false)
    }
  }, [inputAmount, inputToken, outputToken, slippage])

  // Debounce quote fetching
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [fetchQuote])

  // Swap tokens
  const handleSwapTokens = () => {
    const temp = inputToken
    setInputToken(outputToken)
    setOutputToken(temp)
    setInputAmount(outputAmount)
    setOutputAmount(inputAmount)
  }

  // Execute swap
  const handleSwap = async () => {
    if (!connected) {
      connect()
      return
    }

    if (!publicKey || !quote) {
      toast.error('Cannot execute swap')
      return
    }

    setIsSwapping(true)
    try {
      // Get swap transaction from Jupiter
      const response = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey,
          wrapAndUnwrapSol: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create swap transaction')
      }

      const { swapTransaction } = await response.json()

      // Get wallet
      const phantom = (window as any).phantom?.solana
      if (!phantom) {
        throw new Error('Wallet not available')
      }

      // Sign and send transaction
      const transaction = Buffer.from(swapTransaction, 'base64')
      const { signature } = await phantom.signAndSendTransaction(
        new Uint8Array(transaction)
      )

      toast.success('Swap Successful!', {
        description: `Swapped ${inputAmount} ${inputToken.symbol} for ${outputAmount} ${outputToken.symbol}`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, '_blank'),
        },
      })

      // Clear form
      setInputAmount('')
      setOutputAmount('')
      setQuote(null)
    } catch (error: any) {
      console.error('[SwapPanel] Swap error:', error)
      
      if (error.code === 4001) {
        toast.error('Transaction Rejected', {
          description: 'You rejected the transaction',
        })
      } else {
        toast.error('Swap Failed', {
          description: error.message || 'Failed to execute swap',
        })
      }
    } finally {
      setIsSwapping(false)
    }
  }

  // Set max amount
  const handleMax = () => {
    if (inputToken.symbol === 'SOL' && connected) {
      // Leave some for gas
      const maxAmount = Math.max(0, solBalance - 0.01)
      setInputAmount(maxAmount.toFixed(4))
    }
  }

  return (
    <div className="cyber-card p-6 border-2 border-primary/50 relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Lightning size={24} weight="fill" className="text-primary" />
          <h2 className="text-xl font-bold uppercase tracking-wider">Swap</h2>
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            showSettings ? 'bg-primary/20 text-primary' : 'hover:bg-primary/10'
          )}
        >
          <Gear size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 bg-muted/30 border border-muted rounded-lg relative z-10"
        >
          <Label className="text-xs uppercase tracking-wider mb-2 block">
            Slippage Tolerance: {(slippage / 100).toFixed(1)}%
          </Label>
          <div className="flex gap-2 mb-2">
            {[50, 100, 300].map((val) => (
              <button
                key={val}
                onClick={() => setSlippage(val)}
                className={cn(
                  'px-3 py-1 text-xs rounded transition-colors',
                  slippage === val 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {(val / 100).toFixed(1)}%
              </button>
            ))}
          </div>
          <Slider
            value={[slippage]}
            onValueChange={([val]) => setSlippage(val)}
            min={10}
            max={500}
            step={10}
          />
        </motion.div>
      )}

      <div className="space-y-4 relative z-10">
        {/* Input Token */}
        <div className="p-4 bg-muted/30 border border-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              You Pay
            </Label>
            {connected && inputToken.symbol === 'SOL' && (
              <button 
                onClick={handleMax}
                className="text-xs text-primary hover:underline"
              >
                Balance: {solBalance.toFixed(4)} SOL
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
            />
            
            <select
              value={inputToken.symbol}
              onChange={(e) => {
                const token = TOKEN_LIST.find(t => t.symbol === e.target.value)
                if (token) setInputToken(token)
              }}
              className="px-3 py-2 bg-primary/20 border border-primary/50 rounded-lg font-bold cursor-pointer"
            >
              {TOKEN_LIST.map((token) => (
                <option key={token.mint} value={token.symbol}>
                  {token.logo} {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <button
            onClick={handleSwapTokens}
            className="p-2 bg-primary/20 border border-primary/50 rounded-full hover:bg-primary/30 transition-colors"
          >
            <ArrowsDownUp size={20} className="text-primary" />
          </button>
        </div>

        {/* Output Token */}
        <div className="p-4 bg-muted/30 border border-muted rounded-lg">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            You Receive
          </Label>
          
          <div className="flex items-center gap-3">
            <Input
              type="text"
              value={isLoading ? 'Loading...' : outputAmount}
              readOnly
              placeholder="0.00"
              className="flex-1 text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
            />
            
            <select
              value={outputToken.symbol}
              onChange={(e) => {
                const token = TOKEN_LIST.find(t => t.symbol === e.target.value)
                if (token) setOutputToken(token)
              }}
              className="px-3 py-2 bg-accent/20 border border-accent/50 rounded-lg font-bold cursor-pointer"
            >
              {TOKEN_LIST.map((token) => (
                <option key={token.mint} value={token.symbol}>
                  {token.logo} {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quote Info */}
        {quote && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span>
                1 {inputToken.symbol} = {(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(4)} {outputToken.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price Impact</span>
              <span className={quote.priceImpactPct > 3 ? 'text-destructive' : 'text-green-400'}>
                {quote.priceImpactPct.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route</span>
              <span className="text-primary">
                {quote.routePlan?.map(r => r.swapInfo.label).join(' → ') || 'Direct'}
              </span>
            </div>
          </div>
        )}

        {/* Price Impact Warning */}
        {quote && quote.priceImpactPct > 3 && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
            <Warning size={18} />
            <span>High price impact! Consider using smaller amount.</span>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={isSwapping || (!connected && !walletAvailable) || (connected && (!quote || !inputAmount))}
          className={cn(
            'w-full h-14 text-lg font-black uppercase tracking-wider',
            'bg-gradient-to-r from-primary via-accent to-primary',
            'hover:from-primary/90 hover:via-accent/90 hover:to-primary/90',
            'border-2 border-primary/50',
            'shadow-[0_0_30px_rgba(0,212,255,0.3)]',
            'hover:shadow-[0_0_40px_rgba(0,212,255,0.5)]',
            'transition-all'
          )}
        >
          {!connected ? (
            <>
              <Wallet size={20} className="mr-2" />
              Connect Wallet
            </>
          ) : isSwapping ? (
            <>
              <ArrowsClockwise size={20} className="animate-spin mr-2" />
              Swapping...
            </>
          ) : (
            <>
              <Lightning size={20} weight="fill" className="mr-2" />
              Swap
            </>
          )}
        </Button>

        {/* Powered By */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Powered by</span>
          <span className="text-primary font-bold">Jupiter</span>
          <CheckCircle size={14} className="text-green-400" />
        </div>
      </div>
    </div>
  )
}
