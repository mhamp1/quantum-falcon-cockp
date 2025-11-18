import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Warning, ChatCircle } from '@phosphor-icons/react'
import RiskDisclosureModal from '@/components/legal/RiskDisclosureModal'

interface RiskAcknowledgment {
  acknowledgedAt: number
  ipAddress?: string
  userAgent: string
  version: string
  sessionId: string
}

const CURRENT_VERSION = '2025-11-18'

export default function RiskDisclosureBanner() {
  const [acknowledgment, setAcknowledgment] = useKV<RiskAcknowledgment | null>(
    'risk-disclosure-acknowledgment',
    null
  )
  const [auditLog, setAuditLog] = useKV<RiskAcknowledgment[]>(
    'risk-disclosure-audit-log',
    []
  )
  const [showModal, setShowModal] = useState(false)
  const [shouldShowBanner, setShouldShowBanner] = useState(true)

  useEffect(() => {
    const hasValidAcknowledgment = acknowledgment && acknowledgment.version === CURRENT_VERSION
    
    if (hasValidAcknowledgment) {
      setShouldShowBanner(false)
      console.log('[Risk Banner] ✅ User has accepted version', CURRENT_VERSION, 'on', new Date(acknowledgment.acknowledgedAt).toLocaleString())
      console.log('[Risk Banner] 🔒 Acknowledgment data:', acknowledgment)
    } else {
      setShouldShowBanner(true)
      console.log('[Risk Banner] ⚠️ User has NOT accepted current version - banner MUST be shown')
    }
  }, [acknowledgment])

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
    
    console.log('[Risk Banner] 💾 ACCEPTING RISK DISCLOSURE - Saving to KV...')
    
    await setAcknowledgment(acknowledgmentData)
    
    await setAuditLog((currentLog) => {
      const newLog = [...(currentLog || []), acknowledgmentData]
      console.log('[Risk Banner] 📋 Audit log updated - Total entries:', newLog.length)
      return newLog
    })

    console.log('[Risk Banner] ✅ ACCEPTANCE COMPLETE - Banner will now DISAPPEAR FOREVER')
    console.log('[Risk Banner] 📅 Timestamp:', new Date(acknowledgmentData.acknowledgedAt).toISOString())
    console.log('[Risk Banner] 👤 User Agent:', acknowledgmentData.userAgent)
    console.log('[Risk Banner] 🆔 Session ID:', acknowledgmentData.sessionId)
    console.log('[Risk Banner] 📦 Stored in key: risk-disclosure-acknowledgment')
    
    setShouldShowBanner(false)
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
    
    localStorage.setItem(`risk_accepted_${CURRENT_VERSION}`, 'true')
    console.log('[Risk Banner] 💾 Also stored in localStorage for instant UI updates')
  }

  if (!shouldShowBanner) {
    console.log('[Risk Banner] 🚫 Banner hidden - user has accepted')
    return null
  }

  console.log('[Risk Banner] 👁️ BANNER VISIBLE - user MUST accept to make it disappear')

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-auto"
          style={{ display: shouldShowBanner ? 'block' : 'none' }}
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
