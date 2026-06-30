import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { BiometricService } from '@/services/biometric';

interface BiometricGateProps {
  children: React.ReactNode;
}

export default function BiometricGate({ children }: BiometricGateProps) {
  const { colors } = useTheme();
  const { isBiometricEnabled, loginWithBiometric, isLoading } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('FaceID');
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;
    (async () => {
      const status = await BiometricService.checkStatus();
      console.log('[BiometricGate] Status:', JSON.stringify(status));
      setAvailable(status.available);
      setBiometricLabel(status.type);
      if (!isBiometricEnabled || !status.available) {
        setUnlocked(true);
      } else {
        const ok = await loginWithBiometric();
        if (ok) {
          setUnlocked(true);
        } else {
          setFailed(true);
        }
      }
    })();
  }, [isBiometricEnabled, isLoading]);

  const handleRetry = async () => {
    setFailed(false);
    const ok = await loginWithBiometric();
    if (ok) {
      setUnlocked(true);
    } else {
      setFailed(true);
    }
  };

  if (isLoading || available === null) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (unlocked || !isBiometricEnabled || !available) {
    return <>{children}</>;
  }

  return (
    <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: colors.background }}>
      <View className="w-24 h-24 rounded-[32px] items-center justify-center mb-8" style={{ backgroundColor: colors.iconBg }}>
        <MaterialCommunityIcons name="face-recognition" size={48} color={colors.primary} />
      </View>
      <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
        {biometricLabel} Required
      </Text>
      <Text className="text-center mb-10 font-medium leading-6 px-4" style={{ color: colors.textSecondary }}>
        Authenticate to access your account securely
      </Text>
      {failed && (
        <Text className="text-sm mb-6 text-center" style={{ color: colors.error }}>
          Authentication failed. Please try again.
        </Text>
      )}
      <TouchableOpacity
        onPress={handleRetry}
        className="py-4 px-10 rounded-[28px] shadow-lg"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-white font-bold text-lg">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}
