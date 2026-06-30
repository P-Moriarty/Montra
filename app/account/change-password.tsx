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

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const changePasswordMutation = useApiMutation(AuthService.changePassword, {
    onSuccess: () => {
      setToast({ visible: true, message: 'Password changed successfully!', type: 'success' });
      setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password.';
      setToast({ visible: true, message: typeof message === 'string' ? message : 'Invalid details provided', type: 'error' });
    }
  });

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setToast({ visible: true, message: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ visible: true, message: 'Please fill in all fields.', type: 'error' });
      return;
    }
    
    changePasswordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmPassword,
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Change Password</Text>
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
          {/* Form Fields */}
          <View className="mt-8">
            <AuthInput 
              icon="lock" 
              placeholder="Current Password" 
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            
            <View className="h-4" />

            <AuthInput 
              icon="shield" 
              placeholder="New Password" 
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View className="h-4" />

            <AuthInput 
              icon="shield" 
              placeholder="Confirm New Password" 
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Spacer */}
          <View className="h-8" />

          {/* Send Button */}
          <TouchableOpacity 
            className="bg-[#5E5CE6] h-16 rounded-[20px] items-center justify-center shadow-lg shadow-[#5E5CE6]/40"
            onPress={handleChangePassword}
            activeOpacity={0.8}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
               <ActivityIndicator color="white" />
            ) : (
               <Text className="text-white text-lg font-bold">Update Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
