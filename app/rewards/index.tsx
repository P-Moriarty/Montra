import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RewardsIndexScreen() {
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Rewards Center</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Point Vault Card */}
        <View className="mt-6">
          <View className="bg-white p-8 rounded-[48px] shadow-2xl shadow-indigo-100 items-center border border-white">
            <View className="w-20 h-20 bg-indigo-50 rounded-full items-center justify-center mb-4">
               <FontAwesome6 name="coins" size={36} color="#5154F4" />
            </View>
            <Text className="text-[#9DA3B6] text-xs font-bold uppercase tracking-widest mb-1">Montra Points</Text>
            <Text className="text-[#1F2C37] text-4xl font-black mb-6">24,500</Text>
            
            <View className="w-full h-[1px] bg-gray-50 mb-6" />
            
            <View className="flex-row justify-between w-full">
               <View>
                  <Text className="text-[#9DA3B6] text-[10px] font-bold uppercase tracking-widest">Cash Value</Text>
                  <Text className="text-[#1F2C37] font-extrabold text-lg">₦12,250.00</Text>
               </View>
               <TouchableOpacity className="bg-[#5154F4] px-6 py-3 rounded-2xl shadow-sm">
                  <Text className="text-white font-bold text-xs">Redeem</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-4 mt-8">
           <TouchableOpacity 
             onPress={() => router.push('/rewards/refer')}
             className="flex-1 bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm"
           >
             <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mb-3">
               <Ionicons name="people-outline" size={24} color="#5154F4" />
             </View>
             <Text className="text-[#1F2C37] font-bold">Refer & Earn</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             onPress={() => router.push('/rewards/leaderboard')}
             className="flex-1 bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm"
           >
             <View className="w-12 h-12 bg-orange-50 rounded-2xl items-center justify-center mb-3">
               <Ionicons name="trophy-outline" size={24} color="#FF9500" />
             </View>
             <Text className="text-[#1F2C37] font-bold">Leaderboard</Text>
           </TouchableOpacity>
        </View>

        {/* Missions Section */}
        <View className="mt-10">
           <Text className="text-[#1F2C37] text-lg font-bold mb-6">Daily Missions</Text>
           
           {[
             { title: 'Send 5 Transfers', progress: 3, total: 5, reward: '500 pts' },
             { title: 'Pay Electricity Bill', progress: 0, total: 1, reward: '1,200 pts' },
           ].map((mission, idx) => (
             <View key={idx} className="bg-white p-6 rounded-[32px] mb-4 border border-gray-50 shadow-sm">
                <View className="flex-row justify-between items-center mb-4">
                   <Text className="text-[#1F2C37] font-bold text-base">{mission.title}</Text>
                   <View className="bg-green-50 px-3 py-1 rounded-full">
                      <Text className="text-green-600 font-bold text-[10px]">{mission.reward}</Text>
                   </View>
                </View>
                
                <View className="w-full h-2 bg-gray-50 rounded-full overflow-hidden mb-2">
                   <View 
                     className="h-full bg-[#5154F4] rounded-full" 
                     style={{ width: `${(mission.progress / mission.total) * 100}%` }} 
                   />
                </View>
                <Text className="text-[#9DA3B6] text-[10px] font-bold">{mission.progress} / {mission.total} Completed</Text>
             </View>
           ))}
        </View>

        {/* Invite Banner */}
        <TouchableOpacity 
          onPress={() => router.push('/rewards/refer')}
          className="bg-[#1F2C37] p-8 rounded-[48px] mt-6 relative overflow-hidden"
        >
           <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
           <Text className="text-white text-xl font-bold mb-2">Get ₦1,000 for every friend!</Text>
           <Text className="text-white/60 text-xs leading-5 mb-6">Share your referral link with friends and get paid when they sign up and verify.</Text>
           <View className="flex-row items-center">
              <Text className="text-white font-bold mr-2">Start sharing</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
           </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
