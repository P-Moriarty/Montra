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
import { useTheme } from '@/context/ThemeContext';

export default function CreateGoalScreen() {
  const { colors } = useTheme();
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
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
            className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>
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
            <Text className="text-3xl font-extrabold mb-3" style={{ color: colors.text }}>
              {step === 1 ? 'What are you saving for?' : 'Set your target'}
            </Text>
            <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
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
                  className={`w-[48%] p-6 rounded-[32px] items-center mb-4 shadow-sm`}
                  style={{
                    backgroundColor: selectedCategory === cat.id ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: selectedCategory === cat.id ? colors.primary : colors.cardBorder,
                  }}
                >
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
                    style={{ backgroundColor: selectedCategory === cat.id ? colors.primary + '33' : colors.chevronBg }}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={28}
                      color={selectedCategory === cat.id ? 'white' : colors.primary}
                    />
                  </View>
                  <Text
                    className="font-bold text-sm"
                    style={{ color: selectedCategory === cat.id ? 'white' : colors.text }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="p-8 rounded-[40px]" style={{ backgroundColor: colors.surface }}>
              <Text style={{ marginBottom: 12, color: colors.text, fontWeight: '700' }}>
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
                  borderColor: colors.cardBorder,
                  borderRadius: 16,
                  paddingHorizontal: 20,
                  color: colors.text,
                  backgroundColor: colors.background,
                }}
              />

              <Text style={{ marginTop: 24, marginBottom: 12, color: colors.text, fontWeight: '700' }}>
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
                  borderColor: colors.cardBorder,
                  borderRadius: 16,
                  paddingHorizontal: 20,
                  color: colors.text,
                  backgroundColor: colors.background,
                }}
              />

              <Text style={{ marginTop: 24, marginBottom: 12, color: colors.text, fontWeight: '700' }}>
                Savings Preference
              </Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setPreference('MANUAL')}
                  className="flex-1 p-4 rounded-2xl border"
                  style={{
                    backgroundColor: preference === 'MANUAL' ? colors.primary : colors.surfaceSecondary,
                    borderColor: preference === 'MANUAL' ? colors.primary : colors.cardBorder,
                  }}
                >
                  <Text
                    className="text-center font-bold text-xs"
                    style={{ color: preference === 'MANUAL' ? 'white' : colors.textTertiary }}
                  >
                    Manual
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPreference('AUTO')}
                  className="flex-1 p-4 rounded-2xl border"
                  style={{
                    backgroundColor: preference === 'AUTO' ? colors.primary : colors.surfaceSecondary,
                    borderColor: preference === 'AUTO' ? colors.primary : colors.cardBorder,
                  }}
                >
                  <Text
                    className="text-center font-bold text-xs"
                    style={{ color: preference === 'AUTO' ? 'white' : colors.textTertiary }}
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
            className="mt-12 py-5 rounded-[28px]"
            style={{ backgroundColor: createGoalMutation.isPending ? colors.primary + 'B3' : colors.primary }}
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
