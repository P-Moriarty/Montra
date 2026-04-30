import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AccountService } from '../../services/modules/account.service';
import { useApiMutation } from '@/hooks/api/use-api';
import { Toast } from '../../components/ui/toast';

export default function ChangePinScreen() {
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'password' | 'old' | 'new' | 'confirm'>('password');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const changePinMutation = useApiMutation(AccountService.changePin, {
    onSuccess: () => {
      setToast({ visible: true, message: 'PIN changed successfully!', type: 'success' });
      setTimeout(() => router.back(), 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      let errorText = 'Failed to change PIN';

      if (typeof message === 'object') {
        errorText = Object.values(message).join(', ');
      } else if (message) {
        errorText = String(message);
      }

      setToast({ visible: true, message: errorText, type: 'error' });
      setPin('');
      setStep('password');
      setPassword('');
    }
  });

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      const updatedPin = pin + digit;
      setPin(updatedPin);

      if (updatedPin.length === 4) {
        if (step === 'old') {
          setOldPin(updatedPin);
          setTimeout(() => {
            setStep('new');
            setPin('');
          }, 300);
        } else if (step === 'new') {
          setNewPin(updatedPin);
          setTimeout(() => {
            setStep('confirm');
            setPin('');
          }, 300);
        } else if (step === 'confirm') {
          if (updatedPin === newPin) {
            changePinMutation.mutate({
              current_password: password,
              old_pin: oldPin,
              new_pin: newPin
            });
          } else {
            setToast({ visible: true, message: 'PINs do not match. Start again.', type: 'error' });
            setPin('');
            setStep('new');
          }
        }
      }
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const getTitle = () => {
    if (step === 'password') return 'Verify Password';
    if (step === 'old') return 'Current PIN';
    if (step === 'new') return 'New PIN';
    return 'Confirm New PIN';
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-12">{getTitle()}</Text>
      </View>

      <ScrollView>

        <View className="flex-1 items-center px-8 pt-6">
          <View className="w-20 h-20 bg-[#5154F4]/10 rounded-[32px] items-center justify-center mb-8">
            <Feather name={step === 'password' ? 'lock' : 'key'} size={32} color="#5154F4" />
          </View>

          <Text className="text-2xl font-bold text-[#1F2C37] mb-2 text-center">
            {step === 'password' ? 'Authentication Required' : step === 'old' ? 'Verify PIN' : step === 'new' ? 'New Transaction PIN' : 'Confirm New PIN'}
          </Text>
          <Text className="text-[#9DA3B6] text-center mb-10 font-medium leading-6 px-4">
            {step === 'password'
              ? 'Enter your account login password to authorize this sensitive change.'
              : step === 'old'
                ? 'Now enter your current 4-digit Transaction PIN.'
                : step === 'new'
                  ? 'Create a new secure PIN for your financial transactions.'
                  : 'Re-enter your new PIN to confirm the update.'}
          </Text>

          {step === 'password' ? (
            <View className="w-full">
              <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center border border-gray-100 shadow-sm mb-6">
                <Feather name="shield" size={20} color="#9DA3B6" className="mr-3" />
                <TextInput
                  className="flex-1 text-[#1F2C37] font-bold text-lg"
                  placeholder="Account Password"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  autoFocus
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="#9DA3B6" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => password.length > 0 && setStep('old')}
                className={`w-full h-16 rounded-2xl items-center justify-center ${password.length > 0 ? 'bg-[#5154F4]' : 'bg-gray-200'}`}
                disabled={password.length === 0}
              >
                <Text className="text-white font-bold text-lg">Continue to PIN</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center">
              {/* PIN Indicators */}
              <View className="flex-row justify-center items-center space-x-6 gap-6 mb-10">
                {[...Array(4)].map((_, i) => (
                  <View
                    key={i}
                    className={`w-4 h-4 rounded-full ${i < pin.length ? 'bg-[#5154F4]' : 'bg-gray-200'}`}
                  />
                ))}
              </View>
            </View>
          )}

          {changePinMutation.isPending && (
            <View className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-50 flex-row items-center mt-4">
              <ActivityIndicator color="#5154F4" size="small" />
              <Text className="ml-3 text-[#5154F4] font-bold">Updating PIN...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {step !== 'password' && (
        <View className="bg-white rounded-t-[48px] px-10 pt-10 pb-12 shadow-2xl border-t border-gray-50">
          <View className="flex-row flex-wrap justify-between gap-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => item === 'del' ? handlePinDelete() : item !== '' && handlePinPress(item.toString())}
                disabled={changePinMutation.isPending}
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
      )}
    </SafeAreaView>
  );
}
