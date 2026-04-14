import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DepositNGNScreen() {
  const router = useRouter();

  const accountInfo = [
    { label: 'Account number', value: '3749266383' },
    { label: 'Account name', value: 'Ifeanyi Chukwudi' },
    { label: 'Bank name', value: 'Young Money Mfb Ltd' },
  ];

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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Deposit NGN</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <Text className="text-[#1F2C37] text-lg font-medium mt-6 mb-8">
          Use these account details to receive funds securely.
        </Text>

        {/* Account Details Card */}
        <View className="bg-[#F8F9FB] p-8 rounded-[32px] border border-gray-100 shadow-sm mb-10">
          {accountInfo.map((info, index) => (
            <View key={index} className={index !== accountInfo.length - 1 ? 'mb-8' : ''}>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[#1F2C37] text-xl font-bold">{info.value}</Text>
                <TouchableOpacity>
                  <Ionicons name="copy-outline" size={22} color="#9DA3B6" />
                </TouchableOpacity>
              </View>
              <Text className="text-[#9DA3B6] text-sm">{info.label}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-[#F6F6F6] py-5 rounded-2xl mr-2 shadow-sm border border-gray-100">
            <Feather name="share" size={20} color="#1F2C37" />
            <Text className="text-[#1F2C37] font-bold ml-2">Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-[#F0F1FF] py-5 rounded-2xl ml-2 shadow-sm border border-blue-50">
            <Ionicons name="copy-outline" size={20} color="#5154F4" />
            <Text className="text-[#5154F4] font-bold ml-2">Copy all</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
