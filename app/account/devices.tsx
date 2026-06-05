import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApiQuery, useApiMutation } from '@/hooks/api/use-api';
import { DeviceService } from '@/services/modules/device.service';
import { Toast } from '@/components/ui/toast';

const DUMMY_DEVICE_ID = 'device_secure_enclave_key_0x123';

export default function DevicesScreen() {
  const router = useRouter();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  // Fetch all devices
  const { data: devicesData, isLoading, refetch } = useApiQuery(
    ['devices'],
    () => DeviceService.getAll(DUMMY_DEVICE_ID)
  );

  const devices = devicesData?.data || [];

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
  const resendOtpMutation = useApiMutation(
    ({ email, deviceId }: { email: string, deviceId: string }) => DeviceService.resendOtp(deviceId, { email }),
    {
      onSuccess: () => {
        setToast({ visible: true, message: 'OTP sent to your email.', type: 'success' });
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to resend OTP.';
        setToast({ visible: true, message: typeof message === 'string' ? message : 'Error occurred', type: 'error' });
      }
    }
  );

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

  const handleResendOtp = () => {
    // In a real app, you would prompt for the email or use the authenticated user's email
    Alert.prompt(
      "Verify Device",
      "Enter your email to receive an OTP for this device.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send", onPress: (email: any) => {
            const currentDeviceId = devices[0]?.id || DUMMY_DEVICE_ID;
            if (email) resendOtpMutation.mutate({ email, deviceId: currentDeviceId });
          } 
        }
      ],
      'plain-text',
      ''
    );
  };

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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Manage Devices</Text>
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
          <Text className="text-[#9DA3B6] text-base leading-6">
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
              <Text className="text-[#9DA3B6] text-xs font-bold uppercase tracking-widest">Active Devices</Text>
              <TouchableOpacity onPress={handleResendOtp} disabled={resendOtpMutation.isPending}>
                <Text className="text-[#5E5CE6] text-xs font-bold uppercase tracking-widest mr-2">
                  {resendOtpMutation.isPending ? 'Sending...' : 'Verify This Device'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white/60 rounded-[40px] p-2 border border-white/40">
              {devices.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-[#9DA3B6] font-medium">No devices found.</Text>
                </View>
              ) : (
                devices.map((device: any, idx: number) => (
                  <View 
                    key={device.id || idx}
                    className="flex-row items-center justify-between p-5 rounded-[32px] bg-white mb-2 shadow-sm border border-gray-50"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 bg-[#5E5CE6]/10 rounded-2xl items-center justify-center mr-4">
                        <Ionicons name={device.type === 'ios' ? 'logo-apple' : device.type === 'android' ? 'logo-android' : 'hardware-chip-outline'} size={24} color="#5E5CE6" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#1F2C37] font-bold text-[15px]" numberOfLines={1}>
                          {device.name || 'Unknown Device'}
                        </Text>
                        <Text className="text-[#9DA3B6] text-[11px] font-medium mt-1">
                          Last active: {device.lastActive ? new Date(device.lastActive).toLocaleDateString() : 'Recently'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      className="w-10 h-10 bg-red-50 rounded-full items-center justify-center ml-2"
                      onPress={() => handleRemoveDevice(device.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Feather name="trash-2" size={18} color="#EF4444" />
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
