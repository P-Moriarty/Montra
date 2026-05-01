import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useApiQuery } from '@/hooks/api/use-api';
import { TransactionService } from '@/services/modules/transaction.service';
import { useRouter } from 'expo-router';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activeType, setActiveType] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeCurrency, setActiveCurrency] = useState('All');

  // Industrial-grade historical data feed integration
  const { data: historyData, isLoading } = useApiQuery(
    ['transactions', activeType, activeStatus, activeCurrency, search],
    () => TransactionService.getTransactions({
      type: activeType === 'All' ? undefined : activeType.toLowerCase(),
      status: activeStatus === 'All' ? undefined : activeStatus.toLowerCase(),
      currency: activeCurrency === 'All' ? undefined : activeCurrency,
      limit: 50
    })
  );

  const transactions = useMemo(() => 
    historyData?.items || historyData?.data || historyData?.transactions || [],
    [historyData]
  );

  const types = ['All', 'Transfer', 'Swap', 'Deposit', 'Request'];
  const statuses = ['All', 'Completed', 'Pending', 'Failed'];

  const groupedTransactions = useMemo(() => {
    const filtered = transactions.filter((t: any) => 
      (t.title || t.description || '').toLowerCase().includes(search.toLowerCase())
    );

    const groups: { [key: string]: any[] } = {};
    
    const formatLabel = (dateStr: string) => {
      if (!dateStr) return 'Unknown Date';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (d.toDateString() === today.toDateString()) return 'Today';
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    filtered.forEach((t: any) => {
      const label = formatLabel(t.date || t.created_at || t.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
    });

    return groups;
  }, [transactions, search]);

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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Transactions History</Text>
      </View>

      {/* Search & Filter Row */}
      <View className="flex-row items-center px-5 mb-4">
        <View className="flex-1 flex-row items-center bg-white h-14 rounded-2xl px-4 border border-gray-100 shadow-sm">
          <Feather name="search" size={20} color="#9DA3B6" />
          <TextInput
            className="flex-1 ml-3 text-[#1F2C37] font-medium"
            placeholder="Search transaction"
            placeholderTextColor="#9DA3B6"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity 
          onPress={() => setShowFilter(true)}
          className="w-14 h-14 bg-white rounded-2xl items-center justify-center ml-3 border border-gray-100 shadow-sm"
        >
          <Feather name="sliders" size={20} color={(activeType !== 'All' || activeStatus !== 'All') ? '#5154F4' : '#1F2C37'} />
          {(activeType !== 'All' || activeStatus !== 'All') && <View className="absolute top-3 right-3 w-2 h-2 bg-[#5154F4] rounded-full" />}
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoading ? (
          <ActivityIndicator color="#5154F4" className="mt-10" />
        ) : Object.keys(groupedTransactions).length === 0 ? (
          <View className="bg-white p-10 rounded-[32px] items-center justify-center mt-6 border border-gray-100 italic">
            <Feather name="list" size={40} color="#9DA3B6" />
            <Text className="text-[#9DA3B6] mt-4 font-bold text-center">No transactions found matching your criteria</Text>
          </View>
        ) : (
          Object.keys(groupedTransactions).map((date) => (
            <View key={date} className="mb-6">
              <Text className="text-[#6C7278] text-sm font-bold mb-4 uppercase tracking-wider">{date}</Text>
              {groupedTransactions[date].map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => router.push(`/transaction/${item.id}` as any)}
                  className="bg-white p-4 rounded-[32px] flex-row items-center mb-3 border border-gray-50 shadow-sm"
                >
                  <View className={`w-12 h-12 ${item.type === 'send' ? 'bg-indigo-50' : 'bg-blue-50'} rounded-full items-center justify-center mr-4`}>
                    <Feather 
                      name={item.type === 'send' ? "send" : "download"} 
                      size={20} 
                      color="#5154F4" 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#1F2C37] font-bold text-sm mb-1" numberOfLines={1}>
                      {item.title || item.description || 'Transaction'}
                    </Text>
                    <Text className="text-[#9DA3B6] text-[10px]">{item.time || '...'}</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`text-[#1F2C37] font-bold text-sm ${item.type === 'send' ? '' : 'text-green-600'}`}>
                      {item.type === 'send' ? '-' : '+'}{item.amount}
                    </Text>
                    <View className={`${item.status === 'Failed' ? 'bg-red-50' : item.status === 'Pending' ? 'bg-amber-50' : 'bg-green-50'} px-2 py-0.5 rounded-md mt-1 border ${item.status === 'Failed' ? 'border-red-100' : item.status === 'Pending' ? 'border-amber-100' : 'border-green-100'}`}>
                      <Text className={`${item.status === 'Failed' ? 'text-red-500' : item.status === 'Pending' ? 'text-amber-500' : 'text-green-500'} text-[10px] font-bold`}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[48px] px-6 pt-10 pb-12">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-[#1F2C37] text-2xl font-bold">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="close-circle" size={32} color="#E5E7EB" />
              </TouchableOpacity>
            </View>

            <Text className="text-[#1F2C37] font-bold text-lg mb-4">Transaction Type</Text>
            <View className="flex-row flex-wrap gap-2 mb-8">
              {types.map((f) => (
                <TouchableOpacity 
                  key={f}
                  onPress={() => setActiveType(f)}
                  className={`px-6 py-3 rounded-2xl border ${activeType === f ? 'bg-[#5154F4] border-[#5154F4]' : 'bg-white border-gray-100'}`}
                >
                  <Text className={`font-bold ${activeType === f ? 'text-white' : 'text-[#6C7278]'}`}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-[#1F2C37] font-bold text-lg mb-4">Transaction Status</Text>
            <View className="flex-row flex-wrap gap-2">
              {statuses.map((s) => (
                <TouchableOpacity 
                  key={s}
                  onPress={() => setActiveStatus(s)}
                  className={`px-6 py-3 rounded-2xl border ${activeStatus === s ? 'bg-[#5154F4] border-[#5154F4]' : 'bg-white border-gray-100'}`}
                >
                  <Text className={`font-bold ${activeStatus === s ? 'text-white' : 'text-[#6C7278]'}`}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              onPress={() => setShowFilter(false)}
              className="bg-[#333] mt-10 py-5 rounded-[28px] shadow-lg shadow-gray-200"
            >
              <Text className="text-white text-center text-lg font-bold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
