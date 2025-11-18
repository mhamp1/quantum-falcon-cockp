import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WarningCircle } from '@phosphor-icons/react'
import { getCurrentRiskVersion } from '@/lib/legalVersions'

export default function LegalFooter() {
  const [isVisible, setIsVisible] = useState(false)
  const CURRENT_VERSION = getCurrentRiskVersion()

  useEffect(() => {
    const checkRiskAcceptance = () => {
      const localStorageKey = `risk_accepted_${CURRENT_VERSION}`
      const hasAccepted = localStorage.getItem(localStorageKey) === 'true'
      
      setIsVisible(!hasAccepted)
      
      if (hasAccepted) {
        console.log('[Legal Footer] ✅ Risk accepted - footer hidden')
      } else {
        console.log('[Legal Footer] ⚠️ Risk not accepted - footer visible')
      }
    }

    checkRiskAcceptance()
    
    const interval = setInterval(checkRiskAcceptance, 1000)
    return () => clearInterval(interval)
  }, [CURRENT_VERSION])

  if (!isVisible) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="legal-footer"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 bg-destructive/95 backdrop-blur-sm text-background px-4 py-2 text-center font-bold text-xs md:text-sm tracking-wider z-50 shadow-[0_-5px_20px_rgba(255,0,102,0.8)] border-t-2 border-destructive pointer-events-auto"
        >
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <WarningCircle size={20} weight="bold" className="flex-shrink-0" />
            <span>CRYPTOCURRENCY TRADING INVOLVES SUBSTANTIAL RISK OF LOSS</span>
            <span className="hidden md:inline">•</span>
            <button 
              onClick={() => {
                const settingsEvent = new CustomEvent('navigate-tab', { detail: 'settings' })
                window.dispatchEvent(settingsEvent)
                setTimeout(() => {
                  const legalTabEvent = new CustomEvent('open-legal-risk-disclosure')
                  window.dispatchEvent(legalTabEvent)
                }, 100)
              }}
              className="underline hover:text-primary transition-colors"
            >
              SEE RISK DISCLOSURE
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
