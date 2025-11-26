// Profit Converter — ULTIMATE v2025.1.0
// November 26, 2025 — Quantum Falcon Cockpit
// God Mode support, better stats, addictive UI

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowsLeftRight, TrendUp, Coins, Crown, Shield, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import ProfitParticles from './ProfitParticles'
import ConversionBeam from './ConversionBeam'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { isGodMode } from '@/lib/godMode'
import { UserAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface ConversionStats {
  totalConverted: number
  lastConversion: number
  conversionCount: number
  biggestConversion: number
}

const PROFIT_THRESHOLD = 20 // % profit needed to convert

export default function ProfitConverter() {
  const [auth] = useKV<UserAuth>('user-auth', null)
  const isGodModeActive = isGodMode(auth)
  
  const [isConverting, setIsConverting] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [showBeam, setShowBeam] = useState(false)
  const [convertedAmount, setConvertedAmount] = useState(0)
  const [stats, setStats] = useKV<ConversionStats>('conversion-stats-v2', {
    totalConverted: 0,
    lastConversion: 0,
    conversionCount: 0,
    biggestConversion: 0
  })

  // Simulated current profit (in production, this comes from the trading bot)
  const [currentProfit, setCurrentProfit] = useState(24.5 + Math.random() * 15)
  
  // Update profit periodically to simulate live trading
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProfit(prev => {
        const change = (Math.random() - 0.4) * 3 // Slight upward bias
        return Math.max(0, Math.min(100, prev + change))
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // God Mode can always convert
  const canConvert = isGodModeActive || currentProfit >= PROFIT_THRESHOLD

  const handleConvert = async () => {
    if (!canConvert && !isGodModeActive) {
      toast.error('Insufficient Profit', {
        description: `Need ${PROFIT_THRESHOLD}% profit to convert. Current: ${currentProfit.toFixed(1)}%`
      })
      return
    }

    setIsConverting(true)
    setShowBeam(true)

    await new Promise(resolve => setTimeout(resolve, 1200))

    setShowBeam(false)

    await new Promise(resolve => setTimeout(resolve, 200))

    // God Mode gets bigger conversions
    const btcAmount = isGodModeActive 
      ? 0.0420 + Math.random() * 0.0690 // God gets more
      : 0.00125 + Math.random() * 0.00175
    
    setConvertedAmount(btcAmount)
    setShowParticles(true)

    setStats((current) => {
      const newStats = {
        totalConverted: (current?.totalConverted || 0) + btcAmount,
        lastConversion: btcAmount,
        conversionCount: (current?.conversionCount || 0) + 1,
        biggestConversion: Math.max(current?.biggestConversion || 0, btcAmount)
      }
      return newStats
    })

    toast.success('⚡ PROFIT CONVERTED TO BTC!', {
      description: `+${btcAmount.toFixed(8)} BTC secured in vault${isGodModeActive ? ' (GOD MODE)' : ''}`,
      duration: 6000,
    })
  }

  const handleParticlesComplete = () => {
    setShowParticles(false)
    setIsConverting(false)
  }

  return (
    <motion.div 
      className={cn(
        "relative overflow-hidden rounded-2xl border-2",
        isGodModeActive 
          ? "border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-black to-amber-500/10"
          : "border-primary/30 bg-gradient-to-br from-primary/5 via-black to-secondary/5"
      )}
      style={{
        boxShadow: isGodModeActive 
          ? '0 0 40px rgba(251, 191, 36, 0.2)'
          : '0 0 30px rgba(0, 255, 255, 0.1)'
      }}
      whileHover={{ scale: 1.01 }}
    >
      <AnimatePresence>
        {showBeam && (
          <ConversionBeam isActive={showBeam} />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showParticles && (
          <ProfitParticles
            isActive={showParticles}
            onComplete={handleParticlesComplete}
            amount={convertedAmount}
            type="btc"
          />
        )}
      </AnimatePresence>

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl",
              isGodModeActive 
                ? "bg-yellow-500/20 border border-yellow-500/50"
                : "bg-secondary/20 border border-secondary/50"
            )}>
              <Coins size={28} weight="duotone" className={isGodModeActive ? "text-yellow-400" : "text-secondary"} />
            </div>
            <div>
              <h3 className={cn(
                "text-xl font-black uppercase tracking-wider",
                isGodModeActive ? "text-yellow-400" : "text-secondary"
              )}>
                PROFIT CONVERTER
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Auto-convert SOL profits → BTC vault
              </p>
            </div>
          </div>
          
          {isGodModeActive && (
            <Badge className="bg-yellow-500/20 border-yellow-500/50 text-yellow-400 animate-pulse">
              <Crown size={14} weight="fill" className="mr-1" />
              GOD MODE
            </Badge>
          )}
        </div>
        
        <div className="space-y-5">
          {/* Profit Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Current Profit</span>
              <span className={cn(
                "text-3xl font-black",
                currentProfit >= PROFIT_THRESHOLD || isGodModeActive
                  ? isGodModeActive ? "text-yellow-400" : "text-secondary"
                  : "text-muted-foreground"
              )}>
                {currentProfit.toFixed(1)}%
              </span>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={Math.min((currentProfit / PROFIT_THRESHOLD) * 100, 100)} 
                className="h-4"
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Threshold: {PROFIT_THRESHOLD}%</span>
                <span className={cn(
                  "font-bold uppercase",
                  canConvert ? (isGodModeActive ? "text-yellow-400" : "text-green-400") : "text-muted-foreground"
                )}>
                  {canConvert ? '✓ READY TO CONVERT' : `${(PROFIT_THRESHOLD - currentProfit).toFixed(1)}% remaining`}
                </span>
              </div>
            </div>
          </div>

          {/* Convert Button */}
          <motion.div
            animate={canConvert ? {
              boxShadow: isGodModeActive 
                ? [
                    '0 0 0px rgba(251, 191, 36, 0)',
                    '0 0 30px rgba(251, 191, 36, 0.6)',
                    '0 0 0px rgba(251, 191, 36, 0)'
                  ]
                : [
                    '0 0 0px rgba(20, 241, 149, 0)',
                    '0 0 25px rgba(20, 241, 149, 0.5)',
                    '0 0 0px rgba(20, 241, 149, 0)'
                  ]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="rounded-xl"
          >
            <Button
              onClick={handleConvert}
              disabled={!canConvert || isConverting}
              className={cn(
                "w-full h-14 font-black uppercase tracking-wider text-lg rounded-xl border-2 transition-all",
                isGodModeActive
                  ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-yellow-400 hover:from-yellow-400 hover:to-amber-500"
                  : "bg-secondary hover:bg-secondary/90 text-secondary-foreground border-secondary"
              )}
            >
              {isConverting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <ArrowsLeftRight size={24} weight="bold" className="mr-2" />
                  </motion.div>
                  CONVERTING...
                </>
              ) : (
                <>
                  <Lightning size={24} weight="fill" className="mr-2" />
                  CONVERT TO BTC
                </>
              )}
            </Button>
          </motion.div>

          {/* Stats Grid */}
          {stats && stats.conversionCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-4 gap-3 pt-4 border-t border-primary/20"
            >
              <div className="text-center p-3 bg-background/30 rounded-lg border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total BTC</div>
                <div className={cn(
                  "text-sm font-black",
                  isGodModeActive ? "text-yellow-400" : "text-secondary"
                )}>
                  {stats.totalConverted.toFixed(6)}
                </div>
              </div>
              <div className="text-center p-3 bg-background/30 rounded-lg border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Last</div>
                <div className={cn(
                  "text-sm font-black",
                  isGodModeActive ? "text-yellow-400" : "text-secondary"
                )}>
                  {stats.lastConversion.toFixed(6)}
                </div>
              </div>
              <div className="text-center p-3 bg-background/30 rounded-lg border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Best</div>
                <div className={cn(
                  "text-sm font-black",
                  isGodModeActive ? "text-yellow-400" : "text-green-400"
                )}>
                  {stats.biggestConversion.toFixed(6)}
                </div>
              </div>
              <div className="text-center p-3 bg-background/30 rounded-lg border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Count</div>
                <div className={cn(
                  "text-sm font-black",
                  isGodModeActive ? "text-yellow-400" : "text-secondary"
                )}>
                  {stats.conversionCount}
                </div>
              </div>
            </motion.div>
          )}

          {/* Info Box */}
          <div className={cn(
            "flex items-start gap-3 p-4 rounded-xl border",
            isGodModeActive 
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-muted/20 border-primary/30"
          )}>
            <Shield size={20} weight="duotone" className={isGodModeActive ? "text-yellow-400" : "text-secondary"} />
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              <strong className={isGodModeActive ? "text-yellow-400" : "text-foreground"}>AUTO-HEDGING:</strong>{' '}
              Profits above {PROFIT_THRESHOLD}% trigger automatic BTC conversion, preserving gains and reducing volatility exposure.
              {isGodModeActive && (
                <span className="text-yellow-400 block mt-1">
                  👑 God Mode: Convert anytime with boosted amounts
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
