import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();

  // Mock data fetching based on ID
  const transaction = {
    id,
    title: 'Transfer to Emezue chinonso',
    amount: '₦5,000.00',
    fee: '₦0.00',
    total: '₦5,000.00',
    date: 'Apr 16, 2025',
    time: '10:05 PM',
    status: 'Failed',
    type: 'Transfer',
    reference: 'MON-98327492-TR',
    recipient: {
      name: 'Emezue Chinonso',
      identifier: '08123456789 - Phone',
      bank: 'Gtbank'
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Details</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Status Badge & Amount */}
        <View className="items-center mt-8 mb-10">
          <View className={`w-20 h-20 ${transaction.status === 'Failed' ? 'bg-red-50' : 'bg-green-50'} rounded-full items-center justify-center mb-6`}>
             <Ionicons 
               name={transaction.status === 'Failed' ? "close" : "checkmark"} 
               size={40} 
               color={transaction.status === 'Failed' ? "#EF4444" : "#22C55E"} 
             />
          </View>
          <Text className="text-[#1F2C37] text-4xl font-extrabold mb-2">{transaction.amount}</Text>
          <Text className={`${transaction.status === 'Failed' ? 'text-red-500' : 'text-green-500'} font-bold`}>Transaction {transaction.status}</Text>
        </View>

        {/* Info Card */}
        <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 mb-6">
          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Recipient</Text>
            <View className="items-end max-w-[60%]">
              <Text className="text-[#1F2C37] font-bold text-right" numberOfLines={1}>{transaction.recipient.name}</Text>
              <Text className="text-[#9DA3B6] text-xs mt-1">{transaction.recipient.identifier}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Transaction Type</Text>
            <Text className="text-[#1F2C37] font-bold">{transaction.type}</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Date & Time</Text>
            <Text className="text-[#1F2C37] font-bold text-right">{transaction.date}, {transaction.time}</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Reference Code</Text>
            <Text className="text-[#1F2C37] font-bold">{transaction.reference}</Text>
          </View>

          <View className="h-[1px] bg-gray-100 mb-6" />

          <View className="flex-row justify-between mb-4">
            <Text className="text-[#6C7278] font-medium">Amount</Text>
            <Text className="text-[#1F2C37] font-bold">{transaction.amount}</Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="text-[#6C7278] font-medium">Fee</Text>
            <Text className="text-[#1F2C37] font-bold">{transaction.fee}</Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-[#1F2C37] font-extrabold text-lg">Total Amount</Text>
            <Text className="text-[#1F2C37] font-extrabold text-lg">{transaction.total}</Text>
          </View>
        </View>

        {/* Footer Actions */}
        <View className="flex-row gap-4 mb-10">
          <TouchableOpacity className="flex-1 bg-white border border-gray-100 py-5 rounded-[28px] items-center justify-center flex-row shadow-sm">
            <Feather name="share-2" size={20} color="#1F2C37" />
            <Text className="text-[#1F2C37] font-bold ml-2">Share</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="flex-1 bg-[#5154F4] py-5 rounded-[28px] items-center justify-center flex-row shadow-lg shadow-indigo-100"
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Repeat</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="items-center mb-10">
           <Text className="text-red-500 font-bold">Report a problem</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
