// Autonomous Bot Legal Disclaimer — Required Before Bot Activation
// November 22, 2025 — Quantum Falcon Cockpit
// Protects creator from liability for autonomous bot operations

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, X } from '@phosphor-icons/react'
import { useLegalProtection } from '@/lib/legal/LegalProtection'
import { toast } from 'sonner'

interface AutonomousBotDisclaimerProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export default function AutonomousBotDisclaimer({
  isOpen,
  onClose,
  onAccept,
}: AutonomousBotDisclaimerProps) {
  const { getBotDisclaimer, recordAcceptance } = useLegalProtection()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [check1, setCheck1] = useState(false)
  const [check2, setCheck2] = useState(false)
  const [check3, setCheck3] = useState(false)
  const [canAccept, setCanAccept] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const disclaimerText = getBotDisclaimer()

  useEffect(() => {
    if (!isOpen) {
      setScrollProgress(0)
      setCheck1(false)
      setCheck2(false)
      setCheck3(false)
      setCanAccept(false)
    }
  }, [isOpen])

  const handleScroll = () => {
    if (!scrollRef.current) return

    const element = scrollRef.current
    const scrolled = element.scrollTop
    const total = element.scrollHeight - element.clientHeight
    const percent = total > 0 ? (scrolled / total) * 100 : 100

    setScrollProgress(Math.min(percent, 100))

    if (percent >= 98) {
      setCanAccept(true)
    }
  }

  const isAcceptEnabled = check1 && check2 && check3 && canAccept

  const handleAccept = () => {
    if (isAcceptEnabled) {
      // Record autonomous bot acknowledgment
      recordAcceptance({
        autonomousBotAcknowledged: true,
        scrollProgressRisk: scrollProgress,
      })

      toast.success('Autonomous Bot Disclaimer Accepted', {
        description: 'You have acknowledged all risks. Bot can now be activated.',
        duration: 5000,
      })

      onAccept()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/98 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Prevent closing on backdrop click - user must accept
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-4xl my-8 flex flex-col bg-card border-4 border-red-500 shadow-[0_0_80px_rgba(255,0,0,0.6)] rounded-lg overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
          >
            {/* Header */}
            <div className="p-8 text-center border-b-4 border-red-500/50 bg-red-500/20 flex-shrink-0 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-red-500/30 rounded transition-colors"
                disabled // Cannot close without accepting
                title="You must accept the disclaimer to close"
              >
                <X size={24} className="text-red-400" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -15, 15, -15, 0] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-7xl mb-4"
              >
                ⚠️
              </motion.div>
              <h1 className="text-4xl font-black uppercase tracking-wider text-red-400 mb-2">
                AUTONOMOUS BOT DISCLAIMER
              </h1>
              <p className="text-xl text-red-300 font-bold">
                REQUIRED BEFORE BOT ACTIVATION
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You must read and accept this disclaimer to enable the autonomous trading bot
              </p>
            </div>

            {/* Scroll Progress Bar */}
            <div className="h-2 bg-red-500/30 relative overflow-hidden flex-shrink-0">
              <motion.div
                className="h-full bg-red-500 shadow-[0_0_20px_rgba(255,0,0,0.8)]"
                style={{ width: `${scrollProgress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${scrollProgress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>

            {/* Disclaimer Content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 p-8 bg-background/50 overflow-y-auto scrollbar-thin"
              style={{ maxHeight: 'calc(100vh - 28rem)' }}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {disclaimerText}
              </pre>
            </div>

            {/* Acceptance Section */}
            <div className="p-6 border-t-4 border-red-500/50 bg-red-500/10 space-y-4 flex-shrink-0">
              {(!canAccept) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-center text-red-300 bg-red-500/20 p-3 rounded font-bold"
                >
                  ⬇️ Scroll to 98% to unlock acceptance | Progress: {scrollProgress.toFixed(0)}%
                </motion.p>
              )}

              <div className={`space-y-3 transition-opacity ${canAccept ? 'opacity-100' : 'opacity-40'}`}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    id="bot-check-1"
                    checked={check1}
                    onCheckedChange={(checked) => setCheck1(checked === true)}
                    disabled={!canAccept}
                    className="mt-1"
                  />
                  <span className="text-sm font-medium leading-tight group-hover:text-red-400 transition-colors">
                    I understand the Bot operates autonomously and makes trading decisions without my intervention
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    id="bot-check-2"
                    checked={check2}
                    onCheckedChange={(checked) => setCheck2(checked === true)}
                    disabled={!canAccept}
                    className="mt-1"
                  />
                  <span className="text-sm font-medium leading-tight group-hover:text-red-400 transition-colors">
                    I understand the Bot does NOT guarantee profits and I may lose 100% of my capital
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    id="bot-check-3"
                    checked={check3}
                    onCheckedChange={(checked) => setCheck3(checked === true)}
                    disabled={!canAccept}
                    className="mt-1"
                  />
                  <span className="text-sm font-medium leading-tight group-hover:text-red-400 transition-colors">
                    I waive ALL claims against Quantum Falcon for any losses arising from the Bot's operation
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAccept}
                  disabled={!isAcceptEnabled}
                  className={`flex-1 uppercase tracking-wider font-bold text-lg py-6 ${
                    isAcceptEnabled
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_40px_rgba(255,0,0,0.6)] animate-pulse-glow'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                  size="lg"
                >
                  <AlertCircle size={24} className="mr-2" weight="fill" />
                  Accept All Risks & Enable Bot
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-2">
                By clicking "Accept", you acknowledge this is a legally binding agreement
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

