import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApiQuery, useApiMutation } from '@/hooks/api/use-api';
import { useQueryClient } from '@tanstack/react-query';
import { RewardService } from '@/services/modules/reward.service';
import { getCurrencySymbol } from '@/constants/currencies';
import { Toast } from '@/components/ui/toast';

export default function RewardsIndexScreen() {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const queryClient = useQueryClient();

  const { data: rewardsData, isLoading: loadingRewards, refetch, isRefetching } = useApiQuery(
    ['rewards'],
    () => RewardService.getAll(),
  );

  const { data: balanceData, isLoading: loadingBalance } = useApiQuery(
    ['cashback-balance'],
    () => RewardService.getBalance(),
  );

  const redeemMutation = useApiMutation(RewardService.redeemCashback, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashback-balance'] });
      setToast({ visible: true, message: 'Cashback redeemed successfully', type: 'success' });
    },
    onError: () => {
      setToast({ visible: true, message: 'Failed to redeem cashback', type: 'error' });
    },
  });

  const cashbackList = useMemo(() => {
    if (!rewardsData) return [];
    if (Array.isArray(rewardsData.cashback)) return rewardsData.cashback;
    return [];
  }, [rewardsData]);

  const referralList = useMemo(() => {
    if (!rewardsData) return [];
    if (Array.isArray(rewardsData.referral)) return rewardsData.referral;
    return [];
  }, [rewardsData]);

  const cashbackBalance = balanceData?.cashback;
  const isLoading = loadingRewards || loadingBalance;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FE]" edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Rewards Center</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5154F4" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#5154F4" />}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Cashback Section */}
          <Text className="text-[#1F2C37] text-lg font-bold mt-6 mb-4">Cashback</Text>

          {cashbackBalance && (
            <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 mb-4">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                  <Feather name="arrow-down" size={18} color="#10B981" />
                </View>
                <Text className="text-[#1F2C37] font-bold text-base">Available Balance</Text>
              </View>
              <Text className="text-[#1F2C37] text-3xl font-black mb-4">
                {getCurrencySymbol(cashbackBalance.currency)}
                {Number(cashbackBalance.available_balance / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
              <View className="h-[1px] bg-gray-50 mb-4" />
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-[#6C7278] text-sm">Total Earned</Text>
                  <Text className="text-[#1F2C37] font-bold">
                    {getCurrencySymbol(cashbackBalance.currency)}
                    {Number(cashbackBalance.total_earned / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => redeemMutation.mutate(undefined as any)}
                  disabled={cashbackBalance.available_balance < 10000 || redeemMutation.isPending}
                  className={`px-6 py-3 rounded-2xl ${cashbackBalance.available_balance < 10000 ? 'bg-gray-200' : 'bg-[#5154F4]'}`}
                >
                  {redeemMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className={`font-bold text-sm ${cashbackBalance.available_balance < 10000 ? 'text-gray-400' : 'text-white'}`}>
                      Redeem
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {cashbackList.length > 0 && (
            <View className="bg-white rounded-[32px] shadow-sm border border-gray-50 mb-8 overflow-hidden">
              <View className="px-6 py-4 border-b border-gray-50">
                <Text className="text-[#1F2C37] font-bold">History</Text>
              </View>
              {cashbackList.map((item: any, idx: number) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between px-6 py-4 border-b border-gray-50 last:border-b-0"
                >
                  <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-8 h-8 bg-green-50 rounded-full items-center justify-center mr-3">
                      <Feather name="arrow-down" size={14} color="#10B981" />
                    </View>
                    <View>
                      <Text className="text-[#1F2C37] text-sm font-bold">{item.description}</Text>
                      <Text className="text-[#9DA3B6] text-[10px] mt-0.5">{formatDate(item.created_at)}</Text>
                    </View>
                  </View>
                  <Text className="text-green-600 font-bold text-sm">
                    +{getCurrencySymbol("ngn")}
                    {Number(item.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Referral Section */}
          <Text className="text-[#1F2C37] text-lg font-bold mb-4">Referral</Text>

          <TouchableOpacity
            onPress={() => router.push('/rewards/refer')}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 mb-4 flex-row items-center"
          >
            <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="people-outline" size={24} color="#5154F4" />
            </View>
            <View className="flex-1">
              <Text className="text-[#1F2C37] font-bold text-base">Refer & Earn</Text>
              <Text className="text-[#9DA3B6] text-xs mt-0.5">Invite friends, earn rewards</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9DA3B6" />
          </TouchableOpacity>

          {referralList.length > 0 && (
            <View className="bg-white rounded-[32px] shadow-sm border border-gray-50 mb-8 overflow-hidden">
              <View className="px-6 py-4 border-b border-gray-50">
                <Text className="text-[#1F2C37] font-bold">History</Text>
              </View>
              {referralList.map((item: any, idx: number) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between px-6 py-4 border-b border-gray-50 last:border-b-0"
                >
                  <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mr-3">
                      <Ionicons name="people-outline" size={14} color="#5154F4" />
                    </View>
                    <View>
                      <Text className="text-[#1F2C37] text-sm font-bold">{item.description}</Text>
                      <Text className="text-[#9DA3B6] text-[10px] mt-0.5">{formatDate(item.created_at)}</Text>
                    </View>
                  </View>
                  <Text className="text-green-600 font-bold text-sm">
                    +{getCurrencySymbol("ngn")}
                    {Number(item.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {referralList.length === 0 && (
            <View className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 items-center mb-10">
              <View className="w-14 h-14 bg-gray-50 rounded-full items-center justify-center mb-3">
                <Ionicons name="gift-outline" size={24} color="#9DA3B6" />
              </View>
              <Text className="text-[#9DA3B6] text-sm font-medium text-center">No referrals yet</Text>
              <Text className="text-[#9DA3B6] text-xs text-center mt-1">Share your code to get started</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
