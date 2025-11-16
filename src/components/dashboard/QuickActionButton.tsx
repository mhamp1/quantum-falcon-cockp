import { memo } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  action: () => void
}

interface QuickActionButtonProps {
  action: QuickAction
  index: number
}

export const QuickActionButton = memo(({ action, index }: QuickActionButtonProps) => {
  const colorClasses = {
    primary: 'bg-primary/10 hover:bg-primary/20 border-primary/50 hover:border-primary text-primary hover:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]',
    accent: 'bg-accent/10 hover:bg-accent/20 border-accent/50 hover:border-accent text-accent hover:shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]',
    secondary: 'bg-secondary/10 hover:bg-secondary/20 border-secondary/50 hover:border-secondary text-secondary hover:shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]',
    destructive: 'bg-destructive/10 hover:bg-destructive/20 border-destructive/50 hover:border-destructive text-destructive hover:shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.3)]'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={action.action}
        className={`w-full ${colorClasses[action.color as keyof typeof colorClasses]} border-2 transition-all ${index % 2 === 0 ? 'angled-corner-tr' : 'angled-corner-br'} flex-col h-auto py-4 gap-2 relative overflow-hidden group/btn`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        <div className="relative z-10">
          {action.icon}
        </div>
        <span className="text-xs uppercase tracking-wider font-bold relative z-10">{action.label}</span>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
      <div className="relative z-10">
        {action.icon}
      </div>
      <span className="text-xs uppercase tracking-wider font-bold relative z-10">{action.label}</span>
      </Button>
    </motion.div>
  )
})

QuickActionButton.displayName = 'QuickActionButton'
