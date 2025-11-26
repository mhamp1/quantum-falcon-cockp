// ENHANCED: Bot Logic Stream — professional terminal with moving grid lines and clean visuals
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { useState, useEffect, useRef } from 'react'
import { Terminal, Brain, ChartLine, Lightning, CheckCircle, Warning, Info, ArrowsClockwise, MagnifyingGlass, Pause, Play, Download, Funnel } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface LogEntry {
  id: string
  timestamp: number
  type: 'trade' | 'analysis' | 'decision' | 'system'
  severity: 'info' | 'success' | 'warning' | 'error'
  agent: 'Market Analysis' | 'Strategy Execution' | 'RL Optimizer' | 'System'
  message: string
  details: string
}

export function LogicStream() {
  const [logs, setLogs] = useKV<LogEntry[]>('bot-logs', [])
  const [autoScroll, setAutoScroll] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [queuedLogs, setQueuedLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    trade: true,
    analysis: true,
    decision: true,
    system: true,
    info: true,
    success: true,
    warning: true,
    error: true
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const generateLog = () => {
      const logTemplates = [
        {
          type: 'analysis' as const,
          severity: 'info' as const,
          agent: 'Market Analysis' as const,
          message: 'Analyzing SOL/USDT market conditions',
          details: 'RSI: 58.3 | MACD: Bullish crossover detected | Volume: Above average +45%'
        },
        {
          type: 'decision' as const,
          severity: 'success' as const,
          agent: 'RL Optimizer' as const,
          message: 'Position sizing optimized based on volatility',
          details: 'Reduced position size from $500 to $350 due to elevated volatility'
        },
        {
          type: 'trade' as const,
          severity: 'success' as const,
          agent: 'Strategy Execution' as const,
          message: 'BUY order executed: 2.5 SOL @ $142.34',
          details: 'Entry triggered by RSI oversold + MACD bullish signal'
        },
        {
          type: 'analysis' as const,
          severity: 'warning' as const,
          agent: 'Market Analysis' as const,
          message: 'High volatility detected in ETH market',
          details: 'Volatility increased 280% in last hour. Tightening stop-losses'
        }
      ]

      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)]
      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...template
      }

      if (isPaused) {
        setQueuedLogs(current => [...current, newLog])
      } else {
        setLogs(current => {
          const updated = [newLog, ...(current ?? [])].slice(0, 500)
          return updated
        })
      }
    }

    const interval = setInterval(generateLog, Math.random() * 15000 + 10000)
    if (!logs || logs.length === 0) {
      for (let i = 0; i < 5; i++) {
        setTimeout(generateLog, i * 2000)
      }
    }

    return () => clearInterval(interval)
  }, [isPaused])

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [logs, autoScroll])

  const handlePlayPause = () => {
    if (isPaused) {
      if (queuedLogs.length > 0) {
        setLogs(current => {
          const updated = [...queuedLogs, ...(current ?? [])].slice(0, 500)
          return updated
        })
        setQueuedLogs([])
        toast.info(`Resumed - ${queuedLogs.length} queued logs added`)
      }
    } else {
      toast.info('Log stream paused')
    }
    setIsPaused(!isPaused)
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bot-logs-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filteredLogs.length} logs`)
  }

  const getLogIcon = (type: LogEntry['type'], severity: LogEntry['severity']) => {
    if (severity === 'error' || severity === 'warning') {
      return <Warning size={16} weight="fill" className="text-yellow-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.4))' }} />
    }
    if (severity === 'success') {
      return <CheckCircle size={16} weight="fill" className="text-cyan-400 flex-shrink-0" />
    }

    switch (type) {
      case 'trade':
        return <Lightning size={16} weight="duotone" className="text-cyan-400 flex-shrink-0" />
      case 'analysis':
        return <ChartLine size={16} weight="duotone" className="text-cyan-400 flex-shrink-0" />
      case 'decision':
        return <Brain size={16} weight="duotone" className="text-purple-400 flex-shrink-0" />
      case 'system':
        return <Info size={16} weight="duotone" className="text-muted-foreground flex-shrink-0" />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  }

  const filteredLogs = (logs ?? []).filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.agent.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTypeFilter = filters[log.type]
    const matchesSeverityFilter = filters[log.severity]
    
    return matchesSearch && matchesTypeFilter && matchesSeverityFilter
  })

  const highlightKeywords = (text: string) => {
    const keywords = ['RSI', 'MACD', 'BUY', 'SELL', 'SOL', 'ETH', 'BTC', 'USDT', 'volume', 'volatility', 'bullish', 'bearish']
    let result = text
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      result = result.replace(regex, `<span class="text-cyan-400 font-semibold">${keyword}</span>`)
    })
    return result
  }

  return (
    <motion.div 
      className="cyber-card p-4 relative overflow-hidden flex flex-col backdrop-blur-xl"
      style={{
        background: 'linear-gradient(to bottom, rgba(var(--card) / 0.95), rgba(var(--card) / 0.8))',
        borderLeft: '4px solid rgba(0, 255, 255, 0.6)',
        border: '1px solid rgba(0, 255, 255, 0.2)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Moving grid lines background (like a terminal) */}
      <motion.div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
        animate={{
          backgroundPosition: ['0px 0px', '20px 20px']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Data flow line connector from top (Activity Feed) */}
      <motion.div
        className="absolute top-px left-1/2 -translate-x-1/2 w-px h-8"
        style={{
          background: 'linear-gradient(0deg, rgba(0, 255, 255, 0.4), transparent)',
          borderLeft: '1px dashed rgba(0, 255, 255, 0.3)'
        }}
        initial={{ scaleY: 0, originY: 1 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
      />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 jagged-corner-small bg-cyan-500/20 border border-cyan-500/50">
            <Terminal size={18} weight="duotone" className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-cyan-400" style={{ textShadow: '0 0 6px rgba(0, 255, 255, 0.3)' }}>
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
            onClick={handlePlayPause}
            className={`h-7 px-3 border rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
              isPaused 
                ? 'bg-destructive/10 border-red-400/50 text-red-400 hover:bg-destructive/20 hover:shadow-[0_0_12px_rgba(248,113,113,0.3)]' 
                : 'bg-cyan-500/10 border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_12px_rgba(0,255,255,0.3)]'
            }`}
            title={isPaused ? 'Resume log stream' : 'Pause log stream'}
          >
            {isPaused ? <Play size={12} weight="fill" className="mr-1" /> : <Pause size={12} weight="fill" className="mr-1" />}
            {isPaused ? 'Resume' : 'Pause'}
            {isPaused && queuedLogs.length > 0 && (
              <span className="ml-1">({queuedLogs.length})</span>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`h-7 px-3 border rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
              autoScroll 
                ? 'bg-cyan-500/10 border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_12px_rgba(0,255,255,0.3)]' 
                : 'border-muted/50 text-muted-foreground hover:bg-muted/10'
            }`}
            title="Toggle auto-scroll"
          >
            <ArrowsClockwise size={12} weight={autoScroll ? 'fill' : 'regular'} className="mr-1" />
            Auto
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-7 px-3 border rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
              showFilters 
                ? 'bg-purple-500/10 border-purple-400/50 text-purple-400 hover:bg-purple-500/20 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]' 
                : 'border-muted/50 text-muted-foreground hover:bg-muted/10'
            }`}
            title="Toggle filters"
          >
            <Funnel size={12} weight={showFilters ? 'fill' : 'regular'} className="mr-1" />
            Filter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="h-7 px-3 border rounded-lg text-[10px] uppercase tracking-wider font-bold border-muted/50 text-muted-foreground hover:bg-muted/10 transition-all"
            title="Export logs as JSON"
          >
            <Download size={12} weight="regular" className="mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Search bar with glowing cyan underline on focus */}
      <div className="flex gap-2 mb-3 relative z-10">
        <div className="relative flex-1 group">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-cyan-400 transition-colors z-10" size={14} />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-9 pr-8 text-xs border-muted/50 bg-background/50 focus:border-cyan-400/50 focus:shadow-[0_1px_0_0_rgba(0,255,255,0.5)] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs z-10"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 p-3 bg-background/40 border border-cyan-400/20 jagged-corner-small relative z-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Type</p>
              {(['trade', 'analysis', 'decision', 'system'] as const).map(type => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`filter-${type}`}
                    checked={filters[type]}
                    onCheckedChange={(checked) => setFilters(f => ({ ...f, [type]: checked === true }))}
                  />
                  <Label htmlFor={`filter-${type}`} className="text-xs cursor-pointer capitalize text-foreground">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Severity</p>
              {(['info', 'success', 'warning', 'error'] as const).map(severity => (
                <div key={severity} className="flex items-center gap-2">
                  <Checkbox
                    id={`filter-${severity}`}
                    checked={filters[severity]}
                    onCheckedChange={(checked) => setFilters(f => ({ ...f, [severity]: checked === true }))}
                  />
                  <Label htmlFor={`filter-${severity}`} className="text-xs cursor-pointer capitalize text-foreground">
                    {severity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <ScrollArea className="flex-1 relative z-10 h-[400px]" ref={scrollRef}>
        <div className="space-y-2 pr-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <Info size={32} weight="duotone" className="mx-auto mb-2 opacity-50" />
              <p>No logs match your filters</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <div className="p-3 bg-background/40 hover:bg-background/60 border-l-2 border-cyan-400/60 transition-all relative overflow-hidden cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getLogIcon(log.type, log.severity)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs text-cyan-400/60 font-mono">
                            {formatTimestamp(log.timestamp)}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/10 border border-purple-400/30 text-purple-400 uppercase tracking-wider font-bold rounded-sm">
                            {log.agent}
                          </span>
                        </div>
                        
                        <p className="text-sm text-white font-semibold leading-tight mb-1">
                          {log.message}
                        </p>
                        
                        <p 
                          className="text-xs text-white/70 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: highlightKeywords(log.details) }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  )
}
