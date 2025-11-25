// Strategy Rental System — Lower barrier to entry
// November 24, 2025 — Quantum Falcon Cockpit

import { useKVSafe } from '@/hooks/useKVFallback'

export interface StrategyRental {
  strategyId: string
  strategyName: string
  rentedAt: number
  expiresAt: number
  duration: number // in days
  cost: number // in USD
  status: 'active' | 'expired' | 'cancelled'
}

export interface RentalPlan {
  id: string
  name: string
  duration: number // days
  price: number // USD
  discount?: number // percentage
  popular?: boolean
}

export const RENTAL_PLANS: RentalPlan[] = [
  {
    id: '7-day',
    name: '7-Day Trial',
    duration: 7,
    price: 9.99,
    discount: 0,
    popular: false
  },
  {
    id: '30-day',
    name: '30-Day Access',
    duration: 30,
    price: 29.99,
    discount: 15,
    popular: true
  },
  {
    id: '90-day',
    name: '90-Day Access',
    duration: 90,
    price: 69.99,
    discount: 30,
    popular: false
  }
]

export function useStrategyRentals() {
  const [rentals, setRentals] = useKVSafe<StrategyRental[]>('strategy-rentals', [])

  const rentStrategy = (strategyId: string, strategyName: string, plan: RentalPlan): StrategyRental => {
    const now = Date.now()
    const rental: StrategyRental = {
      strategyId,
      strategyName,
      rentedAt: now,
      expiresAt: now + (plan.duration * 24 * 60 * 60 * 1000),
      duration: plan.duration,
      cost: plan.price,
      status: 'active'
    }

    setRentals(prev => [...(prev || []), rental])
    return rental
  }

  const isRented = (strategyId: string): boolean => {
    const rental = rentals?.find(r => r.strategyId === strategyId && r.status === 'active')
    if (!rental) return false
    
    // Check if expired
    if (rental.expiresAt < Date.now()) {
      setRentals(prev => 
        prev?.map(r => 
          r.strategyId === strategyId ? { ...r, status: 'expired' as const } : r
        ) || []
      )
      return false
    }
    
    return true
  }

  const getRental = (strategyId: string): StrategyRental | null => {
    return rentals?.find(r => r.strategyId === strategyId && r.status === 'active') || null
  }

  const cancelRental = (strategyId: string) => {
    setRentals(prev =>
      prev?.map(r =>
        r.strategyId === strategyId ? { ...r, status: 'cancelled' as const } : r
      ) || []
    )
  }

  const getActiveRentals = (): StrategyRental[] => {
    const now = Date.now()
    return rentals?.filter(r => r.status === 'active' && r.expiresAt > now) || []
  }

  return {
    rentals: rentals || [],
    rentStrategy,
    isRented,
    getRental,
    cancelRental,
    getActiveRentals
  }
}

