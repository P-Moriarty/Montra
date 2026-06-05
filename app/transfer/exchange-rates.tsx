import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ExchangeRatesScreen() {
  const exchangePairs = [
    { from: 'USD', to: 'NGN', rate: '1,400.00', fromFlag: 'us', toFlag: 'ng' },
    { from: 'EUR', to: 'USD', rate: '1.08', fromFlag: 'eu', toFlag: 'us' },
    { from: 'GBP', to: 'USD', rate: '1.26', fromFlag: 'gb', toFlag: 'us' },
    { from: 'USD', to: 'GBP', rate: '0.79', fromFlag: 'us', toFlag: 'gb' },
    { from: 'GBP', to: 'NGN', rate: '1,780.00', fromFlag: 'gb', toFlag: 'ng' },
    { from: 'EUR', to: 'NGN', rate: '1,520.00', fromFlag: 'eu', toFlag: 'ng' },
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Exchange Rates</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-[#6C7278] text-sm font-semibold mb-6 mt-4 uppercase tracking-widest">Market Rates</Text>

        {/* Pair List */}
        {exchangePairs.map((pair, index) => (
          <View 
            key={index} 
            className="bg-white p-5 rounded-[32px] flex-row items-center justify-between mb-4 shadow-sm border border-gray-50"
          >
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-4">
                <Image 
                  source={{ uri: `https://flagcdn.com/w80/${pair.fromFlag}.png` }} 
                  className="w-8 h-5 rounded-sm z-10 border-2 border-white"
                />
                <Image 
                  source={{ uri: `https://flagcdn.com/w80/${pair.toFlag}.png` }} 
                  className="w-8 h-5 rounded-sm -ml-3 border-2 border-white"
                />
              </View>
              <View>
                <Text className="text-[#1F2C37] font-bold text-base">{pair.from}/{pair.to}</Text>
                <Text className="text-[#9DA3B6] text-xs">Standard Rate</Text>
              </View>
            </View>

            <View className="items-end">
              <Text className="text-[#5154F4] font-extrabold text-lg">
                {pair.to === 'NGN' ? '₦' : pair.to === 'USD' ? '$' : pair.to === 'GBP' ? '£' : '€'}
                {pair.rate}
              </Text>
              <View className="flex-row items-center mt-1">
                <Feather name="trending-up" size={12} color="#10B981" />
                <Text className="text-[#10B981] text-[10px] font-bold ml-1">+0.24%</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Disclaimer */}
        <View className="mt-6 p-6 bg-white/50 rounded-3xl border border-white/40">
           <Text className="text-[#6C7278] text-xs text-center leading-5 italic">
             Exchange rates are provided for informational purposes only and are subject to market volatility. Real-time rates may vary at the time of transaction.
           </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
