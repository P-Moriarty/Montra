import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function TransferIndexScreen() {
  const { colors } = useTheme();
  const transferMethods = [
    {
      title: 'Via Bank account',
      subtitle: 'Send to a local or international bank account',
      icon: 'bank-outline',
      lib: 'MaterialCommunityIcons',
      route: '/transfer/bank-transfer',
    },
    {
      title: 'Via Payment ID',
      subtitle: 'Send using a recipients\' payment ID',
      icon: 'account-box-outline',
      lib: 'MaterialCommunityIcons',
      route: '/transfer/payment-id',
    },
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
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Transfer money</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <Text className="text-lg font-medium mt-6 mb-8" style={{ color: colors.text }}>
          Select a transfer method
        </Text>

        {transferMethods.map((method, index) => (
          <TouchableOpacity 
            key={index}
            onPress={() => method.route && router.push(method.route as any)}
            className="p-6 rounded-3xl flex-row items-center mb-4 shadow-sm border" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}
          >
            <View className="w-16 h-16 bg-[#F8F9FB] rounded-2xl items-center justify-center mr-4 border" style={{ borderColor: colors.cardBorder }}>
              {method.lib === 'Ionicons' ? (
                <Ionicons name={method.icon as any} size={32} color={colors.text} />
              ) : (
                <MaterialCommunityIcons name={method.icon as any} size={32} color={colors.primary} />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold mb-1" style={{ color: colors.text }}>{method.title}</Text>
              <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>{method.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
