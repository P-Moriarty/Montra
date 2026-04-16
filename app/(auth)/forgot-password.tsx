import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth-input';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    // Logic for password reset (e.g., call API)
    // For now, let's assume it sends an email and maybe navigates to a verification screen
    alert("Password reset email sent!");
    router.back();
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

        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mt-8 mb-12 items-center">
            <Text className="text-[#1F2C37] text-3xl font-bold mb-3">
              Forgot Password?
            </Text>
            <Text className="text-[#9DA3B6] text-base text-center leading-6">
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
            className="bg-[#5E5CE6] h-16 rounded-[20px] items-center justify-center shadow-lg shadow-[#5E5CE6]/40"
            onPress={handleResetPassword}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold">Send Reset Link</Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <View className="flex-row justify-center mt-12">
            <Text className="text-[#1F2C37] text-base">Wait, I remember my password? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-[#5E5CE6] text-base font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
