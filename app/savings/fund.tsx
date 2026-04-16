import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';

export default function FundGoalScreen() {
  const { id, name, saved, target, color } = useLocalSearchParams();
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

  const handleFund = () => {
    if (parseFloat(amount.replace(/,/g, '')) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    alert(`Successfully added ₦${amount} to ${name}!`);
    router.replace('/savings');
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Add Funds</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Summary Card */}
        <View className="bg-white/80 p-6 rounded-[32px] mt-8 flex-row items-center border border-white shadow-sm">
          <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4`} style={{ backgroundColor: `${color}10` }}>
            <Ionicons name="sparkles" size={24} color={color as string} />
          </View>
          <View className="flex-1">
            <Text className="text-[#1F2C37] font-bold text-base">{name}</Text>
            <Text className="text-[#9DA3B6] text-xs">Currently saved: {saved}</Text>
          </View>
          <View className="items-end">
             <Text className="text-[#5154F4] text-xs font-bold uppercase tracking-widest">Goal</Text>
             <Text className="text-[#1F2C37] font-bold text-sm">{target}</Text>
          </View>
        </View>

        {/* Amount Entry */}
        <View className="mt-16 items-center">
           <Text className="text-[#6C7278] text-sm font-semibold uppercase tracking-widest mb-4">Adding to vault</Text>
           <View className="flex-row items-baseline mb-6">
             <Text className="text-[#1F2C37] text-4xl font-extrabold mr-2">₦</Text>
             <Text className="text-[#1F2C37] text-6xl font-extrabold">{amount}</Text>
           </View>
           
           <View className="bg-white/40 px-6 py-3 rounded-full border border-white/20">
             <Text className="text-[#9DA3B6] text-sm">Transferring from <Text className="text-[#1F2C37] font-bold">Available Balance</Text></Text>
           </View>
        </View>

        {/* Fund Button */}
        <TouchableOpacity 
          onPress={handleFund}
          className="bg-[#5154F4] mt-16 py-5 rounded-[28px] shadow-lg shadow-indigo-100"
        >
          <Text className="text-white text-center text-lg font-bold">Fund Vault</Text>
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
