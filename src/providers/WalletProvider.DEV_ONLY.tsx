// src/providers/WalletProvider.DEV_ONLY.tsx
// This file ONLY loads in development mode — never in production builds
import React from 'react';

const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ONLY executes in development — safe to import here
  const { ConnectionProvider, WalletProvider: SolanaWalletProvider } = require('@solana/wallet-adapter-react');
  const { WalletModalProvider } = require('@solana/wallet-adapter-react-ui');
  const { PhantomWalletAdapter, SolflareWalletAdapter } = require('@solana/wallet-adapter-wallets');
  const { clusterApiUrl } = require('@solana/web3.js');
  const { useMemo } = require('react');

  const network = clusterApiUrl('mainnet-beta');
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={network}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProvider;
