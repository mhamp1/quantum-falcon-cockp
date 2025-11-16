import { memo } from 'react'
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

export const QuickStatsCard = memo(({ stat, index }: QuickStatsCardProps) => {
  const isPositive = stat.change >= 0
  const cornerClasses = ['angled-corner-tr', 'angled-corner-br', 'cut-corner-tr', 'angled-corners-dual-tr-bl']
  
  return (
    <div
      className={`cyber-card group hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden ${cornerClasses[index % 4]}`}
      role="gridcell"
      aria-label={`${stat.label}: ${stat.value}, ${stat.change >= 0 ? 'up' : 'down'} ${Math.abs(stat.change).toFixed(2)}%`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-4 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="data-label">{stat.label}</div>
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
              {stat.icon}
            </div>
          </div>
        </div>
        <div className="technical-readout text-2xl mb-2">{stat.value}</div>
        {stat.change !== 0 && (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendUp size={14} weight="bold" className="text-primary" />
            ) : (
              <TrendDown size={14} weight="bold" className="text-destructive" />
            )}
            <span className={`text-xs font-bold ${isPositive ? 'text-primary' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{stat.change.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
})

QuickStatsCard.displayName = 'QuickStatsCard'
