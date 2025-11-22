// Agent Snipe Panel — AI-Powered DEX Trading Execution
// November 21, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, Lightning, CheckCircle, XCircle, 
  Warning, Info 
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import AgentCard from '@/components/ai/AgentCard'
import { ELITE_AGENTS, hasAgentAccess, type AgentTier, type AgentDecision } from '@/lib/ai/agents/index'
import { wrapAllAgentsWithLearning } from '@/lib/ai/agents/agentWrapper'
import { useMarketFeed } from '@/hooks/useMarketFeed'
import { useDexExecution } from '@/hooks/useDexExecution'
import { useMempoolSniper } from '@/hooks/useMempoolSniper'
import { useWallet } from '@/hooks/useWallet'
import { toAgentInput } from '@/lib/ai/agentInputAdapter'
import { buildExecutionHints, parseTokenAmount, type DexExecutionRequest } from '@/lib/dex/client'

interface AgentSnipePanelProps {
  userTier: AgentTier
  userPublicKey?: string | null
}

// Default Solana token mints (can be customized)
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

export default function AgentSnipePanel({ userTier, userPublicKey: propUserPublicKey }: AgentSnipePanelProps) {
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null)
  const [agentDecision, setAgentDecision] = useState<AgentDecision | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Trading params
  const [mintIn, setMintIn] = useState(SOL_MINT)
  const [mintOut, setMintOut] = useState(USDC_MINT)
  const [amount, setAmount] = useState('0.1')
  
  // Hooks - Use wallet adapter if available, fallback to prop
  const { walletAddress: adapterWalletAddress, isConnected: walletConnected } = useWallet()
  const userPublicKey = adapterWalletAddress || propUserPublicKey
  
  // Market feed - Production: Use live data only
  const { snapshot, isConnected } = useMarketFeed({ useMockData: false })
  const { status, lastResult, error: execError, execute, reset } = useDexExecution()
  const { 
    isMonitoring, 
    lastSnipe, 
    startMonitoring, 
    stopMonitoring, 
    enableAutoSnipe 
  } = useMempoolSniper(userPublicKey)
  
  // Mempool sniping state (for Liquidity Hunter)
  const [autoSnipeEnabled, setAutoSnipeEnabled] = useState(false)
  const isLiquidityHunter = selectedAgentName === 'Liquidity Hunter'

  // Available agents (filter by tier access and wrap with learning)
  const availableAgents = wrapAllAgentsWithLearning(
    ELITE_AGENTS.filter(agent => hasAgentAccess(agent.tier, userTier))
  )

  // Select first available agent by default
  useEffect(() => {
    if (!selectedAgentName && availableAgents.length > 0) {
      setSelectedAgentName(availableAgents[0].name)
    }
  }, [availableAgents, selectedAgentName])

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
      
      // Optimize decision using intelligent decision engine
      const { getDecisionEngine } = await import('@/lib/ai/learning/IntelligentDecisionEngine')
      const decisionEngine = getDecisionEngine()
      
      const confidenceValue = rawDecision.confidence === 'very-high' ? 0.9 :
                             rawDecision.confidence === 'high' ? 0.75 :
                             rawDecision.confidence === 'medium' ? 0.6 : 0.4
      
      const optimizedDecision = decisionEngine.optimizeDecision(rawDecision, {
        agentId: agent.name.toLowerCase().replace(/\s+/g, '-'),
        strategy: 'agent-analysis',
        marketConditions: {
          volatility: snapshot.volatility.volatility1h,
          volume: snapshot.orderbook.mid * 1000, // Approximate
          sentiment: snapshot.sentiment.score,
          mevRisk: snapshot.mev.riskScore,
        },
        confidence: confidenceValue,
        signal: rawDecision.signal,
        expectedProfit: rawDecision.metadata?.expectedProfitBps as number | undefined,
        riskLevel: rawDecision.metadata?.riskLevel as 'low' | 'medium' | 'high' | undefined,
      })
      
      // Use optimized decision
      setAgentDecision({
        ...optimizedDecision,
        metadata: {
          ...rawDecision.metadata,
          ...optimizedDecision.metadata,
          optimized: true,
        },
      })
      
      // Show toast with optimization info
      const signalEmoji = { BUY: '🟢', SELL: '🔴', HOLD: '⏸️' }
      const optimizationBadge = optimizedDecision.metadata?.optimized ? '🧠' : ''
      toast.success(`${signalEmoji[optimizedDecision.signal]} ${optimizationBadge} ${agent.name}: ${optimizedDecision.signal}`, {
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

  // Execute trade based on agent signal
  const executeSnipe = async () => {
    if (!userPublicKey) {
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
      // Parse amount
      const amountBigInt = parseTokenAmount(amount, 9) // SOL has 9 decimals
      
      if (amountBigInt <= 0n) {
        toast.error('Invalid amount', { description: 'Amount must be greater than 0' })
        return
      }

      // Build execution hints from market conditions
      // For Liquidity Hunter, use mempool sniping with Jito bundles and flash loan fallback
      const isSnipe = isLiquidityHunter && agentDecision.metadata?.snipeMethod
      const hints = buildExecutionHints(
        snapshot.mev.riskScore,
        snapshot.dexEdge.arbEdgeBps,
        {
          useFlashLoan: isLiquidityHunter && (agentDecision.metadata?.useFlashLoan as boolean),
          flashLoanProvider: 'solend',
          isMempoolSnipe: isSnipe,
        }
      )

      // Use intelligent trade executor for outcome tracking
      const { getTradeExecutor } = await import('@/lib/ai/learning/TradeExecutor')
      const tradeExecutor = getTradeExecutor()
      
      // Get optimized position size
      const confidenceValue = agentDecision.confidence === 'very-high' ? 0.9 :
                             agentDecision.confidence === 'high' ? 0.75 :
                             agentDecision.confidence === 'medium' ? 0.6 : 0.4
      
      const positionMultiplier = agentDecision.metadata?.positionSizeMultiplier as number || 1.0
      const optimizedAmount = amountBigInt * BigInt(Math.round(positionMultiplier * 100)) / 100n
      
      // Create execution request with optimized amount
      const request: DexExecutionRequest = {
        user: userPublicKey,
        mintIn: agentDecision.signal === 'BUY' ? mintIn : mintOut,
        mintOut: agentDecision.signal === 'BUY' ? mintOut : mintIn,
        amountIn: optimizedAmount,
        side: agentDecision.signal === 'BUY' ? 'buy' : 'sell',
        hints,
      }

      // Execute with outcome tracking
      const entryPrice = snapshot.orderbook.mid
      const executionResult = await execute(request)
      
      // Record outcome for learning
      if (executionResult.txId) {
        await tradeExecutor.executeTrade(
          {
            agentId: selectedAgentName.toLowerCase().replace(/\s+/g, '-'),
            strategy: 'agent-execution',
            signal: agentDecision.signal,
            confidence: confidenceValue,
            entryPrice,
            amount: optimizedAmount,
            marketConditions: {
              volatility: snapshot.volatility.volatility1h,
              volume: snapshot.orderbook.mid * 1000,
              sentiment: snapshot.sentiment.score,
              mevRisk: snapshot.mev.riskScore,
            },
            metadata: agentDecision.metadata,
          },
          async () => executionResult
        )
      }
      
      const positionInfo = positionMultiplier !== 1.0 
        ? ` (${(positionMultiplier * 100).toFixed(0)}% position size)` 
        : ''
      
      toast.success('Trade executed! 🧠', {
        description: `Intelligent execution complete${positionInfo}. Learning system updated.`,
        duration: 5000,
      })
    } catch (error: any) {
      console.error('Execution failed:', error)
      toast.error('Execution failed', { description: error.message })
    }
  }

  const selectedAgent = ELITE_AGENTS.find(a => a.name === selectedAgentName)

  return (
    <div className="cyber-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Target size={32} weight="duotone" className="text-accent" />
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-wide text-accent">
            Agent Snipe Panel
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            AI-Powered DEX Trading
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 p-3 bg-background/60 border border-primary/20 rounded-lg">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-muted-foreground'} animate-pulse`} />
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Live Market Feed' : 'Mock Data'}
        </span>
        {snapshot && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              Price: ${snapshot.orderbook.mid.toFixed(4)}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className={`text-xs font-bold ${snapshot.mev.riskScore > 0.5 ? 'text-destructive' : 'text-accent'}`}>
              MEV Risk: {(snapshot.mev.riskScore * 100).toFixed(0)}%
            </span>
          </>
        )}
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
          userTier={userTier}
          compact
          isActive={!!agentDecision}
          lastSignal={agentDecision?.signal}
          confidencePct={agentDecision ? getConfidencePct(agentDecision.confidence) : undefined}
        />
      )}

      {/* Trading Parameters */}
      <div className="grid grid-cols-2 gap-4">
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

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider font-bold">Amount (SOL)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-lg font-bold"
        />
      </div>

      {/* Mempool Sniping Controls (Liquidity Hunter only) */}
      {isLiquidityHunter && (
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightning size={18} weight="duotone" className="text-cyan-400" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                Live Mempool Sniping
              </h4>
            </div>
            <Badge variant={isMonitoring ? 'default' : 'outline'} className={isMonitoring ? 'bg-cyan-500/20 border-cyan-500/50' : ''}>
              {isMonitoring ? 'ACTIVE' : 'IDLE'}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Automatically snipe new pools detected in mempool with Jito bundles and flash loan fallback
          </p>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (autoSnipeEnabled) {
                  stopMonitoring()
                  setAutoSnipeEnabled(false)
                  toast.info('Auto-snipe disabled')
                } else {
                  const amountBigInt = parseTokenAmount(amount, 9)
                  if (amountBigInt <= 0n) {
                    toast.error('Invalid amount for auto-snipe')
                    return
                  }
                  enableAutoSnipe(amountBigInt, mintIn, (result) => {
                    if (result.success) {
                      toast.success('🎯 Pool sniped!', {
                        description: `Method: ${result.method}, Time: ${result.executionTimeMs}ms`,
                      })
                    } else {
                      toast.error('Snipe failed', { description: result.error })
                    }
                  })
                  setAutoSnipeEnabled(true)
                  toast.success('Auto-snipe enabled', {
                    description: 'Monitoring mempool for new pools...',
                  })
                }
              }}
              variant={autoSnipeEnabled ? 'destructive' : 'default'}
              size="sm"
              className={autoSnipeEnabled ? '' : 'bg-cyan-500 hover:bg-cyan-600'}
            >
              {autoSnipeEnabled ? 'Stop Auto-Snipe' : 'Enable Auto-Snipe'}
            </Button>
            
            {lastSnipe && (
              <div className="flex-1 text-xs text-muted-foreground">
                Last snipe: {lastSnipe.success ? '✅' : '❌'} {lastSnipe.method} ({lastSnipe.executionTimeMs}ms)
              </div>
            )}
          </div>

          {agentDecision?.metadata?.snipeMethod && (
            <div className="p-2 bg-background/60 rounded text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Method:</span>
                <Badge className="bg-cyan-500/20 text-cyan-400">
                  {agentDecision.metadata.snipeMethod as string}
                </Badge>
                {agentDecision.metadata.useFlashLoan && (
                  <Badge className="bg-purple-500/20 text-purple-400">
                    Flash Loan Ready
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={runAnalysis}
          disabled={isAnalyzing || !selectedAgentName}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          <Lightning size={16} className="mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
        
        <Button
          onClick={executeSnipe}
          disabled={!agentDecision || agentDecision.signal === 'HOLD' || status === 'submitting'}
          className="bg-gradient-to-r from-accent to-primary"
        >
          <Target size={16} className="mr-2" />
          {status === 'submitting' ? 'Executing...' : 'Execute Snipe'}
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
            {agentDecision.metadata && Object.keys(agentDecision.metadata).length > 0 && (
              <div className="text-[10px] text-muted-foreground font-mono">
                {JSON.stringify(agentDecision.metadata, null, 2)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution Result */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-accent/10 border border-accent/30 rounded-lg space-y-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} weight="fill" className="text-accent" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-accent">
                Execution Successful
              </h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono truncate">{lastResult.txId.slice(0, 16)}...</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Route</p>
                <p className="font-bold">{lastResult.route}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Price</p>
                <p className="font-bold">{lastResult.effectivePrice.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Slippage</p>
                <p className="font-bold">{lastResult.slippageBps} bps</p>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              className="w-full text-xs"
            >
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution Error */}
      <AnimatePresence>
        {execError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={20} weight="fill" className="text-destructive" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-destructive">
                Execution Failed
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">{execError}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              className="w-full text-xs mt-3"
            >
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Warning */}
      {!userPublicKey && (
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

/**
 * Convert confidence level to percentage
 */
function getConfidencePct(confidence: string): number {
  const map: Record<string, number> = {
    'low': 25,
    'medium': 50,
    'high': 75,
    'very-high': 95,
  }
  return map[confidence] || 50
}
