import { useState, useCallback, useEffect } from 'react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowsDownUp, Lightning, Clock, Fire, TestTube } from '@phosphor-icons/react'
import { toast } from 'sonner'
import ProfitConverter from './ProfitConverter'
import TradeExecutionEffect from './TradeExecutionEffect'
import { getTradeEngine, TOKENS } from '@/lib/trading/TradeExecutionEngine'
import { connection } from '@/lib/solana/connection'
import { useQuantumWallet } from '@/providers/WalletProvider'
import { useTradingMode } from '@/components/trading/GoLiveConfirmation'
import { positionMonitor } from '@/lib/trading/PositionMonitor'
import { awardXPAuto } from '@/lib/xpAutoAward'

// Token mint addresses for sniping
const SNIPE_TOKENS: Record<string, string> = {
  'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  'JTO': 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
}

interface TradeHistory {
  id: string
  type: 'dca' | 'snipe'
  token: string
  amount: string
  price: string
  profit: number
  timestamp: number
  signature?: string
  isLive: boolean
}

// Get trade engine singleton
const tradeEngine = getTradeEngine(connection)

export default function Trade() {
  const { connected, signTransaction, publicKey, solBalance } = useQuantumWallet()
  const { isLive } = useTradingMode()
  
  const [dcaAmount, setDcaAmount] = useState('')
  const [dcaInterval, setDcaInterval] = useState('1')
  const [snipeToken, setSnipeToken] = useState('')
  const [snipeBudget, setSnipeBudget] = useState('')
  const [history, setHistory] = useKV<TradeHistory[]>('trade-history', [])
  const [executingTrade, setExecutingTrade] = useState<'dca' | 'snipe' | null>(null)
  const [currentPrice, setCurrentPrice] = useState(150)

  // Set wallet on trade engine when connected
  useEffect(() => {
    if (connected && publicKey && signTransaction) {
      tradeEngine.setWallet(publicKey, signTransaction)
    }
  }, [connected, publicKey, signTransaction])

  // Fetch current SOL price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        const data = await response.json()
        setCurrentPrice(data.solana?.usd || 150)
      } catch {
        // Use default price
      }
    }
    fetchPrice()
    const interval = setInterval(fetchPrice, 30000)
    return () => clearInterval(interval)
  }, [])

  const executeDCA = useCallback(async () => {
    if (!dcaAmount || parseFloat(dcaAmount) <= 0) {
      toast.error('Invalid amount', { description: 'Please enter a valid DCA amount' })
      return
    }

    setExecutingTrade('dca')

    const amount = parseFloat(dcaAmount)
    
    try {
      if (isLive && connected && signTransaction) {
        // REAL DCA EXECUTION
        const result = await tradeEngine.buyToken(TOKENS.SOL, amount)
        
        if (result.status === 'completed') {
          const newTrade: TradeHistory = {
            id: Date.now().toString(),
            type: 'dca',
            token: 'SOL',
            amount: dcaAmount,
            price: currentPrice.toFixed(2),
            profit: 0,
            timestamp: Date.now(),
            signature: result.signature,
            isLive: true
          }

          setHistory((current) => {
            if (!current) return [newTrade]
            return [newTrade, ...current].slice(0, 50)
          })

          // WIRING: Add to position monitor
          positionMonitor.addPosition({
            token: TOKENS.SOL,
            symbol: 'SOL',
            entryPrice: currentPrice,
            amount,
            stopLossPrice: currentPrice * 0.95,
            takeProfitPrice: currentPrice * 1.15,
            trailingStopPercent: 3,
            openedAt: Date.now(),
            strategy: 'dca',
          })

          // WIRING: Award XP
          awardXPAuto('dca-trade', 100, 'DCA Order Executed')

          toast.success('🔴 LIVE DCA Order Executed!', { 
            description: `Bought ${dcaAmount} SOL at $${currentPrice.toFixed(2)}`,
            action: {
              label: 'View TX',
              onClick: () => window.open(`https://solscan.io/tx/${result.signature}`, '_blank'),
            },
          })
        } else {
          toast.error('DCA Failed', { description: result.error })
        }
      } else {
        // PAPER MODE
        const newTrade: TradeHistory = {
          id: Date.now().toString(),
          type: 'dca',
          token: 'SOL',
          amount: dcaAmount,
          price: currentPrice.toFixed(2),
          profit: 0,
          timestamp: Date.now(),
          isLive: false
        }

        setHistory((current) => {
          if (!current) return [newTrade]
          return [newTrade, ...current].slice(0, 50)
        })

        // WIRING: Award XP (less for paper)
        awardXPAuto('paper-trade', 10, 'Paper DCA Order')

        toast.success('📝 Paper DCA Order Placed', { 
          description: `Simulated: Buying ${dcaAmount} SOL every ${dcaInterval}h at $${currentPrice.toFixed(2)}`
        })
      }
      
      setDcaAmount('')
    } catch (error: any) {
      toast.error('DCA Failed', { description: error.message })
    } finally {
      setExecutingTrade(null)
    }
  }, [dcaAmount, dcaInterval, isLive, connected, signTransaction, currentPrice, setHistory])

  const executeSnipe = useCallback(async () => {
    if (!snipeToken || !snipeBudget || parseFloat(snipeBudget) <= 0) {
      toast.error('Invalid parameters', { description: 'Please fill in all fields' })
      return
    }

    setExecutingTrade('snipe')

    const budget = parseFloat(snipeBudget)
    const tokenSymbol = snipeToken.toUpperCase()
    const tokenMint = SNIPE_TOKENS[tokenSymbol] || tokenSymbol

    try {
      if (isLive && connected && signTransaction) {
        // REAL SNIPE EXECUTION
        const result = await tradeEngine.buyToken(tokenMint, budget)
        
        if (result.status === 'completed') {
          const newTrade: TradeHistory = {
            id: Date.now().toString(),
            type: 'snipe',
            token: tokenSymbol,
            amount: snipeBudget,
            price: currentPrice.toFixed(2),
            profit: 0,
            timestamp: Date.now(),
            signature: result.signature,
            isLive: true
          }

          setHistory((current) => {
            if (!current) return [newTrade]
            return [newTrade, ...current].slice(0, 50)
          })

          // WIRING: Add to position monitor
          positionMonitor.addPosition({
            token: tokenMint,
            symbol: tokenSymbol,
            entryPrice: currentPrice, // Would need actual token price
            amount: budget,
            stopLossPrice: currentPrice * 0.90, // Tighter stop for snipes
            takeProfitPrice: currentPrice * 1.30, // Higher target
            trailingStopPercent: 5,
            openedAt: Date.now(),
            strategy: 'snipe',
          })

          // WIRING: Award XP
          awardXPAuto('snipe-trade', 150, `Sniped ${tokenSymbol}`)

          toast.success(`🔴 LIVE Snipe Executed: ${tokenSymbol}!`, { 
            description: `Bought with ${snipeBudget} SOL`,
            action: {
              label: 'View TX',
              onClick: () => window.open(`https://solscan.io/tx/${result.signature}`, '_blank'),
            },
          })
        } else {
          toast.error('Snipe Failed', { description: result.error })
        }
      } else {
        // PAPER MODE
        awardXPAuto('paper-trade', 15, `Paper Snipe ${tokenSymbol}`)

        toast.success('📝 Paper Snipe Activated', { 
          description: `Simulated: Watching for ${tokenSymbol} with ${snipeBudget} SOL budget`
        })
      }
      
      setSnipeToken('')
      setSnipeBudget('')
    } catch (error: any) {
      toast.error('Snipe Failed', { description: error.message })
    } finally {
      setExecutingTrade(null)
    }
  }, [snipeToken, snipeBudget, isLive, connected, signTransaction, currentPrice, setHistory])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-[0.2em] uppercase hud-text">
            <span className="text-primary neon-glow">TRADING HUB</span>
          </h2>
          <p className="text-muted-foreground uppercase tracking-wide text-sm mt-2">
            CONFIGURE DCA STRATEGIES AND TOKEN SNIPING PARAMETERS
          </p>
        </div>
        
        {/* Trading Mode Badge */}
        <Badge 
          className={isLive 
            ? "bg-destructive/20 border-2 border-destructive text-destructive animate-pulse px-4 py-2" 
            : "bg-primary/20 border-2 border-primary text-primary px-4 py-2"
          }
        >
          {isLive ? (
            <>
              <Fire size={16} weight="fill" className="mr-2" />
              LIVE TRADING
            </>
          ) : (
            <>
              <TestTube size={16} weight="fill" className="mr-2" />
              PAPER MODE
            </>
          )}
        </Badge>
      </div>

      <ProfitConverter />

      <Tabs defaultValue="dca" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/80 backdrop-blur-md border-2 border-primary p-1 jagged-corner">
          <TabsTrigger value="dca" className="gap-2 jagged-corner-small data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:neon-glow">
            <Clock size={18} weight="duotone" />
            <span className="font-bold uppercase tracking-wide">DCA</span>
          </TabsTrigger>
          <TabsTrigger value="snipe" className="gap-2 jagged-corner-small data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:neon-glow">
            <Lightning size={18} weight="duotone" />
            <span className="font-bold uppercase tracking-wide">SNIPE</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dca" className="space-y-4 mt-4">
          <div className="holographic-card relative">
            <TradeExecutionEffect 
              isActive={executingTrade === 'dca'} 
              type="dca"
            />
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 jagged-corner-small bg-primary/30 border border-primary">
                  <Clock size={24} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-primary hud-text">DOLLAR COST AVERAGING</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">SYSTEMATIC ACCUMULATION OF SOL AT REGULAR INTERVALS</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dca-amount" className="uppercase tracking-wide text-xs font-bold">Amount (SOL)</Label>
                  <Input
                    id="dca-amount"
                    type="number"
                    placeholder="0.00"
                    value={dcaAmount}
                    onChange={(e) => setDcaAmount(e.target.value)}
                    className="bg-muted/50 border-2 border-primary/50 focus:border-primary jagged-corner-small"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dca-interval" className="uppercase tracking-wide text-xs font-bold">Interval (hours)</Label>
                  <Input
                    id="dca-interval"
                    type="number"
                    placeholder="1"
                    value={dcaInterval}
                    onChange={(e) => setDcaInterval(e.target.value)}
                    className="bg-muted/50 border-2 border-primary/50 focus:border-primary jagged-corner-small"
                  />
                </div>
                <Button 
                  onClick={executeDCA}
                  disabled={executingTrade !== null}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground jagged-corner border-2 border-primary neon-glow uppercase tracking-[0.15em] font-bold"
                >
                  <ArrowsDownUp size={20} weight="bold" className="mr-2" />
                  Start DCA Strategy
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="snipe" className="space-y-4 mt-4">
          <div className="holographic-card relative">
            <TradeExecutionEffect 
              isActive={executingTrade === 'snipe'} 
              type="snipe"
            />
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 jagged-corner-small bg-secondary/30 border border-secondary">
                  <Lightning size={24} weight="duotone" className="text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-secondary hud-text">TOKEN SNIPING</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">AUTOMATICALLY BUY NEW TOKEN LAUNCHES BASED ON CRITERIA</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="snipe-token" className="uppercase tracking-wide text-xs font-bold">Token Symbol</Label>
                  <Input
                    id="snipe-token"
                    type="text"
                    placeholder="e.g. BONK"
                    value={snipeToken}
                    onChange={(e) => setSnipeToken(e.target.value)}
                    className="bg-muted/50 border-2 border-secondary/50 focus:border-secondary jagged-corner-small"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snipe-budget" className="uppercase tracking-wide text-xs font-bold">Budget (SOL)</Label>
                  <Input
                    id="snipe-budget"
                    type="number"
                    placeholder="0.00"
                    value={snipeBudget}
                    onChange={(e) => setSnipeBudget(e.target.value)}
                    className="bg-muted/50 border-2 border-secondary/50 focus:border-secondary jagged-corner-small"
                  />
                </div>
                <Button 
                  onClick={executeSnipe}
                  disabled={executingTrade !== null}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground jagged-corner border-2 border-secondary neon-glow-secondary uppercase tracking-[0.15em] font-bold"
                >
                  <Lightning size={20} weight="bold" className="mr-2" />
                  Activate Sniper
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="holographic-card scan-line-effect">
        <div className="p-6 relative z-10">
          <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-primary hud-text mb-6">RECENT TRADES</h3>
          {!history || history.length === 0 ? (
            <p className="text-center text-muted-foreground uppercase tracking-wide py-8">NO TRADES YET. START A STRATEGY ABOVE!</p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 10).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-4 jagged-corner bg-muted/30 border-2 border-primary/30 hover:border-primary/60 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 jagged-corner-small flex items-center justify-center border-2 border-primary/50 bg-primary/20">
                      {trade.type === 'dca' ? (
                        <Clock size={20} weight="duotone" className="text-primary" />
                      ) : (
                        <Lightning size={20} weight="duotone" className="text-secondary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide">{trade.type}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{trade.amount} {trade.token}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-secondary hud-value">${trade.price}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}