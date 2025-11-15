import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowsLeftRight, TrendUp, Coins } from '@phosphor-icons/react'
import { toast } from 'sonner'
import ProfitParticles from './ProfitParticles'
import ConversionBeam from './ConversionBeam'
import { useKV } from '@github/spark/hooks'

interface ConversionStats {
  totalConverted: number
  lastConversion: number
  conversionCount: number
}

export default function ProfitConverter() {
  const [isConverting, setIsConverting] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [showBeam, setShowBeam] = useState(false)
  const [convertedAmount, setConvertedAmount] = useState(0)
  const [stats, setStats] = useKV<ConversionStats>('conversion-stats', {
    totalConverted: 0,
    lastConversion: 0,
    conversionCount: 0
  })

  const currentProfit = 24.5
  const profitThreshold = 20
  const canConvert = currentProfit >= profitThreshold

  const handleConvert = async () => {
    if (!canConvert) {
      toast.error('Insufficient Profit', {
        description: `Need ${profitThreshold}% profit to convert. Current: ${currentProfit}%`
      })
      return
    }

    setIsConverting(true)
    setShowBeam(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    setShowBeam(false)

    await new Promise(resolve => setTimeout(resolve, 200))

    const btcAmount = 0.00125 + Math.random() * 0.00075
    setConvertedAmount(btcAmount)
    setShowParticles(true)

    setStats((current) => ({
      totalConverted: (current?.totalConverted || 0) + btcAmount,
      lastConversion: btcAmount,
      conversionCount: (current?.conversionCount || 0) + 1
    }))

    toast.success('Profit Converted to BTC!', {
      description: `+${btcAmount.toFixed(8)} BTC secured in vault`
    })
  }

  const handleParticlesComplete = () => {
    setShowParticles(false)
    setIsConverting(false)
  }

  return (
    <Card className="backdrop-blur-md bg-card/50 border-accent/30 relative overflow-hidden">
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

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins size={24} weight="duotone" className="text-accent" />
          Profit Converter
        </CardTitle>
        <CardDescription>
          Auto-convert SOL profits &gt;{profitThreshold}% to BTC for hedging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Profit</span>
            <span className={`text-lg font-bold ${currentProfit >= profitThreshold ? 'text-accent' : 'text-muted-foreground'}`}>
              {currentProfit.toFixed(2)}%
            </span>
          </div>
          
          <div className="space-y-1.5">
            <Progress 
              value={(currentProfit / profitThreshold) * 100} 
              className="h-3"
            />
            <p className="text-xs text-muted-foreground text-right">
              {currentProfit >= profitThreshold ? 'Ready to convert!' : `${(profitThreshold - currentProfit).toFixed(2)}% until conversion`}
            </p>
          </div>
        </div>

        <motion.div
          animate={canConvert ? {
            boxShadow: [
              '0 0 0px rgba(20, 241, 149, 0)',
              '0 0 20px rgba(20, 241, 149, 0.5)',
              '0 0 0px rgba(20, 241, 149, 0)'
            ]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="rounded-lg"
        >
          <Button
            onClick={handleConvert}
            disabled={!canConvert || isConverting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base font-semibold"
          >
            {isConverting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <ArrowsLeftRight size={20} weight="bold" className="mr-2" />
                </motion.div>
                Converting...
              </>
            ) : (
              <>
                <ArrowsLeftRight size={20} weight="bold" className="mr-2" />
                Convert to BTC
              </>
            )}
          </Button>
        </motion.div>

        {stats && stats.conversionCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50"
          >
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Total BTC</div>
              <div className="text-sm font-semibold text-[#F7931A]">
                {stats.totalConverted.toFixed(8)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Last</div>
              <div className="text-sm font-semibold text-[#F7931A]">
                {stats.lastConversion.toFixed(8)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Count</div>
              <div className="text-sm font-semibold text-accent">
                {stats.conversionCount}
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
          <TrendUp size={20} weight="duotone" className="text-accent mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">Auto-Hedging:</strong> Profits above {profitThreshold}% trigger automatic BTC conversion, preserving gains and reducing volatility exposure.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
