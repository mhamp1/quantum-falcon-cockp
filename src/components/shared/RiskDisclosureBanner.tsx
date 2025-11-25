import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Warning, ChatCircle } from '@phosphor-icons/react'
import RiskDisclosureModal from '@/components/legal/RiskDisclosureModal'
import { 
  getCurrentRiskVersion, 
  needsReacceptance, 
  clearOldVersions,
  checkVersionExpiration,
  LegalAcknowledgment 
} from '@/lib/legalVersions'

interface RiskAcknowledgment {
  acknowledgedAt: number
  ipAddress?: string
  userAgent: string
  version: string
  sessionId: string
}

export default function RiskDisclosureBanner() {
  const CURRENT_VERSION = getCurrentRiskVersion()
  
  const [acknowledgment, setAcknowledgment] = useKV<RiskAcknowledgment | null>(
    'risk-disclosure-acknowledgment',
    null
  )
  const [auditLog, setAuditLog] = useKV<RiskAcknowledgment[]>(
    'risk-disclosure-audit-log',
    []
  )
  const [showModal, setShowModal] = useState(false)
  const [isBannerVisible, setIsBannerVisible] = useState(false)

  useEffect(() => {
    const checkAcknowledgment = () => {
      try {
        const localStorageKey = `risk_accepted_${CURRENT_VERSION}`
        const hasLocalStorage = localStorage.getItem(localStorageKey) === 'true'
        const hasValidAcknowledgment = acknowledgment && acknowledgment.version === CURRENT_VERSION
        
        const versionCheck = checkVersionExpiration()
        if (versionCheck.expired && versionCheck.documentType === 'risk') {
          setIsBannerVisible(true)
          clearOldVersions()
          return
        }
        
        if (acknowledgment && needsReacceptance(acknowledgment.version, 'risk')) {
          setIsBannerVisible(true)
          clearOldVersions()
          return
        }
        
        if (hasValidAcknowledgment && hasLocalStorage) {
          setIsBannerVisible(false)
        } else {
          setIsBannerVisible(true)
        }
      } catch (error) {
        // Silent error handling
        setIsBannerVisible(true)
      }
    }

    checkAcknowledgment()
    
    const interval = setInterval(checkAcknowledgment, 30000)
    return () => clearInterval(interval)
  }, [acknowledgment, CURRENT_VERSION])

  const handleOpenModal = () => {
    // Opening Risk Disclosure modal
    setShowModal(true)
  }

  const handleAccept = async () => {
    const acknowledgmentData: RiskAcknowledgment = {
      acknowledgedAt: Date.now(),
      userAgent: navigator.userAgent,
      version: CURRENT_VERSION,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Store acceptance locally
    localStorage.setItem(`risk_accepted_${CURRENT_VERSION}`, 'true')
    clearOldVersions()
    
    // Close modal immediately
    setShowModal(false)
    
    // Hide banner immediately
    setIsBannerVisible(false)
    
    // Store acknowledgment
    await setAcknowledgment(acknowledgmentData)
    
    // Add to audit log
    await setAuditLog((currentLog) => {
      const newLog = [...(currentLog || []), acknowledgmentData]
      return newLog
    })
    
    // Silent backend logging - no console output
    try {
      await fetch('/api/legal/accept-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acknowledgmentData)
      })
    } catch (err) {
      // Silent fail - using KV storage as fallback
    }
  }

  if (!isBannerVisible) {
    return null
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isBannerVisible && (
          <motion.div
            key="risk-banner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 right-0 z-[100] pointer-events-auto"
            style={{ 
              bottom: 'calc(80px + env(safe-area-inset-bottom))',
            }}
          >
            <button
              onClick={handleOpenModal}
              className="w-full bg-destructive text-destructive-foreground px-4 py-3 shadow-[0_-5px_40px_rgba(255,0,102,0.8)] hover:bg-destructive/90 transition-all cursor-pointer"
              aria-label="Open Risk Disclosure - Click to review and accept"
            >
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <Warning size={28} weight="fill" className="text-destructive-foreground flex-shrink-0 animate-pulse" />
                  <div className="text-left">
                    <p className="font-bold uppercase tracking-wider text-sm">
                      ⚠️ LEGAL AGREEMENTS REQUIRED - TERMS OF SERVICE & RISK DISCLOSURE
                    </p>
                    <p className="text-xs opacity-90 font-semibold">
                      Click to review and accept both documents before using the platform
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-shrink-0">
                  <span className="text-xs uppercase tracking-wider font-bold opacity-80">
                    REVIEW AGREEMENTS
                  </span>
                  <ChatCircle size={24} weight="duotone" className="text-destructive-foreground animate-pulse" />
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <RiskDisclosureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAccept={handleAccept}
        version={CURRENT_VERSION}
      />
    </>
  )
}
