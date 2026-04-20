import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CustomKeypad } from '@/components/custom-keypad';
import { useApiMutation } from '@/hooks/api/use-api';
import { AuthService } from '@/services/modules/auth.service';
import { Toast } from '@/components/ui/toast';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const verifyMutation = useApiMutation(AuthService.verifyAccount, {
    onSuccess: (data) => {
      console.log('[Auth Hub] Verification Success:', data);
      setToast({ visible: true, message: 'Account verified successfully!', type: 'success' });
      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    },
    onError: (error: any) => {
      const data = error.response?.data;
      const message = data?.message || 'Verification failed. Please check your code.';
      setToast({ visible: true, message: String(message), type: 'error' });
    }
  });

  const handleKeyPress = (digit: string) => {
    if (currentIndex < 6) {
      const newOtp = [...otp];
      newOtp[currentIndex] = digit;
      setOtp(newOtp);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDelete = () => {
    if (currentIndex > 0) {
      const newOtp = [...otp];
      newOtp[currentIndex - 1] = '';
      setOtp(newOtp);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6 && email) {
      verifyMutation.mutate({ email, verification_code: otpCode });
    } else {
      setToast({ visible: true, message: 'Please enter all 6 digits', type: 'error' });
    }
  };

  const goBack = () => {
    router.replace('/signup');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]">
      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />
      <View className="px-6 flex-1">
        {/* Back Button */}
        <TouchableOpacity 
          className="w-12 h-12 rounded-full bg-gray-50 items-center justify-center mt-4" 
          onPress={goBack}
        >
          <Feather name="arrow-left" size={24} color="#1F2C37" />
        </TouchableOpacity>

        {/* Header */}
        <View className="mt-8 mb-4 items-center">
          <Text className="text-[#1F2C37] text-2xl font-bold mb-3">
            Verify your Email
          </Text>
          <Text className="text-[#9DA3B6] text-base text-center leading-6">
            We sent a 6-digit code to your email{"\n"}
            <Text className="text-[#1F2C37] font-bold">{email || 'your email'}</Text>
          </Text>
        </View>

        {/* OTP Input Boxes */}
        <View className="flex-row justify-between mt-10 mb-8">
          {otp.map((digit, index) => (
            <View 
              key={index} 
              className={`w-[50px] h-[64px] rounded-xl border-2 items-center justify-center ${currentIndex === index ? 'border-[#5E5CE6]' : 'border-gray-100'} bg-white`}
            >
              <Text className="text-[#1F2C37] text-2xl font-bold">{digit}</Text>
            </View>
          ))}
        </View>

        {/* Resend Link */}
        <View className="flex-row justify-center mb-10">
          <Text className="text-[#1F2C37] text-base">Didn’t receive any code? </Text>
          <TouchableOpacity>
            <Text className="text-[#5E5CE6] text-base font-bold">Resend code</Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <TouchableOpacity 
          className={`h-16 rounded-[20px] items-center justify-center shadow-lg ${
            currentIndex === 6 ? 'bg-[#5E5CE6] shadow-[#5E5CE6]/40' : 'bg-gray-400'
          }`}
          onPress={handleVerify}
          activeOpacity={0.8}
          disabled={currentIndex < 6 || verifyMutation.isPending}
        >
          {verifyMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">Verify</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Keypad */}
      <CustomKeypad onPress={handleKeyPress} onDelete={handleDelete} />
    </SafeAreaView>
  );
}
