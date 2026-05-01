import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useApiQuery } from '@/hooks/api/use-api';
import { TransactionService } from '@/services/modules/transaction.service';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();

  const { data: rawData, isLoading } = useApiQuery(
    ['transactions'],
    () => TransactionService.getTransactions()
  );

  const transaction = useMemo(() => {
    const transactions = rawData?.data?.transactions || rawData?.transactions || (Array.isArray(rawData?.data) ? rawData.data : []);
    return transactions.find((t: any) => String(t.id) === String(id));
  }, [rawData, id]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FE] items-center justify-center">
        <ActivityIndicator size="large" color="#5154F4" />
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FE] items-center justify-center px-6">
        <Feather name="alert-circle" size={48} color="#9DA3B6" />
        <Text className="mt-4 text-[#1F2C37] text-lg font-bold">Transaction not found</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-6 bg-[#5154F4] px-8 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Format date and time
  const dateObj = new Date(transaction.created_at || transaction.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const isOutgoing = transaction.type === 'debit' || transaction.type?.toLowerCase().includes('transfer') || transaction.type?.toLowerCase().includes('swap');
  const currencySymbol = transaction.currency === 'USD' ? '$' : transaction.currency === 'GBP' ? '£' : '₦';

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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Details</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Status Badge & Amount */}
        <View className="items-center mt-8 mb-10">
          <View className={`w-20 h-20 ${transaction.status?.toLowerCase() === 'failed' ? 'bg-red-50' : 'bg-green-50'} rounded-full items-center justify-center mb-6`}>
             <Ionicons 
               name={transaction.status?.toLowerCase() === 'failed' ? "close" : "checkmark"} 
               size={40} 
               color={transaction.status?.toLowerCase() === 'failed' ? "#EF4444" : "#22C55E"} 
             />
          </View>
          <Text className="text-[#1F2C37] text-4xl font-extrabold mb-2">
            {isOutgoing ? '-' : '+'}{currencySymbol}{Number(transaction.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <Text className={`${transaction.status?.toLowerCase() === 'failed' ? 'text-red-500' : 'text-green-500'} font-bold`}>
            Transaction {transaction.status || 'Successful'}
          </Text>
        </View>

        {/* Info Card */}
        <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 mb-6">
          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Recipient</Text>
            <View className="items-end max-w-[60%]">
              <Text className="text-[#1F2C37] font-bold text-right" numberOfLines={1}>{transaction.recipient_name || transaction.recipient?.name || 'N/A'}</Text>
              <Text className="text-[#9DA3B6] text-xs mt-1">{transaction.recipient_account || 'N/A'}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Transaction Type</Text>
            <Text className="text-[#1F2C37] font-bold capitalize">{transaction.type || 'Transaction'}</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Date & Time</Text>
            <Text className="text-[#1F2C37] font-bold text-right">{formattedDate}, {formattedTime}</Text>
          </View>

          <View className="flex-row justify-between gap-4 mb-6 w-[65%]">
            <Text className="text-[#6C7278] font-medium">Reference Code</Text>
            <Text className="text-[#1F2C37] font-bold">{transaction.reference || transaction.id?.substring(0, 12).toUpperCase()}</Text>
          </View>

          <View className="h-[1px] bg-gray-100 mb-6" />

          <View className="flex-row justify-between mb-4">
            <Text className="text-[#6C7278] font-medium">Amount</Text>
            <Text className="text-[#1F2C37] font-bold">{currencySymbol}{Number(transaction.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="text-[#6C7278] font-medium">Fee</Text>
            <Text className="text-[#1F2C37] font-bold">{currencySymbol}{Number((transaction.fee || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-[#1F2C37] font-extrabold text-lg">Total Amount</Text>
            <Text className="text-[#1F2C37] font-extrabold text-lg">
                {currencySymbol}{Number((Number(transaction.amount) + Number(transaction.fee || 0)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Footer Actions */}
        <View className="flex-row gap-4 mb-10">
          <TouchableOpacity className="flex-1 bg-white border border-gray-100 py-5 rounded-[28px] items-center justify-center flex-row shadow-sm">
            <Feather name="share-2" size={20} color="#1F2C37" />
            <Text className="text-[#1F2C37] font-bold ml-2">Share</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/swap')}
            className="flex-1 bg-[#5154F4] py-5 rounded-[28px] items-center justify-center flex-row shadow-lg shadow-indigo-100"
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Repeat</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="items-center mb-10">
           <Text className="text-red-500 font-bold">Report a problem</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
