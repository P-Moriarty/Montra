import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function ExchangeRatesScreen() {
  const { colors } = useTheme();
  const exchangePairs = [
    { from: 'USD', to: 'NGN', rate: '1,400.00', fromFlag: 'us', toFlag: 'ng' },
    { from: 'EUR', to: 'USD', rate: '1.08', fromFlag: 'eu', toFlag: 'us' },
    { from: 'GBP', to: 'USD', rate: '1.26', fromFlag: 'gb', toFlag: 'us' },
    { from: 'USD', to: 'GBP', rate: '0.79', fromFlag: 'us', toFlag: 'gb' },
    { from: 'GBP', to: 'NGN', rate: '1,780.00', fromFlag: 'gb', toFlag: 'ng' },
    { from: 'EUR', to: 'NGN', rate: '1,520.00', fromFlag: 'eu', toFlag: 'ng' },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Exchange Rates</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-sm font-semibold mb-6 mt-4 uppercase tracking-widest" style={{ color: colors.textTertiary }}>Market Rates</Text>

        {/* Pair List */}
        {exchangePairs.map((pair, index) => (
          <View 
            key={index} 
            className="p-5 rounded-[32px] flex-row items-center justify-between mb-4 shadow-sm border" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}
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
                <Text className="font-bold text-base" style={{ color: colors.text }}>{pair.from}/{pair.to}</Text>
                <Text className="text-xs" style={{ color: colors.textSecondary }}>Standard Rate</Text>
              </View>
            </View>

            <View className="items-end">
              <Text className="font-extrabold text-lg" style={{ color: colors.primary }}>
                {pair.to === 'NGN' ? '₦' : pair.to === 'USD' ? '$' : pair.to === 'GBP' ? '£' : '€'}
                {pair.rate}
              </Text>
              <View className="flex-row items-center mt-1">
                <Feather name="trending-up" size={12} color={colors.green} />
                <Text className="text-[10px] font-bold ml-1" style={{ color: colors.green }}>+0.24%</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Disclaimer */}
        <View className="mt-6 p-6 rounded-3xl border" style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.border }}>
           <Text className="text-xs text-center leading-5 italic" style={{ color: colors.textTertiary }}>
             Exchange rates are provided for informational purposes only and are subject to market volatility. Real-time rates may vary at the time of transaction.
           </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
