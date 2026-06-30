import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons} from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApiMutation, useApiQuery } from '@/hooks/api/use-api';
import { ProfileService } from '@/services/modules/profile.service';
import { useQueryClient } from '@tanstack/react-query';
import { Toast } from '@/components/ui/toast';
import { useTheme } from '@/context/ThemeContext';

export default function VerificationStatusScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const [showBvnModal, setShowBvnModal] = useState(false);
  const [bvn, setBvn] = useState('');
  const [showNinModal, setShowNinModal] = useState(false);
  const [nin, setNin] = useState('');
  const [passport, setPassport] = useState('');

  const { data: user } = useApiQuery(['profile'], ProfileService.getProfile);

  const upgradeTier2Mutation = useApiMutation(
    (data: { bvn: string }) => ProfileService.upgradeTier2(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setShowBvnModal(false);
        setBvn('');
        setToast({ visible: true, message: 'Tier 2 upgrade submitted successfully!', type: 'success' });
      },
      onError: () => {
        setToast({ visible: true, message: 'Failed to upgrade tier. Check your BVN and try again.', type: 'error' });
      },
    },
  );

  const upgradeTier3Mutation = useApiMutation(
    (data: { nin: string; passport_number?: string }) => ProfileService.upgradeTier3(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setShowNinModal(false);
        setNin('');
        setPassport('');
        setToast({ visible: true, message: 'Tier 3 upgrade submitted successfully!', type: 'success' });
      },
      onError: () => {
        setToast({ visible: true, message: 'Failed to upgrade tier. Check your details and try again.', type: 'error' });
      },
    },
  );

  const userTier = user?.tier || 'tier1';
  const currentTierNum = parseInt(userTier.replace('tier', ''), 10) || 1;

  const tiers = [
    { level: 'Tier 1', status: currentTierNum >= 1 ? 'Completed' : 'Locked', limit: '₦500,000 Daily', active: currentTierNum >= 1, current: false, requirements: ['Email verified', 'Phone number linked'] },
    { level: 'Tier 2', status: currentTierNum >= 2 ? 'Completed' : currentTierNum === 1 ? 'In Progress' : 'Locked', limit: '₦5,000,000 Daily', active: currentTierNum >= 2, current: currentTierNum === 1, requirements: ['BVN Verification', 'Government ID Upload'] },
    { level: 'Tier 3', status: currentTierNum >= 3 ? 'Completed' : currentTierNum === 2 ? 'In Progress' : 'Locked', limit: 'Unlimited', active: currentTierNum >= 3, current: currentTierNum === 2, requirements: ['NIN Verification'] },
  ];

  const handleUpgradePress = (tierIdx: number) => {
    if (tierIdx === 1) setShowBvnModal(true);
    if (tierIdx === 2) setShowNinModal(true);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Verification Status</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Current Status Card */}
        <View className="mt-6 mb-10">
          <View className="p-10 rounded-[48px] shadow-sm border items-center" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
             <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6">
                <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
             </View>
             <Text className="text-2xl font-black mb-2" style={{ color: colors.text }}>
                {userTier.replace('tier', 'Tier ')} {currentTierNum >= 1 ? 'Verified' : ''}
             </Text>
             <Text className="text-center text-sm leading-5" style={{ color: colors.textSecondary }}>
                {currentTierNum < 3
                  ? 'Increase your limits by completing the next tier.'
                  : 'You have reached the highest verification level.'}
             </Text>
          </View>
        </View>

        {/* Tiers List */}
        <View>
          <Text className="text-xs font-bold uppercase tracking-widest ml-4 mb-6" style={{ color: colors.textSecondary }}>Verification Journey</Text>
          
          {tiers.map((tier, idx) => (
           <View key={idx} className="flex-row mb-8">
                {/* Line Indicator */}
                <View className="items-center mr-4">
                   <View className={`w-10 h-10 rounded-full items-center justify-center shadow-sm ${tier.active ? '' : ''}`}
                     style={{ backgroundColor: tier.active ? colors.primary : colors.surface }}>
                      {tier.active ? (
                        <Ionicons name="checkmark" size={20} color="white" />
                      ) : (
                        <Text className="font-bold" style={{ color: tier.current ? colors.primary : '#D1D5DB' }}>{idx + 1}</Text>
                      )}
                   </View>
                   {idx !== tiers.length - 1 && (
                     <View className="w-[2px] flex-1 my-2" style={{ backgroundColor: colors.surface }} />
                   )}
                </View>

                {/* Tier Data Card */}
                <TouchableOpacity 
                  disabled={tier.active}
                  className={`flex-1 p-6 rounded-[32px] border ${tier.current ? '' : 'border-white/10'}`}
                  style={{ backgroundColor: colors.surfaceSecondary, borderColor: tier.current ? `${colors.primary}20` : colors.border }}
                >
                   <View className="flex-row justify-between items-center mb-4">
                      <Text className="font-black text-lg" style={{ color: colors.text }}>{tier.level}</Text>
                      <View className={`px-3 py-1 rounded-full ${tier.active ? 'bg-green-50' : 'bg-indigo-50'}`}>
                         <Text className={`text-[10px] font-bold ${tier.active ? 'text-green-600' : ''}`} style={{ color: tier.active ? '#16A34A' : colors.primary }}>{tier.status}</Text>
                      </View>
                   </View>

                   <Text className="font-bold text-xs mb-4" style={{ color: colors.text }}>Daily Limit: {tier.limit}</Text>
                   
                   <View className="space-y-2">
                      {tier.requirements.map((req, rIdx) => (
                        <View key={rIdx} className="flex-row items-center">
                           <Ionicons name="checkmark-circle" size={16} color={tier.active ? colors.success : '#E5E7EB'} className="mr-2" />
                           <Text className="text-[11px] font-medium" style={{ color: colors.textTertiary }}>{req}</Text>
                        </View>
                      ))}
                   </View>

                   {tier.current && !tier.active && (
                     <TouchableOpacity
                       onPress={() => handleUpgradePress(idx)}
                       className="mt-6 py-3 rounded-2xl"
                       style={{ backgroundColor: colors.primary }}
                     >
                        <Text className="text-white text-center font-bold text-xs">Verify Level {idx + 1}</Text>
                     </TouchableOpacity>
                   )}
                </TouchableOpacity>
             </View>
          ))}
        </View>
      </ScrollView>

      {/* BVN Modal */}
      <Modal visible={showBvnModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="w-full rounded-[40px] p-8" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-black" style={{ color: colors.text }}>Upgrade to Tier 2</Text>
              <TouchableOpacity onPress={() => { setShowBvnModal(false); setBvn(''); }}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text className="text-sm mb-6" style={{ color: colors.textTertiary }}>
              Enter your Bank Verification Number (BVN) to upgrade your account.
            </Text>

            <TextInput
              value={bvn}
              onChangeText={setBvn}
              placeholder="Enter BVN"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={11}
              className="p-5 rounded-2xl text-base font-bold mb-6"
              style={{ backgroundColor: colors.chevronBg, color: colors.text }}
            />

            <TouchableOpacity
              onPress={() => upgradeTier2Mutation.mutate({ bvn })}
              disabled={bvn.length < 11 || upgradeTier2Mutation.isPending}
              className={`py-4 rounded-2xl items-center ${bvn.length >= 11 ? '' : 'bg-gray-200'}`}
              style={bvn.length >= 11 ? { backgroundColor: colors.primary } : {}}
            >
              {upgradeTier2Mutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className={`font-bold text-base ${bvn.length >= 11 ? 'text-white' : 'text-gray-400'}`}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NIN Modal */}
      <Modal visible={showNinModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="w-full rounded-[40px] p-8" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-black" style={{ color: colors.text }}>Upgrade to Tier 3</Text>
              <TouchableOpacity onPress={() => { setShowNinModal(false); setNin(''); setPassport(''); }}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text className="text-sm mb-6" style={{ color: colors.textTertiary }}>
              Enter your National Identification Number (NIN) to upgrade your account.
            </Text>

            <TextInput
              value={nin}
              onChangeText={setNin}
              placeholder="Enter NIN"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={11}
              className="p-5 rounded-2xl text-base font-bold mb-6"
              style={{ backgroundColor: colors.chevronBg, color: colors.text }}
            />

            <TextInput
              value={passport}
              onChangeText={setPassport}
              placeholder="Enter Passport / PVC Number"
              placeholderTextColor={colors.textSecondary}
              className="p-5 rounded-2xl text-base font-bold mb-6"
              style={{ backgroundColor: colors.chevronBg, color: colors.text }}
            />

            <TouchableOpacity
              onPress={() => upgradeTier3Mutation.mutate({ nin, passport_number: passport || undefined })}
              disabled={nin.length < 11 || upgradeTier3Mutation.isPending}
              className={`py-4 rounded-2xl items-center ${nin.length >= 11 ? '' : 'bg-gray-200'}`}
              style={nin.length >= 11 ? { backgroundColor: colors.primary } : {}}
            >
              {upgradeTier3Mutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className={`font-bold text-base ${nin.length >= 11 ? 'text-white' : 'text-gray-400'}`}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
