import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SecurityScreen() {
  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const securityItems = [
    { label: 'Change Transaction PIN', icon: 'key-outline', description: 'Used for all financial transfers' },
    { label: 'Change Login Password', icon: 'lock-open-outline', description: 'Update your account access code' },
    { label: 'Devices', icon: 'phone-portrait-outline', description: 'Manage and log out of other devices' },
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Security Hub</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Security Health Check Card */}
        <View className="mt-6 mb-10">
          <View className="bg-white p-8 rounded-[40px] shadow-sm border border-white relative overflow-hidden">
             <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mr-4">
                   <Ionicons name="shield-checkmark" size={28} color="#22C55E" />
                </View>
                <View>
                   <Text className="text-[#1F2C37] text-lg font-bold">Security Score: 85%</Text>
                   <Text className="text-[#9DA3B6] text-xs font-medium">Your account is highly secure</Text>
                </View>
             </View>
             
             {/* Simple visual bar */}
             <View className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                <View className="w-[85%] h-full bg-[#22C55E] rounded-full" />
             </View>
          </View>
        </View>

        {/* Biometrics & Toggles */}
        <View className="mb-10">
          <Text className="text-[#9DA3B6] text-xs font-bold uppercase tracking-widest ml-4 mb-4">Device Security</Text>
          <View className="bg-white/60 rounded-[40px] p-2 border border-white/40">
             <View className="flex-row items-center justify-between p-5 rounded-[32px] mb-1">
                <View className="flex-row items-center">
                   <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
                      <MaterialCommunityIcons name="face-recognition" size={22} color="#1F2C37" />
                   </View>
                   <View>
                      <Text className="text-[#1F2C37] font-bold">Biometrics</Text>
                      <Text className="text-[#9DA3B6] text-[10px]">Use FaceID / Fingerprint</Text>
                   </View>
                </View>
                <Switch 
                  value={biometrics} 
                  onValueChange={setBiometrics} 
                  trackColor={{ true: '#5154F4', false: '#D1D5DB' }}
                  thumbColor="white"
                />
             </View>

             <View className="flex-row items-center justify-between p-5 rounded-[32px]">
                <View className="flex-row items-center">
                   <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
                      <Ionicons name="notifications-outline" size={20} color="#1F2C37" />
                   </View>
                   <View>
                      <Text className="text-[#1F2C37] font-bold">2FA App</Text>
                      <Text className="text-[#9DA3B6] text-[10px]">Authenticator integration</Text>
                   </View>
                </View>
                <Switch 
                  value={twoFactor} 
                  onValueChange={setTwoFactor} 
                  trackColor={{ true: '#5154F4', false: '#D1D5DB' }}
                  thumbColor="white"
                />
             </View>
          </View>
        </View>

        {/* Management List */}
        <View>
          <Text className="text-[#9DA3B6] text-xs font-bold uppercase tracking-widest ml-4 mb-4">Management</Text>
          <View className="bg-white/60 rounded-[40px] p-2 border border-white/40">
            {securityItems.map((item, idx) => (
              <TouchableOpacity 
                key={idx}
                className={`flex-row items-center justify-between p-5 rounded-[32px] ${idx !== securityItems.length - 1 ? 'mb-1' : ''}`}
              >
                <View className="flex-row items-center">
                   <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
                      <Ionicons name={item.icon as any} size={20} color="#1F2C37" />
                   </View>
                   <View>
                      <Text className="text-[#1F2C37] font-bold">{item.label}</Text>
                      <Text className="text-[#9DA3B6] text-[10px]">{item.description}</Text>
                   </View>
                </View>
                <Feather name="chevron-right" size={18} color="#9DA3B6" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
