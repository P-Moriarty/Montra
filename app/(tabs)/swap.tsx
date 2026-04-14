import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SwapScreen() {
  const [fromAmount, setFromAmount] = useState('14,000.00');
  const [toAmount, setToAmount] = useState('10.00');
  const [isUSDToBase, setIsUSDToBase] = useState(false);
  
  const rate = 1400;
  
  const fromCurrency = isUSDToBase ? { code: 'USD', flag: 'us' } : { code: 'NGN', flag: 'ng' };
  const toCurrency = isUSDToBase ? { code: 'NGN', flag: 'ng' } : { code: 'USD', flag: 'us' };

  const handleSwap = () => {
    setIsUSDToBase(!isUSDToBase);
    // Swap amounts for visual consistency with the mockup
    const temp = fromAmount;
    setFromAmount(toAmount);
    setToAmount(temp);
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Swap</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Swap Cards Container */}
        <View className="relative mt-4">
          {/* From Card */}
          <View className="bg-[#F6F6F6] p-6 rounded-[32px] mb-2">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity className="flex-row items-center bg-white px-3 py-2 rounded-2xl shadow-sm border border-gray-100">
                <Image 
                  source={{ uri: `https://flagcdn.com/w80/${fromCurrency.flag}.png` }} 
                  className="w-6 h-4 rounded-sm mr-2"
                />
                <Text className="text-[#1F2C37] font-bold mr-1">{fromCurrency.code}</Text>
                <Feather name="chevron-down" size={16} color="#1F2C37" />
              </TouchableOpacity>
              <Text className="text-[#1F2C37] text-3xl font-bold">
                {isUSDToBase ? '$' : 'N'}{fromAmount}
              </Text>
            </View>
            <Text className="text-[#9DA3B6] mt-6 font-medium">Balance : </Text>
          </View>

          {/* Swap Button (Absolute Positioned between cards) */}
          <View className="absolute left-1/2 -ml-7 top-[42%] z-10">
            <TouchableOpacity 
              onPress={handleSwap}
              className="bg-[#D1D1D1] w-14 h-14 rounded-full items-center justify-center border-4 border-white shadow-sm"
            >
              <MaterialCommunityIcons name="swap-horizontal-variant" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* To Card */}
          <View className="bg-[#F6F6F6] p-6 rounded-[32px]">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity className="flex-row items-center bg-white px-3 py-2 rounded-2xl shadow-sm border border-gray-100">
                <Image 
                  source={{ uri: `https://flagcdn.com/w80/${toCurrency.flag}.png` }} 
                  className="w-6 h-4 rounded-sm mr-2"
                />
                <Text className="text-[#1F2C37] font-bold mr-1">{toCurrency.code}</Text>
                <Feather name="chevron-down" size={16} color="#1F2C37" />
              </TouchableOpacity>
              <Text className="text-[#1F2C37] text-3xl font-bold">
                {isUSDToBase ? 'N' : '$'}{toAmount}
              </Text>
            </View>
            <Text className="text-[#9DA3B6] mt-6 font-medium">Balance : </Text>
          </View>
        </View>

        {/* Transaction Details Card */}
        <View className="bg-[#F6F6F6] p-6 rounded-[32px] mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#6C7278] font-medium">Exchange Rate</Text>
            <Text className="text-[#1F2C37] font-bold">$1 = N1,400.00</Text>
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#6C7278] font-medium">Fee</Text>
            <Text className="text-[#1F2C37] font-bold">$0.00</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-[#6C7278] font-medium">Arrives</Text>
            <Text className="text-[#1F2C37] font-bold">Instantly</Text>
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity className="bg-[#5154F4] mt-12 py-5 rounded-[28px] shadow-lg shadow-indigo-100">
          <Text className="text-white text-center text-lg font-bold">Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
