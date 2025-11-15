import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Robot, Brain, Lightning, Target, TrendUp, ArrowsClockwise, 
  Play, Pause, Stop, Gear, ChartLine, Calendar, ChatCircle 
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export default function TradingStrategies() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-[0.25em] uppercase">
          <span className="text-primary neon-glow-primary">TRADING_HUB</span>
        </h2>
        <button className="p-2 bg-card border border-primary/30 hover:bg-primary/10 hover:border-primary transition-all relative group">
          <ArrowsClockwise size={18} weight="duotone" className="text-primary" />
          <div className="hud-corner-tl" />
          <div className="hud-corner-br" />
        </button>
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
          <TabsTrigger value="ai" className="data-label gap-2">
            <Brain size={16} weight="duotone" />
            AI_ASSISTANT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
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
                    <div key={strategy.id} className="cyber-card-accent">
                      <div className="p-6">
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

                        <div className="flex gap-2">
                          {strategy.status === 'running' && (
                            <>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-accent text-accent hover:bg-accent/10"
                                onClick={() => handleStrategyToggle(strategy.id, 'pause')}
                              >
                                <Pause size={14} weight="fill" className="mr-2" />
                                PAUSE
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => handleStrategyToggle(strategy.id, 'stop')}
                              >
                                <Stop size={14} weight="fill" className="mr-2" />
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
                            >
                              <Play size={14} weight="fill" className="mr-2" />
                              RESUME
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <Gear size={14} weight="duotone" className="mr-2" />
                            SETTINGS
                          </Button>
                        </div>
                      </div>
                    </div>
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
      </Tabs>
    </div>
  )
}
