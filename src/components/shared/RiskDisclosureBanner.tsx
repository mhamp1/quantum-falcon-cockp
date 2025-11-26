// RISK DISCLOSURE BANNER — REBUILT November 26, 2025
// The red banner at bottom that triggers the Legal Agreement Modal
// Shows until user accepts, then never again

import { useState, useEffect } from 'react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { motion, AnimatePresence } from 'framer-motion'
import { Warning, ArrowRight } from '@phosphor-icons/react'
import LegalAgreementModal from '@/components/auth/LegalAgreementModal'

interface LegalAcceptance {
  acceptedAt: number
  version: string
  userAgent: string
}

export default function RiskDisclosureBanner() {
  const CURRENT_VERSION = '2025-11-26-v2'
  
  const [acceptance, setAcceptance] = useKV<LegalAcceptance | null>(
    'legal-acceptance-v2',
    null
  )
  const [showModal, setShowModal] = useState(false)
  const [isBannerVisible, setIsBannerVisible] = useState(false)

  // Check if user has already accepted
  useEffect(() => {
    const checkAcceptance = () => {
      try {
        // Check localStorage first (faster)
        const localAccepted = localStorage.getItem('legal-accepted-v2') === 'true'
        const kvAccepted = acceptance && acceptance.version === CURRENT_VERSION
        
        if (localAccepted || kvAccepted) {
          setIsBannerVisible(false)
        } else {
          setIsBannerVisible(true)
        }
      } catch (error) {
        // On error, show banner to be safe
        setIsBannerVisible(true)
      }
    }

    checkAcceptance()
  }, [acceptance, CURRENT_VERSION])

  // Handle modal open
  const handleOpenModal = () => {
    setShowModal(true)
  }

  // Handle acceptance from modal
  const handleAccept = () => {
    const acceptanceData: LegalAcceptance = {
      acceptedAt: Date.now(),
      version: CURRENT_VERSION,
      userAgent: navigator.userAgent
    }
    
    // Store in KV
    setAcceptance(acceptanceData)
    
    // Store in localStorage for redundancy
    try {
      localStorage.setItem('legal-accepted-v2', 'true')
      localStorage.setItem('legal-accepted-timestamp', Date.now().toString())
    } catch (e) {
      // Silent fail
    }
    
    // Close modal and hide banner
    setShowModal(false)
    setIsBannerVisible(false)
  }

  // Handle decline
  const handleDecline = () => {
    setShowModal(false)
    // Banner stays visible, user can't proceed
  }

  // Don't render anything if already accepted
  if (!isBannerVisible && !showModal) {
    return null
  }

  return (
    <>
      {/* The red banner */}
      <AnimatePresence mode="wait">
        {isBannerVisible && (
          <motion.div
            key="risk-banner"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 right-0 z-[100] pointer-events-auto"
            style={{ 
              bottom: 'calc(80px + env(safe-area-inset-bottom))',
            }}
          >
            <button
              onClick={handleOpenModal}
              className="w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-4 py-3 shadow-[0_-5px_40px_rgba(255,0,0,0.6)] hover:from-red-500 hover:via-red-400 hover:to-red-500 transition-all cursor-pointer border-t-2 border-red-400/50"
              aria-label="Open Legal Agreements - Click to review and accept"
            >
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <Warning size={28} weight="fill" className="text-yellow-300 flex-shrink-0 animate-pulse" />
                  <div className="text-left">
                    <p className="font-bold uppercase tracking-wider text-sm">
                      ⚠️ LEGAL AGREEMENTS REQUIRED
                    </p>
                    <p className="text-xs opacity-90">
                      Click to review and accept Terms of Service & Risk Disclosure
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-shrink-0 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                  <span className="text-xs sm:text-sm uppercase tracking-wider font-bold">
                    Review Now
                  </span>
                  <ArrowRight size={20} weight="bold" className="animate-pulse" />
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The modal */}
      <LegalAgreementModal
        isOpen={showModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </>
  )
}
