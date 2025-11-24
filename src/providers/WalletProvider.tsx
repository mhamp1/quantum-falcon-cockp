// TEMPORARY FIX: Solana Wallet Provider Disabled
// Reason: React 19 + Solana wallet-adapter conflict causing white page
// The Solana wallet-adapter packages have internal React 18 dependencies
// that conflict with React 19, causing React APIs to become undefined
// 
// TODO: Re-enable Solana integration by doing one of the following:
// 1. Monitor https://github.com/solana-labs/wallet-adapter/issues for React 19 support
// 2. Check if @solana/wallet-adapter-react version > 0.15.39 supports React 19
// 3. Alternatively, downgrade to React 18.3.1 if Solana integration is critical
// 4. Restore original code from git history when ready
//
// November 24, 2025 — Quantum Falcon Cockpit

import { ReactNode } from 'react'

interface WalletProviderProps {
  children: ReactNode
}

/**
 * STUB Wallet Provider - Temporarily disabled Solana integration
 * This prevents the React 19 + Solana wallet-adapter conflict
 * that was causing the white page issue.
 */
export function WalletProvider({ children }: WalletProviderProps) {
  // Simply pass through children without Solana wallet context
  // This eliminates the React version conflict
  return <>{children}</>
}

