// Floating Mini-Profit Ticker — TradingView Style
// November 21, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, X, BarChart } from '@phosphor-icons/react'
import { useKV } from '@/hooks/useKVFallback'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import ProfitModal from './ProfitModal'

interface ProfitData {
  pnl: number
  pnlPercent: number
  isPositive: boolean
  allTimeHigh: number
}

export default function FloatingProfitTicker() {
  const [profit, setProfit] = useKV<ProfitData>('daily-profit', {
    pnl: 0,
    pnlPercent: 0,
    isPositive: false,
    allTimeHigh: 0,
  })
  const [showModal, setShowModal] = useState(false)
  const [previousHigh, setPreviousHigh] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Check if profit > $100
  useEffect(() => {
    setIsVisible(Math.abs(profit.pnl) >= 100)
  }, [profit.pnl])

  // Watch for new all-time high
  useEffect(() => {
    if (profit.pnl > 0 && profit.pnl > previousHigh && profit.pnl > profit.allTimeHigh) {
      // New high reached - trigger confetti
      const duration = 2000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.8, 0.9), y: randomInRange(0.4, 0.6) },
        })
      }, 250)

      setPreviousHigh(profit.pnl)
    }
  }, [profit.pnl, profit.allTimeHigh, previousHigh])

  // Simulate live profit updates (replace with real WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: Replace with real profit feed
      const mockChange = (Math.random() - 0.5) * 50
      setProfit((prev) => {
        const newPnl = prev.pnl + mockChange
        return {
          pnl: newPnl,
          pnlPercent: (newPnl / 10000) * 100, // Assuming $10k starting
          isPositive: newPnl >= 0,
          allTimeHigh: Math.max(prev.allTimeHigh, newPnl),
        }
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [setProfit])

  if (!isVisible) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg
            backdrop-blur-xl border-2 shadow-2xl
            transition-all duration-300
            ${profit.isPositive 
              ? 'bg-green-500/20 border-green-500/50 text-green-400' 
              : 'bg-red-500/20 border-red-500/50 text-red-400'
            }
            hover:shadow-[0_0_30px_currentColor]
          `}
        >
          {profit.isPositive ? (
            <TrendingUp size={20} weight="bold" />
          ) : (
            <TrendingDown size={20} weight="bold" />
          )}
          
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider opacity-70">
              Today's P&L
            </span>
            <span className="text-lg font-bold tabular-nums">
              {profit.isPositive ? '+' : ''}${profit.pnl.toFixed(2)}
            </span>
            <span className={`text-xs ${profit.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {profit.isPositive ? '+' : ''}{profit.pnlPercent.toFixed(2)}%
            </span>
          </div>

          <BarChart size={18} weight="duotone" className="opacity-60" />
        </motion.button>
      </motion.div>

      <ProfitModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        profit={profit}
      />
    </>
  )
}

