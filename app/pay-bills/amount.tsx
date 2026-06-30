import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';
import { useTheme } from '@/context/ThemeContext';

export default function BillAmountScreen() {
  const { colors } = useTheme();
  const { type, name, provider, identifier, fixedAmount, planCode, planName, providerId } = useLocalSearchParams();
  const [amount, setAmount] = useState(
    fixedAmount ? Number(fixedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'
  );

  const isFixed = !!fixedAmount;

  const handleKeyPress = (key: string) => {
    if (isFixed) return;
    const digits = amount.replace(/[.,]/g, '');
    const newDigits = digits + key;
    const floatValue = parseInt(newDigits) / 100;
    setAmount(floatValue.toLocaleString(undefined, { minimumFractionDigits: 2 }));
  };

  const handleDelete = () => {
    if (isFixed || amount === '0.00') return;
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
      params: { 
        type, 
        name, 
        provider, 
        providerId,
        identifier, 
        amount,
        planCode,
        planName
      }
    });
  };

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
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Amount</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        {/* Context Card */}
        <View className="p-6 rounded-[32px] mt-8 flex-row items-center border shadow-sm" style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.surface }}>
          <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
            <Feather name={type === 'airtime' || type === 'data' ? 'phone' : 'zap'} size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-base" style={{ color: colors.text }}>{provider}</Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>{identifier}</Text>
          </View>
          <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: `${colors.primary}1A` }}>
            <Text className="text-[10px] font-bold uppercase" style={{ color: colors.primary }}>{type}</Text>
          </View>
        </View>

        {/* Amount Display */}
        <View className="mt-12 items-center">
          <Text className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: colors.textTertiary }}>You&apos;re paying</Text>
          <View className="flex-row items-baseline mb-4">
            <Text className="text-4xl font-extrabold mr-2" style={{ color: colors.text }}>₦</Text>
            <Text className="text-6xl font-extrabold" style={{ color: colors.text }}>{amount}</Text>
          </View>
          
          <Text className="text-base text-center leading-6 px-4" style={{ color: colors.textSecondary }}>
            Paying <Text className="font-bold" style={{ color: colors.text }}>₦{amount}</Text> for your <Text className="font-bold" style={{ color: colors.text }}>{provider}</Text> {name?.toString().toLowerCase()} service.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          onPress={handleContinue}
          className="mt-12 py-5 rounded-[28px] shadow-lg shadow-indigo-100" style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white text-center text-lg font-bold">Continue</Text>
        </TouchableOpacity>

        {/* Padding for Keypad */}
        <View className="h-[400px]" />
      </ScrollView>

      {/* Custom Keypad */}
      {!isFixed && (
        <View className="absolute bottom-0 left-0 right-0 pt-4 rounded-t-[40px]" style={{ backgroundColor: `${colors.switchTrackOff}30` }}>
          <CustomKeypad 
            onPress={handleKeyPress} 
            onDelete={handleDelete} 
          />
        </View>
      )}
    </SafeAreaView>
  );
}
