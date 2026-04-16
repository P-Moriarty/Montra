import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function VerificationStatusScreen() {
  const tiers = [
    { level: 'Tier 1', status: 'Completed', limit: '₦500,000 Daily', active: true, requirements: ['Email verified', 'Phone number linked'] },
    { level: 'Tier 2', status: 'In Progress', limit: '₦5,000,000 Daily', active: false, current: true, requirements: ['BVN Verification', 'Government ID Upload'] },
    { level: 'Tier 3', status: 'Locked', limit: 'Unlimited', active: false, requirements: ['Utility Bill', 'Address Verification'] },
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Verification Status</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Current Status Card */}
        <View className="mt-6 mb-10">
          <View className="bg-white p-10 rounded-[48px] shadow-sm border border-white items-center">
             <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6">
                <Ionicons name="shield-checkmark" size={48} color="#5154F4" />
             </View>
             <Text className="text-[#1F2C37] text-2xl font-black mb-2">Tier 1 Verified</Text>
             <Text className="text-[#9DA3B6] text-center text-sm leading-5">You have basic access. Increase your limits by completing the next tier.</Text>
          </View>
        </View>

        {/* Tiers List */}
        <View>
          <Text className="text-[#9DA3B6] text-xs font-bold uppercase tracking-widest ml-4 mb-6">Verification Journey</Text>
          
          {tiers.map((tier, idx) => (
            <View key={idx} className="flex-row mb-8">
               {/* Line Indicator */}
               <View className="items-center mr-4">
                  <View className={`w-10 h-10 rounded-full items-center justify-center shadow-sm ${tier.active ? 'bg-[#5154F4]' : 'bg-white'}`}>
                     {tier.active ? (
                       <Ionicons name="checkmark" size={20} color="white" />
                     ) : (
                       <Text className={`font-bold ${tier.current ? 'text-[#5154F4]' : 'text-gray-300'}`}>{idx + 1}</Text>
                     )}
                  </View>
                  {idx !== tiers.length - 1 && (
                    <View className="w-[2px] flex-1 bg-white my-2" />
                  )}
               </View>

               {/* Tier Data Card */}
               <TouchableOpacity 
                 disabled={tier.active}
                 className={`flex-1 bg-white/60 p-6 rounded-[32px] border ${tier.current ? 'border-[#5154F4]/20' : 'border-white/10'}`}
               >
                  <View className="flex-row justify-between items-center mb-4">
                     <Text className="text-[#1F2C37] font-black text-lg">{tier.level}</Text>
                     <View className={`px-3 py-1 rounded-full ${tier.active ? 'bg-green-50' : 'bg-indigo-50'}`}>
                        <Text className={`text-[10px] font-bold ${tier.active ? 'text-green-600' : 'text-[#5154F4]'}`}>{tier.status}</Text>
                     </View>
                  </View>

                  <Text className="text-[#1F2C37] font-bold text-xs mb-4">Daily Limit: {tier.limit}</Text>
                  
                  <View className="space-y-2">
                     {tier.requirements.map((req, rIdx) => (
                       <View key={rIdx} className="flex-row items-center">
                          <Ionicons name="checkmark-circle" size={16} color={tier.active ? '#22C55E' : '#E5E7EB'} className="mr-2" />
                          <Text className="text-[#6C7278] text-[11px] font-medium">{req}</Text>
                       </View>
                     ))}
                  </View>

                  {tier.current && (
                    <TouchableOpacity className="bg-[#5154F4] mt-6 py-3 rounded-2xl">
                       <Text className="text-white text-center font-bold text-xs">Verify Level {idx + 1}</Text>
                    </TouchableOpacity>
                  )}
               </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
