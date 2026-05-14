import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';
import { WalletService } from '@/services/modules/wallet.service';
import { useApiQuery } from '@/hooks/api/use-api';
import { useAuth } from '@/context/AuthContext';

export default function AmountEntryScreen() {
  const params = useLocalSearchParams();
  const [amount, setAmount] = useState('0.00');
  const [narration, setNarration] = useState('');
  const [balance, setBalance] = useState('');
  const { userToken, isLoading: isAuthLoading } = useAuth();

  const { data: walletData } = useApiQuery(
    ['wallet'],
    WalletService.getWalletBalance,
    { enabled: !isAuthLoading && !!userToken }
  );

  const formatMoney = (balanceValue: number | string) => {
    const scale = 2; // API returns values in smallest units (e.g. Kobo)
    const formatted = (Number(balanceValue || 0) / Math.pow(10, scale)).toFixed(scale);
    return Number(formatted).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  useEffect(() => {
    if (walletData?.wallets) {
      console.log('[AmountEntry] Wallets found:', walletData.wallets.length);
      const ngnWallet = walletData.wallets.find(w => 
        String(w.currency || '').toUpperCase() === 'NGN' || 
        String(w.currency || '').toUpperCase() === 'NAIRA'
      );
      if (ngnWallet) {
        setBalance(formatMoney(ngnWallet.balance));
      }
    }
  }, [walletData]);

  const quickAmounts = ['500.00', '1,000.00', '5,000.00'];

  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      if (amount.length <= 1) {
        setAmount('0.00');
      } else {
        // Simple logic for removing last digit while maintaining 2 decimal places
        const digits = amount.replace(/[.,]/g, '');
        const newDigits = digits.slice(0, -1);
        const floatValue = parseInt(newDigits || '0') / 100;
        setAmount(floatValue.toLocaleString(undefined, { minimumFractionDigits: 2 }));
      }
    } else {
      const digits = amount.replace(/[.,]/g, '');
      const newDigits = digits + key;
      const floatValue = parseInt(newDigits) / 100;
      setAmount(floatValue.toLocaleString(undefined, { minimumFractionDigits: 2 }));
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Enter Amount</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Beneficiary Card ... */}
        <View className="bg-white p-5 rounded-[32px] flex-row items-center mt-6 shadow-sm border border-gray-50">
          <View className="w-14 h-14 bg-[#5154F4] rounded-full items-center justify-center mr-4 overflow-hidden">
             <View className="items-center justify-center p-2">
               <Text className="text-white text-xs font-bold uppercase">
                 {params.bank ? (params.bank as string).slice(0, 2) : 'MT'}
               </Text>
             </View>
          </View>
          <View className="flex-1">
            <Text className="text-[#1F2C37] font-bold text-base mb-1">{params.name}</Text>
            <Text className="text-[#9DA3B6] text-xs">{params.account} - {params.bank}</Text>
          </View>
        </View>

        {/* Amount Display */}
        <View className="bg-white p-8 rounded-[40px] mt-4 items-center shadow-sm border border-gray-50">
          <Text className="text-[#9DA3B6] text-sm font-medium mb-4">Enter Amount</Text>
          <Text className="text-[#1F2C37] text-5xl font-extrabold mb-4">{amount}</Text>
          <Text className="text-[#9DA3B6] text-sm">Available balance : ₦{balance}</Text>
        </View>

        {/* Narration */}
        <View className="mt-6">
          <TextInput
            className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-5 text-[#1F2C37] font-medium"
            placeholder="Add narration (Optional)"
            placeholderTextColor="#9DA3B6"
            value={narration}
            onChangeText={setNarration}
          />
        </View>

        {/* Quick Amount Chips */}
        <View className="flex-row justify-between mt-6">
          {quickAmounts.map((val) => (
            <TouchableOpacity 
              key={val}
              onPress={() => setAmount(val)}
              className={`flex-1 mx-1 py-4 rounded-2xl items-center border ${amount === val ? 'bg-white border-[#5154F4]' : 'bg-white border-transparent'}`}
            >
              <Text className={`${amount === val ? 'text-[#5154F4]' : 'text-[#1F2C37]'} font-bold`}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          onPress={() => router.push(`/transfer/confirm?amount=${amount}&name=${params.name || ''}&account=${params.account || ''}&identifier=${params.identifier || params.account || ''}&bank=${params.bank || ''}&bank_code=${params.bank_code || ''}&type=${params.type || ''}&narration=${narration || ''}`)}
          className="bg-[#5154F4] mt-8 py-5 rounded-[28px] shadow-lg shadow-indigo-100 mb-6"
        >
          <Text className="text-white text-center text-lg font-bold">Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Keypad */}
      <View className="bg-[#D1D5DB]/30 pt-4 rounded-t-[40px]">
        <CustomKeypad 
          onPress={(key) => handleKeyPress(key)} 
          onDelete={() => handleKeyPress('delete')} 
        />
      </View>
    </SafeAreaView>
  );
}
