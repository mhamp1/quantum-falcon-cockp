import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Warning, ChatCircle } from '@phosphor-icons/react'
import RiskDisclosureModal from '@/components/legal/RiskDisclosureModal'
import { 
  getCurrentRiskVersion, 
  needsReacceptance, 
  clearOldVersions,
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
      const localStorageKey = `risk_accepted_${CURRENT_VERSION}`
      const hasLocalStorage = localStorage.getItem(localStorageKey) === 'true'
      const hasValidAcknowledgment = acknowledgment && acknowledgment.version === CURRENT_VERSION
      
      if (acknowledgment && needsReacceptance(acknowledgment.version, 'risk')) {
        console.log('[Risk Banner] 📢 DOCUMENT UPDATED! User must re-accept')
        console.log('[Risk Banner] Old version:', acknowledgment.version, 'New version:', CURRENT_VERSION)
        setIsBannerVisible(true)
        clearOldVersions()
        return
      }
      
      if (hasValidAcknowledgment && hasLocalStorage) {
        setIsBannerVisible(false)
        console.log('[Risk Banner] ✅ User has accepted version', CURRENT_VERSION, 'on', new Date(acknowledgment.acknowledgedAt).toLocaleString())
      } else {
        setIsBannerVisible(true)
        console.log('[Risk Banner] ⚠️ User has NOT accepted current version', CURRENT_VERSION, '- banner MUST be shown')
        if (!hasValidAcknowledgment) {
          console.log('[Risk Banner] Missing KV acknowledgment or version mismatch')
        }
        if (!hasLocalStorage) {
          console.log('[Risk Banner] Missing localStorage flag')
        }
      }
    }

    checkAcknowledgment()
    
    const interval = setInterval(checkAcknowledgment, 5000)
    return () => clearInterval(interval)
  }, [acknowledgment, CURRENT_VERSION])

  const handleOpenModal = () => {
    console.log('[Risk Banner] 📖 Opening Risk Disclosure modal...')
    setShowModal(true)
  }

  const handleAccept = async () => {
    const acknowledgmentData: RiskAcknowledgment = {
      acknowledgedAt: Date.now(),
      userAgent: navigator.userAgent,
      version: CURRENT_VERSION,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    console.log('[Risk Banner] 💾 ACCEPTING RISK DISCLOSURE - Version:', CURRENT_VERSION)
    
    await setAcknowledgment(acknowledgmentData)
    
    await setAuditLog((currentLog) => {
      const newLog = [...(currentLog || []), acknowledgmentData]
      console.log('[Risk Banner] 📋 Audit log updated - Total entries:', newLog.length)
      return newLog
    })

    console.log('[Risk Banner] ✅ ACCEPTANCE COMPLETE - Banner will now DISAPPEAR')
    console.log('[Risk Banner] 📅 Timestamp:', new Date(acknowledgmentData.acknowledgedAt).toISOString())
    console.log('[Risk Banner] 👤 User Agent:', acknowledgmentData.userAgent)
    console.log('[Risk Banner] 🆔 Session ID:', acknowledgmentData.sessionId)
    
    localStorage.setItem(`risk_accepted_${CURRENT_VERSION}`, 'true')
    console.log('[Risk Banner] 💾 Stored in localStorage key:', `risk_accepted_${CURRENT_VERSION}`)
    
    clearOldVersions()
    
    setIsBannerVisible(false)
    setShowModal(false)
    
    try {
      await fetch('/api/legal/accept-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acknowledgmentData)
      })
      console.log('[Risk Banner] 🔐 Backend logging successful')
    } catch (err) {
      console.log('[Risk Banner] ℹ️ Backend logging unavailable (OK - using KV storage)')
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
            exit={{ opacity: 0, y: 20, transition: { duration: 0.5 } }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-auto"
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
                      ⚠️ CRYPTOCURRENCY TRADING INVOLVES SUBSTANTIAL RISK OF LOSS
                    </p>
                    <p className="text-xs opacity-90 font-semibold">
                      Click anywhere on this banner to review and accept the Risk Disclosure
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-shrink-0">
                  <span className="text-xs uppercase tracking-wider font-bold opacity-80">
                    SEE RISK DISCLOSURE
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
