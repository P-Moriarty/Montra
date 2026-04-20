import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth-input';
import { Feather } from '@expo/vector-icons';
import { SignupSchema } from '@/services/api/validation';
import { AuthService } from '@/services/modules/auth.service';
import { useApiMutation } from '@/hooks/api/use-api';
import { Toast } from '@/components/ui/toast';

export default function SignupScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: '',
    referral_code: ''
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  // Industrial-grade validation check
  const errors: any = useMemo(() => {
    const result = SignupSchema.safeParse(form);
    if (result.success) return {};
    return result.error.flatten().fieldErrors;
  }, [form]);

  const isValid = Object.keys(errors).length === 0 &&
    form.full_name.length > 0 &&
    form.email.length > 0 &&
    form.password.length > 0 &&
    agreed;

  const signupMutation = useApiMutation(AuthService.register, {
    onSuccess: () => {
      setToast({ visible: true, message: 'Account created successfully!', type: 'success' });
      // Redirect to verification with email param
      setTimeout(() => {
        router.replace({
          pathname: '/verify-email',
          params: { email: form.email }
        });
      }, 1500);
    },
    onError: (error: any) => {
      // Robust error parsing for industrial-grade validation objects
      const data = error.response?.data;
      let message = 'Registration failed. Please try again.';

      if (typeof data?.message === 'string') {
        message = data.message;
      } else if (typeof data?.errors === 'object') {
        // Extract the first error message from the object
        const firstError = Object.values(data.errors)[0];
        message = Array.isArray(firstError) ? firstError[0] : String(firstError);
      } else if (typeof data === 'object' && !data.message) {
        // Handle direct object responses
        const firstValue = Object.values(data)[0];
        message = Array.isArray(firstValue) ? firstValue[0] : String(firstValue);
      }

      setToast({ visible: true, message: String(message), type: 'error' });
    }
  });

  const handleSignup = () => {
    if (isValid) {
      signupMutation.mutate(form);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
          <View className="mt-8 mb-10 items-center">
            <Text className="text-[#1F2C37] text-2xl font-bold mb-2">
              Create Your Montra Account
            </Text>
            <Text className="text-[#9DA3B6] text-base text-center">
              Manage your money across currencies
            </Text>
          </View>

          {/* Form Fields */}
          <View className="mb-1">
            <AuthInput
              icon="user"
              placeholder="Full name"
              value={form.full_name}
              onChangeText={(v) => updateField('full_name', v)}
            />
            {form.full_name.length > 0 && errors.full_name && (
              <Text className="text-red-500 text-xs ml-4 mb-2">{errors.full_name[0]}</Text>
            )}
          </View>

          <View className="mb-1">
            <AuthInput
              icon="mail"
              placeholder="Email"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(v) => updateField('email', v)}
              autoCapitalize="none"
            />
            {form.email.length > 0 && errors.email && (
              <Text className="text-red-500 text-xs ml-4 mb-2">{errors.email[0]}</Text>
            )}
          </View>

          <View className="mb-1">
            <AuthInput
              icon="lock"
              placeholder="Create password"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              value={form.password}
              onChangeText={(v) => updateField('password', v)}
            />
            {form.password.length > 0 && errors.password && (
              <Text className="text-red-500 text-xs ml-4 mb-2">{errors.password[0]}</Text>
            )}
          </View>

          <View className="mb-1">
            <AuthInput
              icon="lock"
              placeholder="Confirm password"
              secureTextEntry={!showConfirmPassword}
              rightIcon={showConfirmPassword ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              value={form.confirm_password}
              onChangeText={(v) => updateField('confirm_password', v)}
            />
            {form.confirm_password.length > 0 && errors.confirm_password && (
              <Text className="text-red-500 text-xs ml-4 mb-2">{errors.confirm_password[0]}</Text>
            )}
          </View>

          <View className="mb-1">
            <AuthInput
              icon="phone"
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={form.phone_number}
              onChangeText={(v) => updateField('phone_number', v)}
            />
            {form.phone_number.length > 0 && errors.phone_number && (
              <Text className="text-red-500 text-xs ml-4 mb-2">{errors.phone_number[0]}</Text>
            )}
          </View>

          <AuthInput
            icon="gift"
            placeholder="Referral code (Optional)"
            value={form.referral_code}
            onChangeText={(v) => updateField('referral_code', v)}
          />

          {/* Terms & Conditions */}
          <TouchableOpacity
            className="flex-row items-center mb-8"
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View className={`w-6 h-6 rounded-md items-center justify-center border ${agreed ? 'bg-[#5E5CE6] border-[#5E5CE6]' : 'border-gray-300'}`}>
              {agreed && <Feather name="check" size={16} color="white" />}
            </View>
            <Text className="text-[#1F2C37] text-base ml-3">
              I agree to the Terms and Condition
            </Text>
          </TouchableOpacity>

          {/* Signup Button */}
          <TouchableOpacity
            className={`h-16 rounded-[20px] items-center justify-center shadow-lg ${isValid ? 'bg-[#5E5CE6] shadow-[#5E5CE6]/40' : 'bg-gray-400'
              }`}
            onPress={handleSignup}
            activeOpacity={0.8}
            disabled={!isValid || signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-10">
            <Text className="text-[#1F2C37] text-base">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-[#5E5CE6] text-base font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
