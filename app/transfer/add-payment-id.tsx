import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AddPaymentIDScreen() {
  const [payID, setPayID] = useState('');
  const [accountName, setAccountName] = useState('');
  const [saveAsBeneficiary, setSaveAsBeneficiary] = useState(false);

  const handleContinue = () => {
    // Navigate to amount entry with Payment ID context
    router.push(`/transfer/amount?name=${accountName || 'New Recipient'}&identifier=${payID}&type=payid`);
  };

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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Payment ID</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Payment ID Input */}
        <View className="mt-8 mb-6">
          <Text className="text-[#1F2C37] text-base font-semibold mb-3">Payment ID</Text>
          <TextInput
            className="w-full h-16 bg-white border border-gray-200 rounded-2xl px-5 text-[#1F2C37] font-medium"
            placeholder="Enter recipient payment ID"
            placeholderTextColor="#9DA3B6"
            keyboardType="numeric"
            value={payID}
            onChangeText={setPayID}
          />
        </View>

        {/* Account Name Input */}
        <View className="mb-10">
          <Text className="text-[#1F2C37] text-base font-semibold mb-3">Account Name</Text>
          <TextInput
            className="w-full h-16 bg-white border border-gray-200 rounded-2xl px-5 text-[#1F2C37] font-medium"
            placeholder="Enter recipient account name"
            placeholderTextColor="#9DA3B6"
            value={accountName}
            onChangeText={setAccountName}
          />
        </View>

        {/* Save as Beneficiary */}
        <View className="flex-row items-center justify-between mb-20">
          <Text className="text-[#1F2C37] text-base font-medium">Save as beneficiary</Text>
          <Switch
            trackColor={{ false: '#E2E8F0', true: '#5154F4' }}
            thumbColor={'#fff'}
            ios_backgroundColor="#E2E8F0"
            onValueChange={() => setSaveAsBeneficiary(!saveAsBeneficiary)}
            value={saveAsBeneficiary}
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          onPress={handleContinue}
          className="bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100"
        >
          <Text className="text-white text-center text-lg font-bold">Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
