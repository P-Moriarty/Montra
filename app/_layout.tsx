import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';

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

  useEffect(() => {
    // Industrial-grade safeguards: Wait for session and navigation state readiness
    if (isLoading || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Industrial-grade diagnostics for navigation and session state
    console.log('[Auth Hub] Navigation Audit:', {
      tokenValue: userToken,
      tokenType: typeof userToken,
      segments,
      inAuthGroup,
      navReady: !!navigationState?.key
    });

    // const currentRoute = segments.join('/');

    if (!userToken && !inAuthGroup && !segments.includes('login' as never)) {
      console.log('[Auth Hub] Redirecting to Gateway (Not authenticated and not in auth group)');
      router.replace('/login' as any);
    } else if (userToken && inAuthGroup) {
      console.log('[Auth Hub] Session Anchored. Launching Dashboard via absolute path...');
      router.replace('/(tabs)' as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToken, isLoading, segments, navigationState?.key]);

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
        <GluestackUIProvider mode="dark">
          <RootLayoutNav />
        </GluestackUIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
