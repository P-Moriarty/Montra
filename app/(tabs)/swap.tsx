import { CustomKeypad } from '@/components/custom-keypad';
import { Toast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useApiMutation, useApiQuery } from '@/hooks/api/use-api';
import { WalletService } from '@/services/modules/wallet.service';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CURRENCY_METADATA: Record<string, { symbol: string; flag: string; name: string }> = {
  USD: { symbol: '$', flag: 'us', name: 'US Dollar' },
  NGN: { symbol: '₦', flag: 'ng', name: 'Nigerian Naira' },
  GBP: { symbol: '£', flag: 'gb', name: 'British Pound' },
  EUR: { symbol: '€', flag: 'eu', name: 'Euro' },
  CAD: { symbol: '$', flag: 'ca', name: 'Canadian Dollar' },
  AUD: { symbol: '$', flag: 'au', name: 'Australian Dollar' },
  BRL: { symbol: 'R$', flag: 'br', name: 'Brazilian Real' },
};

const formatMoney = (balance: number | string, symbol: string = '') => {
  const scale = 2; // for all your fiat currencies
  const formatted = (Number(balance || 0) / Math.pow(10, scale)).toFixed(scale);
  return `${symbol}${Number(formatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function SwapScreen() {
  const queryClient = useQueryClient();
  const { selectedCurrencyCode, setSelectedCurrencyCode } = useWallet();
  const params = useLocalSearchParams<{ from?: string }>();
  const { userToken, isLoading: isAuthLoading } = useAuth();
  const canFetch = !isAuthLoading && !!userToken;

  const { data: rawCurrencies, isLoading: isCurrenciesLoading, error: ratesError } = useApiQuery(
    ['swapRates'],
    WalletService.getSwapRates,
    { enabled: canFetch }
  );

  const { data: walletData, isLoading: isWalletLoading, error: walletError, refetch: refetchWallets, isRefetching: isWalletRefetching } = useApiQuery(
    ['wallet'],
    WalletService.getWalletBalance,
    { enabled: canFetch }
  );

  // React.useEffect(() => {
  //   if (walletData) {
  //     console.log('[Swap] Current Wallets State:', JSON.stringify(walletData.wallets, null, 2));
  //   }
  // }, [walletData]);

  const rateData = useMemo(() => {
    if (!rawCurrencies && !walletData?.wallets) return { currencies: [], pairMap: new Map() };

    // Parse rates from API
    if (rawCurrencies) {
      console.log('[Swap] rawCurrencies response:', JSON.stringify(rawCurrencies).substring(0, 500));
    }
    let ratesData = Array.isArray(rawCurrencies) ? rawCurrencies :
      (rawCurrencies?.rates || rawCurrencies?.data?.rates || rawCurrencies?.data || rawCurrencies?.currencies || rawCurrencies?.payload || []);

    if (!Array.isArray(ratesData) && typeof ratesData === 'object' && ratesData !== null) {
      const keys = Object.keys(ratesData).filter(k => k.length === 3 && k === k.toUpperCase());
      ratesData = keys.map(code => ({ code, rate: (ratesData as any)[code] }));
    }

    const pairMap = new Map<string, number>();
    const ratesMap = new Map<string, number>();

    if (Array.isArray(ratesData)) {
      ratesData.forEach((item: any) => {
        const from = String(item.from || '').toUpperCase();
        const to = String(item.to || '').toUpperCase();
        const rate = Number(item.rate);

        if (from && to && !isNaN(rate)) {
          pairMap.set(`${from}_${to}`, rate);
          // Store base rates relative to NGN for list display
          if (to === 'NGN') ratesMap.set(from, rate);
          else if (from === 'NGN') ratesMap.set(to, 1 / rate);
          else ratesMap.set(to, rate);
        }
      });
    }

    // Ensure NGN is always 1 in the base map if not present
    if (!ratesMap.has('NGN')) ratesMap.set('NGN', 1);

    const walletCodes = (walletData?.wallets?.map((w: any) => String(w.currency || '').toUpperCase()) || []);
    const allCodes = new Set([...ratesMap.keys(), ...walletCodes]);

    const result = Array.from(allCodes).map(code => {
      const meta = CURRENCY_METADATA[code] || { symbol: code, flag: 'us', name: code };
      return {
        ...meta,
        code,
        rate: ratesMap.get(code) || 1,
      };
    });

    return { currencies: result, pairMap };
  }, [rawCurrencies, walletData?.wallets]);

  const currencies = useMemo(() => rateData?.currencies || [], [rateData]);
  const pairMap = useMemo(() => rateData?.pairMap || new Map(), [rateData]);

  // Derived: only currencies the user actually has wallets for (for 'From' field)
  const availableWallets = useMemo(() => {
    if (!walletData?.wallets) return [];
    return currencies.filter((c: any) =>
      walletData.wallets.some((w: any) => w.currency === c.code)
    );
  }, [currencies, walletData?.wallets]);

  const [fromCurrency, setFromCurrency] = useState<any>(null);
  const [toCurrency, setToCurrency] = useState<any>(null);
  const [fromAmount, setFromAmount] = useState('0');
  const [showSelector, setShowSelector] = useState<{ visible: boolean; type: 'from' | 'to' }>({ visible: false, type: 'from' });
  const [isKeypadVisible, setIsKeypadVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isCreateWalletVisible, setIsCreateWalletVisible] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
    action?: { label: string; onPress: () => void };
  }>({ visible: false, message: '', type: 'success' });

  const hasInitialized = React.useRef(false);

  // Sync 'From' currency with global selection or params (Only on initial load)
  React.useEffect(() => {
    if (currencies.length > 0 && walletData?.wallets && !hasInitialized.current) {
      // console.log('[Swap] Initial Sync. Total:', currencies.length, 'Available:', availableWallets.length);
      const targetCode = params.from || selectedCurrencyCode || 'NGN';

      const foundFrom = availableWallets.find(c => c.code === targetCode) ||
        availableWallets[0] ||
        currencies[0];

      setFromCurrency(foundFrom);

      const usd = currencies.find(c => c.code === 'USD');
      const initialTo = (foundFrom.code === 'NGN' && usd) ? usd :
        (currencies.find(c => c.code !== foundFrom.code) || currencies[0]);
      setToCurrency(initialTo);

      hasInitialized.current = true;
    }
  }, [currencies, walletData, params.from, selectedCurrencyCode, availableWallets]);

  const swapMutation = useApiMutation(WalletService.swapCurrencies, {
    onSuccess: (response: any) => {
      // console.log('[Swap] Mutation Response:', JSON.stringify(response, null, 2));
      setToast({ visible: true, message: 'Swap successful!', type: 'success' });

      // Aggressive refetch immediately
      queryClient.refetchQueries({ queryKey: ['wallet'] });
      queryClient.refetchQueries({ queryKey: ['transactions'] });

      // Secondary safety refetch
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['wallet'] });
      }, 3000);

      setIsAuthModalVisible(false);
      setFromAmount('0');
      setAuthPin('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Swap failed';
      setToast({ visible: true, message: String(message), type: 'error' });
      setAuthPin('');
    }
  });

  const createWalletMutation = useApiMutation(WalletService.createFiatAccount, {
    onSuccess: (response: any) => {
      // console.log('[Swap] Create Fiat Account Success:', response);
      refetchWallets();
      setToast({ visible: true, message: 'Wallet created successfully!', type: 'success' });
      setIsCreateWalletVisible(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create wallet';
      setToast({ visible: true, message: String(message), type: 'error' });
    }
  });

  const availableBalance = useMemo(() => {
    if (!walletData?.wallets || !fromCurrency) return 0;
    const wallet = walletData.wallets.find((w: any) => String(w.currency || '').toUpperCase() === fromCurrency.code);
    const raw = wallet ? Number(wallet.balance) : 0;
    // console.log(`[Swap] Raw Balance for ${fromCurrency.code}:`, raw);
    return raw;
  }, [walletData, fromCurrency]);

  const toWalletBalance = useMemo(() => {
    if (!walletData?.wallets || !toCurrency) return 0;
    const wallet = walletData.wallets.find((w: any) => String(w.currency || '').toUpperCase() === toCurrency.code);
    return wallet ? Number(wallet.balance) : 0;
  }, [walletData, toCurrency]);

  const handleMaxPress = () => {
    if (availableBalance > 0) {
      setFromAmount((availableBalance / 100).toFixed(2));
    }
  };

  // Calculate the exchange rate between selected currencies
  const currentRateValue = useMemo(() => {
    if (!fromCurrency || !toCurrency) return 0;

    // 1. Try exact pair match from API (e.g., USD_NGN)
    const pairKey = `${fromCurrency.code}_${toCurrency.code}`;
    if (pairMap.has(pairKey)) return pairMap.get(pairKey)!;

    // 2. Fallback to base rate calculation (Value in NGN)
    if (!toCurrency.rate || toCurrency.rate === 0) return 0;
    return fromCurrency.rate / toCurrency.rate;
  }, [fromCurrency, toCurrency, pairMap]);

  const currentRate = useMemo(() => {
    const rate = currentRateValue;
    if (!rate || !isFinite(rate)) return "0.00";

    let displayRate = rate < 0.01 ? rate.toFixed(6) : rate.toFixed(2);
    console.log(`[Swap] Current Rate (${fromCurrency?.code} -> ${toCurrency?.code}):`, displayRate);
    return displayRate;
  }, [fromCurrency, toCurrency, currentRateValue]);

  // Calculate the target amount
  const toAmount = useMemo(() => {
    const rawValue = parseFloat(fromAmount.replace(/,/g, '')) || 0;
    const rate = currentRateValue;
    if (!rate || !isFinite(rate)) return "0.00";
    const converted = rawValue * rate;
    return converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [fromAmount, currentRateValue]);

  const handleKeyPress = (key: string) => {
    let newAmount = fromAmount;
    if (key === '.') {
      if (!newAmount.includes('.')) newAmount += '.';
    } else {
      if (newAmount === '0' || newAmount === '0.00') newAmount = key;
      else newAmount += key;
    }
    setFromAmount(newAmount);
  };

  const handleDelete = () => {
    let newAmount = fromAmount.slice(0, -1);
    if (newAmount === '' || newAmount === '-') newAmount = '0';
    setFromAmount(newAmount);
  };

  const handleFlipCurrencies = () => {
    if (fromCurrency && toCurrency) {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
      // Recalculate amounts if needed
      setFromAmount('0');
    }
  };

  const handleReviewSwap = () => {
    const rawValue = (parseFloat(fromAmount.replace(/,/g, '')) || 0) * 100;
    if (rawValue < 500000) {
      setToast({ visible: true, message: 'Minimum swap amount is 5,000.00', type: 'error' });
      return;
    }

    // NGN Constraint Check
    if (fromCurrency.code !== 'NGN' && toCurrency.code !== 'NGN') {
      setToast({ visible: true, message: 'Swaps must involve NGN.', type: 'error' });
      return;
    }

    if (rawValue > availableBalance) {
      setToast({ visible: true, message: 'Insufficient balance.', type: 'error' });
      return;
    }

    // Check if source wallet exists
    const fromCode = fromCurrency?.code;
    const hasFromWallet = walletData?.wallets?.some((w: any) => String(w.currency || '').toUpperCase() === fromCode);

    if (!fromCode || !hasFromWallet) {
      setToast({
        visible: true,
        message: `You don't have a ${fromCode || 'selected'} wallet.`,
        type: 'error',
        action: {
          label: 'Create',
          onPress: () => {
            // In a real app, we'd set a target for creation. 
            // Here we'll just open the modal for the selected from currency.
            setIsCreateWalletVisible(true);
          }
        }
      });
      return;
    }

    // Check if destination wallet exists
    const toCode = toCurrency?.code;
    const hasToWallet = walletData?.wallets?.some((w: any) => String(w.currency || '').toUpperCase() === toCode);

    if (!toCode || !hasToWallet) {
      setToast({
        visible: true,
        message: `You don't have a ${toCode || 'selected'} wallet.`,
        type: 'error',
        action: {
          label: 'Create',
          onPress: () => setIsCreateWalletVisible(true)
        }
      });
      return;
    }

    setAuthPin('');
    setIsAuthModalVisible(true);
  };

  const handleAuthPinPress = (key: string) => {
    if (authPin.length < 4) {
      const newPin = authPin + key;
      setAuthPin(newPin);

      if (newPin.length === 4) {
        const rawValue = (parseFloat(fromAmount.replace(/,/g, '')) || 0) * 100;
        swapMutation.mutate({
          amount: rawValue,
          auth_method: 'pin',
          credential: newPin,
          from_currency: fromCurrency.code.toLowerCase(),
          to_currency: toCurrency.code.toLowerCase()
        });
      }
    }
  };

  const handleAuthPinDelete = () => {
    setAuthPin(authPin.slice(0, -1));
  };

  // Selectors now show all available currencies
  const filteredCurrencies = useMemo(() => {
    return currencies.filter((c: any) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [currencies, search]);

  if (isAuthLoading || isCurrenciesLoading || isWalletLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#E5E5F5] items-center justify-center">
        <ActivityIndicator size="large" color="#5154F4" />
        <Text className="mt-4 text-[#9DA3B6] font-medium">Preparing your swap...</Text>
      </SafeAreaView>
    );
  }

  if (ratesError || walletError) {
    return (
      <SafeAreaView className="flex-1 bg-[#E5E5F5] items-center justify-center px-10">
        <Feather name="wifi-off" size={48} color="#9DA3B6" />
        <Text className="mt-4 text-center text-[#1F2C37] text-lg font-bold">Connection Error</Text>
        <Text className="mt-2 text-center text-[#9DA3B6]">We couldn&apos;t reach the server. Please check your internet connection.</Text>
        <TouchableOpacity
          onPress={() => queryClient.invalidateQueries()}
          className="mt-8 bg-[#5154F4] px-8 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (currencies.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#E5E5F5] items-center justify-center px-10">
        <Feather name="alert-circle" size={48} color="#9DA3B6" />
        <Text className="mt-4 text-center text-[#1F2C37] text-lg font-bold">No tradable currencies found</Text>
        <Text className="mt-2 text-center text-[#9DA3B6]">We couldn&apos;t find any wallets in your account that support swapping at this time.</Text>
        <TouchableOpacity
          onPress={() => queryClient.invalidateQueries({ queryKey: ['wallet'] })}
          className="mt-8 bg-[#5154F4] px-8 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold">Refresh Wallets</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!fromCurrency || !toCurrency) {
    return (
      <SafeAreaView className="flex-1 bg-[#E5E5F5] items-center justify-center">
        <ActivityIndicator size="large" color="#5154F4" />
        <Text className="mt-4 text-[#9DA3B6] font-medium">Finalizing selection...</Text>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        action={toast.action}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="text-[#1F2C37] text-xl font-bold">Swap</Text>
        <TouchableOpacity
          onPress={() => refetchWallets()}
          disabled={isWalletRefetching}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          {isWalletRefetching ? (
            <ActivityIndicator size="small" color="#5154F4" />
          ) : (
            <Ionicons name="refresh" size={20} color="#5154F4" />
          )}
        </TouchableOpacity>
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
                  {fromCurrency.symbol}{parseFloat(fromAmount.replace(/,/g, '')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between mt-6">
              <TouchableOpacity
                onPress={handleMaxPress}
                className="flex-row items-center"
              >
                <Text className="text-[#9DA3B6] font-medium">
                  Balance : {formatMoney(availableBalance, fromCurrency?.symbol || '')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleMaxPress}>
                <Text className="text-[#5154F4] font-bold">Max</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Flip Button */}
          <View className="absolute left-1/2 -ml-7 top-[33%] z-10">
            <TouchableOpacity
              onPress={handleFlipCurrencies}
              className="bg-[#5154F4] w-14 h-14 rounded-full items-center justify-center border-4 border-[#E5E5F5] shadow-xl"
              style={{
                shadowColor: '#5154F4',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 10
              }}
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
              <View className="items-end">
                <Text className="text-[#1F2C37] text-3xl font-bold">
                  {toCurrency.symbol}{toAmount}
                </Text>
                <Text className="text-[#9DA3B6] text-xs font-medium mt-1">
                  Equivalent Value
                </Text>
              </View>
            </View>
            <View className="mt-6">
              <Text className="text-[#9DA3B6] font-medium text-xs uppercase tracking-widest">Rate: 1 {fromCurrency.code} ≈ {currentRate} {toCurrency.code}</Text>
            </View>
            <View className="flex-row justify-between mt-6">
              <Text className="text-[#9DA3B6] font-medium">
                Balance : {toCurrency?.symbol || ''}{toWalletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </Text>
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

        {/* Main Action Button */}
        <View className="px-6 py-10">
          <TouchableOpacity
            onPress={handleReviewSwap}
            disabled={swapMutation.isPending || isWalletRefetching || parseFloat(fromAmount.replace(/,/g, '')) <= 0}
            className={`py-5 rounded-[28px] shadow-lg flex-row items-center justify-center ${parseFloat(fromAmount.replace(/,/g, '')) > 0 && !isWalletRefetching ? 'bg-[#5154F4] shadow-indigo-200' : 'bg-gray-300 shadow-none'
              }`}
          >
            {isWalletRefetching ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <Text className="text-white text-lg font-bold">
              {isWalletRefetching ? 'Syncing...' : 'Review Swap'}
            </Text>
            {!isWalletRefetching && <Feather name="arrow-right" size={20} color="white" className="ml-2" />}
          </TouchableOpacity>
        </View>

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
              {filteredCurrencies.map((c: any) => (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => {
                    if (showSelector.type === 'from') {
                      setSelectedCurrencyCode(c.code);
                      setFromCurrency(c);
                    } else {
                      setToCurrency(c);
                    }
                    setShowSelector({ visible: false, type: 'from' });
                    setSearch('');
                  }}
                  className="flex-row items-center justify-between py-4 border-b border-gray-50"
                >
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: `https://flagcdn.com/w80/${c.flag}.png` }}
                      className="w-10 h-7 rounded-md mr-4"
                    />
                    <View>
                      <Text className="text-[#1F2C37] font-bold text-lg">{c.code}</Text>
                      <Text className="text-[#9DA3B6] text-sm">{c.name}</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-[#5154F4] font-bold">
                      {c.code === 'NGN' ? 'Base' : `1 ${c.code} ≈ ${c.rate.toFixed(2)} NGN`}
                    </Text>
                    {(() => {
                      const wallet = walletData?.wallets?.find((w: any) => String(w.currency || '').toUpperCase() === c.code);
                      if (wallet) {
                        return (
                          <View className="bg-green-100 px-2 py-0.5 rounded-md mt-1">
                            <Text className="text-green-600 text-[10px] font-bold">
                              {formatMoney(wallet.balance, c.symbol)}
                            </Text>
                          </View>
                        );
                      }
                      return (
                        <View className="bg-gray-100 px-2 py-0.5 rounded-md mt-1">
                          <Text className="text-gray-500 text-[10px] font-bold uppercase">No Wallet</Text>
                        </View>
                      );
                    })()}
                  </View>
                  {(showSelector.type === 'from' ? fromCurrency?.code : toCurrency?.code) === c.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#5154F4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PIN Authentication Modal */}
      <Modal visible={isAuthModalVisible} animationType="fade" transparent={true}>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/40" onPress={() => !swapMutation.isPending && setIsAuthModalVisible(false)} />
          <View className="bg-white rounded-t-[48px] shadow-2xl overflow-hidden pt-8">
            <View className="items-center px-6 mb-6">
              <Text className="text-2xl font-bold text-[#1F2C37] mb-2">Enter your PIN</Text>
              <Text className="text-[#9DA3B6] text-center mb-6">Enter your 4-digit PIN to authorize this swap.</Text>

              {/* PIN Dots */}
              <View className="flex-row justify-center space-x-4 mb-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <View
                    key={i}
                    className={`w-4 h-4 rounded-full ${i < authPin.length ? 'bg-[#5154F4]' : 'bg-gray-200'}`}
                  />
                ))}
              </View>

              {swapMutation.isPending && (
                <View className="flex-row items-center mt-4">
                  <ActivityIndicator color="#5154F4" size="small" />
                  <Text className="text-[#5154F4] font-medium ml-2">Processing swap...</Text>
                </View>
              )}
            </View>

            <View pointerEvents={swapMutation.isPending ? "none" : "auto"}>
              <CustomKeypad
                onPress={handleAuthPinPress}
                onDelete={handleAuthPinDelete}
                hideDecimal={true}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Wallet Modal */}
      <Modal visible={isCreateWalletVisible} animationType="fade" transparent={true}>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/40" onPress={() => !createWalletMutation.isPending && setIsCreateWalletVisible(false)} />
          <View className="bg-white rounded-t-[48px] shadow-2xl overflow-hidden pt-8 pb-12">
            <View className="items-center px-8">
              <View className="w-20 h-20 bg-[#5154F4]/10 rounded-full items-center justify-center mb-6">
                <MaterialCommunityIcons name="wallet-plus" size={40} color="#5154F4" />
              </View>
              <Text className="text-2xl font-bold text-[#1F2C37] mb-2 text-center">Create {(isAuthModalVisible ? fromCurrency : toCurrency)?.code} Wallet</Text>
              <Text className="text-[#9DA3B6] text-center mb-10 leading-6">
                You need to create a {(isAuthModalVisible ? fromCurrency : toCurrency)?.name || (isAuthModalVisible ? fromCurrency : toCurrency)?.code} wallet to proceed with this swap.
              </Text>

              <TouchableOpacity
                onPress={() => {
                  const target = isAuthModalVisible ? fromCurrency : toCurrency;
                  const country = COUNTRY_MAP[target?.code] || 'US';
                  createWalletMutation.mutate({ country });
                }}
                disabled={createWalletMutation.isPending}
                className="w-full bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-200 flex-row items-center justify-center"
              >
                {createWalletMutation.isPending ? (
                  <ActivityIndicator color="white" className="mr-2" />
                ) : null}
                <Text className="text-white text-lg font-bold">
                  {createWalletMutation.isPending ? 'Creating...' : 'Create Wallet'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsCreateWalletVisible(false)}
                disabled={createWalletMutation.isPending}
                className="mt-6"
              >
                <Text className="text-[#9DA3B6] font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const COUNTRY_MAP: Record<string, string> = {
  USD: 'US',
  GBP: 'UK',
  EUR: 'EU',
  CAD: 'CA',
  AUD: 'AU',
  BRL: 'BR'
};
