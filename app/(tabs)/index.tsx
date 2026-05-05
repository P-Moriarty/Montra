import { Config } from '@/constants/Config';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useApiQuery } from '@/hooks/api/use-api';
import { NotificationService } from '@/services/modules/notification.service';
import { ProfileService } from '@/services/modules/profile.service';
import { TransactionService } from '@/services/modules/transaction.service';
import { WalletService } from '@/services/modules/wallet.service';
import { Feather, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [showBalance, setShowBalance] = useState(true);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const { selectedCurrencyCode, setSelectedCurrencyCode } = useWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);

  const { userToken, isLoading: isAuthLoading } = useAuth();

  const canFetchProtectedData = !isAuthLoading && !!userToken;

  const { data: user, isLoading: isProfileLoading } = useApiQuery(['profile'], ProfileService.getProfile, {
    enabled: canFetchProtectedData,
  });

  const { data: transactionsData, isLoading: isTransactionsLoading } = useApiQuery(
    ['transactions', 'recent'],
    () => TransactionService.getRecentTransactions(3),
    { enabled: canFetchProtectedData }
  );

  const transactions = transactionsData?.data || transactionsData?.transactions || [];

  const {
    data: walletData,
    isLoading: isWalletLoading,
    error: walletError,
    refetch: refetchWallets,
    isRefetching: isWalletRefetching,
  } = useApiQuery(['wallet'], WalletService.getWalletBalance, {
    enabled: canFetchProtectedData,
  });


  const { data: notificationsData } = useApiQuery(
    ['notifications'],
    () => NotificationService.getNotifications({ page: 1, limit: 10 }),
    { enabled: canFetchProtectedData }
  );

  const notifications = notificationsData?.data || notificationsData?.notifications || [];
  const hasUnreadNotifications = notifications.length > 0;

  const availableCurrencies = useMemo(() => {
    const wallets = walletData?.wallets ?? [];
    return wallets.map((wallet: any) => {
      const code = String(wallet.currency || '').toUpperCase();
      const meta = CURRENCY_METADATA[code] || {
        symbol: code,
        flag: 'us',
        name: code,
      };
      return {
        ...wallet,
        code,
        ...meta,
      };
    });
  }, [walletData?.wallets]);

  // Sync selection with available wallets
  React.useEffect(() => {
    if (availableCurrencies.length > 0) {
      // Priority: 1. Current selectedCurrencyCode from context, 2. First available wallet
      const targetCode = selectedCurrencyCode || availableCurrencies[0].code;
      const found = availableCurrencies.find(c => c.code === targetCode) || availableCurrencies[0];

      if (!selectedCurrency || selectedCurrency.code !== found.code || selectedCurrency.balance !== found.balance) {
        setSelectedCurrency(found);
        if (selectedCurrencyCode !== found.code) {
          setSelectedCurrencyCode(found.code);
        }
      }
    }
  }, [availableCurrencies, selectedCurrencyCode, selectedCurrency, setSelectedCurrencyCode]);

  const currentWallet = selectedCurrency || { balance: 0, symbol: '', code: '', flag: 'us' };

  const imageUrl = useMemo(() => {
    const avatar = user?.profilePicture;

    if (!avatar) return 'https://i.pravatar.cc/150';
    if (avatar.startsWith('http')) return avatar;

    const baseUrl = Config.api.baseUrl
      .replace('/api/v1', '')
      .replace(/\/$/, '');

    const cleanAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;

    return `${baseUrl}${cleanAvatar}?t=${Date.now()}`;
  }, [user?.profilePicture]);

  const isInitialDashboardLoading =
    isAuthLoading || ((isProfileLoading || isWalletLoading) && (!user || !walletData));

  if (isInitialDashboardLoading) {
    return <HomeSkeleton />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Header Section */}
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-3">
              <Image
                source={{ uri: imageUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            <Text className="text-[#1F2C37] text-lg font-bold">
              {isProfileLoading ? 'Loading...' : `Hello, ${user?.full_name?.split(' ')[0] || 'User'}`}
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => refetchWallets()}
              disabled={isWalletRefetching}
              className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm mr-2"
            >
              {isWalletRefetching ? (
                <ActivityIndicator size="small" color="#5154F4" />
              ) : (
                <Ionicons name="refresh" size={20} color="#5154F4" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/notifications' as any)}
              className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm relative"
            >
              <Ionicons name="notifications-outline" size={20} color="#1F2C37" />
              {hasUnreadNotifications && (
                <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Multi-Currency Balance Switcher */}
        <View className="mt-10 items-center">
          <Text className="text-[#6C7278] text-sm mb-4 font-semibold uppercase tracking-widest">
            Available balance
          </Text>

          {isWalletLoading ? (
            <ActivityIndicator color="#5154F4" className="mb-6" />
          ) : walletError ? (
            <Text className="text-red-500 text-sm mb-6">Unable to load wallet balance</Text>
          ) : (
            <View className="flex-row items-center mb-6">
              <Text className="text-[#1F2C37] text-4xl font-extrabold mr-3">
                {showBalance
                  ? `${currentWallet.symbol}${Number((currentWallet.balance ?? 0) / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                  : '••••••'}
              </Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                <Ionicons
                  name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#6C7278"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Currency Dropdown Selector */}
          <View className="relative">
            <TouchableOpacity
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
              className="flex-row items-center bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100"
            >
              <Image
                source={{ uri: `https://flagcdn.com/w80/${currentWallet.flag}.png` }}
                className="w-6 h-4 rounded-sm mr-2"
              />
              <Text className="text-[#1F2C37] font-bold mr-2">{currentWallet.code}</Text>
              <Feather
                name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#1F2C37"
              />
            </TouchableOpacity>

            {showCurrencyPicker && availableCurrencies.length > 0 && (
              <View className="absolute top-14 left-0 right-0 bg-white rounded-3xl p-2 shadow-xl z-50 border border-gray-100 min-w-[120px]">
                {availableCurrencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    onPress={() => {
                      setSelectedCurrencyCode(currency.code);
                      setShowCurrencyPicker(false);
                    }}
                    className={`flex-row items-center p-3 rounded-2xl ${selectedCurrency.code === currency.code ? 'bg-[#F0F1FF]' : ''}`}
                  >
                    <Image
                      source={{ uri: `https://flagcdn.com/w80/${currency.flag}.png` }}
                      className="w-5 h-3.5 rounded-sm mr-2"
                    />
                    <Text className={`font-bold ${selectedCurrency.code === currency.code ? 'text-[#5154F4]' : 'text-[#1F2C37]'}`}>
                      {currency.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mt-12 bg-white p-6 rounded-[32px] shadow-sm">
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push('/transfer')}
          >
            <View className="w-14 h-14 bg-[#5154F4] rounded-2xl items-center justify-center mb-2">
              <Feather name="send" size={24} color="white" />
            </View>
            <Text className="text-[#6C7278] font-bold">Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={() => router.push('/deposit-ngn')}
          >
            <View className="w-14 h-14 bg-[#5154F4]/10 rounded-2xl items-center justify-center mb-2">
              <Ionicons name="download-outline" size={24} color="#5154F4" />
            </View>
            <Text className="text-[#6C7278] font-bold">Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={() => router.push('/request')}
          >
            <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mb-2">
              <FontAwesome6 name="hand-holding-dollar" size={24} color="#5154F4" />
            </View>
            <Text className="text-[#6C7278] font-bold">Request</Text>
          </TouchableOpacity>
        </View>

        {/* Exchange Rate Card */}
        <View className="mt-8">
          <Text className="text-[#1F2C37] text-lg font-bold mb-4">Exchange Rate</Text>
          <View className="bg-white p-6 rounded-3xl border border-gray-100 flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-[#1F2C37] text-base font-bold">
                  USD 1
                  <Image
                    source={{ uri: 'https://flagcdn.com/w80/us.png' }}
                    className="w-4 h-3 rounded-sm mx-1"
                  />
                  <Text className="font-normal text-gray-400 mx-1">⇌</Text>
                  NGN 1,400.00
                  <Image
                    source={{ uri: 'https://flagcdn.com/w80/ng.png' }}
                    className="w-4 h-3 rounded-sm mx-1"
                  />
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/exchange-rates')}
                className="bg-[#5154F4] px-4 py-2 rounded-xl self-start"
              >
                <Text className="text-white font-bold">View more</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require('@/assets/images/Foreign Exchange on the International Market.png')}
              style={{ width: 100, height: 100 }}
            />
          </View>
        </View>

        {/* Quick Services */}
        <View className="mt-8">
          <Text className="text-[#1F2C37] text-lg font-bold mb-4">Quick Services</Text>
          <View className="flex-row justify-between">
            {[
              { label: 'Savings', icon: 'piggy-bank-outline', lib: 'MaterialCommunityIcons' },
              { label: 'Pay bills', icon: 'rss', lib: 'Feather' },
              { label: 'Rewards', icon: 'gift-outline', lib: 'Ionicons' },
              { label: 'More', icon: 'ellipsis-horizontal', lib: 'Ionicons' }
            ].map((service, index) => (
              <TouchableOpacity
                key={index}
                className="items-center"
                onPress={() => {
                  if (service.label === 'Pay bills') router.push('/pay-bills');
                  if (service.label === 'Savings') router.push('/savings');
                  if (service.label === 'Rewards') router.push('/rewards');
                }}
              >
                <View className="w-16 h-16 bg-[#F0F1FF] rounded-full items-center justify-center shadow-sm mb-2">
                  {service.lib === 'MaterialCommunityIcons' && <MaterialCommunityIcons name={service.icon as any} size={26} color="#5154F4" />}
                  {service.lib === 'Feather' && <Feather name={service.icon as any} size={24} color="#5154F4" />}
                  {service.lib === 'Ionicons' && <Ionicons name={service.icon as any} size={26} color="#5154F4" />}
                </View>
                <Text className="text-[#6C7278] text-sm font-medium">{service.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#1F2C37] text-lg font-bold">Recent transaction</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-[#5154F4] font-bold mr-1" onPress={() => router.push('/transaction-history')}>View more</Text>
              <Feather name="chevron-right" size={16} color="#5154F4" />
            </TouchableOpacity>
          </View>

          {isTransactionsLoading ? (
            <ActivityIndicator color="#5154F4" className="my-8" />
          ) : transactions.length === 0 ? (
            <View className="bg-white p-8 rounded-3xl items-center justify-center border border-gray-100">
              <Feather name="list" size={32} color="#9DA3B6" />
              <Text className="text-[#9DA3B6] mt-2 font-bold">No transactions yet</Text>
            </View>
          ) : (
            transactions.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/transaction/${item.id}` as any)}
                className="bg-white p-4 rounded-3xl flex-row items-center mb-3 shadow-sm border border-gray-50"
              >
                <View className={`w-12 h-12 ${item.status?.toLowerCase() === 'failed' ? 'bg-red-50' : 'bg-blue-50'} rounded-full items-center justify-center mr-4`}>
                  <Feather
                    name={item.type === 'send' ? 'send' : 'download'}
                    size={20}
                    color={item.status?.toLowerCase() === 'failed' ? '#EF4444' : '#5154F4'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[#1F2C37] font-bold text-base mb-1" numberOfLines={1}>
                    {item.title || item.description || 'Transaction'}
                  </Text>
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: `https://flagcdn.com/w80/${item.flag || 'us'}.png` }}
                      className="w-4 h-3 rounded-sm mr-2"
                    />
                    <Text className="text-[#9DA3B6] text-xs">{item.date || item.createdAt}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className={`font-bold text-base ${item.status?.toLowerCase() === 'failed' ? 'text-red-500' : (item.type === 'send' ? 'text-[#1F2C37]' : 'text-green-600')}`}>
                    {item.type === 'send' ? '-' : '+'}₦{Number(item.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Text>
                  <View className={`${item.status?.toLowerCase() === 'failed' ? 'bg-red-50' : 'bg-green-50'} px-2 py-0.5 rounded-md mt-1`}>
                    <Text className={`${item.status?.toLowerCase() === 'failed' ? 'text-red-500' : 'text-green-500'} text-[10px] font-bold`}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      <View className="px-5">
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-white/60 mr-3 animate-pulse" />
            <View className="w-32 h-6 bg-white/60 rounded-xl animate-pulse" />
          </View>
          <View className="flex-row">
            <View className="w-10 h-10 rounded-full bg-white/60 mr-2 animate-pulse" />
            <View className="w-10 h-10 rounded-full bg-white/60 animate-pulse" />
          </View>
        </View>

        <View className="mt-10 items-center">
          <View className="w-40 h-4 bg-white/60 rounded-md mb-4 animate-pulse" />
          <View className="w-64 h-12 bg-white/60 rounded-2xl mb-6 animate-pulse" />
          <View className="w-24 h-10 bg-white/60 rounded-full animate-pulse" />
        </View>

        <View className="flex-row justify-between bg-white/40 p-6 rounded-[32px] mt-10 border border-white/40">
          {[1, 2, 3].map((_, i) => (
            <View key={i} className="items-center">
              <View className="w-14 h-14 bg-white/60 rounded-2xl mb-2 animate-pulse" />
              <View className="w-12 h-3 bg-white/60 rounded animate-pulse" />
            </View>
          ))}
        </View>

        <View className="mt-10">
          <View className="w-32 h-6 bg-white/60 rounded-lg mb-4 animate-pulse" />
          <View className="flex-row justify-between">
            {[1, 2, 3, 4].map((_, i) => (
              <View key={i} className="items-center">
                <View className="w-16 h-16 bg-white/60 rounded-full mb-2 animate-pulse" />
                <View className="w-12 h-3 bg-white/60 rounded animate-pulse" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CURRENCY_METADATA: Record<string, { symbol: string; flag: string; name: string }> = {
  USD: { symbol: '$', flag: 'us', name: 'US Dollar' },
  NGN: { symbol: '₦', flag: 'ng', name: 'Nigerian Naira' },
  GBP: { symbol: '£', flag: 'gb', name: 'British Pound' },
  EUR: { symbol: '€', flag: 'eu', name: 'Euro' },
  CAD: { symbol: '$', flag: 'ca', name: 'Canadian Dollar' },
  AUD: { symbol: '$', flag: 'au', name: 'Australian Dollar' },
  BRL: { symbol: 'R$', flag: 'br', name: 'Brazilian Real' },
};
