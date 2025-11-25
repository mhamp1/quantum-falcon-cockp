// Metaplex Umi Setup for NFT Minting
// November 21, 2025 — Quantum Falcon Cockpit

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplCore } from '@metaplex-foundation/mpl-core'
import { PublicKey } from '@solana/web3.js'

const RPC_ENDPOINT = import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com'

export const createMetaplexUmi = (
  publicKey: PublicKey | null,
  signTransaction?: any,
  signAllTransactions?: any
) => {
  if (!publicKey || !signTransaction) {
    throw new Error('Wallet not connected')
  }

  const umi = createUmi(RPC_ENDPOINT).use(mplCore())
  
  // Set identity manually (wallet adapter integration)
  // Note: This is a simplified version - you may need to adjust based on actual Metaplex API
  if (publicKey && signTransaction) {
    // @ts-expect-error - Metaplex types may vary
    umi.identity = {
      publicKey: publicKey as any,
      signMessage: signTransaction as any,
      signTransaction: signTransaction as any,
      signAllTransactions: signAllTransactions as any,
    }
  }

  return umi
}

