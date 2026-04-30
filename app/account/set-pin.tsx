import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AccountService } from '../../services/modules/account.service';
import { useApiMutation } from '@/hooks/api/use-api';
import { Toast } from '../../components/ui/toast';

export default function SetPinScreen() {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [tempPin, setTempPin] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const setPinMutation = useApiMutation(AccountService.setPin, {
    onSuccess: () => {
      setToast({ visible: true, message: 'Security PIN set successfully!', type: 'success' });
      setTimeout(() => router.back(), 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      let errorText = 'Failed to set PIN';

      if (typeof message === 'object') {
        errorText = Object.values(message).join(', ');
      } else if (message) {
        errorText = String(message);
      }

      setToast({ visible: true, message: errorText, type: 'error' });
      setPin('');
      setStep('create');
    }
  });

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        if (step === 'create') {
          setTempPin(newPin);
          setTimeout(() => {
            setStep('confirm');
            setPin('');
          }, 300);
        } else {
          if (newPin === tempPin) {
            const payload = {
              account_pin: tempPin,
              confirm_account_pin: newPin
            };
            console.log('[Swap] Sending set-pin payload:', payload);
            setPinMutation.mutate(payload);
          } else {
            setToast({ visible: true, message: 'PINs do not match. Try again.', type: 'error' });
            setPin('');
            setStep('create');
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FE]" edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      {/* Header */}
      <View className="flex-row items-center px-6 py-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm border border-gray-50"
        >
          <Ionicons name="chevron-back" size={24} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-12">Security PIN</Text>
      </View>
      <ScrollView>
        <View className="flex-1 items-center px-8 pt-10">
          <View className="w-20 h-20 bg-[#5154F4]/10 rounded-[32px] items-center justify-center mb-8">
            <Feather name={step === 'create' ? 'shield' : 'check-circle'} size={32} color="#5154F4" />
          </View>

          <Text className="text-2xl font-bold text-[#1F2C37] mb-2 text-center">
            {step === 'create' ? 'Create Secure PIN' : 'Confirm Your PIN'}
          </Text>
          <Text className="text-[#9DA3B6] text-center mb-12 font-medium leading-6 px-4">
            {step === 'create'
              ? 'Set a 4-digit PIN to secure your transactions and sensitive actions.'
              : 'Please re-enter your PIN to ensure it was entered correctly.'}
          </Text>

          {/* PIN Indicators */}
          <View className="flex-row justify-center items-center space-x-6 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <View
                key={i}
                className={`w-4 h-4 rounded-full ${i < pin.length ? 'bg-[#5154F4]' : 'bg-gray-200'}`}
                style={i < pin.length ? {
                  shadowColor: '#5154F4',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5
                } : {}}
              />
            ))}
          </View>

          {setPinMutation.isPending && (
            <View className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-50 flex-row items-center">
              <ActivityIndicator color="#5154F4" size="small" />
              <Text className="ml-3 text-[#5154F4] font-bold">Securing Account...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Numerical Keypad */}
      <View className="bg-white rounded-t-[48px] px-10 pt-10 pb-12 shadow-2xl border-t border-gray-50">
        <View className="flex-row flex-wrap justify-between gap-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => item === 'del' ? handleDelete() : item !== '' && handlePress(item.toString())}
              disabled={setPinMutation.isPending}
              className={`w-[28%] aspect-square items-center justify-center rounded-3xl ${item === '' ? 'opacity-0' : 'active:bg-gray-100'}`}
            >
              {item === 'del' ? (
                <View className="w-14 h-14 bg-red-50 rounded-2xl items-center justify-center">
                  <Ionicons name="backspace-outline" size={24} color="#EF4444" />
                </View>
              ) : item === '' ? null : (
                <Text className="text-2xl font-bold text-[#1F2C37]">{item}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
