import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

export default function ReferScreen() {
  const referralCode = 'MONTRA-9485';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    alert('Referral code copied!');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Montra and get ₦1,000 when you sign up! Use my code: ${referralCode}`,
      });
    } catch (error) {
      console.log(error);
    }
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Refer & Earn</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mt-10 mb-8">
           <View className="w-32 h-32 bg-white rounded-full items-center justify-center shadow-sm mb-6 border border-gray-50">
             <Image 
               source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
               className="w-20 h-20"
             />
           </View>
           <Text className="text-[#1F2C37] text-2xl font-black mb-2 text-center">Refer your friends</Text>
           <Text className="text-[#9DA3B6] text-center text-sm leading-6 px-4">
             Get ₦1,000 for every friend that signs up and completes their first transaction.
           </Text>
        </View>

        {/* Code Card */}
        <View className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-50 mb-10 items-center">
           <Text className="text-[#6C7278] text-[10px] font-bold uppercase tracking-widest mb-4">Your Referral Code</Text>
           <View className="bg-gray-50 px-8 py-5 rounded-[32px] border border-dashed border-indigo-200 flex-row items-center">
              <Text className="text-[#1F2C37] text-2xl font-black mr-4">{referralCode}</Text>
              <TouchableOpacity onPress={handleCopy} className="bg-white p-2 rounded-xl shadow-sm">
                 <Feather name="copy" size={20} color="#5154F4" />
              </TouchableOpacity>
           </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity 
          onPress={handleShare}
          className="bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100 flex-row items-center justify-center"
        >
          <Feather name="share-2" size={20} color="white" className="mr-2" />
          <Text className="text-white text-center text-lg font-bold ml-2">Share Invite Link</Text>
        </TouchableOpacity>

        {/* Referrals Status */}
        <View className="mt-12 mb-10">
           <Text className="text-[#1F2C37] text-lg font-bold mb-6">Your Referrals</Text>
           
           {[
             { name: 'Emeka Obi', status: 'Completed', date: '2 hours ago', amount: '₦1,000' },
             { name: 'Sara Yusuf', status: 'Pending', date: 'Yesterday' },
           ].map((ref, idx) => (
             <View key={idx} className="bg-white/60 p-5 rounded-[32px] mb-4 border border-white/40 flex-row items-center">
                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
                   <Text className="text-[#1F2C37] font-bold">{ref.name[0]}</Text>
                </View>
                <View className="flex-1">
                   <Text className="text-[#1F2C37] font-bold text-sm">{ref.name}</Text>
                   <Text className="text-[#9DA3B6] text-[10px]">{ref.date}</Text>
                </View>
                <View className="items-end">
                   <Text className={`font-bold text-xs ${ref.status === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>
                     {ref.status}
                   </Text>
                   {ref.amount && <Text className="text-[#1F2C37] font-bold text-xs mt-1">{ref.amount}</Text>}
                </View>
             </View>
           ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
