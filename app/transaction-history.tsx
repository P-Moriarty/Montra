import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Sample transactions with diverse types
const ALL_TRANSACTIONS = [
  { id: '1', title: 'Transfer to Emezue chinonso', date: 'Apr 16, 2025', time: '10:05 PM', amount: '₦5,000.00', type: 'transfer', status: 'Failed', category: 'send' },
  { id: '2', title: 'Swap NGN to USD', date: 'Apr 16, 2025', time: '03:00 PM', amount: '$200.00', type: 'swap', status: 'Completed', category: 'receive' },
  { id: '3', title: 'Payment from Trefix company', date: 'Apr 15, 2025', time: '11:00 AM', amount: '$400.00', type: 'deposit', status: 'Completed', category: 'receive' },
  { id: '4', title: 'Request from Chinonso', date: 'Apr 15, 2025', time: '09:00 AM', amount: '₦10,000.00', type: 'request', status: 'Pending', category: 'receive' },
  { id: '5', title: 'Transfer to Tegadesigns', date: 'Apr 12, 2025', time: '10:05 PM', amount: '$100.00', type: 'transfer', status: 'Failed', category: 'send' },
  { id: '6', title: 'Swap USD to NGN', date: 'Mar 30, 2025', time: '03:00 PM', amount: '₦14,000.00', type: 'swap', status: 'Completed', category: 'receive' },
];

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Transfer', 'Swap', 'Deposit', 'Request'];

  // Grouping logic
  const groupedTransactions = useMemo(() => {
    const filtered = ALL_TRANSACTIONS.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === 'All' || t.type.toLowerCase() === activeFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });

    const groups: { [key: string]: typeof ALL_TRANSACTIONS } = {};
    const today = 'Apr 16, 2025'; // Mocked "today"
    const yesterday = 'Apr 15, 2025';

    filtered.forEach(t => {
      let label = t.date;
      if (t.date === today) label = 'Today';
      else if (t.date === yesterday) label = 'Yesterday';
      
      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
    });

    return groups;
  }, [search, activeFilter]);

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
          <Feather name="sliders" size={20} color={activeFilter !== 'All' ? '#5154F4' : '#1F2C37'} />
          {activeFilter !== 'All' && <View className="absolute top-3 right-3 w-2 h-2 bg-[#5154F4] rounded-full" />}
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {Object.keys(groupedTransactions).map((date) => (
          <View key={date} className="mb-6">
            <Text className="text-[#6C7278] text-sm font-bold mb-4 uppercase tracking-wider">{date}</Text>
            {groupedTransactions[date].map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => router.push(`/transaction/${item.id}`)}
                className="bg-white p-4 rounded-[32px] flex-row items-center mb-3 border border-gray-50 shadow-sm"
              >
                <View className={`w-12 h-12 ${item.category === 'send' ? 'bg-indigo-50' : 'bg-blue-50'} rounded-full items-center justify-center mr-4`}>
                  <Feather 
                    name={item.category === 'send' ? "send" : "download"} 
                    size={20} 
                    color="#5154F4" 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[#1F2C37] font-bold text-sm mb-1" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-[#9DA3B6] text-[10px]">{item.time}</Text>
                </View>
                <View className="items-end">
                  <Text className={`text-[#1F2C37] font-bold text-sm ${item.category === 'send' ? '' : 'text-green-600'}`}>
                    {item.category === 'send' ? '-' : '+'}{item.amount}
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
        ))}
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
            <View className="flex-row flex-wrap gap-2">
              {filters.map((f) => (
                <TouchableOpacity 
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  className={`px-6 py-3 rounded-2xl border ${activeFilter === f ? 'bg-[#5154F4] border-[#5154F4]' : 'bg-white border-gray-100'}`}
                >
                  <Text className={`font-bold ${activeFilter === f ? 'text-white' : 'text-[#6C7278]'}`}>{f}</Text>
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
