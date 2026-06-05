import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import 'react-native-reanimated';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes industrial-grade cache
      retry: 2,
    },
  },
});

function RootLayoutNav() {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const colorScheme = useColorScheme();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('montra_onboarding_complete').then(val => {
      setIsFirstLaunch(!val);
    });
  }, []);

  useEffect(() => {
    // Industrial-grade safeguards: Wait for session and navigation state readiness
    if (isLoading || !navigationState?.key || isFirstLaunch === null) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Industrial-grade diagnostics for navigation and session state
    console.log('[Auth Hub] Navigation Audit:', {
      tokenValue: userToken,
      tokenType: typeof userToken,
      segments,
      inAuthGroup,
      navReady: !!navigationState?.key
    });

    if (!userToken) {
      // If no token and it's the first launch, allow them to see the root index (onboarding)
      if (isFirstLaunch && !segments[0]) {
        return;
      }
      
      // Otherwise, if they aren't in the auth group and not on the login page, redirect to login
      if (!inAuthGroup && !segments.includes('login' as never)) {
        console.log('[Auth Hub] Redirecting to Gateway (Not authenticated and not in auth group)');
        router.replace('/login' as any);
      }
    } else if (userToken && (inAuthGroup || !segments[0])) {
      console.log('[Auth Hub] Session Anchored. Launching Dashboard via absolute path...');
      router.replace('/(tabs)' as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToken, isLoading, segments, navigationState?.key, isFirstLaunch]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}


export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
          <GluestackUIProvider mode="dark">
            <RootLayoutNav />
          </GluestackUIProvider>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
