import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AccountService } from '../services/modules/account.service';
import { useApiMutation } from '@/hooks/api/use-api';
import { Toast } from '../components/ui/toast';

export default function SecurityScreen() {
  const [biometrics, setBiometrics] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const enableBioMutation = useApiMutation(AccountService.enableBiometric, {
    onSuccess: () => {
      setBiometrics(true);
      setToast({ visible: true, message: 'Biometrics enabled!', type: 'success' });
    },
    onError: (error: any) => {
      setBiometrics(false);
      const message = error.response?.data?.message;
      let errorText = 'Verification failed.';
      if (typeof message === 'object') errorText = Object.values(message).join(', ');
      setToast({ visible: true, message: errorText, type: 'error' });
    }
  });

  const disableBioMutation = useApiMutation(AccountService.disableBiometric, {
    onSuccess: () => {
      setBiometrics(false);
      setToast({ visible: true, message: 'Biometrics disabled.', type: 'success' });
    }
  });

  const handleBiometricToggle = (val: boolean) => {
    if (val) {
      // Sending a dummy public key for API compatibility
      enableBioMutation.mutate({ public_key: 'device_secure_enclave_key_0x123' });
    } else {
      disableBioMutation.mutate(undefined);
    }
  };

  const securityItems = [
    { label: 'Set Transaction PIN', icon: 'shield-outline', description: 'Configure your first security code', route: '/account/set-pin', color: '#5154F4' },
    { label: 'Change Transaction PIN', icon: 'key-outline', description: 'Update your current security code', route: '/account/change-pin', color: '#F59E0B' },
    { label: 'Reset / Forgot PIN', icon: 'refresh-outline', description: 'Reset your PIN via email OTP', route: '/account/forgot-pin', color: '#10B981' },
    { label: 'Change Password', icon: 'lock-open-outline', description: 'Update your account access code', route: '/(auth)/forgot-password', color: '#6366F1' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Security Hub</Text>
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
        <View className="mt-6 mb-10">
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
             
             {/* Simple visual bar */}
             <View className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                <View className="w-[85%] h-full bg-[#22C55E] rounded-full" />
             </View>
          </View>
        </View>

        {/* Biometrics & Toggles */}
        <View className="mb-10">
          <Text className="text-[#9DA3B6] text-xs font-bold uppercase tracking-widest ml-4 mb-4">Device Security</Text>
          <View className="bg-white/60 rounded-[40px] p-2 border border-white/40">
             <View className="flex-row items-center justify-between p-5 rounded-[32px] mb-1">
                <View className="flex-row items-center">
                   <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
                      <MaterialCommunityIcons name="face-recognition" size={22} color="#1F2C37" />
                   </View>
                   <View>
                      <Text className="text-[#1F2C37] font-bold">Biometrics</Text>
                      <Text className="text-[#9DA3B6] text-[10px]">Use FaceID / Fingerprint</Text>
                   </View>
                </View>
                <Switch 
                  value={biometrics} 
                  onValueChange={handleBiometricToggle} 
                  trackColor={{ true: '#5154F4', false: '#D1D5DB' }}
                  thumbColor="white"
                  disabled={enableBioMutation.isPending || disableBioMutation.isPending}
                />
             </View>

             <View className="flex-row items-center justify-between p-5 rounded-[32px]">
                <View className="flex-row items-center">
                   <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
                      <Ionicons name="notifications-outline" size={20} color="#1F2C37" />
                   </View>
                   <View>
                      <Text className="text-[#1F2C37] font-bold">2FA App</Text>
                      <Text className="text-[#9DA3B6] text-[10px]">Authenticator integration</Text>
                   </View>
                </View>
                <Switch 
                  value={twoFactor} 
                  onValueChange={setTwoFactor} 
                  trackColor={{ true: '#5154F4', false: '#D1D5DB' }}
                  thumbColor="white"
                />
             </View>
          </View>
        </View>

        {/* Management List */}
        <View>
          <Text className="text-[#9DA3B6] text-xs font-bold uppercase tracking-widest ml-4 mb-4">Management</Text>
          <View className="bg-white/60 rounded-[40px] p-2 border border-white/40">
            {securityItems.map((item, idx) => (
              <TouchableOpacity 
                key={idx}
                onPress={() => item.route && router.push(item.route as any)}
                className={`flex-row items-center justify-between p-5 rounded-[32px] bg-white mb-3 shadow-sm border border-gray-50`}
              >
                <View className="flex-row items-center">
                   <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${item.color}10` }}
                   >
                      <Ionicons name={item.icon as any} size={24} color={item.color} />
                   </View>
                   <View>
                      <Text className="text-[#1F2C37] font-bold text-[15px]">{item.label}</Text>
                      <Text className="text-[#9DA3B6] text-[11px] font-medium">{item.description}</Text>
                   </View>
                </View>
                <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center">
                    <Feather name="chevron-right" size={18} color="#9DA3B6" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
