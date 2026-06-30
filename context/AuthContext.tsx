import { Config } from '@/constants/Config';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authSwitchboard } from '@/services/api/auth-switchboard';
import { AuthService } from '@/services/modules/auth.service';

interface AuthContextType {
  userToken: string | null;
  isLoading: boolean;
  isPinSet: boolean;
  isBiometricEnabled: boolean;
  isBiometricPending: boolean;
  signIn: (token: string, isPinSet?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  updatePinStatus: (pinSet: boolean) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  loginWithBiometric: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Industrial-Grade Auth Provider
 * Orchestrates global session state and secure token persistence for the cockpit.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isPinSet, setIsPinSet] = useState<boolean>(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [isBiometricPending, setIsBiometricPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Industrial-grade render audit
  console.log('[Auth Context] Current State:', { userTokenPresent: !!userToken, isLoading });

  // Initial session check on app launch
  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      try {
        const token = await SecureStore.getItemAsync(Config.auth.tokenKey);
        const storedIsPinSet = await SecureStore.getItemAsync('montra_is_pin_set');
        const storedBiometric = await SecureStore.getItemAsync('montra_biometric_enabled');
        console.log('[Auth Context] Session audit from SecureStore:', !!token);
        if (!mounted) return;
        if (token) {
          setUserToken(token);
          if (storedIsPinSet === 'true') setIsPinSet(true);
          if (storedBiometric === 'true') setIsBiometricEnabled(true);
        }
      } catch (e) {
        console.error('[Auth Context] Session restoration failed:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadSession();
    return () => { mounted = false; };
  }, []);

  // Absolute Session Termination Handshake
  useEffect(() => {
    const unsubscribe = authSwitchboard.on('session:expired', () => {
      console.log('[Auth Context] Absolute session expiration signal received. Synchronizing sign-out...');
      signOut();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (token: string, pinSet?: boolean) => {
    console.log('[Auth Context] signIn initiated with token length:', token?.length);
    try {
      // Anchor the token in secure storage FIRST to prevent race conditions
      await SecureStore.setItemAsync(Config.auth.tokenKey, token);
      if (pinSet !== undefined) {
        setIsPinSet(pinSet);
        await SecureStore.setItemAsync('montra_is_pin_set', pinSet ? 'true' : 'false');
      }
      // Then update UI state to trigger the dashboard reveal
      setUserToken(token);
      console.log('[Auth Context] signIn anchoring completed successfully.');
    } catch (e) {
      console.error('[Auth Context] signIn anchoring failed:', e);
    }
  };

  const updatePinStatus = async (pinSet: boolean) => {
    setIsPinSet(pinSet);
    await SecureStore.setItemAsync('montra_is_pin_set', pinSet ? 'true' : 'false');
  };

  const setBiometricEnabled = async (enabled: boolean) => {
    setIsBiometricEnabled(enabled);
    await SecureStore.setItemAsync('montra_biometric_enabled', enabled ? 'true' : 'false');
  };

  const loginWithBiometric = async (): Promise<boolean> => {
    setIsBiometricPending(true);
    try {
      const { BiometricService } = await import('@/services/biometric');
      const authenticated = await BiometricService.authenticate('Sign in to Montra');
      if (authenticated) {
        const token = await SecureStore.getItemAsync(Config.auth.tokenKey);
        if (token) {
          setUserToken(token);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('[Auth Context] Biometric login failed:', e);
      return false;
    } finally {
      setIsBiometricPending(false);
    }
  };

  const signOut = async () => {
    console.log('[Auth Context] signOut initiated.');
    try {
      try {
        await AuthService.logout();
      } catch (e) {
        console.error('[Auth Context] API logout failed, proceeding with local clear:', e);
      }
      setUserToken(null);
      setIsPinSet(false);
    } catch (e) {
      console.error('[Auth Context] signOut failed:', e);
    }
  };

  const authValue = useMemo(() => ({
    userToken,
    isLoading,
    isPinSet,
    isBiometricEnabled,
    isBiometricPending,
    signIn,
    signOut,
    updatePinStatus,
    setBiometricEnabled,
    loginWithBiometric,
  }), [userToken, isLoading, isPinSet, isBiometricEnabled, isBiometricPending]);

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
