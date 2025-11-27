// ═══════════════════════════════════════════════════════════════
// TRADING CONTROL PANEL — Admin Emergency Controls
// Emergency pause, risk monitoring, and system controls
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldWarning,
  Power,
  Play,
  Stop,
  Warning,
  Lightning,
  Gauge,
  ArrowsClockwise,
  Gear,
  CheckCircle,
  XCircle,
  TrendDown,
  Clock
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  getRiskSystem, 
  RiskState, 
  RiskConfig,
  DEFAULT_RISK_CONFIG 
} from '@/lib/trading/RiskManagementSystem'
import { toast } from 'sonner'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { isGodMode } from '@/lib/godMode'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface AlertLog {
  id: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function TradingControlPanel() {
  const { auth } = usePersistentAuth()
  const isMaster = isGodMode(auth)

  // State
  const [riskState, setRiskState] = useState<RiskState | null>(null)
  const [riskConfig, setRiskConfig] = useState<RiskConfig>(DEFAULT_RISK_CONFIG)
  const [alerts, setAlerts] = useState<AlertLog[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const [tempConfig, setTempConfig] = useState<RiskConfig>(DEFAULT_RISK_CONFIG)

  // Get risk system
  const riskSystem = getRiskSystem()

  // Setup callbacks
  useEffect(() => {
    riskSystem.setCallbacks({
      onStateChange: (state) => setRiskState(state),
      onRiskAlert: (message, severity) => {
        const alert: AlertLog = {
          id: `alert-${Date.now()}`,
          message,
          severity: severity as AlertLog['severity'],
          timestamp: Date.now(),
        }
        setAlerts(prev => [alert, ...prev].slice(0, 50))
      },
      onPause: (reason) => {
        toast.warning('Trading Paused', { description: reason })
      },
      onEmergencyStop: (reason) => {
        toast.error('🚨 EMERGENCY STOP', { description: reason, duration: 30000 })
      },
    })

    // Initial state
    setRiskState(riskSystem.getState())
    setRiskConfig(riskSystem.getConfig())
    setTempConfig(riskSystem.getConfig())
  }, [])

  // Handle emergency stop
  const handleEmergencyStop = () => {
    if (confirm('Are you sure you want to EMERGENCY STOP all trading? This will require manual reset.')) {
      riskSystem.triggerEmergencyStop('Manual emergency stop by admin')
    }
  }

  // Handle pause/resume
  const handleTogglePause = () => {
    if (riskState?.isPaused) {
      if (riskState.isEmergencyStop) {
        toast.error('Cannot resume', { description: 'Emergency stop requires manual reset' })
        return
      }
      riskSystem.resume()
    } else {
      riskSystem.triggerPause('Manual pause by admin')
    }
  }

  // Handle emergency reset
  const handleEmergencyReset = () => {
    if (confirm('This will RESET the emergency stop and allow trading to resume. Are you absolutely sure?')) {
      riskSystem.resetEmergencyStop()
      toast.success('Emergency Stop Reset')
    }
  }

  // Save config
  const handleSaveConfig = () => {
    riskSystem.updateConfig(tempConfig)
    setRiskConfig(tempConfig)
    setShowConfig(false)
    toast.success('Risk settings saved')
  }

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/20 border-red-500/50'
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/50'
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/50'
      default: return 'text-blue-500 bg-blue-500/20 border-blue-500/50'
    }
  }

  // Calculate risk level
  const getRiskLevel = () => {
    if (!riskState) return { level: 0, label: 'Unknown', color: 'text-muted-foreground' }

    const dailyLossPercent = Math.abs(riskState.dailyPnL) / riskConfig.maxDailyLossUSD * 100
    const drawdownPercent = riskState.currentDrawdown / riskConfig.maxDrawdownPercent * 100
    const lossStreak = riskState.consecutiveLosses / riskConfig.maxConsecutiveLosses * 100

    const riskScore = Math.max(dailyLossPercent, drawdownPercent, lossStreak)

    if (riskScore >= 80) return { level: riskScore, label: 'CRITICAL', color: 'text-red-500' }
    if (riskScore >= 60) return { level: riskScore, label: 'HIGH', color: 'text-orange-500' }
    if (riskScore >= 40) return { level: riskScore, label: 'ELEVATED', color: 'text-yellow-500' }
    if (riskScore >= 20) return { level: riskScore, label: 'MODERATE', color: 'text-blue-500' }
    return { level: riskScore, label: 'LOW', color: 'text-green-500' }
  }

  const riskLevel = getRiskLevel()

  if (!isMaster) {
    return (
      <div className="cyber-card p-6 text-center">
        <ShieldWarning size={48} className="mx-auto text-destructive mb-4" />
        <h3 className="font-bold text-lg mb-2">Access Denied</h3>
        <p className="text-sm text-muted-foreground">
          Trading controls require admin access
        </p>
      </div>
    )
  }

  return (
    <div className="cyber-card p-6 border-2 border-primary/50 relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldWarning size={24} weight="fill" className="text-primary" />
          <h2 className="text-xl font-bold uppercase tracking-wider">Trading Controls</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className={cn(
            'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
            riskState?.isEmergencyStop
              ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse'
              : riskState?.isPaused
                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                : 'bg-green-500/20 text-green-500 border border-green-500/50'
          )}>
            {riskState?.isEmergencyStop ? '🚨 STOPPED' : riskState?.isPaused ? '⏸️ PAUSED' : '✅ ACTIVE'}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Gear size={16} />
          </Button>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        {/* Emergency Stop Button */}
        <Button
          onClick={handleEmergencyStop}
          disabled={riskState?.isEmergencyStop}
          className={cn(
            'h-16 text-lg font-black uppercase',
            'bg-red-600 hover:bg-red-700 border-2 border-red-500',
            'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
            'disabled:opacity-50'
          )}
        >
          <Stop size={24} weight="fill" className="mr-2" />
          EMERGENCY STOP
        </Button>

        {/* Pause/Resume Button */}
        <Button
          onClick={handleTogglePause}
          className={cn(
            'h-16 text-lg font-black uppercase',
            riskState?.isPaused
              ? 'bg-green-600 hover:bg-green-700 border-2 border-green-500'
              : 'bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-500'
          )}
        >
          {riskState?.isPaused ? (
            <>
              <Play size={24} weight="fill" className="mr-2" />
              RESUME
            </>
          ) : (
            <>
              <Power size={24} weight="fill" className="mr-2" />
              PAUSE
            </>
          )}
        </Button>

        {/* Reset Button (only shown during emergency) */}
        {riskState?.isEmergencyStop && (
          <Button
            onClick={handleEmergencyReset}
            className={cn(
              'h-16 text-lg font-black uppercase',
              'bg-purple-600 hover:bg-purple-700 border-2 border-purple-500'
            )}
          >
            <ArrowsClockwise size={24} className="mr-2" />
            RESET EMERGENCY
          </Button>
        )}
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
        {/* Risk Level */}
        <div className="p-4 bg-muted/30 border border-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Gauge size={16} className="text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Risk Level</span>
          </div>
          <p className={cn('text-xl font-black', riskLevel.color)}>
            {riskLevel.label}
          </p>
          <Progress value={riskLevel.level} className="mt-2 h-2" />
        </div>

        {/* Daily P&L */}
        <div className={cn(
          'p-4 border rounded-lg',
          (riskState?.dailyPnL || 0) >= 0
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Lightning size={16} className="text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Daily P&L</span>
          </div>
          <p className={cn(
            'text-xl font-black',
            (riskState?.dailyPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            ${(riskState?.dailyPnL || 0).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Limit: ${riskConfig.maxDailyLossUSD}
          </p>
        </div>

        {/* Consecutive Losses */}
        <div className="p-4 bg-muted/30 border border-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendDown size={16} className="text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Loss Streak</span>
          </div>
          <p className={cn(
            'text-xl font-black',
            (riskState?.consecutiveLosses || 0) >= riskConfig.maxConsecutiveLosses - 1
              ? 'text-red-400'
              : 'text-foreground'
          )}>
            {riskState?.consecutiveLosses || 0} / {riskConfig.maxConsecutiveLosses}
          </p>
        </div>

        {/* Daily Trades */}
        <div className="p-4 bg-muted/30 border border-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Daily Trades</span>
          </div>
          <p className="text-xl font-black">
            {riskState?.dailyTrades || 0} / {riskConfig.maxTradesPerDay}
          </p>
        </div>
      </div>

      {/* Config Panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-muted/30 border border-muted rounded-lg relative z-10"
          >
            <h3 className="font-bold mb-4">Risk Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Max Position Size */}
              <div>
                <Label>Max Position Size (USD)</Label>
                <Input
                  type="number"
                  value={tempConfig.maxPositionSizeUSD}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    maxPositionSizeUSD: parseFloat(e.target.value) || 0
                  })}
                  className="mt-1"
                />
              </div>

              {/* Max Daily Loss */}
              <div>
                <Label>Max Daily Loss (USD)</Label>
                <Input
                  type="number"
                  value={tempConfig.maxDailyLossUSD}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    maxDailyLossUSD: parseFloat(e.target.value) || 0
                  })}
                  className="mt-1"
                />
              </div>

              {/* Max Drawdown */}
              <div>
                <Label>Max Drawdown (%): {tempConfig.maxDrawdownPercent}%</Label>
                <Slider
                  value={[tempConfig.maxDrawdownPercent]}
                  onValueChange={([val]) => setTempConfig({
                    ...tempConfig,
                    maxDrawdownPercent: val
                  })}
                  min={5}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Max Consecutive Losses */}
              <div>
                <Label>Max Consecutive Losses: {tempConfig.maxConsecutiveLosses}</Label>
                <Slider
                  value={[tempConfig.maxConsecutiveLosses]}
                  onValueChange={([val]) => setTempConfig({
                    ...tempConfig,
                    maxConsecutiveLosses: val
                  })}
                  min={2}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Max Slippage */}
              <div>
                <Label>Max Slippage (%): {(tempConfig.maxSlippageBps / 100).toFixed(1)}%</Label>
                <Slider
                  value={[tempConfig.maxSlippageBps]}
                  onValueChange={([val]) => setTempConfig({
                    ...tempConfig,
                    maxSlippageBps: val
                  })}
                  min={50}
                  max={500}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Min Time Between Trades */}
              <div>
                <Label>Cooldown (seconds): {tempConfig.minTimeBetweenTrades}s</Label>
                <Slider
                  value={[tempConfig.minTimeBetweenTrades]}
                  onValueChange={([val]) => setTempConfig({
                    ...tempConfig,
                    minTimeBetweenTrades: val
                  })}
                  min={1}
                  max={30}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleSaveConfig}>
                <CheckCircle size={16} className="mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => {
                setTempConfig(riskConfig)
                setShowConfig(false)
              }}>
                <XCircle size={16} className="mr-2" />
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Log */}
      <div className="relative z-10">
        <h3 className="font-bold mb-2">Risk Alerts</h3>
        <ScrollArea className="h-[150px] border border-muted rounded-lg p-2">
          {alerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No alerts</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-2 rounded border text-sm',
                    getSeverityColor(alert.severity)
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <span className="text-xs opacity-70">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

