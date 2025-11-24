// TEMPORARY FIX: Solana Wallet Provider Disabled
// Reason: React 19 + Solana wallet-adapter conflict causing white page
// The Solana wallet-adapter packages have internal React 18 dependencies
// that conflict with React 19, causing React APIs to become undefined
// 
// TODO: Re-enable once Solana wallet-adapter supports React 19
// or downgrade to React 18.3.1
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

