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
import { useTheme } from '@/context/ThemeContext';

export default function ReferScreen() {
  const { colors } = useTheme();
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
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
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Refer & Earn</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <View className="items-center mt-10 mb-8">
          <View className="w-20 h-20 rounded-full items-center justify-center shadow-sm mb-4" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
            <Ionicons name="people-outline" size={40} color={colors.primary} />
          </View>
          <Text className="text-2xl font-black mb-2 text-center" style={{ color: colors.text }}>Refer your friends</Text>
          <Text className="text-center text-sm leading-6 px-4" style={{ color: colors.textSecondary }}>
            Earn rewards for every friend that signs up using your code.
          </Text>
        </View>

        {/* Referral Code Card */}
        <View className="p-8 rounded-[48px] shadow-sm mb-6 items-center" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
          <Text className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: colors.textTertiary }}>Your Referral Code</Text>
          <View className="px-8 py-5 rounded-[32px] flex-row items-center" style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.primary + '40', borderWidth: 1, borderStyle: 'dashed' }}>
            <Text className="text-2xl font-black mr-4" style={{ color: colors.text }}>{referralCode}</Text>
            <TouchableOpacity onPress={handleCopy} className="p-2 rounded-xl shadow-sm" style={{ backgroundColor: colors.surface }}>
              <Feather name="copy" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 p-5 rounded-[32px] shadow-sm items-center" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
            <Text className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textSecondary }}>Referrals</Text>
            {loadingCount ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text className="text-3xl font-black" style={{ color: colors.text }}>{referralCount}</Text>
            )}
          </View>
          <View className="flex-1 p-5 rounded-[32px] shadow-sm items-center" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
            <Text className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textSecondary }}>Pending</Text>
            {loadingBalance ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text className="text-orange-500 text-3xl font-black">₦{(pendingBalance / 100).toLocaleString()}</Text>
            )}
          </View>
        </View>

        {/* Withdrawable + Redeem */}
        <View className="p-6 rounded-[32px] shadow-sm mb-6" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Withdrawable Balance</Text>
            {loadingBalance ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text className="text-2xl font-black" style={{ color: colors.text }}>₦{(withdrawableBalance / 100).toLocaleString()}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => redeemMutation.mutate(undefined as any)}
            disabled={withdrawableBalance <= 0 || redeemMutation.isPending}
            className="py-4 rounded-2xl items-center"
            style={{ backgroundColor: withdrawableBalance > 0 ? colors.primary : colors.disabledBg }}
          >
            {redeemMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`font-bold text-base ${withdrawableBalance > 0 ? 'text-white' : ''}`} style={withdrawableBalance > 0 ? {} : { color: colors.textTertiary }}>
                Redeem to Wallet
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Share Button */}
        <TouchableOpacity 
          onPress={handleShare}
          className="py-5 rounded-[28px] flex-row items-center justify-center mb-10" style={{ backgroundColor: colors.primary }}
        >
          <Feather name="share-2" size={20} color="white" />
          <Text className="text-white text-center text-lg font-bold ml-2">Share Invite Link</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
