import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MyProfileScreen() {
  const router = useRouter();

  const profileData = [
    { label: 'Payment ID', value: '394856', hasChevron: true },
    { label: 'KYC Levels', value: 'Tier 1', hasChevron: true },
    { label: 'Email', value: 'JohnDoe3@gmail.com', hasChevron: true },
    { label: 'Phone number', value: '+2349030531124' },
    { label: 'Gender', value: 'Male' },
    { label: 'Date of birth', value: '11-11-1970' },
    { label: 'Country', value: 'Nigeria' },
    { label: 'Address', hasChevron: true },
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">My Profile</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Summary */}
        <View className="items-center mt-6 mb-10">
          <View className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden">
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?u=ifeanyi' }} 
              className="w-full h-full"
            />
          </View>
          <Text className="text-[#1F2C37] text-2xl font-bold mt-4">Ifeanyi Chukwudi</Text>
        </View>

        {/* Data Cards */}
        <View className="space-y-3">
          {profileData.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              disabled={!item.hasChevron}
              className="bg-white p-5 rounded-3xl flex-row items-center justify-between shadow-sm border border-gray-50 mb-3"
            >
              <Text className="text-[#6C7278] text-base font-medium">{item.label}</Text>
              <View className="flex-row items-center">
                {item.value && (
                  <Text className="text-[#1F2C37] text-base font-bold mr-2">
                    {item.value}
                  </Text>
                )}
                {item.hasChevron && (
                  <Feather name="chevron-right" size={20} color="#9DA3B6" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
