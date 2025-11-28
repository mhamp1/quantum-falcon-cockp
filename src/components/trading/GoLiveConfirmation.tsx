// ═══════════════════════════════════════════════════════════════
// GO LIVE CONFIRMATION — Scary Warning for Real Money Trading
// CRITICAL safety dialog before enabling live trading
// November 28, 2025 — Quantum Falcon Cockpit
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Warning,
  Skull,
  Lightning,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Wallet,
  CurrencyDollar,
  Fire,
  Lock
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useKVSafe } from '@/hooks/useKVFallback'
import { useQuantumWallet } from '@/providers/WalletProvider'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface GoLiveConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

interface TradingMode {
  isLive: boolean
  confirmedAt: number
  riskAcknowledged: boolean
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function GoLiveConfirmation({ isOpen, onClose, onConfirm }: GoLiveConfirmationProps) {
  const { connected, publicKey, solBalance } = useQuantumWallet()
  
  const [step, setStep] = useState(1)
  const [acceptedRisks, setAcceptedRisks] = useState<string[]>([])
  const [confirmText, setConfirmText] = useState('')
  const [countdown, setCountdown] = useState(10)
  const [isCountdownComplete, setIsCountdownComplete] = useState(false)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setAcceptedRisks([])
      setConfirmText('')
      setCountdown(10)
      setIsCountdownComplete(false)
    }
  }, [isOpen])

  // Countdown timer for step 3
  useEffect(() => {
    if (step === 3 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (step === 3 && countdown === 0) {
      setIsCountdownComplete(true)
    }
  }, [step, countdown])

  const REQUIRED_RISKS = [
    'I understand I am trading with REAL money and can lose everything',
    'I have tested the bot in paper mode and understand its behavior',
    'I will never invest more than I can afford to lose',
    'I understand crypto markets are volatile and unpredictable',
    'I acknowledge Quantum Falcon is not financial advice',
    'I have secured my wallet and private keys',
  ]

  const handleRiskToggle = (risk: string) => {
    setAcceptedRisks(prev =>
      prev.includes(risk)
        ? prev.filter(r => r !== risk)
        : [...prev, risk]
    )
  }

  const canProceedStep1 = acceptedRisks.length === REQUIRED_RISKS.length
  const canProceedStep2 = confirmText === 'GO LIVE'
  const canConfirm = isCountdownComplete && connected && publicKey

  const handleFinalConfirm = () => {
    if (!canConfirm) return

    toast.success('🚀 LIVE TRADING ENABLED', {
      description: 'You are now trading with real money. Be careful!',
      duration: 8000,
      className: 'border-2 border-destructive bg-destructive/20',
    })

    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-2 border-destructive bg-background/95 backdrop-blur-xl overflow-hidden">
        {/* Animated danger border */}
        <div className="absolute inset-0 border-4 border-destructive/50 animate-pulse pointer-events-none" />
        
        {/* Warning stripes */}
        <div className="absolute inset-x-0 top-0 h-8 bg-[repeating-linear-gradient(45deg,#ef4444_0px,#ef4444_10px,#000_10px,#000_20px)] opacity-50" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-[repeating-linear-gradient(45deg,#ef4444_0px,#ef4444_10px,#000_10px,#000_20px)] opacity-50" />

        <DialogHeader className="relative z-10 pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-destructive/20 border-2 border-destructive rounded-lg animate-pulse">
              <Skull size={32} weight="fill" className="text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-wider text-destructive flex items-center gap-2">
                <Warning size={24} weight="fill" />
                DANGER ZONE
                <Warning size={24} weight="fill" />
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                You are about to enable REAL MONEY trading
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="relative z-10 space-y-6 py-4">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 justify-center">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 flex items-center justify-center text-sm font-bold
                  ${step >= s
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-muted text-muted-foreground'
                  } ${step === s ? 'ring-2 ring-destructive ring-offset-2 ring-offset-background' : ''}`}
              >
                {s}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Risk Acknowledgment */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-destructive mb-4 flex items-center gap-2">
                    <Fire size={20} weight="fill" />
                    Acknowledge All Risks
                  </h3>
                  
                  <div className="space-y-3">
                    {REQUIRED_RISKS.map((risk) => (
                      <div
                        key={risk}
                        className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-all
                          ${acceptedRisks.includes(risk)
                            ? 'bg-destructive/10 border-destructive'
                            : 'border-muted hover:border-destructive/50'
                          }`}
                        onClick={() => handleRiskToggle(risk)}
                      >
                        <Checkbox
                          checked={acceptedRisks.includes(risk)}
                          className="mt-0.5 border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                        />
                        <span className="text-sm">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    <XCircle size={18} className="mr-2" />
                    Cancel (Stay Safe)
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    <Warning size={18} className="mr-2" />
                    I Accept All Risks ({acceptedRisks.length}/{REQUIRED_RISKS.length})
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Type Confirmation */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-destructive mb-4 flex items-center gap-2">
                    <Lock size={20} weight="fill" />
                    Type "GO LIVE" to Confirm
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    This action cannot be undone. You will be trading with real cryptocurrency.
                  </p>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-destructive">
                      Type exactly: GO LIVE
                    </Label>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                      placeholder="Type here..."
                      className="border-destructive/50 focus:border-destructive text-xl font-mono tracking-widest uppercase text-center"
                    />
                    {confirmText && confirmText !== 'GO LIVE' && (
                      <p className="text-xs text-destructive">
                        Please type exactly: GO LIVE
                      </p>
                    )}
                    {canProceedStep2 && (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle size={16} weight="fill" />
                        <span>Confirmation matched</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    <Warning size={18} className="mr-2" />
                    Final Confirmation
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Final Warning & Wallet Check */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-destructive mb-4 flex items-center gap-2">
                    <Skull size={20} weight="fill" />
                    FINAL WARNING
                  </h3>

                  <div className="text-center mb-6">
                    <p className="text-2xl font-black text-destructive mb-2">
                      ⚠️ YOU ARE ABOUT TO TRADE REAL MONEY ⚠️
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Losses are permanent. Gains are not guaranteed.
                    </p>
                  </div>

                  {/* Wallet Status */}
                  <div className="p-4 bg-background/50 border border-muted rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Wallet Status</span>
                      {connected ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle size={14} weight="fill" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-destructive text-sm">
                          <XCircle size={14} weight="fill" />
                          Not Connected
                        </span>
                      )}
                    </div>
                    
                    {connected && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Address</span>
                          <span className="text-xs font-mono text-primary">
                            {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">SOL Balance</span>
                          <span className="flex items-center gap-1 text-primary font-bold">
                            <CurrencyDollar size={14} />
                            {solBalance.toFixed(4)} SOL
                          </span>
                        </div>
                      </>
                    )}

                    {!connected && (
                      <p className="text-xs text-destructive mt-2">
                        You must connect your wallet to enable live trading.
                      </p>
                    )}
                  </div>

                  {/* Countdown */}
                  {!isCountdownComplete && (
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Please wait and read all warnings carefully
                      </p>
                      <div className="text-4xl font-black text-destructive">
                        {countdown}
                      </div>
                    </div>
                  )}

                  {isCountdownComplete && (
                    <div className="text-center mb-4">
                      <ShieldCheck size={48} className="text-destructive mx-auto mb-2" />
                      <p className="text-sm text-green-400">
                        All checks passed. You may proceed.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    <XCircle size={18} className="mr-2" />
                    Cancel (Stay in Paper Mode)
                  </Button>
                  <Button
                    onClick={handleFinalConfirm}
                    disabled={!canConfirm}
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    <Lightning size={18} weight="fill" className="mr-2" />
                    {!isCountdownComplete
                      ? `Wait ${countdown}s...`
                      : !connected
                      ? 'Connect Wallet First'
                      : 'GO LIVE — TRADE REAL MONEY'
                    }
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════
// TRADING MODE HOOK
// ═══════════════════════════════════════════════════════════════

export function useTradingMode() {
  const [tradingMode, setTradingMode] = useKVSafe<TradingMode>('qf-trading-mode', {
    isLive: false,
    confirmedAt: 0,
    riskAcknowledged: false,
  })

  const enableLiveTrading = () => {
    setTradingMode({
      isLive: true,
      confirmedAt: Date.now(),
      riskAcknowledged: true,
    })
  }

  const disableLiveTrading = () => {
    setTradingMode({
      isLive: false,
      confirmedAt: 0,
      riskAcknowledged: false,
    })
    
    toast.success('Paper Mode Enabled', {
      description: 'You are now trading in simulation mode.',
    })
  }

  return {
    isLive: tradingMode?.isLive ?? false,
    tradingMode,
    enableLiveTrading,
    disableLiveTrading,
  }
}

export { GoLiveConfirmation }

