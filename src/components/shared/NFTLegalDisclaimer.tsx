// NFT Legal Disclaimer Component — SEC-Proof
// November 22, 2025 — Quantum Falcon Cockpit

import { AlertCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export const NFT_LEGAL_DISCLAIMER_TEXT = `QUANTUM FALCON NFTs ARE DIGITAL COLLECTIBLES ONLY

These NFTs are non-fungible digital art and collectibles created for entertainment and artistic purposes.

They are NOT investment products, securities, or financial instruments.

There is NO promise of profit, utility, revenue share, staking rewards, governance rights, or future value appreciation.

Royalties are a voluntary creator fee only and do not represent profit sharing.

The value of these NFTs is subjective and may go to zero.

You are buying digital art — nothing more.

By minting or purchasing a Quantum Falcon NFT, you explicitly acknowledge:

• You are not investing
• You expect no financial return
• You accept 100% of the risk
• You will not hold the creator, team liable for any loss in value

Past performance of previous collections is not indicative of future results.

Quantum Falcon NFTs have no intrinsic value beyond what someone is willing to pay for the art.`

interface NFTLegalDisclaimerProps {
  className?: string
  variant?: 'banner' | 'inline' | 'modal'
}

export default function NFTLegalDisclaimer({ 
  className = '',
  variant = 'banner'
}: NFTLegalDisclaimerProps) {
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`cyber-card-accent p-4 border-l-4 border-destructive ${className}`}
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={24} className="text-destructive flex-shrink-0 mt-0.5" weight="fill" />
          <div className="flex-1 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-destructive text-sm">
              Legal Disclaimer — Digital Collectibles Only
            </h4>
            <pre className="text-xs whitespace-pre-wrap font-mono text-foreground leading-relaxed">
              {NFT_LEGAL_DISCLAIMER_TEXT}
            </pre>
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`text-xs text-muted-foreground space-y-1 ${className}`}>
        <div className="flex items-center gap-2 text-destructive font-bold">
          <AlertCircle size={14} weight="fill" />
          <span>Legal Notice</span>
        </div>
        <p className="text-[10px] leading-relaxed">
          Quantum Falcon NFTs are digital art collectibles only. Not investments. No profit promise. 
          Value may go to zero. You accept all risk.
        </p>
      </div>
    )
  }

  return null
}

