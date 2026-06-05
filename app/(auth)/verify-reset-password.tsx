import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth-input';
import { Ionicons } from '@expo/vector-icons';
import { useApiMutation } from '@/hooks/api/use-api';
import { AuthService } from '@/services/modules/auth.service';
import { Toast } from '@/components/ui/toast';

export default function VerifyResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [verificationCode, setVerificationCode] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const verifyOtpMutation = useApiMutation(AuthService.verifyResetPasswordOtp, {
    onSuccess: () => {
      setToast({ visible: true, message: 'Password reset verified!', type: 'success' });
      // In a real app, this might navigate back to login, or to a "create new password" screen if the API returns a token.
      // Based on instructions, we just call the endpoint. We'll navigate to login.
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Verification failed.';
      setToast({ visible: true, message: typeof message === 'string' ? message : 'Invalid OTP', type: 'error' });
    }
  });

  const resendOtpMutation = useApiMutation(AuthService.resendOtp, {
    onSuccess: () => {
      setToast({ visible: true, message: 'OTP resent to your email.', type: 'success' });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to resend OTP.';
      setToast({ visible: true, message: typeof message === 'string' ? message : 'Failed to resend', type: 'error' });
    }
  });

  const handleVerify = () => {
    if (!verificationCode) {
      setToast({ visible: true, message: 'Please enter the verification code.', type: 'error' });
      return;
    }
    verifyOtpMutation.mutate({ email: email || '', verification_code: verificationCode });
  };

  const handleResend = () => {
    if (!email) return;
    resendOtpMutation.mutate({ email });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-6 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
          >
            <Ionicons name="arrow-back" size={20} color="#1F2C37" />
          </TouchableOpacity>
        </View>

        <Toast 
          visible={toast.visible} 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
        />

        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mt-8 mb-12 items-center">
            <Text className="text-[#1F2C37] text-3xl font-bold mb-3">
              Verify OTP
            </Text>
            <Text className="text-[#9DA3B6] text-base text-center leading-6">
              Enter the verification code sent to {"\n"}{email}
            </Text>
          </View>

          {/* Form Fields */}
          <AuthInput 
            icon="key" 
            placeholder="Verification Code" 
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
          />

          {/* Spacer */}
          <View className="h-4" />

          {/* Send Button */}
          <TouchableOpacity 
            className="bg-[#5E5CE6] h-16 rounded-[20px] items-center justify-center shadow-lg shadow-[#5E5CE6]/40"
            onPress={handleVerify}
            activeOpacity={0.8}
            disabled={verifyOtpMutation.isPending}
          >
            {verifyOtpMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Resend Option */}
          <View className="flex-row justify-center mt-12">
            <Text className="text-[#1F2C37] text-base">Didn&apos;t receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resendOtpMutation.isPending}>
              <Text className="text-[#5E5CE6] text-base font-bold">
                {resendOtpMutation.isPending ? 'Resending...' : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
