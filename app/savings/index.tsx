import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApiQuery } from '@/hooks/api/use-api';
import { SavingsService } from '@/services/modules/savings.service';
import { router } from 'expo-router';

export default function SavingsIndexScreen() {
  const { data: goalsData, isLoading } = useApiQuery(['savingsGoals'], async () => {
    const response = await SavingsService.getGoals();
    // console.log('[Savings Debug] Goals Response:', JSON.stringify(response, null, 2));
    return response;
  });

  const activeGoals = useMemo(() => {
    const raw = goalsData?.goals || goalsData?.data?.goals || goalsData?.data || goalsData;
    return Array.isArray(raw) ? raw : [];
  }, [goalsData]);

  const totalSaved = useMemo(() => 
    activeGoals.reduce((sum: number, goal: any) => sum + (Number(goal.saved_amount) || 0), 0),
    [activeGoals]
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Savings Vault</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Total Savings Card */}
        <View className="mt-6">
          <View className="bg-[#5154F4] p-8 rounded-[40px] shadow-2xl shadow-indigo-300 relative overflow-hidden">
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <Text className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">Total Savings</Text>
            <Text className="text-white text-4xl font-extrabold mb-8">₦{totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            
            <View className="flex-row items-center">
              <View className="bg-white/20 px-4 py-2 rounded-2xl border border-white/30">
                <Text className="text-white font-bold text-xs">{activeGoals.length} Active Goals</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Row */}
        <View className="flex-row gap-4 mt-8">
           <TouchableOpacity 
             onPress={() => router.push('/savings/create')}
             className="flex-1 bg-white p-6 rounded-[32px] items-center border border-gray-50 shadow-sm"
           >
             <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mb-3">
               <Ionicons name="add" size={24} color="#5154F4" />
             </View>
             <Text className="text-[#1F2C37] font-bold">New Goal</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             onPress={() => router.push('/savings/sayt')}
             className="flex-1 bg-white p-6 rounded-[32px] items-center border border-gray-50 shadow-sm"
           >
             <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mb-3">
               <MaterialCommunityIcons name="auto-fix" size={24} color="#22C55E" />
             </View>
             <Text className="text-[#1F2C37] font-bold">Auto-Save</Text>
           </TouchableOpacity>
        </View>

        {/* Active Goals */}
        <View className="mt-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-[#1F2C37] text-lg font-bold">Active Goals</Text>
            <Text className="text-[#5154F4] font-bold">{activeGoals.length} Goals</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#5154F4" className="mt-10" />
          ) : activeGoals.length === 0 ? (
            <View className="bg-white p-10 rounded-[40px] items-center justify-center mt-6 border border-gray-50 italic">
               <Ionicons name="leaf-outline" size={48} color="#9DA3B6" />
               <Text className="text-[#9DA3B6] mt-4 font-bold">No active goals yet</Text>
            </View>
          ) : (
            activeGoals.map((goal: any) => {
              const saved = Number(goal.saved_amount) || 0;
              const target = Number(goal.target_amount) || 1; // Avoid division by zero
              const prog = (saved / target) * 100;
              return (
                <TouchableOpacity 
                  key={goal.id} 
                  onPress={() => router.push(`/savings/${goal.id}`)}
                  className="bg-white p-6 rounded-[40px] mb-4 border border-gray-50 shadow-sm"
                >
                  <View className="flex-row items-center mb-6">
                    <View className="w-14 h-14 rounded-3xl items-center justify-center mr-4 bg-[#F8F9FB]">
                      <Ionicons name="sparkles" size={28} color="#5154F4" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#1F2C37] font-bold text-base mb-1">{goal.name}</Text>
                      <Text className="text-[#9DA3B6] text-xs uppercase font-bold tracking-widest">{goal.preference}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[#1F2C37] font-black text-base">₦{saved.toLocaleString()}</Text>
                      <Text className="text-[#9DA3B6] text-[10px]">Target: ₦{target.toLocaleString()}</Text>
                    </View>
                  </View>
 
                   {/* Progress Bar */}
                   <View className="w-full h-3 bg-gray-50 rounded-full overflow-hidden mb-2">
                      <View 
                        className="h-full rounded-full bg-[#5154F4]" 
                        style={{ width: `${Math.min(prog, 100)}%` }} 
                      />
                   </View>
                   <View className="flex-row justify-between">
                     <Text className="text-[#9DA3B6] text-[10px] font-bold">{prog.toFixed(1)}% Completed</Text>
                     <Text className="text-[#9DA3B6] text-[10px] font-bold">₦{Math.max(0, target - saved).toLocaleString()} left</Text>
                   </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Suggestion Card */}
        <View className="bg-[#1F2C37] p-8 rounded-[40px] mt-6 flex-row items-center border border-white/10 shadow-xl overflow-hidden">
           <View className="flex-1">
             <Text className="text-white text-lg font-bold mb-2">Start an Emergency Fund</Text>
             <Text className="text-white/60 text-xs leading-5">Secure your future with a dedicated vault for unexpected life events.</Text>
           </View>
           <View className="w-16 h-16 bg-white/10 rounded-full items-center justify-center ml-4">
             <Ionicons name="shield-checkmark" size={32} color="white" />
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
