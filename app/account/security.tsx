import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AccountService } from '@/services/modules/account.service';
import { BiometricService } from '@/services/biometric';
import { useApiMutation } from '@/hooks/api/use-api';
import { Toast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function SecurityScreen() {
  const { colors } = useTheme();
  const { isPinSet, isBiometricEnabled, setBiometricEnabled } = useAuth();
  const [twoFactor, setTwoFactor] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const [bioToggling, setBioToggling] = useState(false);

  const enableBioMutation = useApiMutation(AccountService.enableBiometric);
  const disableBioMutation = useApiMutation(AccountService.disableBiometric);

  const handleBiometricToggle = async (val: boolean) => {
    if (bioToggling) return;
    setBioToggling(true);
    try {
      if (val) {
        const status = await BiometricService.checkStatus();
        if (!status.available) {
          const msg = !status.hasHardware
            ? 'This device does not have biometric hardware'
            : 'No biometrics enrolled. Set up FaceID / fingerprint in your device settings first.';
          setToast({ visible: true, message: msg, type: 'error' });
          setBioToggling(false);
          return;
        }
        const authenticated = await BiometricService.authenticate('Enable biometric login');
        if (!authenticated) {
          setBioToggling(false);
          return;
        }
        await setBiometricEnabled(true);
        setToast({ visible: true, message: 'Biometrics enabled!', type: 'success' });
        enableBioMutation.mutate({ public_key: 'device_secure_enclave_key_0x123' });
      } else {
        await setBiometricEnabled(false);
        setToast({ visible: true, message: 'Biometrics disabled.', type: 'success' });
        disableBioMutation.mutate(undefined);
      }
    } catch (error: any) {
      const message = error.response?.data?.message;
      let errorText = 'Something went wrong.';
      if (typeof message === 'object') errorText = Object.values(message).join(', ');
      setToast({ visible: true, message: errorText, type: 'error' });
    } finally {
      setBioToggling(false);
    }
  };

  const securityItems = [
    { label: 'Set Transaction PIN', icon: 'shield-outline', description: 'Configure your first security code', route: '/account/set-pin', color: '#5154F4', disabled: isPinSet },
    { label: 'Change Transaction PIN', icon: 'key-outline', description: 'Update your current security code', route: '/account/change-pin', color: '#F59E0B', disabled: false },
    { label: 'Reset / Forgot PIN', icon: 'refresh-outline', description: 'Reset your PIN via email OTP', route: '/account/forgot-pin', color: '#10B981', disabled: false },
    { label: 'Change Password', icon: 'lock-open-outline', description: 'Update your account access code', route: '/account/change-password', color: '#6366F1', disabled: false },
    { label: 'Manage Devices', icon: 'hardware-chip-outline', description: 'View and manage logged in devices', route: '/account/devices', color: '#8B5CF6', disabled: false },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Security Hub</Text>
      </View>

      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Security Health Check Card */}
        {/* <View className="mt-6 mb-10">
          <View className="bg-white p-8 rounded-[40px] shadow-sm border border-white relative overflow-hidden">
             <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mr-4">
                   <Ionicons name="shield-checkmark" size={28} color="#22C55E" />
                </View>
                <View>
                   <Text className="text-[#1F2C37] text-lg font-bold">Security Score: 85%</Text>
                   <Text className="text-[#9DA3B6] text-xs font-medium">Your account is highly secure</Text>
                </View>
             </View>
             
          
             <View className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                <View className="w-[85%] h-full bg-[#22C55E] rounded-full" />
             </View>
          </View>
        </View> */}

        {/* Biometrics & Toggles */}
        <View className="mb-10">
          <Text className="text-xs font-bold uppercase tracking-widest ml-4 mb-4" style={{ color: colors.textSecondary }}>Device Security</Text>
          <View className="rounded-[40px] p-2 border" style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.border }}>
             <View className="flex-row items-center justify-between p-5 rounded-[32px] mb-1">
                <View className="flex-row items-center">
                   <View className="w-10 h-10 rounded-2xl items-center justify-center mr-4 shadow-sm" style={{ backgroundColor: colors.surface }}>
                      <MaterialCommunityIcons name="face-recognition" size={22} color={colors.text} />
                   </View>
                   <View>
                      <Text className="font-bold" style={{ color: colors.text }}>Biometrics</Text>
                      <Text className="text-[10px]" style={{ color: colors.textSecondary }}>Use FaceID / Fingerprint</Text>
                   </View>
                </View>
                <Switch 
                  value={isBiometricEnabled} 
                  onValueChange={handleBiometricToggle} 
                  trackColor={{ true: colors.primary, false: colors.switchTrackOff }}
                  thumbColor="white"
                  disabled={bioToggling}
                />
             </View>

             <View className="flex-row items-center justify-between p-5 rounded-[32px]">
                <View className="flex-row items-center">
                   <View className="w-10 h-10 rounded-2xl items-center justify-center mr-4 shadow-sm" style={{ backgroundColor: colors.surface }}>
                      <Ionicons name="notifications-outline" size={20} color={colors.text} />
                   </View>
                   <View>
                      <Text className="font-bold" style={{ color: colors.text }}>2FA App</Text>
                      <Text className="text-[10px]" style={{ color: colors.textSecondary }}>Authenticator integration</Text>
                   </View>
                </View>
                <Switch 
                  value={twoFactor} 
                  onValueChange={setTwoFactor} 
                  trackColor={{ true: colors.primary, false: colors.switchTrackOff }}
                  thumbColor="white"
                />
             </View>
          </View>
        </View>

        {/* Management List */}
        <View>
          <Text className="text-xs font-bold uppercase tracking-widest ml-4 mb-4" style={{ color: colors.textSecondary }}>Management</Text>
          <View className="rounded-[40px] p-2 border" style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.border }}>
            {securityItems.map((item, idx) => (
              <TouchableOpacity 
                key={idx}
                onPress={() => !item.disabled && item.route && router.push(item.route as any)}
                disabled={item.disabled}
                className={`flex-row items-center justify-between p-5 rounded-[32px] mb-3 shadow-sm border ${item.disabled ? 'opacity-50' : ''}`}
                style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}
                activeOpacity={item.disabled ? 1 : 0.7}
              >
                <View className="flex-row items-center">
                   <View 
                     className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                     style={{ backgroundColor: `${item.color}10` }}
                   >
                      <Ionicons name={item.icon as any} size={24} color={item.disabled ? colors.textSecondary : item.color} />
                   </View>
                   <View>
                      <Text className="font-bold text-[15px]" style={{ color: item.disabled ? colors.textSecondary : colors.text }}>{item.label}</Text>
                      <Text className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>{item.description}</Text>
                   </View>
                </View>
                <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: colors.chevronBg }}>
                    <Feather name="chevron-right" size={18} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
