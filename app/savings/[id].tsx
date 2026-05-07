import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApiQuery, useApiMutation } from '@/hooks/api/use-api';
import { SavingsService } from '@/services/modules/savings.service';
import { Toast } from '@/components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';

export default function GoalDetailsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const { data: historyData, isLoading: isLoadingHistory } = useApiQuery(
    ['savingsHistory', id],
    () => SavingsService.getGoalHistory(id as string)
  );
  
  const history = useMemo(() => {
    const raw = historyData?.history || historyData?.data?.history || historyData?.data || historyData;
    return Array.isArray(raw) ? raw : [];
  }, [historyData]);

  const { data: goalsData } = useApiQuery(['savingsGoals'], () => SavingsService.getGoals());
  
  const goal = useMemo(() => {
    const raw = goalsData?.goals || goalsData?.data?.goals || goalsData?.data || goalsData;
    const goalsArray = Array.isArray(raw) ? raw : [];
    return goalsArray.find((g: any) => g.id === id);
  }, [goalsData, id]);

  const withdrawMutation = useApiMutation(
    (payload: any) => SavingsService.withdrawFromGoal(id as string, payload),
    {
      onSuccess: () => {
        setToast({ visible: true, message: 'Withdrawal successful!', type: 'success' });
        setIsWithdrawModalVisible(false);
        setWithdrawAmount('');
        queryClient.invalidateQueries({ queryKey: ['savingsHistory', id] });
        queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      },
      onError: (error: any) => {
        setToast({ 
          visible: true, 
          message: error.response?.data?.message || 'Failed to withdraw funds', 
          type: 'error' 
        });
      }
    }
  );

  const breakMutation = useApiMutation(
    () => SavingsService.breakGoal(id as string),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
        setToast({ visible: true, message: 'Savings goal liquidated successfully!', type: 'success' });
        setTimeout(() => router.replace('/savings'), 2000);
      },
      onError: (error: any) => {
        setToast({ 
          visible: true, 
          message: error.response?.data?.message || 'Failed to break goal', 
          type: 'error' 
        });
      }
    }
  );

  if (!goal) return null;

  const progress = (goal.saved_amount / goal.target_amount) * 100;

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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Goal Details</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Main Goal Card */}
        <View className="bg-white p-8 rounded-[40px] mt-6 border border-gray-50 shadow-sm">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-indigo-50 rounded-3xl items-center justify-center mb-4">
              <Ionicons name="sparkles" size={40} color="#5154F4" />
            </View>
            <Text className="text-[#1F2C37] text-2xl font-extrabold mb-1">{goal.name}</Text>
            <Text className="text-[#9DA3B6] text-xs font-bold uppercase tracking-widest">{goal.description}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-[#9DA3B6] font-bold text-xs uppercase tracking-widest">Progress</Text>
            <Text className="text-[#5154F4] font-bold text-xs">{progress.toFixed(1)}%</Text>
          </View>
          
          <View className="w-full h-4 bg-gray-50 rounded-full overflow-hidden mb-8 border border-gray-100">
            <View 
              className="h-full bg-[#5154F4] rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </View>

          <View className="flex-row justify-between items-center bg-[#F8F9FB] p-6 rounded-3xl">
            <View>
              <Text className="text-[#9DA3B6] text-[10px] font-bold uppercase tracking-widest mb-1">Saved</Text>
              <Text className="text-[#1F2C37] text-xl font-black">₦{Number(goal.saved_amount).toLocaleString()}</Text>
            </View>
            <View className="w-px h-10 bg-gray-200" />
            <View className="items-end">
              <Text className="text-[#9DA3B6] text-[10px] font-bold uppercase tracking-widest mb-1">Target</Text>
              <Text className="text-[#1F2C37] text-xl font-black">₦{Number(goal.target_amount).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mt-6">
           <TouchableOpacity 
             onPress={() => router.push({ pathname: '/savings/fund', params: { id: goal.id, name: goal.name, saved: goal.saved_amount, target: goal.target_amount } })}
             className="flex-1 bg-[#5154F4] p-5 rounded-[28px] items-center shadow-lg shadow-indigo-100"
           >
             <Text className="text-white font-bold">Add Funds</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             onPress={() => setIsWithdrawModalVisible(true)}
             className="flex-1 bg-white p-5 rounded-[28px] items-center border border-indigo-100 shadow-sm"
           >
             <Text className="text-[#5154F4] font-bold">Withdraw</Text>
           </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => breakMutation.mutate(undefined)}
          className="mt-4 p-5 rounded-[28px] items-center border border-red-50 shadow-sm"
        >
          <Text className="text-red-500 font-bold">Break Goal (Liquidate)</Text>
        </TouchableOpacity>

        {/* History */}
        <View className="mt-10 mb-10">
          <Text className="text-[#1F2C37] text-lg font-bold mb-6">Recent Activities</Text>
          
          {isLoadingHistory ? (
            <ActivityIndicator color="#5154F4" />
          ) : history?.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-[#9DA3B6] italic">No activities yet</Text>
            </View>
          ) : (
            history?.map((item: any) => (
              <View key={item.id} className="bg-white p-5 rounded-3xl flex-row items-center mb-3 border border-gray-50">
                <View className={`w-10 h-10 ${item.type === 'FUND' ? 'bg-green-50' : 'bg-red-50'} rounded-2xl items-center justify-center mr-4`}>
                  <Feather name={item.type === 'FUND' ? 'arrow-down-left' : 'arrow-up-right'} size={18} color={item.type === 'FUND' ? '#22C55E' : '#EF4444'} />
                </View>
                <View className="flex-1">
                  <Text className="text-[#1F2C37] font-bold text-sm mb-0.5">{item.type === 'FUND' ? 'Goal Funded' : 'Withdrawal'}</Text>
                  <Text className="text-[#9DA3B6] text-[10px]">{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text className={`font-bold text-sm ${item.type === 'FUND' ? 'text-green-600' : 'text-red-500'}`}>
                  {item.type === 'FUND' ? '+' : '-'}₦{Number(item.amount).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />

      {/* Withdraw Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWithdrawModalVisible}
        onRequestClose={() => setIsWithdrawModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setIsWithdrawModalVisible(false)}
            className="flex-1 bg-black/50 justify-end"
          >
            <TouchableOpacity 
              activeOpacity={1}
              className="bg-white rounded-t-[40px] p-8 pb-12"
            >
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-[#1F2C37] text-xl font-black">Withdraw Funds</Text>
                <TouchableOpacity onPress={() => setIsWithdrawModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#1F2C37" />
                </TouchableOpacity>
              </View>

              <Text className="text-[#9DA3B6] text-sm mb-6 leading-6">
                How much would you like to withdraw from <Text className="text-[#1F2C37] font-bold">{goal?.name || 'this goal'}</Text>?
              </Text>
              
              <View className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 mb-10">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-[#9DA3B6] text-[10px] font-bold uppercase tracking-widest">Available to withdraw</Text>
                  <Text className="text-[#5154F4] text-sm font-black">₦{Number(goal?.saved_amount || 0).toLocaleString()}</Text>
                </View>
                <View className="bg-white border border-indigo-200 h-[72px] rounded-2xl px-5 flex-row items-center">
                  <Text className="text-[#1F2C37] text-2xl font-black mr-2">₦</Text>
                  <TextInput 
                    className="flex-1 text-[#1F2C37] text-2xl font-black"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    autoFocus
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => {
                  const amount = parseFloat(withdrawAmount.replace(/,/g, ''));
                  if (isNaN(amount) || amount <= 0) {
                    setToast({ visible: true, message: 'Please enter a valid amount', type: 'error' });
                    return;
                  }
                  if (amount > Number(goal?.saved_amount || 0)) {
                    setToast({ visible: true, message: 'Insufficient funds in vault', type: 'error' });
                    return;
                  }
                  withdrawMutation.mutate({ amount });
                }}
                disabled={withdrawMutation.isPending || !withdrawAmount}
                className={`py-5 rounded-[28px] shadow-lg ${withdrawMutation.isPending ? 'bg-[#5154F4]/70' : 'bg-[#5154F4]'}`}
              >
                <Text className="text-white text-center text-lg font-bold">
                  {withdrawMutation.isPending ? 'Processing...' : 'Confirm Withdrawal'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
