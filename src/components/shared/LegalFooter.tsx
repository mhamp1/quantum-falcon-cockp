import { motion } from 'framer-motion'
import { WarningCircle } from '@phosphor-icons/react'

export default function LegalFooter() {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-destructive/95 backdrop-blur-sm text-background px-4 py-2 text-center font-bold text-xs md:text-sm tracking-wider z-50 shadow-[0_-5px_20px_rgba(255,0,102,0.8)] border-t-2 border-destructive"
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <WarningCircle size={20} weight="bold" className="flex-shrink-0" />
        <span>CRYPTOCURRENCY TRADING INVOLVES SUBSTANTIAL RISK OF LOSS</span>
        <span className="hidden md:inline">•</span>
        <button 
          onClick={() => {
            const event = new CustomEvent('navigate-tab', { detail: 'settings' })
            window.dispatchEvent(event)
          }}
          className="underline hover:text-primary transition-colors"
        >
          SEE RISK DISCLOSURE
        </button>
      </div>
    </motion.div>
  )
}
