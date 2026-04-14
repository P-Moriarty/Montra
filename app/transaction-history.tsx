import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const transactions = [
    {
      id: '1',
      title: 'Transfer to Emezue chinonso',
      date: 'Apr 03, 2025 10:05 PM',
      amount: 'N5,000.00',
      type: 'send',
      status: 'Failed',
    },
    {
      id: '2',
      title: 'Swap NGN to USD',
      date: 'Apr 02, 2025 03:00 PM',
      amount: '$200.00',
      type: 'receive',
      status: 'Completed',
    },
    {
      id: '3',
      title: 'Payment from Trefix compay',
      date: 'Mar 30, 2025 11:00 AM',
      amount: '$400.00',
      type: 'receive',
      status: 'Completed',
    },
    {
      id: '4',
      title: 'Transfer to Tegadesigns',
      date: 'Apr 03, 2025 10:05 PM',
      amount: '$100.00',
      type: 'send',
      status: 'Failed',
    },
    {
      id: '5',
      title: 'Swap USD to NGN',
      date: 'Apr 02, 2025 03:00 PM',
      amount: 'N14,000.00',
      type: 'receive',
      status: 'Completed',
    },
    {
      id: '6',
      title: 'Payment from Trefix compay',
      date: 'Mar 30, 2025 11:00 AM',
      amount: '$400.00',
      type: 'receive',
      status: 'Completed',
    },
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Transactions</Text>
      </View>

      {/* Search & Filter Row */}
      <View className="flex-row items-center px-5 mb-6">
        <View className="flex-1 flex-row items-center bg-white h-14 rounded-2xl px-4 border border-gray-100 shadow-sm">
          <Feather name="search" size={20} color="#9DA3B6" />
          <TextInput
            className="flex-1 ml-3 text-[#1F2C37] font-medium"
            placeholder="Search transaction"
            placeholderTextColor="#9DA3B6"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity className="w-14 h-14 bg-white rounded-2xl items-center justify-center ml-3 border border-gray-100 shadow-sm">
          <Feather name="sliders" size={20} color="#1F2C37" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Transaction List */}
        {transactions.map((item) => (
          <TouchableOpacity key={item.id} className="bg-white p-4 rounded-3xl flex-row items-center mb-3 border border-gray-50 shadow-sm">
            <View className={`w-12 h-12 ${item.status === 'Failed' ? 'bg-indigo-50' : 'bg-blue-50'} rounded-full items-center justify-center mr-4`}>
              <Feather 
                name={item.type === 'send' ? "send" : "download"} 
                size={20} 
                color="#5154F4" 
              />
            </View>
            <View className="flex-1">
              <Text className="text-[#1F2C37] font-bold text-base mb-1" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-[#9DA3B6] text-xs">{item.date}</Text>
            </View>
            <View className="items-end">
              <Text className={`text-[#1F2C37] font-bold text-base ${item.type === 'send' ? '' : 'text-green-600'}`}>
                {item.type === 'send' ? '-' : '+'}{item.amount}
              </Text>
              <View className={`${item.status === 'Failed' ? 'bg-red-50' : 'bg-green-50'} px-2 py-0.5 rounded-md mt-1 border ${item.status === 'Failed' ? 'border-red-100' : 'border-green-100'}`}>
                <Text className={`${item.status === 'Failed' ? 'text-red-500' : 'text-green-500'} text-[10px] font-bold`}>
                  {item.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
