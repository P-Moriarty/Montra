import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CustomKeypad } from '@/components/custom-keypad';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    // Navigate to Login after verification
    router.replace('/login');
  };

  const goBack = () => {
    router.replace('/signup');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]">
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
            Enter it below to continue
          </Text>
        </View>

        {/* OTP Input Boxes */}
        <View className="flex-row justify-between mt-10 mb-8">
          {otp.map((digit, index) => (
            <View 
              key={index} 
              className={`w-[50px] h-[64px] rounded-xl border-2 items-center justify-center ${currentIndex === index ? 'border-[#5E5CE6]' : 'border-gray-100'}`}
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
          className="bg-[#5E5CE6] h-16 rounded-[20px] items-center justify-center shadow-lg shadow-[#5E5CE6]/40"
          onPress={handleVerify}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">Verify</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Keypad */}
      <CustomKeypad onPress={handleKeyPress} onDelete={handleDelete} />
    </SafeAreaView>
  );
}
