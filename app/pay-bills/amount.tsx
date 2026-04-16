import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';

export default function BillAmountScreen() {
  const { type, name, provider, identifier } = useLocalSearchParams();
  const [amount, setAmount] = useState('0.00');

  const handleKeyPress = (key: string) => {
    const digits = amount.replace(/[.,]/g, '');
    const newDigits = digits + key;
    const floatValue = parseInt(newDigits) / 100;
    setAmount(floatValue.toLocaleString(undefined, { minimumFractionDigits: 2 }));
  };

  const handleDelete = () => {
    if (amount === '0.00') return;
    const digits = amount.replace(/[.,]/g, '');
    const newDigits = digits.slice(0, -1);
    const floatValue = parseInt(newDigits || '0') / 100;
    setAmount(floatValue.toLocaleString(undefined, { minimumFractionDigits: 2 }));
  };

  const handleContinue = () => {
    if (parseFloat(amount.replace(/,/g, '')) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    router.push({
      pathname: '/pay-bills/confirm',
      params: { type, name, provider, identifier, amount }
    });
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Amount</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        {/* Context Card */}
        <View className="bg-white/80 p-6 rounded-[32px] mt-8 flex-row items-center border border-white shadow-sm">
          <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
            <Feather name={type === 'airtime' || type === 'data' ? 'phone' : 'zap'} size={24} color="#5154F4" />
          </View>
          <View className="flex-1">
            <Text className="text-[#1F2C37] font-bold text-base">{provider}</Text>
            <Text className="text-[#9DA3B6] text-xs">{identifier}</Text>
          </View>
          <View className="bg-[#5154F4]/10 px-3 py-1 rounded-lg">
            <Text className="text-[#5154F4] text-[10px] font-bold uppercase">{type}</Text>
          </View>
        </View>

        {/* Amount Display */}
        <View className="mt-12 items-center">
          <Text className="text-[#6C7278] text-sm font-semibold uppercase tracking-widest mb-4">You're paying</Text>
          <View className="flex-row items-baseline mb-4">
            <Text className="text-[#1F2C37] text-4xl font-extrabold mr-2">₦</Text>
            <Text className="text-[#1F2C37] text-6xl font-extrabold">{amount}</Text>
          </View>
          
          <Text className="text-[#9DA3B6] text-base text-center leading-6 px-4">
            Paying <Text className="text-[#1F2C37] font-bold">₦{amount}</Text> for your <Text className="text-[#1F2C37] font-bold">{provider}</Text> {name?.toString().toLowerCase()} service.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          onPress={handleContinue}
          className="bg-[#5154F4] mt-12 py-5 rounded-[28px] shadow-lg shadow-indigo-100"
        >
          <Text className="text-white text-center text-lg font-bold">Continue</Text>
        </TouchableOpacity>

        {/* Padding for Keypad */}
        <View className="h-[400px]" />
      </ScrollView>

      {/* Custom Keypad */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#D1D5DB]/30 pt-4 rounded-t-[40px]">
        <CustomKeypad 
          onPress={handleKeyPress} 
          onDelete={handleDelete} 
        />
      </View>
    </SafeAreaView>
  );
}
