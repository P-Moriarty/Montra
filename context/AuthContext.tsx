import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Config } from '@/constants/Config';

interface AuthContextType {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Industrial-Grade Auth Provider
 * Orchestrates global session state and secure token persistence for the cockpit.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Industrial-grade render audit
  console.log('[Auth Context] Current State:', { userTokenPresent: !!userToken, isLoading });

  // Initial session check on app launch
  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await SecureStore.getItemAsync(Config.auth.tokenKey);
        console.log('[Auth Context] Session audit from SecureStore:', !!token);
        if (token) {
          setUserToken(token);
        }
      } catch (e) {
        console.error('[Auth Context] Session restoration failed:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const signIn = async (token: string) => {
    console.log('[Auth Context] signIn initiated with token length:', token?.length);
    try {
      // Set state first for immediate UI responsiveness
      setUserToken(token);
      await SecureStore.setItemAsync(Config.auth.tokenKey, token);
      console.log('[Auth Context] signIn anchoring completed successfully.');
    } catch (e) {
      console.error('[Auth Context] signIn anchoring failed:', e);
    }
  };

  const signOut = async () => {
    console.log('[Auth Context] signOut initiated.');
    try {
      await SecureStore.deleteItemAsync(Config.auth.tokenKey);
      setUserToken(null);
    } catch (e) {
      console.error('[Auth Context] signOut failed:', e);
    }
  };

  const authValue = useMemo(() => ({
    userToken,
    isLoading,
    signIn,
    signOut
  }), [userToken, isLoading]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access the high-fidelity Auth session.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
