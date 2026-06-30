import { TransferService } from '@/services/modules/transfer.service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

export default function RequestConfirmScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const [isDeclining, setIsDeclining] = React.useState(false);

  const handleDecline = async () => {
    try {
      setIsDeclining(true);
      await TransferService.actionRequest({
        request_id: params.id as string,
        status: 'rejected',
        auth_method: 'none',
        credential: '',
      });
      Alert.alert('Success', 'Request declined successfully');
      router.dismissAll();
      router.push('/(tabs)');
    } catch (error) {
      console.error('Failed to decline request:', error);
      Alert.alert('Error', 'Failed to decline request');
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Confirm Request</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Beneficiary Header */}
        <View className="mt-10 items-center">
          <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4 overflow-hidden shadow-lg border-4 border-white">
            <Image
              source={{ uri: `https://i.pravatar.cc/150?u=${params.identifier}` }}
              className="w-full h-full"
            />
          </View>
          <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>{params.name || 'Unknown User'}</Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>{params.identifier || 'No ID'} - Pay ID</Text>
        </View>

        {/* Amount Summary */}
        <View className="w-full p-8 rounded-[40px] mt-10" style={{ backgroundColor: colors.surfaceSecondary }}>
          <View className="items-center mb-10">
            <Text className="text-4xl font-extrabold" style={{ color: colors.text }}>₦{Number(params.amount || 0).toLocaleString()}</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Debit</Text>
            <View className="items-end">
              <Text className="font-bold text-right" style={{ color: colors.text }}>Available balance</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>(Checking...)</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Fee</Text>
            <Text className="font-bold" style={{ color: colors.text }}>₦0.00</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Narration</Text>
            <Text className="font-bold" style={{ color: colors.text }}>{params.narration || 'No narration provided'}</Text>
          </View>

          <View className="h-[1px] mb-6" style={{ backgroundColor: colors.cardBorder }} />

          <View className="flex-row justify-between">
            <Text className="font-bold" style={{ color: colors.textTertiary }}>Total</Text>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>₦{Number(params.amount || 0).toLocaleString()}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mt-16 mb-10">
          <TouchableOpacity
            onPress={handleDecline}
            disabled={isDeclining}
            className="flex-1 py-5 rounded-[28px] items-center justify-center" style={{ backgroundColor: colors.cardSecondary }}
          >
            {isDeclining ? <ActivityIndicator color={colors.text} /> : <Text className="text-center text-lg font-bold" style={{ color: colors.text }}>Decline</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/request/authorize',
              params: { ...params, status: 'accepted' }
            })}
            className="flex-1 py-5 rounded-[28px] shadow-lg shadow-indigo-100" style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white text-center text-lg font-bold">Accept</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
