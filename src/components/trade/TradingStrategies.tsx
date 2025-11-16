import { useKV } from '@github/spark/hooks'
import { useState, useEffect, useRef, useCallback } from 'react'
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
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { motion, AnimatePresence } from 'framer-motion'
import io, { Socket } from 'socket.io-client'
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

interface NewsItem {
  id: string
  title: string
  source: string
  timestamp: number
  sentiment: 'positive' | 'negative' | 'neutral'
}

interface TradeData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface TradingStrategiesProps {
  apiUrl?: string
  wsUrl?: string
}

// Custom hook for WebSocket connection with JWT auth
function useSocket(url: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('jwt') || 'demo-token'
    const socketInstance = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.warn('WebSocket connection error:', error.message)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [url])

  return { socket, isConnected }
}

// Draggable Widget Component
interface DraggableWidgetProps {
  id: string
  children: React.ReactNode
  className?: string
}

function DraggableWidget({ id, children, className = '' }: DraggableWidgetProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'widget',
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <motion.div
      ref={drag}
      className={className}
      whileHover={{ scale: 1.02 }}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      role="button"
      aria-label={`Draggable widget ${id}`}
      tabIndex={0}
    >
      {children}
    </motion.div>
  )
}

// Particle effect component for trade celebrations
function TradeParticles({ show }: { show: boolean }) {
  if (!show) return null
  
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary rounded-full"
          initial={{
            x: '50vw',
            y: '50vh',
            scale: 0,
          }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            ease: 'easeOut',
            delay: i * 0.05,
          }}
        />
      ))}
    </motion.div>
  )
}

export default function TradingStrategies({ 
  apiUrl = '/api', 
  wsUrl = 'ws://localhost:3001' 
}: TradingStrategiesProps = {}) {
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
  
  // WebSocket connection
  const { socket, isConnected } = useSocket(wsUrl)
  
  // Particle explosion state
  const [showParticles, setShowParticles] = useState(false)
  
  // News feed state
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'Bitcoin surges past $50,000 as institutional adoption grows',
      source: 'CryptoNews',
      timestamp: Date.now() - 3600000,
      sentiment: 'positive'
    },
    {
      id: '2',
      title: 'Ethereum upgrade shows promising scalability improvements',
      source: 'BlockchainDaily',
      timestamp: Date.now() - 7200000,
      sentiment: 'positive'
    }
  ])
  
  // Chart data state
  const [chartData, setChartData] = useState<TradeData[]>([])
  const chartContainerRef = useRef<HTMLDivElement>(null)
  
  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return

    socket.on('strategyUpdate', (data: ActiveStrategy[]) => {
      setActiveStrategies(data)
    })

    socket.on('newTrade', (trade: { id: string; pnl: number; strategy: string }) => {
      // Trigger particle effect
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 2000)
      
      // Update strategies
      setActiveStrategies((current) => {
        if (!current) return []
        return current.map((s) => {
          if (s.name === trade.strategy) {
            return { 
              ...s, 
              trades: s.trades + 1, 
              pnl: s.pnl + trade.pnl 
            }
          }
          return s
        })
      })
      
      // Show toast notification
      toast.success(`Trade completed: ${trade.pnl > 0 ? '+' : ''}$${trade.pnl.toFixed(2)}`, {
        description: `Strategy: ${trade.strategy}`
      })
      
      // Dispatch custom event for XP system
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeCompleted', { 
          detail: { pnl: trade.pnl } 
        }))
      }
    })

    socket.on('newsUpdate', (news: NewsItem) => {
      setNewsItems((prev) => [news, ...prev].slice(0, 20))
    })

    socket.on('chartData', (data: TradeData[]) => {
      setChartData(data)
    })

    return () => {
      socket.off('strategyUpdate')
      socket.off('newTrade')
      socket.off('newsUpdate')
      socket.off('chartData')
    }
  }, [socket, setActiveStrategies])

  // SciChart initialization effect
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return

    // SciChart initialization would go here
    // Note: This requires SciChart license and proper setup
    // For now, we'll just log that the chart is ready
    console.log('SciChart container ready with', chartData.length, 'data points')
    
    // Example SciChart initialization (commented out - requires license):
    /*
    const initChart = async () => {
      const { sciChartSurface, wasmContext } = await SciChartSurface.create(chartContainerRef.current)
      const xAxis = new NumericAxis(wasmContext)
      const yAxis = new NumericAxis(wasmContext)
      sciChartSurface.xAxes.add(xAxis)
      sciChartSurface.yAxes.add(yAxis)
      
      const candlestickSeries = new FastCandlestickRenderableSeries(wasmContext, {
        dataSeries: new OhlcDataSeries(wasmContext, {
          xValues: chartData.map(d => d.timestamp),
          openValues: chartData.map(d => d.open),
          highValues: chartData.map(d => d.high),
          lowValues: chartData.map(d => d.low),
          closeValues: chartData.map(d => d.close),
        })
      })
      sciChartSurface.renderableSeries.add(candlestickSeries)
    }
    initChart()
    */
  }, [chartData])

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
    <DndProvider backend={HTML5Backend}>
      <AnimatePresence>
        {showParticles && <TradeParticles show={showParticles} />}
      </AnimatePresence>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold tracking-[0.25em] uppercase">
            <span className="text-primary neon-glow-primary">TRADING_HUB</span>
          </h2>
          <div className="flex items-center gap-3">
            {isConnected && (
              <div className="flex items-center gap-2" role="status" aria-live="polite">
                <div className="status-indicator" />
                <span className="hud-readout text-xs text-primary">WS_CONNECTED</span>
              </div>
            )}
            <button 
              className="p-2 bg-card border border-primary/30 hover:bg-primary/10 hover:border-primary transition-all relative group"
              aria-label="Refresh data"
            >
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
              NEWS
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-label gap-2">
              <Brain size={16} weight="duotone" />
              AI_ASSISTANT
            </TabsTrigger>
          </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Advanced Chart Section */}
          <div className="cyber-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <ChartLine size={24} weight="duotone" className="text-primary" />
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">PERFORMANCE_CHART</h3>
              </div>
              
              <div 
                ref={chartContainerRef} 
                className="w-full h-96 bg-background/80 border border-primary/20 rounded relative"
                role="img"
                aria-label="Trading performance chart"
              >
                {chartData.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <ChartLine size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="data-label">NO_CHART_DATA</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isConnected ? 'Waiting for real-time data...' : 'Connect WebSocket to view live charts'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="data-label text-xs mb-2">
                      SciChart Ready - {chartData.length} data points loaded
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-4 bg-accent/10 border border-accent/30">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-accent">Advanced Charting:</strong> Powered by SciChart.js for high-performance visualization. Supports millions of data points with 60FPS rendering.
                </p>
              </div>
            </div>
          </div>
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
                    <DraggableWidget 
                      key={strategy.id} 
                      id={`strategy-${strategy.id}`}
                      className="cyber-card-accent cursor-move"
                    >
                      <div className="p-6">
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

        <TabsContent value="news" className="space-y-6">
          <div className="cyber-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Newspaper size={24} weight="duotone" className="text-primary" />
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">REAL-TIME_NEWS</h3>
              </div>

              <div className="space-y-3">
                {newsItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-muted/30 border-l-2 hover:bg-muted/50 transition-all"
                    style={{
                      borderLeftColor: 
                        item.sentiment === 'positive' ? 'var(--primary)' :
                        item.sentiment === 'negative' ? 'var(--destructive)' :
                        'var(--muted-foreground)'
                    }}
                    role="article"
                    aria-label={item.title}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="data-label">{item.source}</span>
                          <span className="text-muted-foreground">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            item.sentiment === 'positive' ? 'bg-primary/20 text-primary' :
                            item.sentiment === 'negative' ? 'bg-destructive/20 text-destructive' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {item.sentiment.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {newsItems.length === 0 && (
                <div className="text-center py-12">
                  <Newspaper size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="data-label">NO_NEWS_AVAILABLE</p>
                  <p className="text-sm text-muted-foreground mt-2">Waiting for real-time updates...</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-accent/10 border border-accent/30">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-accent">Real-Time News:</strong> Powered by WebSocket connection. News updates appear automatically with sentiment analysis.
                </p>
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
    </DndProvider>
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
