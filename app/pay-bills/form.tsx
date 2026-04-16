import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { AuthInput } from '@/components/auth-input';

export default function BillFormScreen() {
  const { type, name } = useLocalSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const providers = {
    airtime: [{ name: 'MTN', icon: 'flare' }, { name: 'Airtel', icon: 'circle' }, { name: 'Glo', icon: 'leaf' }, { name: '9Mobile', icon: 'grid' }],
    electricity: [{ name: 'EKEDC', icon: 'lightning-bolt' }, { name: 'IKEDC', icon: 'lightning-bolt' }, { name: 'AEDC', icon: 'lightning-bolt' }],
    cable: [{ name: 'DSTV', icon: 'television' }, { name: 'GOTV', icon: 'television-guide' }, { name: 'Startimes', icon: 'television' }],
    data: [{ name: 'MTN Data', icon: 'wifi' }, { name: 'Airtel Data', icon: 'wifi' }],
    internet: [{ name: 'Smile', icon: 'rss' }, { name: 'Spectranet', icon: 'rss' }],
  }[type as string] || [];

  const labels = {
    airtime: 'Phone Number',
    electricity: 'Meter Number',
    cable: 'Smart Card Number',
    data: 'Phone Number',
    internet: 'Customer ID',
    water: 'Customer ID'
  }[type as string] || 'Account ID';

  const handleContinue = () => {
    if (!identifier || !selectedProvider) {
      alert("Please fill all fields");
      return;
    }
    router.push({
      pathname: '/pay-bills/amount',
      params: { type, name, provider: selectedProvider, identifier }
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">{name}</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[#6C7278] text-base font-medium mt-6 mb-8">
          Select your provider and enter your {"\n"}{labels} to continue.
        </Text>

        {/* Provider Selection */}
        <Text className="text-[#1F2C37] text-lg font-bold mb-4">Select Provider</Text>
        <View className="flex-row flex-wrap gap-3 mb-10">
          {providers.map((p) => (
            <TouchableOpacity 
              key={p.name}
              onPress={() => setSelectedProvider(p.name)}
              className={`px-6 py-4 rounded-3xl border ${selectedProvider === p.name ? 'bg-[#5154F4] border-[#5154F4]' : 'bg-white border-gray-100'} items-center flex-row shadow-sm`}
            >
              <MaterialCommunityIcons name={p.icon as any} size={20} color={selectedProvider === p.name ? 'white' : '#5154F4'} className="mr-2" />
              <Text className={`font-bold ${selectedProvider === p.name ? 'text-white' : 'text-[#1F2C37]'}`}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Identifier Input */}
        <Text className="text-[#1F2C37] text-lg font-bold mb-4">{labels}</Text>
        <View className="bg-white rounded-[32px] p-2 border border-white shadow-sm">
          <AuthInput 
            icon={type === 'airtime' || type === 'data' ? 'phone' : 'credit-card'} 
            placeholder={`Enter ${labels.toLowerCase()}`}
            keyboardType="numeric"
            value={identifier}
            onChangeText={setIdentifier}
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          onPress={handleContinue}
          className="bg-[#5154F4] mt-12 py-5 rounded-[28px] shadow-lg shadow-indigo-100"
        >
          <Text className="text-white text-center text-lg font-bold">Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
