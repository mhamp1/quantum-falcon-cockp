// src/providers/WalletProvider.tsx
import React from 'react';

const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In production: do absolutely nothing — no imports, no Solana, no crash
  if (import.meta.env.PROD) {
    return <>{children}</>;
  }

  // In development: dynamically load the real one
  const RealProvider = React.lazy(() => import('./WalletProvider.DEV_ONLY').then(m => ({ default: m.default })));
  return (
    <React.Suspense fallback={<div>Loading wallet (dev only)...</div>}>
      <RealProvider>{children}</RealProvider>
    </React.Suspense>
  );
};

export { WalletProvider };

