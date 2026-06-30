import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AccountService } from '../../services/modules/account.service';
import { useApiMutation } from '@/hooks/api/use-api';
import { Toast } from '../../components/ui/toast';
import { useTheme } from '@/context/ThemeContext';

export default function ForgotPinScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const [timer, setTimer] = useState(60);

  const forgotPinMutation = useApiMutation(AccountService.forgotPin, {
    onSuccess: () => {
      setToast({ visible: true, message: 'Verification code sent!', type: 'success' });
      setStep('otp');
      setTimer(60);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send OTP';
      setToast({ visible: true, message: String(message), type: 'error' });
    }
  });

  const resendMutation = useApiMutation(AccountService.resendPinOtp, {
    onSuccess: () => {
      setToast({ visible: true, message: 'Verification code resent!', type: 'success' });
      setTimer(60);
    }
  });

  const verifyMutation = useApiMutation(AccountService.verifyPinReset, {
    onSuccess: () => {
      setToast({ visible: true, message: 'OTP Verified Successfully!', type: 'success' });
      setStep('success');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      let errorText = 'Invalid OTP or verification failed';
      
      if (typeof message === 'object') {
        errorText = Object.values(message).join(', ');
      } else if (message) {
        errorText = String(message);
      }
      
      setToast({ visible: true, message: errorText, type: 'error' });
      setOtp(['', '', '', '', '', '']);
    }
  });

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleOtpInput = (val: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (newOtp.every(d => d !== '')) {
      verifyMutation.mutate({
        email: email,
        verification_code: newOtp.join('')
      });
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-6">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm border"
          style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-12" style={{ color: colors.text }}>Account Recovery</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-8 pt-10">
          <View className="w-20 h-20 rounded-[32px] items-center justify-center mb-8 self-center" style={{ backgroundColor: colors.iconBg }}>
            <MaterialCommunityIcons 
                name={step === 'email' ? 'email-outline' : step === 'otp' ? 'shield-key-outline' : 'check-decagram-outline'} 
                size={32} 
                color={colors.primary}
            />
          </View>

          <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
            {step === 'email' ? 'Forgot PIN?' : step === 'otp' ? 'Enter OTP' : 'Verification Complete'}
          </Text>
          <Text className="text-center mb-10 font-medium leading-6 px-4" style={{ color: colors.textSecondary }}>
            {step === 'email' 
              ? 'Enter the email address associated with your account to receive a reset code.' 
              : step === 'otp' 
                ? `A 6-digit verification code has been sent to ${email}.` 
                : 'Your identity has been verified. You can now proceed to set a new PIN.'}
          </Text>

          {step === 'email' && (
            <View className="w-full">
              <View className="rounded-2xl px-4 py-4 flex-row items-center border shadow-sm mb-6" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
                  <Feather name="mail" size={20} color={colors.textSecondary} className="mr-3" />
                  <TextInput
                      className="flex-1 font-bold text-lg"
                      style={{ color: colors.text }}
                      placeholder="Email Address"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      autoFocus
                  />
              </View>
              <View className="rounded-2xl px-4 py-4 flex-row items-center border shadow-sm mb-6" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
                  <Feather name="lock" size={20} color={colors.textSecondary} className="mr-3" />
                  <TextInput
                      className="flex-1 font-bold text-lg"
                      style={{ color: colors.text }}
                      placeholder="Password"
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      value={password}
                      onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
              </View>
              <TouchableOpacity 
                  onPress={() => email.includes('@') && password.length > 0 && forgotPinMutation.mutate({ email, password })}
                  className="w-full h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: email.includes('@') && password.length > 0 ? colors.primary : colors.disabledBg }}
                  disabled={forgotPinMutation.isPending || !email.includes('@') || password.length === 0}
              >
                  {forgotPinMutation.isPending ? (
                      <ActivityIndicator color="white" />
                  ) : (
                      <Text className="text-white font-bold text-lg">Send Reset Code</Text>
                  )}
              </TouchableOpacity>
            </View>
          )}

          {step === 'otp' && (
            <View className="items-center">
              <View className="flex-row justify-center space-x-2 gap-2 mb-8">
                {otp.map((digit, idx) => (
                  <View key={idx} className="w-12 h-14 rounded-2xl items-center justify-center border shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
                    <TextInput
                      className="text-xl font-bold text-center w-full h-full"
                      style={{ color: colors.text }}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => handleOtpInput(val, idx)}
                      autoFocus={idx === 0}
                    />
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                onPress={() => timer === 0 && resendMutation.mutate(undefined)}
                disabled={timer > 0 || resendMutation.isPending}
                className="mt-4"
              >
                <Text className="font-bold" style={{ color: timer === 0 ? colors.primary : colors.textSecondary }}>
                  {resendMutation.isPending ? 'Resending...' : timer === 0 ? 'Resend Code' : `Resend code in ${timer}s`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'success' && (
             <TouchableOpacity 
                onPress={() => router.push('/account/set-pin')}
                className="w-full h-16 rounded-2xl items-center justify-center mt-6 shadow-lg"
                style={{ backgroundColor: colors.green }}
             >
                <Text className="text-white font-bold text-lg">Set New PIN Now</Text>
             </TouchableOpacity>
          )}

          {verifyMutation.isPending && (
            <View className="px-6 py-3 rounded-2xl shadow-sm border flex-row items-center self-center mt-8" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text className="ml-3 font-bold" style={{ color: colors.primary }}>Verifying OTP...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
