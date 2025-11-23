import React from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

// TEMPORARY FIX: Disable Solana wallet in production to avoid React 19 + web3.js crash
const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (import.meta.env.PROD) {
    console.log('Solana wallet disabled in production (temporary React 19 fix)');
    return <>{children}</>;
  }

  // Only runs in development — your original code below
  const network = clusterApiUrl('mainnet-beta');
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={network}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export { WalletProvider };
