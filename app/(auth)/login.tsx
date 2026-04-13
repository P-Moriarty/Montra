import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth-input';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Navigate to the main app dashboard (tabs)
    router.replace('/(tabs)');
  };

  const navigateToSignup = () => {
    router.replace('/signup');
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
          <View className="mt-16 mb-12 items-center">
            <Text className="text-[#1F2C37] text-3xl font-bold mb-3">
              Welcome Back!
            </Text>
            <Text className="text-[#9DA3B6] text-base text-center leading-6">
              Sign in to continue managing your {"\n"}cross border finances
            </Text>
          </View>

          {/* Form Fields */}
          <AuthInput icon="mail" placeholder="Enter your email" keyboardType="email-address" />
          <AuthInput icon="lock" placeholder="Enter your password" secureTextEntry />

          {/* Remember Me & Forgot Password */}
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
            
            <TouchableOpacity>
              <Text className="text-[#5E5CE6] text-base font-bold">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            className="bg-[#5E5CE6] h-16 rounded-[20px] items-center justify-center shadow-lg shadow-[#5E5CE6]/40"
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold">Login</Text>
          </TouchableOpacity>

          {/* Signup Link */}
          <View className="flex-row justify-center mt-12">
            <Text className="text-[#1F2C37] text-base">Don’t have an account? </Text>
            <TouchableOpacity onPress={navigateToSignup}>
              <Text className="text-[#5E5CE6] text-base font-bold">Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
