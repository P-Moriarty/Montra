import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { themeColors } from '@/constants/colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof themeColors.light;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'montra_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync(THEME_KEY).then((stored) => {
      if (!mounted) return;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
    });
    return () => { mounted = false; };
  }, []);

  const resolvedMode: 'light' | 'dark' =
    mode === 'system' ? (systemScheme ?? 'light') : mode;

  const isDark = resolvedMode === 'dark';

  const colors = useMemo(() => themeColors[resolvedMode], [resolvedMode]);

  const setMode = useMemo(() => async (newMode: ThemeMode) => {
    setModeState(newMode);
    await SecureStore.setItemAsync(THEME_KEY, newMode);
  }, []);

  const toggleTheme = useMemo(() => () => {
    setMode(isDark ? 'light' : 'dark');
  }, [isDark, setMode]);

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors,
      toggleTheme,
      setMode,
      resolvedMode,
    }),
    [mode, isDark, colors, toggleTheme, setMode, resolvedMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
