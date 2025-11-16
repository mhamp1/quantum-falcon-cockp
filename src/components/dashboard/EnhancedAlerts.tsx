import { useKV } from '@/hooks/useKVFallback'
import { useState, useEffect } from 'react'
import { Warning, TrendUp, TrendDown, Lightning, Brain, Info } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Alert {
  id: string
  type: 'anomaly' | 'sentiment' | 'strategy' | 'system'
  severity: 'high' | 'medium' | 'low'
  title: string
  summary: string
  reason: string
  timestamp: number
  data?: {
    symbol?: string
    change?: number
    value?: string
  }
}

export default function EnhancedAlerts() {
  const [alerts, setAlerts] = useKV<Alert[]>('live-alerts', [])
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  useEffect(() => {
    const generateAlert = () => {
      const alertTypes: Array<{
        type: Alert['type']
        title: string
        summary: string
        reason: string
        severity: Alert['severity']
        data?: Alert['data']
      }> = [
        {
          type: 'anomaly',
          title: 'Price Spike Detected',
          summary: 'SOL surged +12.4% in 5 minutes',
          reason: 'Large institutional buy detected. Volume increased 340% above 24h average. Bot adjusted position sizing automatically.',
          severity: 'high',
          data: { symbol: 'SOL/USDT', change: 12.4, value: '$142.50' }
        },
        {
          type: 'sentiment',
          title: 'Bullish Sentiment Surge',
          summary: 'BTC sentiment shifted to extremely bullish',
          reason: 'Social media mentions increased 280%. Positive sentiment ratio jumped from 52% to 87%. News articles about institutional adoption trending.',
          severity: 'medium',
          data: { symbol: 'BTC', change: 35, value: '87% positive' }
        },
        {
          type: 'strategy',
          title: 'Strategy Switch Triggered',
          summary: 'Bot switched from Momentum to Mean Reversion',
          reason: 'Market volatility decreased below threshold. RSI indicating overbought conditions. Historical data suggests mean reversion performs better in current regime.',
          severity: 'medium'
        },
        {
          type: 'anomaly',
          title: 'Volume Anomaly',
          summary: 'ETH trading volume 450% above average',
          reason: 'Unusual trading activity detected. Whale wallets moving significant amounts. Bot increased monitoring frequency and tightened stop-losses.',
          severity: 'high',
          data: { symbol: 'ETH/USDT', change: 450, value: '$2.3B volume' }
        },
        {
          type: 'system',
          title: 'Risk Threshold Adjusted',
          summary: 'Bot reduced position sizes due to volatility',
          reason: 'Market volatility index exceeded safe threshold. Bot automatically reduced exposure by 30% across all positions to protect capital.',
          severity: 'medium'
        }
      ]

      const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)]
      const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        ...randomAlert,
        timestamp: Date.now()
      }

      setAlerts(current => {
        const updated = [newAlert, ...(current ?? [])].slice(0, 20)
        return updated
      })
    }

    const interval = setInterval(generateAlert, 45000)
    if (!alerts || alerts.length === 0) {
      generateAlert()
    }

    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'anomaly':
        return <Warning size={20} weight="duotone" className="text-destructive" />
      case 'sentiment':
        return <TrendUp size={20} weight="duotone" className="text-primary" />
      case 'strategy':
        return <Brain size={20} weight="duotone" className="text-secondary" />
      case 'system':
        return <Info size={20} weight="duotone" className="text-accent" />
    }
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'oklch(0.65 0.25 25)'
      case 'medium':
        return 'oklch(0.68 0.18 330)'
      case 'low':
        return 'oklch(0.72 0.20 195)'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="cyber-card p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 technical-grid pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 jagged-corner-small bg-destructive/20 border-2 border-destructive/50">
            <Lightning size={24} weight="duotone" className="text-destructive animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-primary neon-glow-primary">
              Live Activity
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Real-time market alerts
            </p>
          </div>
        </div>
        
        <div className="px-3 py-1 jagged-corner-small bg-destructive/10 border border-destructive/50">
          <span className="text-xs font-bold text-destructive uppercase tracking-wider">
            {alerts?.length ?? 0} Alerts
          </span>
        </div>
      </div>

      <ScrollArea className="h-[400px] relative z-10">
        <div className="space-y-3 pr-4">
          <AnimatePresence initial={false}>
            {(alerts ?? []).map((alert, index) => {
              const isExpanded = expandedAlert === alert.id
              const severityColor = getSeverityColor(alert.severity)
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                    className="w-full text-left p-4 jagged-corner-small bg-muted/20 hover:bg-muted/30 border-l-3 transition-all group relative overflow-hidden"
                    style={{ borderLeftColor: severityColor }}
                  >
                    <div 
                      className="absolute inset-0 opacity-5"
                      style={{ backgroundColor: severityColor }}
                    />
                    
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold text-foreground uppercase tracking-wide truncate">
                            {alert.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                            {formatTimestamp(alert.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {alert.summary}
                        </p>
                        
                        {alert.data && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {alert.data.symbol && (
                              <span className="px-2 py-0.5 bg-primary/10 border border-primary/30 text-[10px] font-bold text-primary uppercase tracking-wide jagged-corner-small">
                                {alert.data.symbol}
                              </span>
                            )}
                            {alert.data.change !== undefined && (
                              <span 
                                className="px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wide jagged-corner-small"
                                style={{
                                  backgroundColor: `${severityColor}20`,
                                  borderColor: `${severityColor}50`,
                                  color: severityColor
                                }}
                              >
                                {alert.data.change > 0 ? '+' : ''}{alert.data.change}%
                              </span>
                            )}
                            {alert.data.value && (
                              <span className="px-2 py-0.5 bg-accent/10 border border-accent/30 text-[10px] font-bold text-accent uppercase tracking-wide jagged-corner-small">
                                {alert.data.value}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                                  Why this alert:
                                </p>
                                <p className="text-xs text-foreground leading-relaxed">
                                  {alert.reason}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div 
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: severityColor }}
                          />
                          <span 
                            className="text-[9px] font-bold uppercase tracking-wider"
                            style={{ color: severityColor }}
                          >
                            {alert.severity} priority
                          </span>
                          <span className="text-[9px] text-muted-foreground">•</span>
                          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
                            {isExpanded ? 'Click to collapse' : 'Click for details'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}
