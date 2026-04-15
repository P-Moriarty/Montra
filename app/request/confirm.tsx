import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function RequestConfirmScreen() {
  const params = useLocalSearchParams();

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
               source={{ uri: 'https://i.pravatar.cc/150?u=chinonso' }} 
               className="w-full h-full"
             />
          </View>
          <Text className="text-[#1F2C37] text-xl font-bold mb-1">{params.name || 'Emezue Chinonso'}</Text>
          <Text className="text-[#9DA3B6] text-sm">{params.identifier || '707293 - Pay ID'}</Text>
        </View>

        {/* Amount Summary */}
        <View className="bg-white/80 w-full p-8 rounded-[40px] mt-10">
          <View className="items-center mb-10">
            <Text className="text-[#1F2C37] text-4xl font-extrabold">{params.amount || '₦10,000.00'}</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Debit</Text>
            <View className="items-end">
              <Text className="text-[#1F2C37] font-bold text-right">Available balance</Text>
              <Text className="text-[#9DA3B6] text-xs">(₦20,000.00)</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Fee</Text>
            <Text className="text-[#1F2C37] font-bold">₦0.00</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Narration</Text>
            <Text className="text-[#1F2C37] font-bold">{params.narration || 'For feeding'}</Text>
          </View>

          <View className="h-[1px] bg-gray-100 mb-6" />

          <View className="flex-row justify-between">
            <Text className="text-[#6C7278] font-bold">Total</Text>
            <Text className="text-[#1F2C37] text-lg font-bold">{params.amount || '₦10,000.00'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mt-16 mb-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="flex-1 bg-gray-100 py-5 rounded-[28px]"
          >
            <Text className="text-[#1F2C37] text-center text-lg font-bold">Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
             onPress={() => router.push('/request/authorize')}
             className="flex-1 bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100"
          >
            <Text className="text-white text-center text-lg font-bold">Accept</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
