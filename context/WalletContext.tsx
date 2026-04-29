import React, { createContext, useContext, useState } from 'react';

interface WalletContextType {
  selectedCurrencyCode: string;
  setSelectedCurrencyCode: (code: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('NGN');

  return (
    <WalletContext.Provider value={{ selectedCurrencyCode, setSelectedCurrencyCode }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
