// Rental Management UI — Settings Sub-tab
// November 24, 2025 — Quantum Falcon Cockpit

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, Calendar, CreditCard, Trash, ArrowClockwise as RefreshCw,
  CheckCircle, XCircle, WarningCircle as AlertCircle, Crown
} from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useStrategyRentals } from '@/lib/strategyRental'
import { toast } from 'sonner'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'

export default function RentalManagement() {
  const { rentals, cancelRental, getActiveRentals } = useStrategyRentals()
  const activeRentals = getActiveRentals()

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now()
    const diff = expiresAt - now
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  const getProgress = (rentedAt: number, expiresAt: number) => {
    const now = Date.now()
    const total = expiresAt - rentedAt
    const elapsed = now - rentedAt
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  const handleCancel = (strategyId: string, strategyName: string) => {
    if (confirm(`Cancel rental for ${strategyName}? This action cannot be undone.`)) {
      cancelRental(strategyId)
      toast.success('Rental cancelled', {
        description: `${strategyName} access has been revoked`
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
            <CreditCard size={28} weight="duotone" />
            Strategy Rentals
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your rented strategies and access periods
          </p>
        </div>
        <Badge className="bg-primary/20 border-primary/50 text-primary">
          {activeRentals.length} Active
        </Badge>
      </div>

      {/* Active Rentals */}
      {activeRentals.length > 0 ? (
        <div className="space-y-4">
          {activeRentals.map((rental, idx) => (
            <motion.div
              key={rental.strategyId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="cyber-card p-6 border-2 border-primary/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-black uppercase tracking-wider text-primary">
                        {rental.strategyName}
                      </h4>
                      <Badge className="bg-green-500/20 border-green-500/50 text-green-400">
                        <CheckCircle size={12} className="mr-1" weight="fill" />
                        Active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Rented
                        </div>
                        <div className="font-bold text-foreground">
                          {formatDate(rental.rentedAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Expires
                        </div>
                        <div className="font-bold text-foreground">
                          {formatDate(rental.expiresAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Duration
                        </div>
                        <div className="font-bold text-foreground">
                          {rental.duration} days
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Cost
                        </div>
                        <div className="font-bold text-primary">
                          ${rental.cost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground uppercase tracking-wider">
                      Time Remaining
                    </span>
                    <span className="font-bold text-primary">
                      {getTimeRemaining(rental.expiresAt)}
                    </span>
                  </div>
                  <Progress 
                    value={getProgress(rental.rentedAt, rental.expiresAt)} 
                    className="h-3"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-primary/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(rental.strategyId, rental.strategyName)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash size={16} className="mr-2" />
                    Cancel Rental
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'trading' }))
                    }}
                    className="flex-1"
                  >
                    <Crown size={16} className="mr-2" />
                    Use Strategy
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="cyber-card p-12 text-center border-2 border-primary/30">
          <Clock size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4 opacity-50" />
          <h4 className="text-xl font-bold text-primary mb-2">No Active Rentals</h4>
          <p className="text-muted-foreground mb-6">
            You don't have any active strategy rentals. Rent strategies from the Trading Hub to get started.
          </p>
          <Button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'trading' }))
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Browse Strategies
          </Button>
        </Card>
      )}

      {/* Expired Rentals */}
      {rentals.filter(r => r.status === 'expired').length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
            Expired Rentals
          </h4>
          {rentals
            .filter(r => r.status === 'expired')
            .map((rental, idx) => (
              <Card key={rental.strategyId} className="cyber-card p-4 border border-muted/30 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-bold text-muted-foreground">{rental.strategyName}</h5>
                      <Badge className="bg-muted/30 border-muted/50 text-muted-foreground text-xs">
                        <XCircle size={10} className="mr-1" />
                        Expired
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expired on {formatDate(rental.expiresAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'trading' }))
                    }}
                  >
                    Rent Again
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}

