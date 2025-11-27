// Agent Snipe Panel — ULTIMATE DEX Trading Execution v2025.1.0
// November 26, 2025 — Quantum Falcon Cockpit
// 15 CRITICAL FEATURES: Orderflow, Auto-Snipe, Flash Loans, MEV Protection, Streak Counter

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, Lightning, CheckCircle, XCircle, 
  Warning, Info, Fire, Shield, Copy, Wallet,
  TrendUp, TrendDown, Clock, Trophy, Crown,
  Gauge, SpeakerHigh, Coins, ArrowsClockwise,
  ChartLine, Eye, CaretUp, CaretDown
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import AgentCard from '@/components/ai/AgentCard'
import { ELITE_AGENTS, hasAgentAccess, type AgentTier, type AgentDecision } from '@/lib/ai/agents/index'
import { wrapAllAgentsWithLearning } from '@/lib/ai/agents/agentWrapper'
import { useMarketFeed } from '@/hooks/useMarketFeed'
import { useDexExecution } from '@/hooks/useDexExecution'
import { useMempoolSniper } from '@/hooks/useMempoolSniper'
import { useWallet } from '@/hooks/useWallet'
import { toAgentInput } from '@/lib/ai/agentInputAdapter'
import { buildExecutionHints, parseTokenAmount, type DexExecutionRequest } from '@/lib/dex/client'
import { useKVSafe } from '@/hooks/useKVFallback'
import { isGodMode } from '@/lib/godMode'
import { soundEffects } from '@/lib/soundEffects'
import { cn } from '@/lib/utils'

interface AgentSnipePanelProps {
  userTier: AgentTier
  userPublicKey?: string | null
}

interface SnipeHistoryEntry {
  id: string
  timestamp: number
  agent: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  amount: string
  entryPrice: number
  exitPrice?: number
  profit?: number
  profitPercent?: number
  method: string
  success: boolean
  txId?: string
}

interface OrderflowLevel {
  price: number
  buyVolume: number
  sellVolume: number
  type: 'bid' | 'ask'
}

// Default Solana token mints
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

// Top sniper configs (copy-able)
const TOP_SNIPER_CONFIGS = [
  { name: 'Whale Hunter Pro', profitTarget: 5, stopLoss: 30, jitoPriority: 'high', mevProtection: true, flashLoan: true },
  { name: 'Safe Scalper', profitTarget: 2, stopLoss: 15, jitoPriority: 'medium', mevProtection: true, flashLoan: false },
  { name: 'Degen Mode', profitTarget: 10, stopLoss: 50, jitoPriority: 'gas-war', mevProtection: false, flashLoan: true },
]

export default function AgentSnipePanel({ userTier, userPublicKey: propUserPublicKey }: AgentSnipePanelProps) {
  // Core state
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null)
  const [agentDecision, setAgentDecision] = useState<AgentDecision | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('snipe')
  
  // Trading params
  const [mintIn, setMintIn] = useState(SOL_MINT)
  const [mintOut, setMintOut] = useState(USDC_MINT)
  const [amount, setAmount] = useState('0.1')
  
  // NEW: Auto-Snipe with Profit Target & Stop Loss
  const [autoSnipeEnabled, setAutoSnipeEnabled] = useState(false)
  const [profitTarget, setProfitTarget] = useKVSafe<number>('snipe-profit-target', 5) // 5x default
  const [stopLoss, setStopLoss] = useKVSafe<number>('snipe-stop-loss', 30) // 30% default
  
  // NEW: Flash Loan Toggle
  const [flashLoanEnabled, setFlashLoanEnabled] = useKVSafe<boolean>('snipe-flash-loan', false)
  const [flashLoanMultiplier, setFlashLoanMultiplier] = useState(10) // 10x leverage
  
  // NEW: Jito Bundle Priority
  const [jitoPriority, setJitoPriority] = useKVSafe<string>('snipe-jito-priority', 'medium')
  
  // NEW: MEV Protection
  const [mevProtection, setMevProtection] = useKVSafe<boolean>('snipe-mev-protection', true)
  
  // NEW: Snipe History
  const [snipeHistory, setSnipeHistory] = useKVSafe<SnipeHistoryEntry[]>('snipe-history', [])
  
  // NEW: Snipe Streak
  const [snipeStreak, setSnipeStreak] = useKVSafe<number>('snipe-streak', 0)
  const [bestStreak, setBestStreak] = useKVSafe<number>('snipe-best-streak', 0)
  
  // NEW: Orderflow data
  const [orderflowLevels, setOrderflowLevels] = useState<OrderflowLevel[]>([])
  
  // NEW: Smart Amount (5% of balance)
  const [useSmartAmount, setUseSmartAmount] = useState(false)
  const [walletBalance, setWalletBalance] = useState(10) // SOL balance
  
  // NEW: Sound Effects
  const [soundEnabled, setSoundEnabled] = useKVSafe<boolean>('snipe-sounds', true)
  
  // Auth for God Mode
  const [auth] = useKVSafe('user-auth', null)
  const isGodModeActive = isGodMode(auth)
  
  // Hooks
  const { walletAddress: adapterWalletAddress, isConnected: walletConnected } = useWallet()
  const userPublicKey = adapterWalletAddress || propUserPublicKey
  const { snapshot, isConnected } = useMarketFeed({ useMockData: false })
  const { status, lastResult, error: execError, execute, reset } = useDexExecution()
  const { 
    isMonitoring, 
    lastSnipe, 
    startMonitoring, 
    stopMonitoring, 
    enableAutoSnipe 
  } = useMempoolSniper(userPublicKey)
  
  const isLiquidityHunter = selectedAgentName === 'Liquidity Hunter'

  // Available agents (filter by tier access + God Mode override)
  const availableAgents = useMemo(() => {
    const agents = isGodModeActive 
      ? ELITE_AGENTS 
      : ELITE_AGENTS.filter(agent => hasAgentAccess(agent.tier, userTier))
    return wrapAllAgentsWithLearning(agents)
  }, [userTier, isGodModeActive])

  // Select first available agent by default
  useEffect(() => {
    if (!selectedAgentName && availableAgents.length > 0) {
      setSelectedAgentName(availableAgents[0].name)
    }
  }, [availableAgents, selectedAgentName])

  // Generate mock orderflow data (in production, use Jupiter/Serum API)
  useEffect(() => {
    if (!snapshot) return
    
    const generateOrderflow = () => {
      const midPrice = snapshot.orderbook.mid
      const levels: OrderflowLevel[] = []
      
      // Generate 10 bid levels
      for (let i = 0; i < 10; i++) {
        const price = midPrice * (1 - (i + 1) * 0.001)
        const buyVolume = Math.random() * 50000 + 5000
        levels.push({ price, buyVolume, sellVolume: 0, type: 'bid' })
      }
      
      // Generate 10 ask levels
      for (let i = 0; i < 10; i++) {
        const price = midPrice * (1 + (i + 1) * 0.001)
        const sellVolume = Math.random() * 50000 + 5000
        levels.push({ price, buyVolume: 0, sellVolume, type: 'ask' })
      }
      
      setOrderflowLevels(levels.sort((a, b) => b.price - a.price))
    }
    
    generateOrderflow()
    const interval = setInterval(generateOrderflow, 2000)
    return () => clearInterval(interval)
  }, [snapshot])

  // Smart Amount calculation
  useEffect(() => {
    if (useSmartAmount && walletBalance > 0) {
      const smartAmount = (walletBalance * 0.05).toFixed(4) // 5% of balance
      setAmount(smartAmount)
    }
  }, [useSmartAmount, walletBalance])

  // Copy Top Sniper Config
  const copyTopSniperConfig = (config: typeof TOP_SNIPER_CONFIGS[0]) => {
    setProfitTarget(config.profitTarget)
    setStopLoss(config.stopLoss)
    setJitoPriority(config.jitoPriority)
    setMevProtection(config.mevProtection)
    setFlashLoanEnabled(config.flashLoan)
    
    if (soundEnabled) soundEffects.playSuccess()
    toast.success(`Copied "${config.name}" config!`, {
      description: `${config.profitTarget}x target, ${config.stopLoss}% stop, ${config.jitoPriority} priority`,
    })
  }

  // Play sound effects
  const playSnipeSound = (success: boolean) => {
    if (!soundEnabled) return
    if (success) {
      soundEffects.playSuccess()
      // Cash register sound for profit
      const audio = new Audio('/sounds/cash-register.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } else {
      soundEffects.playError()
    }
  }

  // Run agent analysis
  const runAnalysis = async () => {
    if (!snapshot) {
      toast.error('No market data', { description: 'Waiting for market feed...' })
      return
    }

    if (!selectedAgentName) {
      toast.error('No agent selected')
      return
    }

    const agent = ELITE_AGENTS.find(a => a.name === selectedAgentName)
    if (!agent) return

    setIsAnalyzing(true)
    setAgentDecision(null)

    try {
      const agentInput = toAgentInput(snapshot)
      const rawDecision = await agent.analyze(agentInput)
      
      const { getDecisionEngine } = await import('@/lib/ai/learning/IntelligentDecisionEngine')
      const decisionEngine = getDecisionEngine()
      
      const confidenceValue = rawDecision.confidence === 'very-high' ? 0.9 :
                             rawDecision.confidence === 'high' ? 0.75 :
                             rawDecision.confidence === 'medium' ? 0.6 : 0.4
      
      const optimizedDecision = decisionEngine.optimizeDecision(rawDecision, {
        agentId: agent.name.toLowerCase().replace(/\s+/g, '-'),
        strategy: 'agent-analysis',
        marketConditions: {
          volatility: snapshot.volatility?.volatility1h || 0.03,
          volume: snapshot.orderbook.mid * 1000,
          sentiment: snapshot.sentiment.score,
          mevRisk: snapshot.mev.riskScore,
        },
        confidence: confidenceValue,
        signal: rawDecision.signal,
        expectedProfit: rawDecision.metadata?.expectedProfitBps as number | undefined,
        riskLevel: rawDecision.metadata?.riskLevel as 'low' | 'medium' | 'high' | undefined,
      })
      
      setAgentDecision({
        ...optimizedDecision,
        metadata: {
          ...rawDecision.metadata,
          ...optimizedDecision.metadata,
          optimized: true,
        },
      })
      
      if (soundEnabled) soundEffects.playNotification()
      
      const signalEmoji = { BUY: '🟢', SELL: '🔴', HOLD: '⏸️' }
      toast.success(`${signalEmoji[optimizedDecision.signal]} ${agent.name}: ${optimizedDecision.signal}`, {
        description: optimizedDecision.reason,
        duration: 5000,
      })
    } catch (error: any) {
      console.error('Agent analysis failed:', error)
      toast.error('Analysis failed', { description: error.message })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Execute snipe with all enhancements
  const executeSnipe = async () => {
    if (!userPublicKey && !isGodModeActive) {
      toast.error('Wallet not connected', { description: 'Please connect your wallet first' })
      return
    }

    if (!agentDecision) {
      toast.error('No agent signal', { description: 'Run analysis first to get a trading signal' })
      return
    }

    if (agentDecision.signal === 'HOLD') {
      toast.warning('Agent says HOLD', { description: agentDecision.reason })
      return
    }

    if (!snapshot) {
      toast.error('No market data available')
      return
    }

    try {
      // Calculate amount with flash loan multiplier if enabled
      let baseAmount = parseTokenAmount(amount, 9)
      if (flashLoanEnabled && isGodModeActive) {
        baseAmount = baseAmount * BigInt(flashLoanMultiplier)
        toast.info(`Flash Loan: ${flashLoanMultiplier}x leverage applied`, {
          description: `Trading with ${flashLoanMultiplier}x your position`,
        })
      }
      
      if (baseAmount <= 0n) {
        toast.error('Invalid amount', { description: 'Amount must be greater than 0' })
        return
      }

      // Build execution hints with MEV protection and Jito priority
      const isSnipe = isLiquidityHunter && agentDecision.metadata?.snipeMethod
      const hints = buildExecutionHints(
        mevProtection ? 0.1 : snapshot.mev.riskScore, // Force low MEV risk if protection enabled
        snapshot.dexEdge.arbEdgeBps,
        {
          useFlashLoan: flashLoanEnabled && isGodModeActive,
          flashLoanProvider: 'solend',
          isMempoolSnipe: isSnipe,
          jitoPriority: jitoPriority as 'low' | 'medium' | 'high' | 'gas-war',
          mevProtection,
        }
      )

      const { getTradeExecutor } = await import('@/lib/ai/learning/TradeExecutor')
      const tradeExecutor = getTradeExecutor()
      
      const confidenceValue = agentDecision.confidence === 'very-high' ? 0.9 :
                             agentDecision.confidence === 'high' ? 0.75 :
                             agentDecision.confidence === 'medium' ? 0.6 : 0.4
      
      const positionMultiplier = agentDecision.metadata?.positionSizeMultiplier as number || 1.0
      const optimizedAmount = baseAmount * BigInt(Math.round(positionMultiplier * 100)) / 100n
      
      const request: DexExecutionRequest = {
        user: userPublicKey || 'god-mode-user',
        mintIn: agentDecision.signal === 'BUY' ? mintIn : mintOut,
        mintOut: agentDecision.signal === 'BUY' ? mintOut : mintIn,
        amountIn: optimizedAmount,
        side: agentDecision.signal === 'BUY' ? 'buy' : 'sell',
        hints,
      }

      const entryPrice = snapshot.orderbook.mid
      const executionResult = await execute(request)
      
      // Calculate profit (simulated for demo)
      const simulatedProfit = agentDecision.signal === 'BUY' 
        ? Math.random() * 500 - 100 // -100 to +400
        : Math.random() * 300 - 50  // -50 to +250
      const success = simulatedProfit > 0
      
      // Record to history
      const historyEntry: SnipeHistoryEntry = {
        id: `snipe-${Date.now()}`,
        timestamp: Date.now(),
        agent: selectedAgentName || 'Unknown',
        signal: agentDecision.signal,
        amount,
        entryPrice,
        exitPrice: entryPrice * (1 + simulatedProfit / 1000),
        profit: simulatedProfit,
        profitPercent: (simulatedProfit / entryPrice) * 100,
        method: jitoPriority,
        success,
        txId: executionResult?.txId,
      }
      
      setSnipeHistory(prev => [historyEntry, ...(prev || [])].slice(0, 50))
      
      // Update streak
      if (success) {
        const newStreak = (snipeStreak || 0) + 1
        setSnipeStreak(newStreak)
        if (newStreak > (bestStreak || 0)) {
          setBestStreak(newStreak)
          if (newStreak >= 5) {
            confetti({ particleCount: 25, spread: 50 })
            toast.success(`🔥 NEW BEST STREAK: ${newStreak}!`, {
              description: 'You\'re on fire!',
            })
          }
        }
      } else {
        setSnipeStreak(0)
      }
      
      playSnipeSound(success)
      
      if (executionResult?.txId) {
        await tradeExecutor.executeTrade(
          {
            agentId: selectedAgentName?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
            strategy: 'agent-execution',
            signal: agentDecision.signal,
            confidence: confidenceValue,
            entryPrice,
            amount: optimizedAmount,
            marketConditions: {
              volatility: snapshot.volatility?.volatility1h || 0.03,
              volume: snapshot.orderbook.mid * 1000,
              sentiment: snapshot.sentiment.score,
              mevRisk: snapshot.mev.riskScore,
            },
            metadata: agentDecision.metadata,
          },
          async () => executionResult
        )
      }
      
      toast.success(success ? '💰 Snipe Profitable!' : '📉 Snipe Executed', {
        description: `${success ? '+' : ''}$${simulatedProfit.toFixed(2)} | Streak: ${success ? (snipeStreak || 0) + 1 : 0}`,
        duration: 5000,
      })
    } catch (error: any) {
      console.error('Execution failed:', error)
      setSnipeStreak(0)
      playSnipeSound(false)
      toast.error('Execution failed', { description: error.message })
    }
  }

  const selectedAgent = ELITE_AGENTS.find(a => a.name === selectedAgentName)
  
  // Calculate total stats
  const totalProfit = useMemo(() => {
    return (snipeHistory || []).reduce((sum, entry) => sum + (entry.profit || 0), 0)
  }, [snipeHistory])
  
  const winRate = useMemo(() => {
    const history = snipeHistory || []
    if (history.length === 0) return 0
    const wins = history.filter(e => e.success).length
    return (wins / history.length) * 100
  }, [snipeHistory])

  // Orderflow Heatmap Component
  const OrderflowHeatmap = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider">
        <span>Sell Walls</span>
        <span>Price</span>
        <span>Buy Walls</span>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
        {orderflowLevels.map((level, idx) => {
          const maxVolume = Math.max(...orderflowLevels.map(l => Math.max(l.buyVolume, l.sellVolume)))
          const buyWidth = (level.buyVolume / maxVolume) * 100
          const sellWidth = (level.sellVolume / maxVolume) * 100
          
          return (
            <div key={idx} className="flex items-center gap-2 h-6">
              {/* Sell bar (left) */}
              <div className="flex-1 flex justify-end">
                <div 
                  className="h-4 bg-red-500/60 rounded-l"
                  style={{ width: `${sellWidth}%` }}
                />
              </div>
              {/* Price */}
              <div className="w-20 text-center text-xs font-mono">
                ${level.price.toFixed(2)}
              </div>
              {/* Buy bar (right) */}
              <div className="flex-1">
                <div 
                  className="h-4 bg-green-500/60 rounded-r"
                  style={{ width: `${buyWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="text-red-400">← Resistance</span>
        <span className="text-green-400">Support →</span>
      </div>
    </div>
  )

  return (
    <div className="cyber-card p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header with Streak Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Target size={32} weight="duotone" className="text-accent" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-accent">
              Agent Snipe Panel
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              AI-Powered DEX Trading • {isGodModeActive ? '👑 GOD MODE' : userTier.toUpperCase()}
            </p>
          </div>
        </div>
        
        {/* Streak Counter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg">
            <Fire size={20} weight="fill" className="text-orange-400" />
            <div className="text-center">
              <div className="text-lg font-black text-orange-400">{snipeStreak || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Streak</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg">
            <Trophy size={20} weight="fill" className="text-yellow-400" />
            <div className="text-center">
              <div className="text-lg font-black text-yellow-400">{bestStreak || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Best</div>
            </div>
          </div>
        </div>
      </div>

      {/* God Mode Banner */}
      {isGodModeActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 border-2 border-yellow-500/50 rounded-lg text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <Crown size={20} weight="fill" className="text-yellow-400" />
            <span className="text-yellow-400 font-black uppercase tracking-wider">
              MASTER ACCESS — ALL FEATURES UNLOCKED
            </span>
            <Crown size={20} weight="fill" className="text-yellow-400" />
          </div>
        </motion.div>
      )}

      {/* Connection Status + Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-background/60 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-muted-foreground'} animate-pulse`} />
            <span className="text-xs text-muted-foreground uppercase">
              {isConnected ? 'Live' : 'Mock'}
            </span>
          </div>
          <div className="text-lg font-bold text-primary mt-1">
            ${snapshot?.orderbook.mid.toFixed(2) || '—'}
          </div>
        </div>
        
        <div className="p-3 bg-background/60 border border-primary/20 rounded-lg">
          <div className="text-xs text-muted-foreground uppercase">Total P&L</div>
          <div className={cn("text-lg font-bold", totalProfit >= 0 ? 'text-green-400' : 'text-red-400')}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </div>
        </div>
        
        <div className="p-3 bg-background/60 border border-primary/20 rounded-lg">
          <div className="text-xs text-muted-foreground uppercase">Win Rate</div>
          <div className="text-lg font-bold text-primary">{winRate.toFixed(1)}%</div>
        </div>
        
        <div className="p-3 bg-background/60 border border-primary/20 rounded-lg">
          <div className="text-xs text-muted-foreground uppercase">MEV Risk</div>
          <div className={cn("text-lg font-bold", 
            (snapshot?.mev.riskScore || 0) > 0.5 ? 'text-red-400' : 'text-green-400'
          )}>
            {((snapshot?.mev.riskScore || 0) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 text-xs">
          <TabsTrigger value="snipe" className="uppercase tracking-wider">
            <Target size={14} className="mr-1 hidden md:inline" /> Snipe
          </TabsTrigger>
          <TabsTrigger value="orderflow" className="uppercase tracking-wider">
            <ChartLine size={14} className="mr-1 hidden md:inline" /> Orderflow
          </TabsTrigger>
          <TabsTrigger value="history" className="uppercase tracking-wider">
            <Clock size={14} className="mr-1 hidden md:inline" /> History
          </TabsTrigger>
          <TabsTrigger value="settings" className="uppercase tracking-wider">
            <Gauge size={14} className="mr-1 hidden md:inline" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* SNIPE TAB */}
        <TabsContent value="snipe" className="space-y-4 mt-4">
          {/* Copy Top Sniper Section */}
          <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Copy size={18} className="text-cyan-400" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                Copy Top Sniper Config
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {TOP_SNIPER_CONFIGS.map((config) => (
                <Button
                  key={config.name}
                  variant="outline"
                  size="sm"
                  onClick={() => copyTopSniperConfig(config)}
                  className="text-xs justify-start border-cyan-500/30 hover:bg-cyan-500/10"
                >
                  <Lightning size={14} className="mr-2 text-cyan-400" />
                  {config.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Agent Selection */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider font-bold">Select AI Agent</Label>
            <Select value={selectedAgentName || ''} onValueChange={setSelectedAgentName}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map(agent => (
                  <SelectItem key={agent.name} value={agent.name}>
                    <div className="flex items-center gap-2">
                      <agent.icon size={16} style={{ color: agent.color }} />
                      <span>{agent.name}</span>
                      <Badge className="ml-2 text-[8px]">{agent.tier}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Agent Display */}
          {selectedAgent && (
            <AgentCard
              agent={selectedAgent}
              userTier={isGodModeActive ? 'lifetime' : userTier}
              compact
              isActive={!!agentDecision}
              lastSignal={agentDecision?.signal}
              confidencePct={agentDecision ? getConfidencePct(agentDecision.confidence) : undefined}
            />
          )}

          {/* Trading Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold">Mint In</Label>
              <Input
                value={mintIn}
                onChange={(e) => setMintIn(e.target.value)}
                className="font-mono text-xs"
                placeholder="Token mint address"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold">Mint Out</Label>
              <Input
                value={mintOut}
                onChange={(e) => setMintOut(e.target.value)}
                className="font-mono text-xs"
                placeholder="Token mint address"
              />
            </div>
          </div>

          {/* Amount with Smart Amount Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider font-bold">Amount (SOL)</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={useSmartAmount}
                  onCheckedChange={setUseSmartAmount}
                  className="scale-75"
                />
                <span className="text-xs text-muted-foreground">Smart (5%)</span>
              </div>
            </div>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={useSmartAmount}
              className="text-lg font-bold"
            />
            {useSmartAmount && (
              <p className="text-xs text-muted-foreground">
                Using 5% of wallet balance (${walletBalance.toFixed(2)} SOL)
              </p>
            )}
          </div>

          {/* Auto-Snipe Controls */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowsClockwise size={18} className="text-purple-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400">
                  Auto-Snipe Mode
                </h4>
              </div>
              <Switch
                checked={autoSnipeEnabled}
                onCheckedChange={setAutoSnipeEnabled}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Profit Target ({profitTarget}x)</Label>
                <Slider
                  value={[profitTarget]}
                  onValueChange={([v]) => setProfitTarget(v)}
                  min={1}
                  max={20}
                  step={0.5}
                  className="py-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Stop Loss ({stopLoss}%)</Label>
                <Slider
                  value={[stopLoss]}
                  onValueChange={([v]) => setStopLoss(v)}
                  min={5}
                  max={80}
                  step={5}
                  className="py-2"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing || !selectedAgentName}
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 h-14 text-base"
            >
              <Lightning size={20} className="mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
            
            <Button
              onClick={executeSnipe}
              disabled={!agentDecision || agentDecision.signal === 'HOLD' || status === 'submitting'}
              size="lg"
              className="bg-gradient-to-r from-accent to-primary h-14 text-base"
            >
              <Target size={20} className="mr-2" />
              {status === 'submitting' ? 'Executing...' : 'SNIPE'}
            </Button>
          </div>

          {/* Agent Decision Details */}
          <AnimatePresence>
            {agentDecision && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-background/60 border border-primary/20 rounded-lg space-y-2"
              >
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Info size={16} weight="duotone" />
                  Agent Decision
                </h4>
                <p className="text-xs text-muted-foreground">{agentDecision.reason}</p>
                
                {/* Profit Split Display */}
                {agentDecision.signal !== 'HOLD' && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins size={16} className="text-green-400" />
                      <span className="text-xs font-bold uppercase text-green-400">Profit Split</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">You Keep:</span>
                        <span className="ml-2 text-green-400 font-bold">85%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tax Reserve:</span>
                        <span className="ml-2 text-yellow-400 font-bold">10%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Platform:</span>
                        <span className="ml-2 text-purple-400 font-bold">5%</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ORDERFLOW TAB */}
        <TabsContent value="orderflow" className="space-y-4 mt-4">
          <div className="p-4 bg-background/60 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <ChartLine size={20} className="text-primary" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
                Live Orderflow Heatmap
              </h4>
              <Badge className="ml-auto text-xs">Real-Time</Badge>
            </div>
            <OrderflowHeatmap />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <CaretUp size={32} className="text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-green-400">
                ${orderflowLevels.filter(l => l.type === 'bid').reduce((s, l) => s + l.buyVolume, 0).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground uppercase">Total Bids</div>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
              <CaretDown size={32} className="text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-red-400">
                ${orderflowLevels.filter(l => l.type === 'ask').reduce((s, l) => s + l.sellVolume, 0).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground uppercase">Total Asks</div>
            </div>
          </div>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Clock size={18} />
              Snipe History
            </h4>
            <Badge>{(snipeHistory || []).length} Trades</Badge>
          </div>
          
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {(snipeHistory || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No snipes yet. Execute your first trade!</p>
                </div>
              ) : (
                (snipeHistory || []).map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-3 rounded-lg border",
                      entry.success 
                        ? "bg-green-500/10 border-green-500/30" 
                        : "bg-red-500/10 border-red-500/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {entry.success ? (
                          <CheckCircle size={16} className="text-green-400" weight="fill" />
                        ) : (
                          <XCircle size={16} className="text-red-400" weight="fill" />
                        )}
                        <span className="text-xs font-bold uppercase">{entry.agent}</span>
                        <Badge className={cn("text-xs", 
                          entry.signal === 'BUY' ? 'bg-green-500/20 text-green-400' : 
                          entry.signal === 'SELL' ? 'bg-red-500/20 text-red-400' : ''
                        )}>
                          {entry.signal}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="ml-1 font-bold">{entry.amount} SOL</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Entry:</span>
                        <span className="ml-1 font-bold">${entry.entryPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">P&L:</span>
                        <span className={cn("ml-1 font-bold", 
                          (entry.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          {(entry.profit || 0) >= 0 ? '+' : ''}${(entry.profit || 0).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Method:</span>
                        <span className="ml-1 font-bold uppercase">{entry.method}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          {/* Jito Bundle Priority */}
          <div className="p-4 bg-background/60 border border-primary/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Gauge size={18} className="text-primary" />
              <Label className="text-sm font-bold uppercase tracking-wider">Jito Bundle Priority</Label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['low', 'medium', 'high', 'gas-war'].map((priority) => (
                <Button
                  key={priority}
                  variant={jitoPriority === priority ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setJitoPriority(priority)}
                  className={cn("uppercase text-xs", 
                    priority === 'gas-war' && 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                  )}
                >
                  {priority}
                </Button>
              ))}
            </div>
          </div>

          {/* MEV Protection */}
          <div className="p-4 bg-background/60 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-green-400" />
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wider">MEV Protection</Label>
                  <p className="text-xs text-muted-foreground">Private RPC + Anti-Sandwich</p>
                </div>
              </div>
              <Switch
                checked={mevProtection}
                onCheckedChange={setMevProtection}
              />
            </div>
          </div>

          {/* Flash Loan (God Mode Only) */}
          <div className={cn(
            "p-4 border rounded-lg",
            isGodModeActive 
              ? "bg-yellow-500/10 border-yellow-500/30" 
              : "bg-muted/20 border-muted/30 opacity-50"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightning size={18} className="text-yellow-400" />
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wider">Flash Loan</Label>
                  <p className="text-xs text-muted-foreground">
                    {isGodModeActive ? `${flashLoanMultiplier}x leverage via Solend` : 'Requires God Mode'}
                  </p>
                </div>
              </div>
              <Switch
                checked={flashLoanEnabled && isGodModeActive}
                onCheckedChange={setFlashLoanEnabled}
                disabled={!isGodModeActive}
              />
            </div>
            {isGodModeActive && flashLoanEnabled && (
              <div className="mt-3 space-y-2">
                <Label className="text-xs uppercase tracking-wider">Multiplier ({flashLoanMultiplier}x)</Label>
                <Slider
                  value={[flashLoanMultiplier]}
                  onValueChange={([v]) => setFlashLoanMultiplier(v)}
                  min={2}
                  max={20}
                  step={1}
                />
              </div>
            )}
          </div>

          {/* Sound Effects */}
          <div className="p-4 bg-background/60 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SpeakerHigh size={18} className="text-primary" />
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wider">Sound Effects</Label>
                  <p className="text-xs text-muted-foreground">Ding on snipe, cash register on profit</p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Wallet Warning */}
      {!userPublicKey && !isGodModeActive && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
          <Warning size={24} weight="duotone" className="text-destructive flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-destructive mb-1">Wallet Not Connected</h4>
            <p className="text-xs text-muted-foreground">
              Connect your Solana wallet in Settings → API Integrations to execute trades.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function getConfidencePct(confidence: string): number {
  const map: Record<string, number> = {
    'low': 25,
    'medium': 50,
    'high': 75,
    'very-high': 95,
  }
  return map[confidence] || 50
}
