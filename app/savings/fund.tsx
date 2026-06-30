import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';

import { useApiMutation } from '@/hooks/api/use-api';
import { SavingsService } from '@/services/modules/savings.service';
import { Toast } from '@/components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/context/ThemeContext';

export default function FundGoalScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id, name, saved, target, color } = useLocalSearchParams();
  const [amount, setAmount] = useState('0.00');
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const fundMutation = useApiMutation(
    (payload: any) => SavingsService.fundGoal(id as string, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
        queryClient.invalidateQueries({ queryKey: ['savingsHistory', id] });
        setToast({ visible: true, message: `Successfully funded ${name}!`, type: 'success' });
        setTimeout(() => router.replace('/savings'), 2000);
      },
      onError: (error: any) => {
        setToast({ 
          visible: true, 
          message: error.response?.data?.message || 'Failed to fund vault', 
          type: 'error' 
        });
      }
    }
  );

  const handleFund = () => {
    const rawAmount = parseFloat(amount.replace(/,/g, ''));
    if (rawAmount <= 0) {
      setToast({ visible: true, message: 'Please enter a valid amount', type: 'error' });
      return;
    }
    
    fundMutation.mutate({
      amount: rawAmount
    });
  };

  const handleKeyPress = (key: string) => {
    const digits = amount.replace(/[.,]/g, '');
    const newDigits = digits + key;
    const floatValue = parseInt(newDigits) / 100;
    setAmount(floatValue.toLocaleString(undefined, { minimumFractionDigits: 2 }));
  };

  const handleDelete = () => {
    if (amount === '0.00') return;
    const digits = amount.replace(/[.,]/g, '');
    const newDigits = digits.slice(0, -1);
    const floatValue = parseInt(newDigits || '0') / 100;
    setAmount(floatValue.toLocaleString(undefined, { minimumFractionDigits: 2 }));
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Add Funds</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Summary Card */}
        <View className="p-6 rounded-[32px] mt-8 flex-row items-center shadow-sm" style={{ backgroundColor: colors.surface + 'CC', borderColor: colors.cardBorder, borderWidth: 1 }}>
          <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4`} style={{ backgroundColor: `${color}10` }}>
            <Ionicons name="sparkles" size={24} color={color as string} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-base" style={{ color: colors.text }}>{name}</Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>Currently saved: {saved}</Text>
          </View>
          <View className="items-end">
             <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.primary }}>Goal</Text>
             <Text className="font-bold text-sm" style={{ color: colors.text }}>{target}</Text>
          </View>
        </View>

        {/* Amount Entry */}
        <View className="mt-16 items-center">
           <Text className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: colors.textTertiary }}>Adding to vault</Text>
           <View className="flex-row items-baseline mb-6">
             <Text className="text-4xl font-extrabold mr-2" style={{ color: colors.text }}>₦</Text>
             <Text className="text-6xl font-extrabold" style={{ color: colors.text }}>{amount}</Text>
           </View>
           
           <View className="px-6 py-3 rounded-full" style={{ backgroundColor: colors.surface + '66', borderColor: colors.cardBorder, borderWidth: 1 }}>
             <Text className="text-sm" style={{ color: colors.textSecondary }}>Transferring from <Text className="font-bold" style={{ color: colors.text }}>Available Balance</Text></Text>
           </View>
        </View>

        {/* Fund Button */}
        <TouchableOpacity 
          onPress={handleFund}
          disabled={fundMutation.isPending}
          className="mt-16 py-5 rounded-[28px]" style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white text-center text-lg font-bold">
            {fundMutation.isPending ? 'Processing...' : 'Fund Vault'}
          </Text>
        </TouchableOpacity>

        <Toast 
          visible={toast.visible} 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
        />

        {/* Padding for Keypad */}
        <View className="h-[400px]" />
      </ScrollView>

      {/* Custom Keypad */}
      <View className="absolute bottom-0 left-0 right-0 pt-4 rounded-t-[40px]" style={{ backgroundColor: `${colors.switchTrackOff}30` }}>
        <CustomKeypad 
          onPress={handleKeyPress} 
          onDelete={handleDelete} 
        />
      </View>
    </SafeAreaView>
  );
}
