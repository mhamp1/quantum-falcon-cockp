// Card Grid Skeleton — Loading States for All Card Grids
// November 21, 2025 — Quantum Falcon Cockpit

import { Skeleton } from '@/components/ui/skeleton'

interface CardGridSkeletonProps {
  count?: number
  variant?: 'default' | 'compact' | 'large'
  className?: string
}

export function CardGridSkeleton({ 
  count = 6, 
  variant = 'default',
  className = '' 
}: CardGridSkeletonProps) {
  const heightClass = variant === 'large' ? 'h-48' : variant === 'compact' ? 'h-32' : 'h-40'
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="cyber-card p-4 space-y-3"
        >
          <Skeleton className={`w-full ${heightClass} rounded-md`} />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

