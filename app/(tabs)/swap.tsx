import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.00, flag: 'us' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1400.00, flag: 'ng' },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79, flag: 'gb' },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.93, flag: 'eu' },
];

export default function SwapScreen() {
  const [fromCurrency, setFromCurrency] = useState(CURRENCIES[0]); // USD
  const [toCurrency, setToCurrency] = useState(CURRENCIES[1]); // NGN
  const [fromAmount, setFromAmount] = useState('0.00');
  const [showSelector, setShowSelector] = useState<{ visible: boolean; type: 'from' | 'to' }>({ visible: false, type: 'from' });
  const [isKeypadVisible, setIsKeypadVisible] = useState(false);
  const [search, setSearch] = useState('');

  // Calculate the exchange rate between selected currencies
  const currentRate = useMemo(() => {
    return (toCurrency.rate / fromCurrency.rate).toFixed(2);
  }, [fromCurrency, toCurrency]);

  // Calculate the target amount
  const toAmount = useMemo(() => {
    const rawValue = parseFloat(fromAmount.replace(/[.,]/g, '')) / 100;
    const converted = rawValue * (toCurrency.rate / fromCurrency.rate);
    return converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [fromAmount, fromCurrency, toCurrency]);

  const handleKeyPress = (key: string) => {
    const digits = fromAmount.replace(/[.,]/g, '');
    const newDigits = digits + key;
    const floatValue = parseInt(newDigits) / 100;
    setFromAmount(floatValue.toLocaleString(undefined, { minimumFractionDigits: 2 }));
  };

  const handleDelete = () => {
    if (fromAmount === '0.00') return;
    const digits = fromAmount.replace(/[.,]/g, '');
    const newDigits = digits.slice(0, -1);
    const floatValue = parseInt(newDigits || '0') / 100;
    setFromAmount(floatValue.toLocaleString(undefined, { minimumFractionDigits: 2 }));
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const filteredCurrencies = CURRENCIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Swap</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        <View className="relative mt-8">
          {/* From Card */}
          <View className="bg-white p-6 rounded-[32px] mb-2 shadow-sm border border-white">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity 
                onPress={() => setShowSelector({ visible: true, type: 'from' })}
                className="flex-row items-center bg-gray-50 px-3 py-2 rounded-2xl border border-gray-100"
              >
                <Image 
                  source={{ uri: `https://flagcdn.com/w80/${fromCurrency.flag}.png` }} 
                  className="w-6 h-4 rounded-sm mr-2"
                />
                <Text className="text-[#1F2C37] font-bold mr-1">{fromCurrency.code}</Text>
                <Feather name="chevron-down" size={16} color="#1F2C37" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setIsKeypadVisible(true)}>
                <Text className={`text-3xl font-bold ${isKeypadVisible ? 'text-[#5154F4]' : 'text-[#1F2C37]'}`}>
                  {fromCurrency.symbol}{fromAmount}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between mt-6">
              <Text className="text-[#9DA3B6] font-medium">Balance : $2,000.00</Text>
              <Text className="text-[#5154F4] font-bold">Max</Text>
            </View>
          </View>

          {/* Swap Button */}
          <View className="absolute left-1/2 -ml-7 top-[44%] z-10">
            <TouchableOpacity 
              onPress={handleSwap}
              className="bg-[#333] w-14 h-14 rounded-full items-center justify-center border-4 border-[#E5E5F5] shadow-lg"
            >
              <MaterialCommunityIcons name="swap-vertical" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* To Card */}
          <View className="bg-white/80 p-6 rounded-[32px] shadow-sm border border-white mt-1">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity 
                onPress={() => setShowSelector({ visible: true, type: 'to' })}
                className="flex-row items-center bg-gray-50 px-3 py-2 rounded-2xl border border-gray-100"
              >
                <Image 
                  source={{ uri: `https://flagcdn.com/w80/${toCurrency.flag}.png` }} 
                  className="w-6 h-4 rounded-sm mr-2"
                />
                <Text className="text-[#1F2C37] font-bold mr-1">{toCurrency.code}</Text>
                <Feather name="chevron-down" size={16} color="#1F2C37" />
              </TouchableOpacity>
              <Text className="text-[#1F2C37] text-3xl font-bold opacity-60">
                {toCurrency.symbol}{toAmount}
              </Text>
            </View>
            <View className="mt-6">
              <Text className="text-[#9DA3B6] font-medium text-xs uppercase tracking-widest">Rate: 1 {fromCurrency.code} ≈ {currentRate} {toCurrency.code}</Text>
            </View>
          </View>
        </View>

        {/* Transaction Details */}
        <View className="bg-white/40 p-6 rounded-[40px] mt-6 border border-white/20">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#6C7278] font-medium">Exchange Rate</Text>
            <Text className="text-[#1F2C37] font-bold">1 {fromCurrency.code} = {currentRate} {toCurrency.code}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#6C7278] font-medium">Fee</Text>
            <Text className="text-green-600 font-bold">Free</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-[#6C7278] font-medium">Arrives</Text>
            <Text className="text-[#1F2C37] font-bold">Instantly</Text>
          </View>
        </View>

        <TouchableOpacity className="bg-[#5154F4] mt-10 py-5 rounded-[28px] shadow-lg shadow-indigo-100">
          <Text className="text-white text-center text-lg font-bold">Review Swap</Text>
        </TouchableOpacity>

        <View className="h-10" />
      </ScrollView>

      {/* Keypad Modal (Above Tab Bar) */}
      <Modal visible={isKeypadVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/10" onPress={() => setIsKeypadVisible(false)} />
          <View className="bg-white rounded-t-[48px] shadow-2xl overflow-hidden">
             <View className="items-center py-2">
                <View className="w-12 h-1.5 bg-gray-100 rounded-full" />
             </View>
             <CustomKeypad 
               onPress={handleKeyPress} 
               onDelete={handleDelete} 
             />
          </View>
        </View>
      </Modal>

      {/* Currency Selector Modal */}
      <Modal visible={showSelector.visible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[48px] px-6 pt-10 pb-8 h-[70%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#1F2C37] text-2xl font-bold">Select Currency</Text>
              <TouchableOpacity onPress={() => setShowSelector({ visible: false, type: 'from' })}>
                <Ionicons name="close-circle" size={32} color="#E5E7EB" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="flex-row items-center bg-gray-50 h-14 rounded-2xl px-4 mb-6 border border-gray-100">
              <Feather name="search" size={20} color="#9DA3B6" />
              <TextInput 
                className="flex-1 ml-3 font-medium text-[#1F2C37]"
                placeholder="Search currency"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredCurrencies.map((c) => (
                <TouchableOpacity 
                  key={c.code}
                  onPress={() => {
                    if (showSelector.type === 'from') setFromCurrency(c);
                    else setToCurrency(c);
                    setShowSelector({ visible: false, type: 'from' });
                    setSearch('');
                  }}
                  className={`flex-row items-center p-4 rounded-3xl mb-3 ${
                    (showSelector.type === 'from' ? fromCurrency.code : toCurrency.code) === c.code 
                    ? 'bg-[#F0F1FF] border border-[#5154F4]/20' 
                    : 'bg-white border border-gray-50'
                  }`}
                >
                  <View className="w-12 h-12 rounded-full bg-gray-50 items-center justify-center mr-4">
                    <Image 
                      source={{ uri: `https://flagcdn.com/w80/${c.flag}.png` }} 
                      className="w-8 h-5 rounded-sm"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#1F2C37] font-bold text-base">{c.code}</Text>
                    <Text className="text-[#9DA3B6] text-sm">{c.name}</Text>
                  </View>
                  {(showSelector.type === 'from' ? fromCurrency.code : toCurrency.code) === c.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#5154F4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
