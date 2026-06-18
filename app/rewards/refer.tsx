import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useApiQuery, useApiMutation } from '@/hooks/api/use-api';
import { ProfileService } from '@/services/modules/profile.service';
import { ReferralService } from '@/services/modules/referral.service';
import { useQueryClient } from '@tanstack/react-query';
import { Toast } from '@/components/ui/toast';

export default function ReferScreen() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const { data: user } = useApiQuery(['profile'], ProfileService.getProfile);
  const { data: countData, isLoading: loadingCount } = useApiQuery(['referral-count'], () => ReferralService.getCount());
  const { data: balanceData, isLoading: loadingBalance } = useApiQuery(['referral-balance'], () => ReferralService.getBalance());

  const referralCode = user?.pay_id || 'MONTRA-9485';
  const referralCount = countData?.count || countData?.data?.count || 0;
  const pendingBalance = balanceData?.pending || balanceData?.data?.pending || 0;
  const withdrawableBalance = balanceData?.withdrawable || balanceData?.data?.withdrawable || 0;

  const redeemMutation = useApiMutation(ReferralService.redeem, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-balance'] });
      setToast({ visible: true, message: 'Referral earnings redeemed successfully!', type: 'success' });
    },
    onError: () => {
      setToast({ visible: true, message: 'Failed to redeem referral earnings.', type: 'error' });
    },
  });

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    setToast({ visible: true, message: 'Referral code copied!', type: 'success' });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Montra and earn rewards! Use my code: ${referralCode}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
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
        keyboardShouldPersistTaps="always"
      >
        <View className="items-center mt-10 mb-8">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-sm mb-4 border border-gray-50">
            <Ionicons name="people-outline" size={40} color="#5154F4" />
          </View>
          <Text className="text-[#1F2C37] text-2xl font-black mb-2 text-center">Refer your friends</Text>
          <Text className="text-[#9DA3B6] text-center text-sm leading-6 px-4">
            Earn rewards for every friend that signs up using your code.
          </Text>
        </View>

        {/* Referral Code Card */}
        <View className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-50 mb-6 items-center">
          <Text className="text-[#6C7278] text-[10px] font-bold uppercase tracking-widest mb-4">Your Referral Code</Text>
          <View className="bg-gray-50 px-8 py-5 rounded-[32px] border border-dashed border-indigo-200 flex-row items-center">
            <Text className="text-[#1F2C37] text-2xl font-black mr-4">{referralCode}</Text>
            <TouchableOpacity onPress={handleCopy} className="bg-white p-2 rounded-xl shadow-sm">
              <Feather name="copy" size={20} color="#5154F4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white p-5 rounded-[32px] shadow-sm border border-gray-50 items-center">
            <Text className="text-[#9DA3B6] text-[10px] font-bold uppercase tracking-widest mb-2">Referrals</Text>
            {loadingCount ? (
              <ActivityIndicator size="small" color="#5154F4" />
            ) : (
              <Text className="text-[#1F2C37] text-3xl font-black">{referralCount}</Text>
            )}
          </View>
          <View className="flex-1 bg-white p-5 rounded-[32px] shadow-sm border border-gray-50 items-center">
            <Text className="text-[#9DA3B6] text-[10px] font-bold uppercase tracking-widest mb-2">Pending</Text>
            {loadingBalance ? (
              <ActivityIndicator size="small" color="#5154F4" />
            ) : (
              <Text className="text-orange-500 text-3xl font-black">₦{(pendingBalance / 100).toLocaleString()}</Text>
            )}
          </View>
        </View>

        {/* Withdrawable + Redeem */}
        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#9DA3B6] text-[10px] font-bold uppercase tracking-widest">Withdrawable Balance</Text>
            {loadingBalance ? (
              <ActivityIndicator size="small" color="#5154F4" />
            ) : (
              <Text className="text-[#1F2C37] text-2xl font-black">₦{(withdrawableBalance / 100).toLocaleString()}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => redeemMutation.mutate(undefined as any)}
            disabled={withdrawableBalance <= 0 || redeemMutation.isPending}
            className={`py-4 rounded-2xl items-center ${withdrawableBalance > 0 ? 'bg-[#5154F4]' : 'bg-gray-200'}`}
          >
            {redeemMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`font-bold text-base ${withdrawableBalance > 0 ? 'text-white' : 'text-gray-400'}`}>
                Redeem to Wallet
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Share Button */}
        <TouchableOpacity 
          onPress={handleShare}
          className="bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100 flex-row items-center justify-center mb-10"
        >
          <Feather name="share-2" size={20} color="white" />
          <Text className="text-white text-center text-lg font-bold ml-2">Share Invite Link</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
