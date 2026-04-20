import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth-input';
import { Feather } from '@expo/vector-icons';
import { LoginSchema } from '@/services/api/validation';
import { AuthService } from '@/services/modules/auth.service';
import { useApiMutation } from '@/hooks/api/use-api';
import { Toast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  // Industrial-grade validation check
  const errors = useMemo(() => {
    const result = LoginSchema.safeParse({ email, password });
    if (result.success) return {};
    return result.error.flatten().fieldErrors;
  }, [email, password]);

  const isValid = LoginSchema.safeParse({ email, password }).success;
  const loginMutation = useApiMutation(AuthService.login, {
    onSuccess: async (data: any) => {
      console.log('[Auth Hub] Login Success Payload Audit:', data);

      // Robust token extraction mirroring the AuthService engine
      const token = data?.token ||
        data?.access_token ||
        data?.user?.token ||
        data?.user?.access_token ||
        data?.data?.token ||
        data?.data?.access_token;

      if (token) {
        console.log('[Auth Hub] Token Verified. Length:', token.length, 'Anchoring session...');
        setToast({ visible: true, message: data.message || 'Authentication successful!', type: 'success' });

        // Immediate session anchoring
        try {
          await signIn(token);
          console.log('[Auth Hub] Session anchored successfully.');
        } catch (authError) {
          console.error('[Auth Hub] Session anchoring failed:', authError);
        }
      } else {
        const message = data?.message || 'Verification successful but no session token received.';
        console.warn('[Auth Hub] Handshake Alert:', message);
        setToast({ visible: true, message: String(message), type: 'error' });
      }
    },
    onError: (error: any) => {
      // Robust error parsing for industrial-grade validation objects
      const data = error.response?.data;
      let message = 'Invalid credentials or server error';

      if (typeof data?.message === 'string') {
        message = data.message;
      } else if (typeof data?.errors === 'object') {
        const firstError = Object.values(data.errors)[0];
        message = Array.isArray(firstError) ? firstError[0] : String(firstError);
      } else if (typeof data === 'object' && !data.message) {
        const firstValue = Object.values(data)[0];
        message = Array.isArray(firstValue) ? firstValue[0] : String(firstValue);
      }

      setToast({ visible: true, message: String(message), type: 'error' });
    }
  });

  const handleLogin = () => {
    if (isValid) {
      loginMutation.mutate({ email, password });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mt-16 mb-12 items-center">
            <Text className="text-[#1F2C37] text-3xl font-bold mb-3 text-center">
              Welcome Back!
            </Text>
            <Text className="text-[#9DA3B6] text-base text-center leading-6">
              Sign in to continue managing your {"\n"}cross border finances
            </Text>
          </View>

          {/* Form Fields */}
          <View className="mb-2">
            <AuthInput
              icon="mail"
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            {email.length > 0 && errors.email && (
              <Text className="text-red-500 text-xs ml-4 mb-2">{errors.email[0]}</Text>
            )}
          </View>

          <View className="mb-2">
            <AuthInput
              icon="lock"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              value={password}
              onChangeText={setPassword}
            />
            {password.length > 0 && errors.password && (
              <Text className="text-red-500 text-xs ml-4 mb-2">{errors.password[0]}</Text>
            )}
          </View>

          {/* ... Remember Me & Forgot Password ... */}
          <View className="flex-row justify-between items-center mb-10">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View className={`w-5 h-5 rounded-md items-center justify-center border ${rememberMe ? 'bg-[#5E5CE6] border-[#5E5CE6]' : 'border-gray-300'}`}>
                {rememberMe && <Feather name="check" size={14} color="white" />}
              </View>
              <Text className="text-[#6C7278] text-base ml-2">Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text className="text-[#5E5CE6] text-base font-bold">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className={`h-16 rounded-[20px] items-center justify-center shadow-lg ${isValid ? 'bg-[#5E5CE6] shadow-[#5E5CE6]/40' : 'bg-gray-400'
              }`}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={!isValid || loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Login</Text>
            )}
          </TouchableOpacity>

          {/* Signup Link */}
          <View className="flex-row justify-center mt-12">
            <Text className="text-[#1F2C37] text-base">Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text className="text-[#5E5CE6] text-base font-bold">Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
