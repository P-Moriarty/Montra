import React from 'react';
import { View, Text, TouchableOpacity, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather} from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PayBillsIndexScreen() {
  const categories = [
    { id: 'airtime', name: 'Airtime', icon: 'phone-portrait-outline', lib: 'Ionicons', color: '#5154F4' },
    { id: 'data', name: 'Data Bundle', icon: 'wifi-outline', lib: 'Ionicons', color: '#1F2C37' },
    { id: 'electricity', name: 'Electricity', icon: 'flash-outline', lib: 'Ionicons', color: '#1F2C37' },
    { id: 'cable', name: 'Cable TV', icon: 'tv-outline', lib: 'Ionicons', color: '#1F2C37' },
    
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Pay Bills</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-[#6C7278] text-base font-medium mt-6 mb-8 leading-6">
          Pay your utilities and services instantly {"\n"}from your Montra account.
        </Text>

        {/* Categories Grid */}
        <View className="flex-row flex-wrap justify-between">
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id}
              onPress={() => router.push(`/pay-bills/form?type=${cat.id}&name=${cat.name}`)}
              className="w-[48%] bg-white p-6 rounded-[32px] items-center mb-4 border border-gray-50 shadow-sm"
            >
              <View className="w-16 h-16 bg-[#F8F9FB] rounded-2xl items-center justify-center mb-4">
                {cat.lib === 'Ionicons' && <Ionicons name={cat.icon as any} size={28} color={cat.color} />}
                {cat.lib === 'Feather' && <Feather name={cat.icon as any} size={24} color={cat.color} />}
              </View>
              <Text className="text-[#1F2C37] font-bold text-sm">{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
