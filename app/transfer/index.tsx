import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TransferIndexScreen() {
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
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Transfer money</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <Text className="text-[#1F2C37] text-lg font-medium mt-6 mb-8">
          Select a transfer method
        </Text>

        {transferMethods.map((method, index) => (
          <TouchableOpacity 
            key={index}
            onPress={() => method.route && router.push(method.route as any)}
            className="bg-white p-6 rounded-3xl flex-row items-center mb-4 shadow-sm border border-gray-50"
          >
            <View className="w-16 h-16 bg-[#F8F9FB] rounded-2xl items-center justify-center mr-4 border border-gray-100">
              {method.lib === 'Ionicons' ? (
                <Ionicons name={method.icon as any} size={32} color="#1F2C37" />
              ) : (
                <MaterialCommunityIcons name={method.icon as any} size={32} color="#5154F4" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[#1F2C37] text-lg font-bold mb-1">{method.title}</Text>
              <Text className="text-[#9DA3B6] text-sm leading-5">{method.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
