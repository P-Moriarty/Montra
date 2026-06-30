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
import { useTheme } from '@/context/ThemeContext';

export default function RewardsIndexScreen() {
  const { colors } = useTheme();
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Rewards Center</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Cashback Section */}
          <Text className="text-lg font-bold mt-6 mb-4" style={{ color: colors.text }}>Cashback</Text>

          {cashbackBalance && (
            <View className="p-6 rounded-[32px] shadow-sm mb-4" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.successLight }}>
                  <Feather name="arrow-down" size={18} color={colors.success} />
                </View>
                <Text className="font-bold text-base" style={{ color: colors.text }}>Available Balance</Text>
              </View>
              <Text className="text-3xl font-black mb-4" style={{ color: colors.text }}>
                {getCurrencySymbol(cashbackBalance.currency)}
                {Number(cashbackBalance.available_balance / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
              <View className="h-[1px] mb-4" style={{ backgroundColor: colors.cardBorder }} />
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-sm" style={{ color: colors.textTertiary }}>Total Earned</Text>
                  <Text className="font-bold" style={{ color: colors.text }}>
                    {getCurrencySymbol(cashbackBalance.currency)}
                    {Number(cashbackBalance.total_earned / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => redeemMutation.mutate(undefined as any)}
                  disabled={cashbackBalance.available_balance < 10000 || redeemMutation.isPending}
                  className="px-6 py-3 rounded-2xl"
                  style={{ backgroundColor: cashbackBalance.available_balance < 10000 ? colors.disabledBg : colors.primary }}
                >
                  {redeemMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className={`font-bold text-sm ${cashbackBalance.available_balance < 10000 ? '' : 'text-white'}`} style={cashbackBalance.available_balance < 10000 ? { color: colors.textTertiary } : {}}>
                      Redeem
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {cashbackList.length > 0 && (
            <View className="rounded-[32px] shadow-sm mb-8 overflow-hidden" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
              <View className="px-6 py-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
                <Text className="font-bold" style={{ color: colors.text }}>History</Text>
              </View>
              {cashbackList.map((item: any, idx: number) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between px-6 py-4" style={{ borderBottomWidth: idx < cashbackList.length - 1 ? 1 : 0, borderBottomColor: colors.cardBorder }}
                >
                  <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.successLight }}>
                      <Feather name="arrow-down" size={14} color={colors.success} />
                    </View>
                    <View>
                      <Text className="text-sm font-bold" style={{ color: colors.text }}>{item.description}</Text>
                      <Text className="text-[10px] mt-0.5" style={{ color: colors.textSecondary }}>{formatDate(item.created_at)}</Text>
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
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>Referral</Text>

          <TouchableOpacity
            onPress={() => router.push('/rewards/refer')}
            className="p-6 rounded-[32px] shadow-sm mb-4 flex-row items-center" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}
          >
            <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="people-outline" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-base" style={{ color: colors.text }}>Refer & Earn</Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Invite friends, earn rewards</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {referralList.length > 0 && (
            <View className="rounded-[32px] shadow-sm mb-8 overflow-hidden" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
              <View className="px-6 py-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
                <Text className="font-bold" style={{ color: colors.text }}>History</Text>
              </View>
              {referralList.map((item: any, idx: number) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between px-6 py-4" style={{ borderBottomWidth: idx < referralList.length - 1 ? 1 : 0, borderBottomColor: colors.cardBorder }}
                >
                  <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mr-3">
                      <Ionicons name="people-outline" size={14} color={colors.primary} />
                    </View>
                    <View>
                      <Text className="text-sm font-bold" style={{ color: colors.text }}>{item.description}</Text>
                      <Text className="text-[10px] mt-0.5" style={{ color: colors.textSecondary }}>{formatDate(item.created_at)}</Text>
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
            <View className="rounded-[32px] p-8 shadow-sm items-center mb-10" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
              <View className="w-14 h-14 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colors.chevronBg }}>
                <Ionicons name="gift-outline" size={24} color={colors.textSecondary} />
              </View>
              <Text className="text-sm font-medium text-center" style={{ color: colors.textSecondary }}>No referrals yet</Text>
              <Text className="text-xs text-center mt-1" style={{ color: colors.textSecondary }}>Share your code to get started</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
