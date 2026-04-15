import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BankTransferScreen() {
  const [search, setSearch] = useState('');

  const beneficiaries = [
    { id: '1', name: 'Emezue Chinonso', account: '8323847728', bank: 'GT Bank' },
    { id: '2', name: 'Emezue Chinonso', account: '8323847728', bank: 'GT Bank' },
    { id: '3', name: 'Emezue Chinonso', account: '8323847728', bank: 'GT Bank' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#F8F9FB] items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Bank transfer</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-[#6C7278] text-base font-medium mt-6 mb-8 leading-6">
          Transfer money to an existing or new recipient
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-[#F8F9FB] h-14 rounded-2xl px-4 border border-gray-100 mb-6">
          <Feather name="search" size={20} color="#9DA3B6" />
          <TextInput
            className="flex-1 ml-3 text-[#1F2C37] font-medium"
            placeholder="Search beneficiary"
            placeholderTextColor="#9DA3B6"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Add New Button */}
        <TouchableOpacity 
          onPress={() => router.push('/transfer/add-recipient')}
          className="bg-[#5154F4] py-5 rounded-[28px] flex-row items-center justify-center mb-10 shadow-lg shadow-indigo-100"
        >
          <Ionicons name="add" size={24} color="white" />
          <Text className="text-white text-lg font-bold ml-2">Add new recipient</Text>
        </TouchableOpacity>

        <Text className="text-[#1F2C37] text-lg font-bold mb-6">Saved beneficiary</Text>

        {/* Beneficiary List */}
        {beneficiaries.map((item) => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => router.push(`/transfer/amount?name=${item.name}&account=${item.account}&bank=${item.bank}`)}
            className="flex-row items-center mb-6 pb-6 border-b border-gray-50"
          >
            <View className="w-14 h-14 bg-[#E34800] rounded-full items-center justify-center mr-4 overflow-hidden">
               <View className="items-center justify-center p-2">
                 <View className="w-3 h-3 bg-white mb-1 self-end" />
                 <Text className="text-white text-[10px] font-bold tracking-tighter">GTCO</Text>
               </View>
            </View>
            <View className="flex-1">
              <Text className="text-[#1F2C37] font-bold text-base mb-1">{item.name}</Text>
              <Text className="text-[#9DA3B6] text-xs">{item.account} - {item.bank}</Text>
            </View>
            <TouchableOpacity>
              <Feather name="more-horizontal" size={24} color="#9DA3B6" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
