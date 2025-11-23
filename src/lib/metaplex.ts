// Metaplex Umi Setup for NFT Minting
// November 21, 2025 — Quantum Falcon Cockpit
// DISABLED: Solana wallet-adapter conflicts with React 19

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplCore } from '@metaplex-foundation/mpl-core'

// Stub PublicKey type to avoid Solana import
type PublicKey = any;

const RPC_ENDPOINT = import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com'

export const createMetaplexUmi = (
  publicKey: PublicKey | null,
  signTransaction?: any,
  signAllTransactions?: any
) => {
  // Temporarily disabled to prevent React 19 conflicts
  console.warn('[Metaplex] NFT minting temporarily disabled due to React 19 + Solana wallet-adapter conflicts');
  throw new Error('NFT minting temporarily disabled - Solana wallet-adapter not compatible with React 19')
}

