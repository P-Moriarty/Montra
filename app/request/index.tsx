import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RequestMoneyScreen() {
  const [activeTab, setActiveTab] = useState<'request' | 'pending'>('request');
  const [payID, setPayID] = useState('');
  const [accountName, setAccountName] = useState('');
  const [narration, setNarration] = useState('');

  const pendingRequests = [
    { id: '1', name: 'Emezue chi...', date: 'Apr 03, 2025 10:05 PM', amount: '₦10,000.00', status: 'Pending' },
    { id: '2', name: 'Emezue chi...', date: 'Apr 03, 2025 10:05 PM', amount: '₦10,000.00', status: 'Pending' },
    { id: '3', name: 'Emezue chi...', date: 'Apr 03, 2025 10:05 PM', amount: '₦10,000.00', status: 'Pending' },
    { id: '4', name: 'Emezue chi...', date: 'Apr 03, 2025 10:05 PM', amount: '₦10,000.00', status: 'Pending' },
    { id: '5', name: 'Emezue chi...', date: 'Apr 03, 2025 10:05 PM', amount: '₦10,000.00', status: 'Pending' },
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Request money</Text>
      </View>

      <View className="flex-1 px-6">
        {/* Tab Switcher */}
        <View className="flex-row bg-white/50 p-1.5 rounded-[32px] mt-6 mb-8 border border-white/40">
          <TouchableOpacity 
            onPress={() => setActiveTab('request')}
            className={`flex-1 py-4 rounded-[28px] items-center justify-center ${activeTab === 'request' ? 'bg-[#333333]' : ''}`}
          >
            <Text className={`font-bold ${activeTab === 'request' ? 'text-white' : 'text-[#6C7278]'}`}>Request</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('pending')}
            className={`flex-row flex-1 py-4 rounded-[28px] items-center justify-center ${activeTab === 'pending' ? 'bg-[#333333]' : ''}`}
          >
            <Text className={`font-bold ${activeTab === 'pending' ? 'text-white' : 'text-[#6C7278]'}`}>Pending</Text>
            <View className="ml-2 bg-[#6C7278] w-5 h-5 rounded-full items-center justify-center">
              <Text className="text-white text-[10px] font-bold">5</Text>
            </View>
          </TouchableOpacity>
        </View>

        {activeTab === 'request' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Request Form */}
            <View className="mb-6">
              <Text className="text-[#1F2C37] text-base font-semibold mb-3">Payment ID</Text>
              <TextInput
                className="w-full h-16 bg-white border border-gray-100 rounded-2xl px-5 text-[#1F2C37] font-medium"
                placeholder="Enter recipient payment ID"
                placeholderTextColor="#9DA3B6"
                value={payID}
                onChangeText={setPayID}
              />
            </View>

            <View className="mb-6">
              <Text className="text-[#1F2C37] text-base font-semibold mb-3">Account Name</Text>
              <TextInput
                className="w-full h-16 bg-white border border-gray-100 rounded-2xl px-5 text-[#1F2C37] font-medium"
                placeholder="Enter recipient account name"
                placeholderTextColor="#9DA3B6"
                value={accountName}
                onChangeText={setAccountName}
              />
            </View>

            <View className="mb-10">
              <Text className="text-[#1F2C37] text-base font-semibold mb-3">Narration</Text>
              <TextInput
                className="w-full h-16 bg-white border border-gray-100 rounded-2xl px-5 text-[#1F2C37] font-medium"
                placeholder="Optional"
                placeholderTextColor="#9DA3B6"
                value={narration}
                onChangeText={setNarration}
              />
            </View>

            <TouchableOpacity 
              onPress={() => router.push(`/request/amount?name=${accountName}&identifier=${payID}&narration=${narration}`)}
              className="bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100"
            >
              <Text className="text-white text-center text-lg font-bold">Continue</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Pending List */}
            {pendingRequests.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => router.push(`/request/confirm?amount=${item.amount}&name=${item.name}`)}
                className="bg-white p-4 rounded-[32px] flex-row items-center mb-4 shadow-sm border border-gray-50"
              >
                <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mr-4">
                  <MaterialCommunityIcons name="hands-pray" size={24} color="#1F2C37" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#1F2C37] font-bold text-sm mb-1" numberOfLines={1}>
                    Request from {item.name}
                  </Text>
                  <Text className="text-[#9DA3B6] text-[10px]">{item.date}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[#1F2C37] font-bold text-sm">{item.amount}</Text>
                  <View className="bg-amber-100 px-2 py-0.5 rounded-md mt-1">
                    <Text className="text-amber-500 text-[10px] font-bold">{item.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// Icon Import for the pending list
import { MaterialCommunityIcons } from '@expo/vector-icons';
