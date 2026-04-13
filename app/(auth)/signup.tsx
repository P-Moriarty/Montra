import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth-input';
import { Feather } from '@expo/vector-icons';

export default function SignupScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const handleSignup = () => {
    // Navigate to email verification
    router.replace('/verify-email');
  };

  const navigateToLogin = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]">
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
          <AuthInput icon="user" placeholder="Full name" />
          <AuthInput icon="mail" placeholder="Email" keyboardType="email-address" />
          <AuthInput icon="lock" placeholder="Create password" secureTextEntry />
          <AuthInput icon="lock" placeholder="Confirm password" secureTextEntry />
          <AuthInput icon="phone" placeholder="Phone number" keyboardType="phone-pad" />
          <AuthInput icon="gift" placeholder="Referral code" />

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
            className="bg-[#5E5CE6] h-16 rounded-[20px] items-center justify-center shadow-lg shadow-[#5E5CE6]/40"
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold">Sign Up</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-10">
            <Text className="text-[#1F2C37] text-base">Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text className="text-[#5E5CE6] text-base font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
