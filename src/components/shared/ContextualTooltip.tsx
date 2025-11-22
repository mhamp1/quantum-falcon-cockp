// Contextual Tooltip — First-Time User Guidance
// November 21, 2025 — Quantum Falcon Cockpit
// Shows helpful tooltips for first-time actions

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X } from '@phosphor-icons/react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { Button } from '@/components/ui/button'

interface ContextualTooltipProps {
  id: string
  message: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  showOnce?: boolean
  delay?: number
}

export function ContextualTooltip({
  id,
  message,
  position = 'top',
  showOnce = true,
  delay = 1000,
}: ContextualTooltipProps) {
  const [hasSeen, setHasSeen] = useKV<boolean>(`tooltip-seen-${id}`, false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (showOnce && hasSeen) return

    const timer = setTimeout(() => {
      setShow(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [hasSeen, showOnce, delay, show])

  const handleDismiss = () => {
    setShow(false)
    if (showOnce) {
      setHasSeen(true)
    }
  }

  if (!show || (showOnce && hasSeen)) return null

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`fixed ${positionClasses[position]} z-[99997] pointer-events-none`}
        >
          <div className="cyber-card p-4 max-w-xs border-2 border-primary/40 bg-card/95 backdrop-blur-xl pointer-events-auto">
            <div className="flex items-start gap-3">
              <Info size={20} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground leading-relaxed">{message}</p>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-6 text-xs"
                >
                  Got it
                </Button>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

