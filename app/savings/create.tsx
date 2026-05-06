import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Toast } from '@/components/ui/toast';
import { useApiMutation } from '@/hooks/api/use-api';
import { SavingsService } from '@/services/modules/savings.service';
import { useQueryClient } from '@tanstack/react-query';

export default function CreateGoalScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [preference, setPreference] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const createGoalMutation = useApiMutation(
    (payload: any) => SavingsService.createGoal(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
        setToast({
          visible: true,
          message: 'Savings goal created successfully!',
          type: 'success',
        });

        redirectTimeoutRef.current = setTimeout(() => {
          router.back();
        }, 1500);
      },
      onError: (error: any) => {
        setToast({
          visible: true,
          message: error?.response?.data?.message || 'Failed to create goal',
          type: 'error',
        });
      },
    }
  );

  const categories = [
    { id: 'vacation', name: 'Vacation', icon: 'airplane-outline' },
    { id: 'education', name: 'Education', icon: 'school-outline' },
    { id: 'gadget', name: 'New Gadget', icon: 'phone-portrait-outline' },
    { id: 'home', name: 'Dream Home', icon: 'home-outline' },
    { id: 'wedding', name: 'Wedding', icon: 'heart-outline' },
    { id: 'emergency', name: 'Emergency', icon: 'shield-checkmark-outline' },
  ];

  const handleNext = () => {
    if (step === 1 && !selectedCategory) {
      setToast({
        visible: true,
        message: 'Please select a category to continue.',
        type: 'info',
      });
      return;
    }

    if (step === 2 && (!goalName.trim() || !targetAmount.trim())) {
      setToast({
        visible: true,
        message: 'Please enter a goal name and target amount.',
        type: 'error',
      });
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    createGoalMutation.mutate({
      name: goalName.trim(),
      description: selectedCategory || 'Savings Goal',
      target_amount: parseFloat(targetAmount.replace(/,/g, '')),
      end_date: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString(),
      currency: 'NGN',
      preference,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity
            onPress={() => (step === 1 ? router.back() : setStep(1))}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
          >
            <Ionicons name="arrow-back" size={20} color="#1F2C37" />
          </TouchableOpacity>

          <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">
            New Savings Goal
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-8 mb-10">
            <Text className="text-[#1F2C37] text-3xl font-extrabold mb-3">
              {step === 1 ? 'What are you saving for?' : 'Set your target'}
            </Text>
            <Text className="text-[#9DA3B6] text-base leading-6">
              {step === 1
                ? 'Pick a category that best describes your goal.'
                : 'Tell us how much you need and give it a name.'}
            </Text>
          </View>

          {step === 1 ? (
            <View className="flex-row flex-wrap justify-between">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  className={`w-[48%] p-6 rounded-[32px] items-center mb-4 border border-white shadow-sm ${
                    selectedCategory === cat.id ? 'bg-[#5154F4] border-[#5154F4]' : 'bg-white'
                  }`}
                >
                  <View
                    className={`w-14 h-14 rounded-2xl items-center justify-center mb-4 ${
                      selectedCategory === cat.id ? 'bg-white/20' : 'bg-indigo-50'
                    }`}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={28}
                      color={selectedCategory === cat.id ? 'white' : '#5154F4'}
                    />
                  </View>
                  <Text
                    className={`font-bold text-sm ${
                      selectedCategory === cat.id ? 'text-white' : 'text-[#1F2C37]'
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-white p-8 rounded-[40px]">
              <Text style={{ marginBottom: 12, color: '#1F2C37', fontWeight: '700' }}>
                Goal Name
              </Text>
              <TextInput
                placeholder="e.g. My New Laptop"
                value={goalName}
                onChangeText={setGoalName}
                autoCorrect={false}
                autoCapitalize="words"
                style={{
                  height: 64,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 16,
                  paddingHorizontal: 20,
                  color: '#1F2C37',
                  backgroundColor: '#FFFFFF',
                }}
              />

              <Text style={{ marginTop: 24, marginBottom: 12, color: '#1F2C37', fontWeight: '700' }}>
                Target Amount
              </Text>
              <TextInput
                placeholder="e.g. 500,000"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="numeric"
                autoCorrect={false}
                style={{
                  height: 64,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 16,
                  paddingHorizontal: 20,
                  color: '#1F2C37',
                  backgroundColor: '#FFFFFF',
                }}
              />

              <Text style={{ marginTop: 24, marginBottom: 12, color: '#1F2C37', fontWeight: '700' }}>
                Savings Preference
              </Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setPreference('MANUAL')}
                  className={`flex-1 p-4 rounded-2xl border ${
                    preference === 'MANUAL'
                      ? 'bg-[#5154F4] border-[#5154F4]'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <Text
                    className={`text-center font-bold text-xs ${
                      preference === 'MANUAL' ? 'text-white' : 'text-[#6C7278]'
                    }`}
                  >
                    Manual
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPreference('AUTO')}
                  className={`flex-1 p-4 rounded-2xl border ${
                    preference === 'AUTO'
                      ? 'bg-[#5154F4] border-[#5154F4]'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <Text
                    className={`text-center font-bold text-xs ${
                      preference === 'AUTO' ? 'text-white' : 'text-[#6C7278]'
                    }`}
                  >
                    Automatic
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={handleNext}
            disabled={createGoalMutation.isPending}
            className={`mt-12 py-5 rounded-[28px] ${
              createGoalMutation.isPending ? 'bg-[#5154F4]/70' : 'bg-[#5154F4]'
            }`}
          >
            <Text className="text-white text-center text-lg font-bold">
              {createGoalMutation.isPending
                ? 'Please wait...'
                : step === 1
                  ? 'Next'
                  : 'Create Goal'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
