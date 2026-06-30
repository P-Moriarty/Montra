import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApiQuery } from '@/hooks/api/use-api';
import { SavingsService } from '@/services/modules/savings.service';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function SavingsIndexScreen() {
  const { colors } = useTheme();
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Savings Vault</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Total Savings Card */}
        <View className="mt-6">
          <View className="p-8 rounded-[40px] relative overflow-hidden" style={{ backgroundColor: colors.primary }}>
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
             className="flex-1 p-6 rounded-[32px] items-center shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}
           >
             <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mb-3">
               <Ionicons name="add" size={24} color={colors.primary} />
             </View>
             <Text className="font-bold" style={{ color: colors.text }}>New Goal</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             onPress={() => router.push('/savings/sayt')}
             className="flex-1 p-6 rounded-[32px] items-center shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}
           >
             <View className="w-12 h-12 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: colors.successLight }}>
               <MaterialCommunityIcons name="auto-fix" size={24} color={colors.success} />
             </View>
             <Text className="font-bold" style={{ color: colors.text }}>Auto-Save</Text>
           </TouchableOpacity>
        </View>

        {/* Active Goals */}
        <View className="mt-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>Active Goals</Text>
            <Text className="font-bold" style={{ color: colors.primary }}>{activeGoals.length} Goals</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} className="mt-10" />
          ) : activeGoals.length === 0 ? (
            <View className="p-10 rounded-[40px] items-center justify-center mt-6 italic" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
               <Ionicons name="leaf-outline" size={48} color={colors.textSecondary} />
               <Text className="mt-4 font-bold" style={{ color: colors.textSecondary }}>No active goals yet</Text>
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
                  className="p-6 rounded-[40px] mb-4 shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}
                >
                  <View className="flex-row items-center mb-6">
                    <View className="w-14 h-14 rounded-3xl items-center justify-center mr-4" style={{ backgroundColor: colors.surfaceSecondary }}>
                      <Ionicons name="sparkles" size={28} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-base mb-1" style={{ color: colors.text }}>{goal.name}</Text>
                      <Text className="text-xs uppercase font-bold tracking-widest" style={{ color: colors.textSecondary }}>{goal.preference}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-black text-base" style={{ color: colors.text }}>₦{saved.toLocaleString()}</Text>
                      <Text className="text-[10px]" style={{ color: colors.textSecondary }}>Target: ₦{target.toLocaleString()}</Text>
                    </View>
                  </View>
 
                   {/* Progress Bar */}
                   <View className="w-full h-3 rounded-full overflow-hidden mb-2" style={{ backgroundColor: colors.chevronBg }}>
                      <View 
                        className="h-full rounded-full" style={{ width: `${Math.min(prog, 100)}%`, backgroundColor: colors.primary }} 
                      />
                   </View>
                   <View className="flex-row justify-between">
                     <Text className="text-[10px] font-bold" style={{ color: colors.textSecondary }}>{prog.toFixed(1)}% Completed</Text>
                     <Text className="text-[10px] font-bold" style={{ color: colors.textSecondary }}>₦{Math.max(0, target - saved).toLocaleString()} left</Text>
                   </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Suggestion Card */}
        <View className="p-8 rounded-[40px] mt-6 flex-row items-center overflow-hidden" style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1 }}>
           <View className="flex-1">
             <Text className="font-bold text-lg mb-2" style={{ color: colors.text }}>Start an Emergency Fund</Text>
             <Text className="text-xs leading-5" style={{ color: colors.textTertiary }}>Secure your future with a dedicated vault for unexpected life events.</Text>
           </View>
           <View className="w-16 h-16 rounded-full items-center justify-center ml-4" style={{ backgroundColor: colors.surface }}>
             <Ionicons name="shield-checkmark" size={32} color={colors.text} />
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
