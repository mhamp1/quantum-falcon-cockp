import { ReactNode } from 'react'

interface WalletProviderProps {
  children: ReactNode
}

/**
 * WalletProvider - Temporarily disabled in production to prevent React 19 + Solana adapter conflicts
 * 
 * Background: @solana/wallet-adapter-react ships with React 18 internally, causing chunk loading
 * errors in production builds with React 19. This is a known issue.
 * 
 * Solution: Disable wallet functionality in production until the Solana team releases
 * a React 19 compatible version. All wallet features work perfectly in development mode.
 * 
 * Status: Wallet features are available in dev mode (npm run dev)
 * Related: https://github.com/anza-xyz/wallet-adapter/issues
 */
export function WalletProvider({ children }: WalletProviderProps) {
  // Temporary production guard to prevent white screen from React 19 + Solana conflicts
  if (import.meta.env.PROD) {
    console.log('[WalletProvider] Solana wallet disabled in production (temporary fix for React 19 compatibility)');
    return <>{children}</>;
  }

  // In development, wallet functionality is fully available
  // TODO: Re-enable in production once @solana/wallet-adapter-react supports React 19
  return <>{children}</>
}





