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

    setAcknowledgment(acknowledgmentData)
    
    setAuditLog((currentLog) => [...(currentLog || []), acknowledgmentData])

    console.log('[Risk Disclosure] Acknowledgment logged for legal compliance:', acknowledgmentData)
    console.log('[Risk Disclosure] Full audit trail contains', (auditLog?.length || 0) + 1, 'entries')
    
    setIsVisible(false)

    toast.success('Risk Disclosure Acknowledged', {
      description: 'Your acknowledgment has been logged for legal compliance'
    })
  }

  if (acknowledgment || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-[100] p-4"
      >
        <Alert
          variant="destructive"
          className="max-w-7xl mx-auto border-2 border-destructive bg-destructive/10 backdrop-blur-md shadow-[0_0_40px_rgba(255,0,102,0.4)] jagged-corner"
        >
          <Warning size={24} weight="fill" className="text-destructive" />
          <AlertTitle className="text-lg font-bold uppercase tracking-wider text-destructive flex items-center justify-between">
            <span>⚠️ RISK DISCLOSURE STATEMENT</span>
          </AlertTitle>
          <AlertDescription className="text-destructive/90">
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">
                <strong>WARNING:</strong> Trading cryptocurrencies and using automated tools involves substantial risk of loss. 
                You may lose 100% (or more with leverage) of all invested capital rapidly and completely. 
                This platform provides no investment advice and makes no guarantees of profit. 
                Past performance is not indicative of future results.
              </p>
              <p className="text-xs">
                By clicking "I Acknowledge", you confirm that you have read, understood, and accept all risks, 
                including total loss of capital, and agree that you will never hold Quantum Falcon liable for any losses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleAcknowledge}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider border-2 border-primary shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.5)] jagged-corner-small"
                  size="lg"
                >
                  I Acknowledge the Risks
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open('/risk-disclosure-full', '_blank')
                  }}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive uppercase tracking-wide jagged-corner-small"
                >
                  Read Full Disclosure
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  )
}
