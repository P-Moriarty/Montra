import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AccountService } from '../../services/modules/account.service';
import { useApiMutation } from '@/hooks/api/use-api';
import { Toast } from '../../components/ui/toast';

export default function ForgotPinScreen() {
  const [email, setEmail] = useState('');
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
    <SafeAreaView className="flex-1 bg-[#F8F9FE]" edges={['top']}>
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
          className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm border border-gray-50"
        >
          <Ionicons name="chevron-back" size={24} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-12">Account Recovery</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-8 pt-10">
          <View className="w-20 h-20 bg-[#5154F4]/10 rounded-[32px] items-center justify-center mb-8 self-center">
            <MaterialCommunityIcons 
                name={step === 'email' ? 'email-outline' : step === 'otp' ? 'shield-key-outline' : 'check-decagram-outline'} 
                size={32} 
                color="#5154F4" 
            />
          </View>

          <Text className="text-2xl font-bold text-[#1F2C37] mb-2 text-center">
            {step === 'email' ? 'Forgot PIN?' : step === 'otp' ? 'Enter OTP' : 'Verification Complete'}
          </Text>
          <Text className="text-[#9DA3B6] text-center mb-10 font-medium leading-6 px-4">
            {step === 'email' 
              ? 'Enter the email address associated with your account to receive a reset code.' 
              : step === 'otp' 
                ? `A 6-digit verification code has been sent to ${email}.` 
                : 'Your identity has been verified. You can now proceed to set a new PIN.'}
          </Text>

          {step === 'email' && (
            <View className="w-full">
              <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center border border-gray-100 shadow-sm mb-6">
                  <Feather name="mail" size={20} color="#9DA3B6" className="mr-3" />
                  <TextInput
                      className="flex-1 text-[#1F2C37] font-bold text-lg"
                      placeholder="Email Address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      autoFocus
                  />
              </View>
              <TouchableOpacity 
                  onPress={() => email.includes('@') && forgotPinMutation.mutate(undefined)}
                  className={`w-full h-16 rounded-2xl items-center justify-center ${email.includes('@') ? 'bg-[#5154F4]' : 'bg-gray-200'}`}
                  disabled={forgotPinMutation.isPending || !email.includes('@')}
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
                  <View key={idx} className="w-12 h-14 bg-white rounded-2xl items-center justify-center border border-gray-100 shadow-sm">
                    <TextInput
                      className="text-xl font-bold text-[#1F2C37] text-center w-full h-full"
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
                <Text className={`font-bold ${timer === 0 ? 'text-[#5154F4]' : 'text-[#9DA3B6]'}`}>
                  {resendMutation.isPending ? 'Resending...' : timer === 0 ? 'Resend Code' : `Resend code in ${timer}s`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'success' && (
             <TouchableOpacity 
                onPress={() => router.push('/account/set-pin')}
                className="w-full h-16 rounded-2xl bg-[#10B981] items-center justify-center mt-6 shadow-lg shadow-emerald-200"
             >
                <Text className="text-white font-bold text-lg">Set New PIN Now</Text>
             </TouchableOpacity>
          )}

          {verifyMutation.isPending && (
            <View className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-50 flex-row items-center self-center mt-8">
              <ActivityIndicator color="#5154F4" size="small" />
              <Text className="ml-3 text-[#5154F4] font-bold">Verifying OTP...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
