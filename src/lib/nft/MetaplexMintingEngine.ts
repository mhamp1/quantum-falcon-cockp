// METAPLEX CORE + UMI MINTING ENGINE — November 22, 2025
// Cheapest, fastest, most secure NFT minting

import { logger } from '../logger'
import { toast } from 'sonner'
import { ROYALTY_WALLET, ROYALTY_BASIS_POINTS } from './QuantumFalconNFTEngine'

// mhamp1 creator wallet address - receives 7.77% royalty on all secondary sales
// Set VITE_MHAMP1_WALLET in .env for your own wallet
const MHAMP1_WALLET = import.meta.env.VITE_MHAMP1_WALLET || import.meta.env.VITE_ROYALTY_WALLET || ROYALTY_WALLET

/**
 * Mint NFT using Metaplex Core + Umi
 * SACRED RULE: 7.77% royalty to mhamp1 wallet on EVERY secondary sale — forever
 */
export async function mintNFTWithMetaplex(
  wallet: any, // Wallet adapter
  metadataUri: string,
  name: string,
  options: {
    royaltyBasisPoints?: number
    creators?: Array<{ address: string; share: number }>
  } = {}
): Promise<string | null> {
  try {
    // Dynamic import to avoid Buffer issues
    const { generateSigner, publicKey } = await import('@metaplex-foundation/umi')
    const { createV1 } = await import('@metaplex-foundation/mpl-core')
    const { createMetaplexUmi } = await import('@/lib/metaplex')

    if (!wallet?.publicKey || !wallet?.signTransaction) {
      throw new Error('Wallet not connected')
    }

    // Initialize UMI
    const umi = createMetaplexUmi(
      wallet.publicKey,
      wallet.signTransaction,
      wallet.signAllTransactions
    )

    // Create asset signer
    const asset = generateSigner(umi)

    // Set creators with mhamp1 as royalty recipient
    const creators = options.creators || [{
      address: publicKey(MHAMP1_WALLET),
      share: 100
    }]

    // Mint NFT with 7.77% royalty to mhamp1
    await createV1(umi, {
      asset,
      name,
      uri: metadataUri,
      creators: creators.map(c => ({
        address: publicKey(c.address),
        share: c.share
      })),
      royalty: options.royaltyBasisPoints || ROYALTY_BASIS_POINTS, // 7.77% = 777 basis points
    }).sendAndConfirm(umi)

    const mintAddress = asset.publicKey.toString()

    logger.info(`[NFT] Minted NFT: ${name} at ${mintAddress}`)
    
    return mintAddress

  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown minting error')
    logger.error('[NFT] Minting failed', err)
    
    // SACRED RULE: No white screens — show beautiful cyberpunk toast
    toast.error('NFT Minting Failed', {
      description: err.message || 'Please try again later',
      duration: 5000,
      className: 'cyber-toast-error'
    })
    
    return null
  }
}

/**
 * Verify NFT was minted successfully
 */
export async function verifyNFTMint(mintAddress: string): Promise<boolean> {
  try {
    // TODO: Implement on-chain verification
    // Check if NFT exists on Solana blockchain
    return true
  } catch (error) {
    logger.error('[NFT] Verification failed', error)
    return false
  }
}

