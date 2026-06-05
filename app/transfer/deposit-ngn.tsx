import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApiQuery } from '@/hooks/api/use-api';
import { WalletService } from '@/services/modules/wallet.service';

export default function DepositScreen() {
  const router = useRouter();

  const { data: accountsData, isLoading } = useApiQuery(['fiatAccounts'], async () => {
    const response = await WalletService.getFiatAccounts();
    // console.log('[Deposit Debug] Fiat Accounts:', JSON.stringify(response, null, 2));
    return response;
  });

  const accounts = useMemo(() => {
    return accountsData?.accounts || accountsData?.data?.accounts || [];
  }, [accountsData]);

  const renderAccountDetails = (account: any) => {
    const details = account.account_details || {};
    const items = [];

    // Add generic info
    items.push({ label: 'Account Name', value: account.account_name });
    items.push({ label: 'Bank Name', value: account.bank_name });

    // Handle dynamic details based on what's available
    if (details.account_number) items.push({ label: 'Account Number', value: details.account_number });
    if (details.iban) items.push({ label: 'IBAN', value: details.iban });
    if (details.routing_number) items.push({ label: 'Routing Number', value: details.routing_number });
    if (details.sort_code) items.push({ label: 'Sort Code', value: details.sort_code });
    if (details.swift_code) items.push({ label: 'SWIFT/BIC', value: details.swift_code || details.bic });
    if (details.account_type) items.push({ label: 'Account Type', value: details.account_type.toUpperCase() });

    return (
      <View key={account.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-6">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
             <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3">
               <Text className="text-[#5154F4] font-bold text-xs">{account.currency.toUpperCase()}</Text>
             </View>
             <Text className="text-[#1F2C37] text-lg font-black">{account.currency.toUpperCase()} Account</Text>
          </View>
          <View className="bg-green-50 px-3 py-1 rounded-full">
            <Text className="text-green-600 text-[10px] font-bold">ACTIVE</Text>
          </View>
        </View>

        {items.map((item, idx) => (
          <View key={idx} className={idx !== items.length - 1 ? 'mb-5' : ''}>
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-[#9DA3B6] text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</Text>
                <Text className="text-[#1F2C37] text-base font-bold" numberOfLines={1}>{item.value}</Text>
              </View>
              <TouchableOpacity className="p-2">
                <Ionicons name="copy-outline" size={18} color="#9DA3B6" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity className="mt-6 flex-row items-center justify-center bg-[#F0F1FF] py-4 rounded-2xl border border-blue-50">
          <Feather name="share" size={18} color="#5154F4" />
          <Text className="text-[#5154F4] font-bold ml-2">Share Details</Text>
        </TouchableOpacity>
      </View>
    );
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Deposit Funds</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-[#1F2C37] text-lg font-medium mt-6 mb-8 leading-6">
          Receive funds securely using any of your available fiat accounts below.
        </Text>

        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator color="#5154F4" size="large" />
            <Text className="text-[#9DA3B6] mt-4 font-bold">Fetching your accounts...</Text>
          </View>
        ) : accounts.length === 0 ? (
          <View className="bg-white p-10 rounded-[40px] items-center justify-center mt-6 border border-gray-50 italic">
             <Ionicons name="alert-circle-outline" size={48} color="#9DA3B6" />
             <Text className="text-[#9DA3B6] mt-4 font-bold text-center">No fiat accounts found. Please contact support.</Text>
          </View>
        ) : (
          <View className="pb-10">
            {accounts.map((acc: any) => renderAccountDetails(acc))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
