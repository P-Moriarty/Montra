import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { BeneficiaryService } from '@/services/modules/beneficiary.service';

export default function BankTransferScreen() {
  const [search, setSearch] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchBeneficiaries();
    }, [])
  );

  const fetchBeneficiaries = async () => {
    try {
      setIsLoading(true);
      const response = await BeneficiaryService.getBeneficiaries();
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && Array.isArray(response.beneficiaries)) {
        data = response.beneficiaries;
      }
      // Filter for bank type
      setBeneficiaries(data.filter((b: any) => b.type === 'bank' || b.bank_code));
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Beneficiary',
      'Are you sure you want to remove this beneficiary?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await BeneficiaryService.deleteBeneficiary(id);
              fetchBeneficiaries();
            } catch (error) {
              console.error('Failed to delete beneficiary:', error);
              Alert.alert('Error', 'Failed to delete beneficiary');
            }
          }
        }
      ]
    );
  };

  const filteredBeneficiaries = beneficiaries.filter(b => 
    b.account_name?.toLowerCase().includes(search.toLowerCase()) || 
    b.number?.includes(search)
  );

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
        {isLoading ? (
          <ActivityIndicator color="#5154F4" />
        ) : filteredBeneficiaries.length === 0 ? (
          <Text className="text-[#9DA3B6] text-center mt-4">No beneficiaries found</Text>
        ) : filteredBeneficiaries.map((item) => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => router.push(`/transfer/amount?name=${item.account_name}&account=${item.number}&bank=${item.bank_name}&bank_code=${item.bank_code}&type=bank`)}
            className="flex-row items-center mb-6 pb-6 border-b border-gray-50"
          >
            <View className="w-14 h-14 bg-[#5154F4] rounded-full items-center justify-center mr-4 overflow-hidden">
               <Text className="text-white font-bold text-xs">{item.bank_name?.substring(0, 3).toUpperCase()}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[#1F2C37] font-bold text-base mb-1">{item.account_name}</Text>
              <Text className="text-[#9DA3B6] text-xs">{item.number} - {item.bank_name}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Feather name="trash-2" size={20} color="#EF4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
