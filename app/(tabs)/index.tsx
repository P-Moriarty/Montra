import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Header Section */}
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-3">
              <Image 
                source={{ uri: 'https://i.pravatar.cc/150?u=ifeanyi' }} 
                className="w-full h-full"
              />
            </View>
            <Text className="text-[#1F2C37] text-lg font-bold">Hello, Ifeanyi</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm mr-2">
              <Feather name="headphones" size={20} color="#1F2C37" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
              <Ionicons name="notifications-outline" size={20} color="#1F2C37" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Section */}
        <View className="mt-10 items-center">
          <Text className="text-[#6C7278] text-base mb-2 font-medium">Available balance</Text>
          <View className="flex-row items-center">
            <Text className="text-[#1F2C37] text-5xl font-extrabold mr-2">
              {showBalance ? '$5.00' : '••••••'}
            </Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Ionicons 
                name={showBalance ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color="#6C7278" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="flex-row items-center bg-white px-4 py-2 rounded-full mt-6 shadow-sm border border-gray-100">
            <Image 
              source={{ uri: 'https://flagcdn.com/w80/ng.png' }} 
              className="w-6 h-4 rounded-sm mr-2"
            />
            <Text className="text-[#1F2C37] font-bold mr-1">NGN</Text>
            <Feather name="chevron-down" size={16} color="#1F2C37" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mt-12 bg-white p-6 rounded-[32px] shadow-sm">
          <TouchableOpacity className="items-center">
            <View className="w-14 h-14 bg-[#5154F4] rounded-2xl items-center justify-center mb-2">
              <Feather name="send" size={24} color="white" />
            </View>
            <Text className="text-[#6C7278] font-bold">Transfer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
          className="items-center"
                      onPress={() => router.push('/deposit-ngn')}
>
            <View className="w-14 h-14 bg-[#5154F4]/10 rounded-2xl items-center justify-center mb-2">
              <Ionicons name="download-outline" size={24} color="#5154F4" />
            </View>
            <Text className="text-[#6C7278] font-bold">Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push('/swap')}
          >
            <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mb-2">
              <MaterialCommunityIcons name="swap-horizontal" size={24} color="#5154F4" />
            </View>
            <Text className="text-[#6C7278] font-bold">Swap</Text>
          </TouchableOpacity>
        </View>

        {/* Exchange Rate Card */}
        <View className="mt-8">
          <Text className="text-[#1F2C37] text-lg font-bold mb-4">Exchange Rate</Text>
          <View className="bg-white p-6 rounded-3xl border border-gray-100 flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-4">
                <View className="flex-row items-center">
                  <Image 
                    source={{ uri: 'https://flagcdn.com/w80/us.png' }} 
                    className="w-6 h-4 rounded-sm"
                  />
                  <Ionicons name="swap-horizontal" size={16} color="#6C7278" className="mx-2" />
                  <Image 
                    source={{ uri: 'https://flagcdn.com/w80/ng.png' }} 
                    className="w-6 h-4 rounded-sm"
                  />
                </View>
              </View>
              <Text className="text-[#1F2C37] text-base font-bold mb-4">
                USD 1 <Text className="font-normal text-gray-400">⇌</Text> NGN 1,400.00
              </Text>
              <TouchableOpacity className="bg-[#5154F4] px-4 py-2 rounded-xl self-start">
                <Text className="text-white font-bold">View more</Text>
              </TouchableOpacity>
            </View>
            <Image 
              source={require('@/assets/images/Foreign Exchange on the International Market.png')} 
              style={{ width: 100, height: 100 }}
              // contentFit="contain"
            />
          </View>
        </View>

        {/* Quick Services */}
        <View className="mt-8">
          <Text className="text-[#1F2C37] text-lg font-bold mb-4">Quick Services</Text>
          <View className="flex-row justify-between">
            {[
              { label: 'Savings', icon: 'piggy-bank-outline', lib: 'MaterialCommunityIcons' },
              { label: 'Pay bills', icon: 'rss', lib: 'Feather' },
              { label: 'Rewards', icon: 'gift-outline', lib: 'Ionicons' },
              { label: 'More', icon: 'ellipsis-horizontal', lib: 'Ionicons' }
            ].map((service, index) => (
              <TouchableOpacity key={index} className="items-center">
                <View className="w-16 h-16 bg-[#F0F1FF] rounded-full items-center justify-center shadow-sm mb-2">
                  {service.lib === 'MaterialCommunityIcons' && <MaterialCommunityIcons name={service.icon as any} size={26} color="#5154F4" />}
                  {service.lib === 'Feather' && <Feather name={service.icon as any} size={24} color="#5154F4" />}
                  {service.lib === 'Ionicons' && <Ionicons name={service.icon as any} size={26} color="#5154F4" />}
                </View>
                <Text className="text-[#6C7278] text-sm font-medium">{service.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#1F2C37] text-lg font-bold">Recent transaction</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-[#5154F4] font-bold mr-1" onPress={() => router.push('/transaction-history')}>View more</Text>
              <Feather name="chevron-right" size={16} color="#5154F4" />
            </TouchableOpacity>
          </View>

          {/* Mapped Transaction List */}
          {TRANSACTIONS.map((item) => (
            <View key={item.id} className="bg-white p-4 rounded-3xl flex-row items-center mb-3">
              <View className={`w-12 h-12 ${item.status === 'Failed' ? 'bg-red-50' : 'bg-blue-50'} rounded-full items-center justify-center mr-4`}>
                <Feather 
                  name={item.type === 'send' ? "send" : "download"} 
                  size={20} 
                  color={item.status === 'Failed' ? '#EF4444' : '#5154F4'} 
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#1F2C37] font-bold text-base mb-1" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-[#9DA3B6] text-xs">{item.date}</Text>
              </View>
              <View className="items-end">
                <Text className={`text-[#1F2C37] font-bold text-base ${item.type === 'send' ? '' : 'text-green-600'}`}>
                  {item.type === 'send' ? '-' : '+'}{item.amount}
                </Text>
                <View className={`${item.status === 'Failed' ? 'bg-red-50' : 'bg-green-50'} px-2 py-0.5 rounded-md mt-1`}>
                  <Text className={`${item.status === 'Failed' ? 'text-red-500' : 'text-green-500'} text-[10px] font-bold`}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Mock Transaction Data
const TRANSACTIONS = [
  {
    id: '1',
    title: 'C2C Transfer to Tegadesigns',
    date: 'Apr 03, 2025 10:05 PM',
    amount: '$100.00',
    type: 'send',
    status: 'Failed',
  },
  {
    id: '2',
    title: 'Deposit from Bank Account',
    date: 'Apr 02, 2025 08:30 AM',
    amount: '$250.00',
    type: 'receive',
    status: 'Success',
  },
  {
    id: '3',
    title: 'Swap USD to NGN',
    date: 'Mar 31, 2025 02:15 PM',
    amount: '$50.00',
    type: 'send',
    status: 'Success',
  },
];
