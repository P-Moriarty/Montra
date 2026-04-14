import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const router = useRouter();

  const menuItems = [
    { label: 'My Profile', icon: 'person-outline', color: '#1F2C37', route: '/my-profile' as const },
    { label: 'Transaction history', icon: 'time-outline', color: '#1F2C37', route: '/transaction-history' as const },
    { label: 'Refer & Earn', icon: 'gift-outline', color: '#1F2C37' },
    { label: 'Contact support', icon: 'headset-outline', color: '#1F2C37' },
    { label: 'Help', icon: 'help-circle-outline', color: '#1F2C37' },
    { label: 'Log out', icon: 'log-out-outline', color: '#EF4444', isLast: true },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity> */}
        <Text className="text-[#1F2C37] text-xl font-bold">Account</Text>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
          <Ionicons name="settings-outline" size={20} color="#1F2C37" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Account Details Section */}
        <View className="mt-6 mb-8">
          <Text className="text-[#1F2C37] text-lg font-bold mb-4">Account details</Text>
          <View className="bg-[#F6F6F6] p-6 rounded-[32px] border border-gray-100">
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-[#1F2C37] text-xl font-bold mb-1">3749266383</Text>
                <Text className="text-[#9DA3B6] text-sm">Account number</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="copy-outline" size={22} color="#9DA3B6" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-[#1F2C37] text-lg font-bold mb-1">Ifeanyi Chukwudi</Text>
              <Text className="text-[#9DA3B6] text-sm">Account name</Text>
            </View>

            <View>
              <Text className="text-[#1F2C37] text-lg font-bold mb-1">Young Money Mfb Ltd</Text>
              <Text className="text-[#9DA3B6] text-sm">Bank name</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="space-y-3">
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => item.route && router.push(item.route)}
              className="bg-white p-4 rounded-3xl flex-row items-center justify-between shadow-sm border border-gray-50 mb-3"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mr-4">
                  <Ionicons name={item.icon as any} size={22} color={item.color === '#EF4444' ? '#EF4444' : '#1F2C37'} />
                </View>
                <Text className={`text-base font-bold ${item.color === '#EF4444' ? 'text-[#EF4444]' : 'text-[#1F2C37]'}`}>
                  {item.label}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9DA3B6" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
