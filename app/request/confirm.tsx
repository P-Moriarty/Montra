import { TransferService } from '@/services/modules/transfer.service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RequestConfirmScreen() {
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
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Confirm Request</Text>
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
          <Text className="text-[#1F2C37] text-xl font-bold mb-1">{params.name || 'Unknown User'}</Text>
          <Text className="text-[#9DA3B6] text-sm">{params.identifier || 'No ID'} - Pay ID</Text>
        </View>

        {/* Amount Summary */}
        <View className="bg-white/80 w-full p-8 rounded-[40px] mt-10">
          <View className="items-center mb-10">
            <Text className="text-[#1F2C37] text-4xl font-extrabold">₦{Number(params.amount || 0).toLocaleString()}</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Debit</Text>
            <View className="items-end">
              <Text className="text-[#1F2C37] font-bold text-right">Available balance</Text>
              <Text className="text-[#9DA3B6] text-xs">(Checking...)</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Fee</Text>
            <Text className="text-[#1F2C37] font-bold">₦0.00</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Narration</Text>
            <Text className="text-[#1F2C37] font-bold">{params.narration || 'No narration provided'}</Text>
          </View>

          <View className="h-[1px] bg-gray-100 mb-6" />

          <View className="flex-row justify-between">
            <Text className="text-[#6C7278] font-bold">Total</Text>
            <Text className="text-[#1F2C37] text-lg font-bold">₦{Number(params.amount || 0).toLocaleString()}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mt-16 mb-10">
          <TouchableOpacity
            onPress={handleDecline}
            disabled={isDeclining}
            className="flex-1 bg-gray-100 py-5 rounded-[28px] items-center justify-center"
          >
            {isDeclining ? <ActivityIndicator color="#1F2C37" /> : <Text className="text-[#1F2C37] text-center text-lg font-bold">Decline</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/request/authorize',
              params: { ...params, status: 'accepted' }
            })}
            className="flex-1 bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100"
          >
            <Text className="text-white text-center text-lg font-bold">Accept</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
