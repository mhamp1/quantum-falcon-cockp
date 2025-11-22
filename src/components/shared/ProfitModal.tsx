// Full P&L Modal — Detailed Profit View
// November 21, 2025 — Quantum Falcon Cockpit

import { X, TrendingUp, TrendingDown, Calendar, Clock } from '@phosphor-icons/react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { motion } from 'framer-motion'

interface ProfitModalProps {
  isOpen: boolean
  onClose: () => void
  profit: {
    pnl: number
    pnlPercent: number
    isPositive: boolean
    allTimeHigh: number
  }
}

export default function ProfitModal({ isOpen, onClose, profit }: ProfitModalProps) {
  // Mock data - replace with real API
  const stats = {
    totalTrades: 47,
    winRate: 68.1,
    avgWin: 234.56,
    avgLoss: -89.23,
    largestWin: 1250.00,
    largestLoss: -320.50,
    sharpeRatio: 2.34,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="cyber-card border-2 border-primary max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-primary">
            Profit & Loss Dashboard
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main P&L Card */}
        <div className={`
          cyber-card p-6 mb-6
          ${profit.isPositive ? 'border-green-500/50' : 'border-red-500/50'}
        `}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm uppercase tracking-wider text-muted-foreground">
              Today's Performance
            </span>
            <div className="flex items-center gap-2">
              {profit.isPositive ? (
                <TrendingUp size={24} weight="bold" className="text-green-400" />
              ) : (
                <TrendingDown size={24} weight="bold" className="text-red-400" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-black tabular-nums">
              <span className={profit.isPositive ? 'text-green-400' : 'text-red-400'}>
                {profit.isPositive ? '+' : ''}${profit.pnl.toFixed(2)}
              </span>
            </div>
            <div className={`text-xl font-bold ${profit.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {profit.isPositive ? '+' : ''}{profit.pnlPercent.toFixed(2)}%
            </div>
          </div>

          {profit.allTimeHigh > 0 && (
            <div className="mt-4 pt-4 border-t border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  All-Time High
                </span>
                <span className="text-lg font-bold text-green-400">
                  ${profit.allTimeHigh.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="cyber-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Total Trades
            </div>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
          </div>

          <div className="cyber-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Win Rate
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.winRate}%</div>
          </div>

          <div className="cyber-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Avg Win
            </div>
            <div className="text-2xl font-bold text-green-400">${stats.avgWin.toFixed(2)}</div>
          </div>

          <div className="cyber-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Avg Loss
            </div>
            <div className="text-2xl font-bold text-red-400">${stats.avgLoss.toFixed(2)}</div>
          </div>

          <div className="cyber-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Largest Win
            </div>
            <div className="text-2xl font-bold text-green-400">${stats.largestWin.toFixed(2)}</div>
          </div>

          <div className="cyber-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Sharpe Ratio
            </div>
            <div className="text-2xl font-bold">{stats.sharpeRatio}</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="cyber-card p-4">
          <h3 className="text-sm uppercase tracking-wider font-bold mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-primary/10">
              <span className="text-muted-foreground">12:34 PM</span>
              <span className="text-green-400 font-bold">+$234.56</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-primary/10">
              <span className="text-muted-foreground">12:28 PM</span>
              <span className="text-red-400 font-bold">-$89.23</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">12:15 PM</span>
              <span className="text-green-400 font-bold">+$156.78</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

