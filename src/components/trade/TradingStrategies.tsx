import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Robot, Brain, Lightning, Target, TrendUp, ArrowsClockwise, 
  Play, Pause, Stop, Gear, ChartLine, Calendar, ChatCircle, Newspaper 
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { store, Strategy, Trade, TradingState } from '@/store/tradingStore'
import { useSocket } from '@/hooks/useSocket'
import { ParticleBackground } from '@/components/shared/ParticleBackground'
import { DraggableWidget } from '@/components/trade/DraggableWidget'
import { TradingChart } from '@/components/trade/TradingChart'

interface ActiveStrategy {
  id: string
  name: string
  symbol: string
  status: 'running' | 'paused' | 'stopped'
  trades: number
  pnl: number
  pnlPercent: number
  startedAt: number
}

interface RecurringBuy {
  id: string
  symbol: string
  amount: number
  interval: 'daily' | 'weekly' | 'monthly'
  nextExecution: number
  executions: number
  totalSpent: number
  enabled: boolean
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// WebSocket URL - can be configured via props or environment variable
const DEFAULT_WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

function TradingStrategiesContent() {
  const dispatch = useDispatch()
  const reduxStrategies = useSelector((state: TradingState) => state.strategies)
  const reduxTrades = useSelector((state: TradingState) => state.trades)
  const wsConnected = useSelector((state: TradingState) => state.isConnected)

  const [activeStrategies, setActiveStrategies] = useKV<ActiveStrategy[]>('active-strategies', [
    {
      id: '1',
      name: 'Momentum Bot',
      symbol: 'BTC/USDT',
      status: 'running',
      trades: 12,
      pnl: 342.50,
      pnlPercent: 3.2,
      startedAt: Date.now() - 86400000
    }
  ])

  const [explodeParticles, setExplodeParticles] = useState(false)
  const { socket, isConnected } = useSocket(DEFAULT_WS_URL)

  const [recurringBuys, setRecurringBuys] = useKV<RecurringBuy[]>('recurring-buys', [
    {
      id: '1',
      symbol: 'BTC/USDT',
      amount: 100,
      interval: 'daily',
      nextExecution: Date.now() + 3600000,
      executions: 30,
      totalSpent: 3000,
      enabled: true
    }
  ])

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI trading assistant. Ask me anything about market conditions, strategies, or risk management.', timestamp: Date.now() }
  ])
  const [userInput, setUserInput] = useState('')

  // WebSocket connection status update
  useEffect(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: isConnected })
  }, [isConnected, dispatch])

  // WebSocket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return

    // Listen for strategy updates
    socket.on('strategyUpdate', (data: Strategy[]) => {
      dispatch({ type: 'UPDATE_STRATEGIES', payload: data })
      toast.info('Strategies updated via WebSocket')
    })

    // Listen for new trades with particle explosion
    socket.on('newTrade', (trade: Trade) => {
      dispatch({ type: 'ADD_TRADE', payload: trade })
      setExplodeParticles(true)
      setTimeout(() => setExplodeParticles(false), 2000)
      
      // Award XP for profitable trades
      if (trade.pnl && trade.pnl > 0) {
        window.dispatchEvent(new CustomEvent('tradeCompleted', { 
          detail: { pnl: trade.pnl, symbol: trade.symbol } 
        }))
        toast.success(`Trade completed! PnL: $${trade.pnl.toFixed(2)}`)
      }
    })

    // Listen for real-time news updates
    socket.on('newsUpdate', (newsData: any) => {
      toast.info(`News: ${newsData.title}`, { duration: 5000 })
    })

    return () => {
      socket.off('strategyUpdate')
      socket.off('newTrade')
      socket.off('newsUpdate')
    }
  }, [socket, dispatch])

  // Keyboard shortcuts for accessibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt+1-5 for quick tab navigation
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        const tabs = ['active', 'strategies', 'dca', 'news', 'ai']
        const tabIndex = parseInt(e.key) - 1
        if (tabs[tabIndex]) {
          const tabElement = document.querySelector(`[value="${tabs[tabIndex]}"]`) as HTMLElement
          tabElement?.click()
          e.preventDefault()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const builtInStrategies = [
    { id: 'baseline', name: 'Baseline (Buy & Hold)', type: 'Buy & Hold', risk: 'Low' },
    { id: 'random', name: 'Random', type: 'Experimental', risk: 'High' },
    { id: 'mean-reversion', name: 'Mean Reversion', type: 'Mean Reversion', risk: 'Medium' },
    { id: 'momentum', name: 'Momentum', type: 'Trend Following', risk: 'Medium' },
    { id: 'rsi', name: 'RSI Strategy', type: 'Oscillator', risk: 'Low' },
    { id: 'bollinger', name: 'Bollinger Bands', type: 'Volatility', risk: 'Medium' },
    { id: 'macd', name: 'MACD Crossover', type: 'Trend Following', risk: 'Medium' },
    { id: 'ichimoku', name: 'Ichimoku Cloud', type: 'Multi-indicator', risk: 'High' },
  ]

  const handleStrategyToggle = (strategyId: string, action: 'pause' | 'stop' | 'resume') => {
    setActiveStrategies((current) => {
      if (!current) return []
      return current.map((s) => {
        if (s.id === strategyId) {
          if (action === 'pause') {
            toast.info(`Strategy ${s.name} paused`)
            return { ...s, status: 'paused' as const }
          } else if (action === 'stop') {
            toast.success(`Strategy ${s.name} stopped`)
            return { ...s, status: 'stopped' as const }
          } else if (action === 'resume') {
            toast.success(`Strategy ${s.name} resumed`)
            return { ...s, status: 'running' as const }
          }
        }
        return s
      })
    })
  }

  const handleToggleRecurring = (id: string) => {
    setRecurringBuys((current) => {
      if (!current) return []
      return current.map((buy) => {
        if (buy.id === id) {
          toast.success(`Recurring buy ${buy.enabled ? 'disabled' : 'enabled'}`)
          return { ...buy, enabled: !buy.enabled }
        }
        return buy
      })
    })
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: Date.now()
    }

    setChatMessages((prev) => [...prev, userMessage])
    setUserInput('')

    setTimeout(() => {
      const responses = [
        'Based on current RSI indicators, BTC is showing oversold conditions. This could be a good entry point for a mean reversion strategy.',
        'Market sentiment is bullish. Volume analysis shows strong buying pressure across major pairs.',
        'Consider implementing a stop-loss at -3% to protect your capital. Risk management is key to long-term success.',
        'The MACD crossover suggests a bullish trend forming. Consider increasing position size gradually.',
        'Current volatility is elevated. DCA strategies work well in these conditions to average your entry price.'
      ]

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: Date.now()
      }

      setChatMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  const formatNextExecution = (timestamp: number) => {
    const diff = timestamp - Date.now()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)} days`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6 relative">
      <ParticleBackground explode={explodeParticles} />
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-[0.25em] uppercase">
          <span className="text-primary neon-glow-primary">TRADING_HUB</span>
        </h2>
        <div className="flex items-center gap-3">
          {/* WebSocket connection indicator */}
          <div className="flex items-center gap-2" role="status" aria-live="polite">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-muted-foreground/50'}`} />
            <span className="text-xs uppercase tracking-wider" style={{ color: isConnected ? 'var(--primary)' : 'var(--muted-foreground)' }}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <button className="p-2 bg-card border border-primary/30 hover:bg-primary/10 hover:border-primary transition-all relative group">
            <ArrowsClockwise size={18} weight="duotone" className="text-primary" />
            <div className="hud-corner-tl" />
            <div className="hud-corner-br" />
          </button>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-muted/30 border border-primary/30">
          <TabsTrigger value="active" className="data-label gap-2">
            <Lightning size={16} weight="duotone" />
            ACTIVE
          </TabsTrigger>
          <TabsTrigger value="strategies" className="data-label gap-2">
            <Robot size={16} weight="duotone" />
            STRATEGIES
          </TabsTrigger>
          <TabsTrigger value="dca" className="data-label gap-2">
            <Calendar size={16} weight="duotone" />
            DCA
          </TabsTrigger>
          <TabsTrigger value="news" className="data-label gap-2">
            <Newspaper size={16} weight="duotone" />
            NEWS_FEED
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-label gap-2">
            <Brain size={16} weight="duotone" />
            AI_ASSISTANT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Advanced Trading Chart */}
          <TradingChart />

          <div className="cyber-card">
            <div className="p-6">
              <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">ACTIVE_STRATEGIES</h3>
              
              {!activeStrategies || activeStrategies.length === 0 ? (
                <div className="text-center py-12">
                  <Robot size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="data-label">NO_ACTIVE_STRATEGIES</p>
                  <p className="text-sm text-muted-foreground mt-2">Select a strategy to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeStrategies.map((strategy) => (
                    <DraggableWidget key={strategy.id} id={`strategy-${strategy.id}`}>
                      <div className="cyber-card-accent p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-bold uppercase tracking-wide text-primary">
                                {strategy.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                {strategy.status === 'running' && (
                                  <>
                                    <div className="status-indicator" />
                                    <span className="hud-readout text-xs text-primary">RUNNING</span>
                                  </>
                                )}
                                {strategy.status === 'paused' && (
                                  <span className="hud-readout text-xs text-accent">PAUSED</span>
                                )}
                              </div>
                            </div>
                            <div className="data-label">{strategy.symbol}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary neon-glow-primary">
                              ${strategy.pnl.toFixed(2)}
                            </div>
                            <div className="text-sm text-accent">+{strategy.pnlPercent}%</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="data-label">TRADES</div>
                            <div className="text-lg font-bold">{strategy.trades}</div>
                          </div>
                          <div>
                            <div className="data-label">RUNTIME</div>
                            <div className="text-lg font-bold">
                              {Math.floor((Date.now() - strategy.startedAt) / 3600000)}h
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2" role="group" aria-label="Strategy controls">
                          {strategy.status === 'running' && (
                            <>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-accent text-accent hover:bg-accent/10"
                                onClick={() => handleStrategyToggle(strategy.id, 'pause')}
                                aria-label={`Pause ${strategy.name} strategy`}
                              >
                                <Pause size={14} weight="fill" className="mr-2" aria-hidden="true" />
                                PAUSE
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => handleStrategyToggle(strategy.id, 'stop')}
                                aria-label={`Stop ${strategy.name} strategy`}
                              >
                                <Stop size={14} weight="fill" className="mr-2" aria-hidden="true" />
                                STOP
                              </Button>
                            </>
                          )}
                          {strategy.status === 'paused' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary/10"
                              onClick={() => handleStrategyToggle(strategy.id, 'resume')}
                              aria-label={`Resume ${strategy.name} strategy`}
                            >
                              <Play size={14} weight="fill" className="mr-2" aria-hidden="true" />
                              RESUME
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-primary/30 text-primary hover:bg-primary/10"
                            aria-label={`Open settings for ${strategy.name} strategy`}
                          >
                            <Gear size={14} weight="duotone" className="mr-2" aria-hidden="true" />
                            SETTINGS
                          </Button>
                        </div>
                      </div>
                    </DraggableWidget>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <div className="cyber-card">
            <div className="p-6">
              <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">SELECT_STRATEGY</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {builtInStrategies.map((strategy) => (
                  <div key={strategy.id} className="p-4 bg-muted/30 border-l-2 border-primary hover:bg-muted/50 hover:border-accent transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="hud-readout text-sm mb-1">{strategy.name}</h4>
                        <p className="data-label text-xs">{strategy.type}</p>
                      </div>
                      <div className={`px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                        strategy.risk === 'Low' ? 'bg-primary/20 text-primary border border-primary/40' :
                        strategy.risk === 'Medium' ? 'bg-accent/20 text-accent border border-accent/40' :
                        'bg-destructive/20 text-destructive border border-destructive/40'
                      }`}>
                        {strategy.risk}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className="w-full"
                      variant="outline"
                      onClick={() => toast.info('Strategy configuration coming soon')}
                    >
                      <Play size={14} weight="fill" className="mr-2" />
                      ACTIVATE
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dca" className="space-y-6">
          <div className="cyber-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">RECURRING_BUYS</h3>
                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  + CREATE_NEW
                </Button>
              </div>

              <div className="space-y-4">
                {recurringBuys && recurringBuys.map((buy) => (
                  <div key={buy.id} className="cyber-card-accent">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold uppercase tracking-wide">
                              {buy.symbol}
                            </h4>
                            <div className="flex items-center gap-2">
                              {buy.enabled && (
                                <>
                                  <div className="status-indicator" />
                                  <span className="hud-readout text-xs text-primary">ACTIVE</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="data-label">${buy.amount} {buy.interval}</div>
                        </div>
                        <Switch 
                          checked={buy.enabled}
                          onCheckedChange={() => handleToggleRecurring(buy.id)}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="data-label">NEXT_BUY</div>
                          <div className="text-sm font-bold text-primary">
                            {formatNextExecution(buy.nextExecution)}
                          </div>
                        </div>
                        <div>
                          <div className="data-label">EXECUTIONS</div>
                          <div className="text-sm font-bold">{buy.executions}</div>
                        </div>
                        <div>
                          <div className="data-label">TOTAL_SPENT</div>
                          <div className="text-sm font-bold">${buy.totalSpent}</div>
                        </div>
                        <div>
                          <div className="data-label">AVG_PRICE</div>
                          <div className="text-sm font-bold">${(buy.totalSpent / buy.executions).toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Gear size={14} weight="duotone" className="mr-2" />
                          EDIT
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          DELETE
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="cyber-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Brain size={24} weight="duotone" className="text-primary" />
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">AI_TRADING_ASSISTANT</h3>
              </div>

              <div className="bg-background/80 border border-primary/20 h-[400px] overflow-y-auto scrollbar-thin p-4 mb-4">
                <div className="space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 ${
                        msg.role === 'user' 
                          ? 'bg-primary/20 border-l-2 border-primary' 
                          : 'bg-accent/20 border-l-2 border-accent'
                      }`}>
                        <div className="hud-readout text-xs mb-2">
                          {msg.role === 'user' ? 'YOU' : 'AI_ASSISTANT'}
                        </div>
                        <p className="text-sm text-foreground">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me about trading strategies..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="px-6"
                >
                  <ChatCircle size={18} weight="duotone" className="mr-2" />
                  SEND
                </Button>
              </div>

              <div className="mt-4 p-4 bg-accent/10 border border-accent/30">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-accent">AI Assistant Features:</strong> Market analysis, strategy recommendations, risk assessment, educational Q&A, and trade suggestions based on current market conditions.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <DraggableWidget id="news-feed">
            <div className="cyber-card">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Newspaper size={24} weight="duotone" className="text-primary" />
                  <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">REAL-TIME_NEWS_FEED</h3>
                  {isConnected && (
                    <div className="ml-auto flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs uppercase tracking-wider text-primary">LIVE</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {reduxTrades.slice(-5).reverse().map((trade, idx) => (
                    <div key={trade.id} className="p-4 bg-muted/30 border-l-2 border-primary hover:bg-muted/50 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="hud-readout text-sm mb-1">
                            Trade Executed: {trade.symbol || 'BTC/USDT'}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(trade.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {trade.pnl && (
                          <div className={`text-sm font-bold ${trade.pnl > 0 ? 'text-primary' : 'text-destructive'}`}>
                            {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {reduxTrades.length === 0 && (
                    <div className="text-center py-12">
                      <Newspaper size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="data-label">NO_TRADES_YET</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isConnected ? 'Waiting for real-time updates...' : 'Connect to WebSocket to receive live updates'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-primary/10 border border-primary/30">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-primary">Real-Time Features:</strong> Live trade updates via WebSocket, instant notifications, market news integration, and automated trade logging with XP rewards.
                  </p>
                </div>
              </div>
            </div>
          </DraggableWidget>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Main component wrapped with Redux Provider and DnD
export default function TradingStrategies() {
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <TradingStrategiesContent />
      </DndProvider>
    </Provider>
  )
}
