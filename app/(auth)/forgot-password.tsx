import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth-input';
import { Ionicons } from '@expo/vector-icons';
import { useApiMutation } from '@/hooks/api/use-api';
import { AuthService } from '@/services/modules/auth.service';
import { Toast } from '@/components/ui/toast';
import { useTheme } from '@/context/ThemeContext';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const forgotPasswordMutation = useApiMutation(AuthService.forgotPassword, {
    onSuccess: () => {
      setToast({ visible: true, message: 'Password reset OTP sent to your email!', type: 'success' });
      setTimeout(() => {
        router.push(`/(auth)/verify-reset-password?email=${encodeURIComponent(email)}` as any);
      }, 1000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to request reset.';
      setToast({ visible: true, message: typeof message === 'string' ? message : 'An error occurred', type: 'error' });
    }
  });

  const handleResetPassword = () => {
    if (!email) {
      setToast({ visible: true, message: 'Please enter your email.', type: 'error' });
      return;
    }
    forgotPasswordMutation.mutate({ email });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-6 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
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
            <Text className="text-3xl font-bold mb-3" style={{ color: colors.text }}>
              Forgot Password?
            </Text>
            <Text className="text-base text-center leading-6" style={{ color: colors.textSecondary }}>
              Don’t worry! It happens. Please enter the {"\n"}email address associated with your account.
            </Text>
          </View>

          {/* Form Fields */}
          <AuthInput 
            icon="mail" 
            placeholder="Enter your email" 
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Spacer */}
          <View className="h-4" />

          {/* Send Button */}
          <TouchableOpacity 
            className="h-16 rounded-[20px] items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.primaryAuth, shadowColor: colors.primaryAuth }}
            onPress={handleResetPassword}
            activeOpacity={0.8}
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Send Reset Link</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <View className="flex-row justify-center mt-12">
            <Text className="text-base" style={{ color: colors.text }}>Wait, I remember my password? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-base font-bold" style={{ color: colors.primaryAuth }}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
