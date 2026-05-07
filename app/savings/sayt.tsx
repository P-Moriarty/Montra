import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApiMutation, useApiQuery } from '@/hooks/api/use-api';
import { SavingsService } from '@/services/modules/savings.service';
import { Toast } from '@/components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';

export default function SaytScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEnabled, setIsEnabled] = useState(false);
  const [percentage, setPercentage] = useState(5);

  // Try to find SAYT config in the existing goals query data
  const { data: goalsData } = useApiQuery(['savingsGoals'], () => SavingsService.getGoals());

  useEffect(() => {
    const saytConfig = goalsData?.sayt || goalsData?.data?.sayt;
    if (saytConfig) {
      // console.log('[SAYT Debug] Found config in goals:', saytConfig);
      setIsEnabled(!!saytConfig.enabled);
      setPercentage(Number(saytConfig.percentage) || 5);
    }
  }, [goalsData]);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const saytMutation = useApiMutation(
    (payload: any) => SavingsService.configureSayt(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
        setToast({ visible: true, message: 'Auto-Save configured successfully!', type: 'success' });
        setTimeout(() => router.back(), 2000);
      },
      onError: (error: any) => {
        setToast({ 
          visible: true, 
          message: error.response?.data?.message || 'Failed to configure Auto-Save', 
          type: 'error' 
        });
      }
    }
  );

  const handleSave = () => {
    saytMutation.mutate({
      enabled: isEnabled,
      percentage: percentage,
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() // Default to 1 year
    });
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Auto-Save (SAYT)</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-8 mb-10 items-center">
          <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
            <MaterialCommunityIcons name="auto-fix" size={48} color="#22C55E" />
          </View>
          <Text className="text-[#1F2C37] text-3xl font-extrabold mb-3 text-center">Save As You Spend</Text>
          <Text className="text-[#9DA3B6] text-base leading-6 text-center px-4">
            Automatically save a percentage of every transaction you make on Montra.
          </Text>
        </View>

        <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 mb-8">
          <View className="flex-row justify-between items-center mb-10">
            <View>
              <Text className="text-[#1F2C37] font-bold text-lg mb-1">Enable SAYT</Text>
              <Text className="text-[#9DA3B6] text-xs">Toggle to activate automatic savings</Text>
            </View>
            <Switch 
              value={isEnabled} 
              onValueChange={setIsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#5154F4' }}
              thumbColor="white"
            />
          </View>

          {isEnabled && (
            <View>
              <Text className="text-[#1F2C37] font-bold mb-6">Saving Percentage</Text>
              <View className="flex-row flex-wrap gap-3">
                {[1, 2, 5, 10, 15].map((p) => (
                  <TouchableOpacity 
                    key={p}
                    onPress={() => setPercentage(p)}
                    className={`px-6 py-4 rounded-2xl border ${percentage === p ? 'bg-[#5154F4] border-[#5154F4]' : 'bg-gray-50 border-gray-100'}`}
                  >
                    <Text className={`font-bold ${percentage === p ? 'text-white' : 'text-[#6C7278]'}`}>{p}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="text-[#9DA3B6] text-[11px] mt-6 leading-5">
                Note: This percentage will be deducted from your available balance and added to your general savings vault on every outgoing transaction.
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          onPress={handleSave}
          disabled={saytMutation.isPending}
          className="bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100 mb-10"
        >
          <Text className="text-white text-center text-lg font-bold">
            {saytMutation.isPending ? 'Configuring...' : 'Save Configuration'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />
    </SafeAreaView>
  );
}
