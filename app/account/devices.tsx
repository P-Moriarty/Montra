import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApiQuery, useApiMutation } from '@/hooks/api/use-api';
import { DeviceService } from '@/services/modules/device.service';
import { Toast } from '@/components/ui/toast';
import { useTheme } from '@/context/ThemeContext';

export default function DevicesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  // Fetch all devices
  const { data: devicesData, isLoading, refetch } = useApiQuery(
    ['devices'],
    () => DeviceService.getAll()
  );

  const devices = devicesData?.devices?.devices || [];

  // Remove Device Mutation
  const removeMutation = useApiMutation(DeviceService.removeDevice, {
    onSuccess: () => {
      setToast({ visible: true, message: 'Device removed successfully.', type: 'success' });
      refetch();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove device.';
      setToast({ visible: true, message: typeof message === 'string' ? message : 'Error occurred', type: 'error' });
    }
  });

  // Resend OTP Mutation
  // const resendOtpMutation = useApiMutation(
  //   (data: { email: string }) => DeviceService.resendOtp(data),
  //   {
  //     onSuccess: () => {
  //       setToast({ visible: true, message: 'OTP sent to your email.', type: 'success' });
  //     },
  //     onError: (error: any) => {
  //       const message = error.response?.data?.message || 'Failed to resend OTP.';
  //       setToast({ visible: true, message: typeof message === 'string' ? message : 'Error occurred', type: 'error' });
  //     }
  //   }
  // );

  const handleRemoveDevice = (deviceId: string) => {
    Alert.alert(
      "Remove Device",
      "Are you sure you want to remove this device from your account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeMutation.mutate(deviceId) }
      ]
    );
  };

  // const handleResendOtp = () => {
  //   Alert.prompt(
  //     "Verify Device",
  //     "Enter your email to receive an OTP for this device.",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       { text: "Send", onPress: (email: any) => {
  //           if (email) resendOtpMutation.mutate({ email });
  //         } 
  //       }
  //     ],
  //     'plain-text',
  //     ''
  //   );
  // };

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
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Manage Devices</Text>
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
        <View className="mt-4 mb-6">
          <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
            Review the devices that have logged into your account. Remove any unrecognized devices to secure your account.
          </Text>
        </View>

        {isLoading ? (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator size="large" color="#5E5CE6" />
          </View>
        ) : (
          <View>
            <View className="flex-row justify-between items-center mb-4 ml-4">
              <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Active Devices</Text>
              {/* <TouchableOpacity onPress={handleResendOtp} disabled={resendOtpMutation.isPending}>
                <Text className="text-[#5E5CE6] text-xs font-bold uppercase tracking-widest mr-2">
                  {resendOtpMutation.isPending ? 'Sending...' : 'Verify This Device'}
                </Text>
              </TouchableOpacity> */}
            </View>

            <View className="rounded-[40px] p-2 border" style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.border }}>
              {devices.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="font-medium" style={{ color: colors.textSecondary }}>No devices found.</Text>
                </View>
              ) : (
                devices.map((device: any, idx: number) => (
                  <View 
                    key={device.id || idx}
                    className="flex-row items-center justify-between p-5 rounded-[32px] mb-2 shadow-sm border"
                    style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 bg-[#5E5CE6]/10 rounded-2xl items-center justify-center mr-4">
                        <Ionicons name="hardware-chip-outline" size={24} color="#5E5CE6" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-[15px]" style={{ color: colors.text }} numberOfLines={1}>
                          {device.device_name || 'Unknown Device'}
                        </Text>
                        <Text className="text-[11px] font-medium mt-1" style={{ color: colors.textSecondary }}>
                          {device.location || ''}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
                            {device.last_login_at
                              ? `Last login: ${new Date(device.last_login_at).toLocaleDateString()}`
                              : 'Recently'}
                          </Text>
                          {device.is_trusted ? (
                            <View className="ml-2 px-2 py-0.5 rounded-full bg-green-100">
                              <Text className="text-green-700 text-[10px] font-semibold">Trusted</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity 
                      className="w-10 h-10 rounded-full items-center justify-center ml-2"
                      style={{ backgroundColor: colors.errorLight }}
                      onPress={() => handleRemoveDevice(device.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Feather name="trash-2" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
