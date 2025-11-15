import { useKV } from '@github/spark/hooks'
import { useState, useEffect, useRef } from 'react'
import { Terminal, Brain, ChartLine, Lightning, CheckCircle, Warning, Info, ArrowsClockwise } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface LogEntry {
  id: string
  timestamp: number
  type: 'trade' | 'analysis' | 'decision' | 'system'
  severity: 'info' | 'success' | 'warning' | 'error'
  agent: 'Market Analysis' | 'Strategy Execution' | 'RL Optimizer' | 'System'
  message: string
  details: string
}

export default function BotLogs() {
  const [logs, setLogs] = useKV<LogEntry[]>('bot-logs', [])
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const generateLog = () => {
      const logTemplates = [
        {
          type: 'analysis' as const,
          severity: 'info' as const,
          agent: 'Market Analysis' as const,
          message: 'Analyzing SOL/USDT market conditions',
          details: 'RSI: 58.3 | MACD: Bullish crossover detected | Volume: Above average +45% | Trend: Upward momentum confirmed'
        },
        {
          type: 'decision' as const,
          severity: 'success' as const,
          agent: 'RL Optimizer' as const,
          message: 'Position sizing optimized based on volatility',
          details: 'Reduced position size from $500 to $350 due to elevated volatility (σ = 4.2%). Risk-adjusted Kelly Criterion applied.'
        },
        {
          type: 'trade' as const,
          severity: 'success' as const,
          agent: 'Strategy Execution' as const,
          message: 'BUY order executed: 2.5 SOL @ $142.34',
          details: 'Entry triggered by RSI oversold + MACD bullish signal. Stop-loss: $138.50 | Take-profit: $148.00 | Risk/Reward: 1:1.5'
        },
        {
          type: 'analysis' as const,
          severity: 'warning' as const,
          agent: 'Market Analysis' as const,
          message: 'High volatility detected in ETH market',
          details: 'Volatility increased 280% in last hour. Large whale movements observed. Tightening stop-losses and reducing exposure by 20%.'
        },
        {
          type: 'trade' as const,
          severity: 'success' as const,
          agent: 'Strategy Execution' as const,
          message: 'SELL order executed: 2.5 SOL @ $147.80 | Profit: +$13.65',
          details: 'Exit triggered by take-profit target. Hold duration: 2h 34m. ROI: 3.84%. Capital recycled into next opportunity.'
        },
        {
          type: 'decision' as const,
          severity: 'info' as const,
          agent: 'RL Optimizer' as const,
          message: 'Strategy rebalance: Switching from Momentum to Mean Reversion',
          details: 'Market regime change detected. Momentum indicators weakening. Mean reversion historically performs better in current conditions (backtest: +12.3% edge).'
        },
        {
          type: 'system' as const,
          severity: 'info' as const,
          agent: 'System' as const,
          message: 'DCA schedule executed: Purchased 1.2 SOL',
          details: 'Dollar-cost averaging order filled successfully. Total DCA cost basis: $139.45. Next scheduled purchase in 4 hours.'
        },
        {
          type: 'analysis' as const,
          severity: 'success' as const,
          agent: 'Market Analysis' as const,
          message: 'Bullish pattern detected: Golden cross forming on BTC 4h chart',
          details: '50 EMA crossing above 200 EMA. Historical win rate: 72% with avg gain of +18% over next 30 days. Increasing BTC allocation by 15%.'
        },
        {
          type: 'decision' as const,
          severity: 'warning' as const,
          agent: 'RL Optimizer' as const,
          message: 'Risk threshold exceeded - reducing exposure',
          details: 'Portfolio heat at 8.2/10. Closing lowest-conviction positions. Raising cash allocation to 25% until volatility subsides.'
        },
        {
          type: 'trade' as const,
          severity: 'warning' as const,
          agent: 'Strategy Execution' as const,
          message: 'Stop-loss triggered: 1.8 ETH @ $2,315 | Loss: -$28.50',
          details: 'Position stopped out due to sudden price drop. Loss contained at -1.2% of portfolio. Market continues downtrend - staying sidelined.'
        }
      ]

      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)]
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: Date.now(),
        ...template
      }

      setLogs(current => {
        const updated = [newLog, ...(current ?? [])].slice(0, 100)
        return updated
      })
    }

    const interval = setInterval(generateLog, Math.random() * 15000 + 10000)
    if (!logs || logs.length === 0) {
      for (let i = 0; i < 5; i++) {
        setTimeout(generateLog, i * 2000)
      }
    }

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [logs, autoScroll])

  const getLogIcon = (type: LogEntry['type'], severity: LogEntry['severity']) => {
    if (severity === 'error' || severity === 'warning') {
      return <Warning size={14} weight="fill" className={severity === 'error' ? 'text-destructive' : 'text-secondary'} />
    }
    if (severity === 'success') {
      return <CheckCircle size={14} weight="fill" className="text-primary" />
    }

    switch (type) {
      case 'trade':
        return <Lightning size={14} weight="duotone" className="text-accent" />
      case 'analysis':
        return <ChartLine size={14} weight="duotone" className="text-primary" />
      case 'decision':
        return <Brain size={14} weight="duotone" className="text-secondary" />
      case 'system':
        return <Info size={14} weight="duotone" className="text-muted-foreground" />
    }
  }

  const getSeverityColor = (severity: LogEntry['severity']) => {
    switch (severity) {
      case 'error':
        return 'oklch(0.65 0.25 25)'
      case 'warning':
        return 'oklch(0.68 0.18 330)'
      case 'success':
        return 'oklch(0.72 0.20 195)'
      case 'info':
        return 'oklch(0.50 0.10 195)'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="cyber-card p-4 relative overflow-hidden h-[400px] flex flex-col">
      <div className="absolute inset-0 technical-grid opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 jagged-corner-small bg-primary/20 border border-primary/50">
            <Terminal size={18} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] hud-text text-primary">
              Bot Logic Stream
            </h3>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
              Real-time decision log
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`h-7 px-2 border jagged-corner-small text-[10px] uppercase tracking-wider font-bold ${
              autoScroll 
                ? 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30' 
                : 'border-border/50 text-muted-foreground hover:bg-muted/20'
            }`}
          >
            <ArrowsClockwise size={12} weight={autoScroll ? 'fill' : 'regular'} className="mr-1" />
            Auto
          </Button>
          <div className="px-2 py-1 jagged-corner-small bg-primary/10 border border-primary/30">
            <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
              {logs?.length ?? 0} Logs
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 relative z-10" ref={scrollRef}>
        <div className="space-y-1.5 pr-3">
          <AnimatePresence initial={false}>
            {(logs ?? []).map((log, index) => {
              const severityColor = getSeverityColor(log.severity)
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="group"
                >
                  <div
                    className="p-2 jagged-corner-small bg-muted/10 hover:bg-muted/20 border-l-2 transition-all relative overflow-hidden"
                    style={{ borderLeftColor: severityColor }}
                  >
                    <div 
                      className="absolute inset-0 opacity-5"
                      style={{ backgroundColor: severityColor }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-start gap-2 mb-1">
                        <div className="mt-0.5">
                          {getLogIcon(log.type, log.severity)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {formatTimestamp(log.timestamp)}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-accent/10 border border-accent/30 text-accent uppercase tracking-wider font-bold rounded-sm">
                              {log.agent}
                            </span>
                            <div 
                              className="w-1 h-1 rounded-full animate-pulse"
                              style={{ backgroundColor: severityColor }}
                            />
                          </div>
                          
                          <p className="text-[11px] text-foreground font-semibold leading-tight mb-1">
                            {log.message}
                          </p>
                          
                          <p className="text-[10px] text-muted-foreground leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            {log.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  )
}
