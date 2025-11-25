import { memo } from 'react'
import { motion } from 'framer-motion'
import { TrendUp, TrendDown } from '@phosphor-icons/react'

interface QuickStat {
  id: string
  label: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
}

interface QuickStatsCardProps {
  stat: QuickStat
  index: number
}

function QuickStatsCardComponent(props: QuickStatsCardProps) {
  // Defensive checks - validate props structure
  if (!props || typeof props !== 'object') {
    console.warn('[QuickStatsCard] Invalid props:', props)
    return null
  }

  const { stat, index } = props

  // Defensive checks - ensure stat is valid
  if (!stat || typeof stat !== 'object' || !stat.id || typeof stat.id !== 'string') {
    console.warn('[QuickStatsCard] Invalid stat prop:', stat)
    return null
  }

  // Ensure change is a number - handle string numbers too
  let change = 0
  if (typeof stat.change === 'number' && Number.isFinite(stat.change)) {
    change = stat.change
  } else if (typeof stat.change === 'string') {
    const parsed = parseFloat(stat.change)
    change = Number.isFinite(parsed) ? parsed : 0
  }

  const isPositive = change >= 0
  const cornerClasses = ['angled-corner-tr', 'angled-corner-br', 'cut-corner-tr', 'angled-corners-dual-tr-bl']
  
  // Ensure index is a valid number
  let safeIndex = 0
  if (typeof index === 'number' && Number.isFinite(index) && index >= 0) {
    safeIndex = Math.floor(index)
  } else if (typeof index === 'string') {
    const parsed = parseInt(index, 10)
    safeIndex = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
  }
  
  // Tour visibility is handled by CSS and tour system - no need for useEffect

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: safeIndex * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className={`cyber-card stat-card group cursor-pointer relative overflow-hidden ${cornerClasses[safeIndex % 4]}`}
      role="gridcell"
      data-tour="stat-card"
      data-tour-card="true"
      aria-label={`${stat.label || 'Stat'}: ${stat.value || 'N/A'}, ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(2)}%`}
      style={{ 
        opacity: 1, 
        visibility: 'visible', 
        display: 'block',
        zIndex: 1
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-4 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="data-label">{stat.label || 'Stat'}</div>
          <div className={`p-2.5 border-2 angled-corner-tr relative overflow-hidden ${
            stat.color === 'primary' ? 'bg-primary/5 border-primary' : 
            stat.color === 'secondary' ? 'bg-secondary/5 border-secondary' : 
            'bg-accent/5 border-accent'
          }`}>
            <div className={`absolute inset-0 ${
              stat.color === 'primary' ? 'bg-primary' : 
              stat.color === 'secondary' ? 'bg-secondary' : 
              'bg-accent'
            } opacity-5`} />
            <div className="relative z-10">
              {stat.icon || <TrendUp size={22} weight="duotone" />}
            </div>
          </div>
        </div>
        <div className="technical-readout text-2xl mb-2">{stat.value || 'N/A'}</div>
        {change !== 0 && (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendUp size={14} weight="bold" className="text-primary" />
            ) : (
              <TrendDown size={14} weight="bold" className="text-destructive" />
            )}
            <span className={`text-xs font-bold ${isPositive ? 'text-primary' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Export component - memo removed temporarily to debug
export const QuickStatsCard = QuickStatsCardComponent

QuickStatsCard.displayName = 'QuickStatsCard'

// Export as default as well for compatibility
export default QuickStatsCard
