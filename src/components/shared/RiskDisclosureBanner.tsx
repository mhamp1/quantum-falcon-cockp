import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Warning, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

interface RiskAcknowledgment {
  acknowledgedAt: number
  ipAddress?: string
  userAgent: string
  version: string
  sessionId: string
}

export default function RiskDisclosureBanner() {
  const [acknowledgment, setAcknowledgment] = useKV<RiskAcknowledgment | null>(
    'risk-disclosure-acknowledgment',
    null
  )
  const [auditLog, setAuditLog] = useKV<RiskAcknowledgment[]>(
    'risk-disclosure-audit-log',
    []
  )
  const [isVisible, setIsVisible] = useState(true)

  const handleAcknowledge = async () => {
    const acknowledgmentData: RiskAcknowledgment = {
      acknowledgedAt: Date.now(),
      userAgent: navigator.userAgent,
      version: '2025-11-18',
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    setIsVisible(false)
    
    setAcknowledgment(acknowledgmentData)
    
    setAuditLog((currentLog) => [...(currentLog || []), acknowledgmentData])

    console.log('[Risk Disclosure Banner] ✅ Acknowledgment logged for legal compliance:', acknowledgmentData)
    console.log('[Risk Disclosure Banner] 📋 Full audit trail contains', (auditLog?.length || 0) + 1, 'entries')
    console.log('[Risk Disclosure Banner] 🔒 Acknowledgment stored permanently in key: risk-disclosure-acknowledgment')
    console.log('[Risk Disclosure Banner] 📅 Timestamp:', new Date(acknowledgmentData.acknowledgedAt).toISOString())
    console.log('[Risk Disclosure Banner] 👤 User Agent:', acknowledgmentData.userAgent)
    console.log('[Risk Disclosure Banner] 🆔 Session ID:', acknowledgmentData.sessionId)
    
    try {
      await fetch('/api/legal/acknowledge-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acknowledgmentData)
      }).catch(() => {
        console.log('[Risk Disclosure Banner] ℹ️ Backend logging unavailable, using client-side storage only')
      })
    } catch (err) {
      console.log('[Risk Disclosure Banner] ℹ️ Backend logging unavailable, using client-side storage only')
    }
    
    toast.success('Risk Disclosure Acknowledged', {
      description: 'Your acknowledgment has been permanently logged.'
    })
  }

  if (acknowledgment || !isVisible) {
    console.log('[Risk Disclosure Banner] 🚫 Banner hidden - User has acknowledged (logged on:', acknowledgment ? new Date(acknowledgment.acknowledgedAt).toLocaleString() : 'N/A', ')')
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-[100]"
      >
        <div className="bg-destructive text-destructive-foreground px-4 py-3 shadow-[0_-5px_40px_rgba(255,0,102,0.8)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Warning size={24} weight="fill" className="text-destructive-foreground flex-shrink-0" />
              <div className="text-left">
                <p className="font-bold uppercase tracking-wider text-sm">
                  ⚠️ CRYPTOCURRENCY TRADING INVOLVES SUBSTANTIAL RISK OF LOSS
                </p>
                <p className="text-xs opacity-90">
                  You may lose 100% of invested capital. No investment advice provided. See full disclosure.
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={handleAcknowledge}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider border-2 border-primary-foreground/20 shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.5)]"
              >
                I Acknowledge
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
