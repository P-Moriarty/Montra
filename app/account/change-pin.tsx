import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { AccountService } from '../../services/modules/account.service';
import { useApiMutation } from '@/hooks/api/use-api';
import { Toast } from '../../components/ui/toast';
import { useTheme } from '@/context/ThemeContext';

const PIN_STORAGE_KEY = 'montra_transaction_pin';

export default function ChangePinScreen() {
  const { colors } = useTheme();
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
            SecureStore.setItemAsync(PIN_STORAGE_KEY, newPin);
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
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
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
          className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm border"
          style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-12" style={{ color: colors.text }}>{getTitle()}</Text>
      </View>

      <ScrollView>

        <View className="flex-1 items-center px-8 pt-6">
          <View className="w-20 h-20 rounded-[32px] items-center justify-center mb-8" style={{ backgroundColor: colors.iconBg }}>
            <Feather name={step === 'password' ? 'lock' : 'key'} size={32} color={colors.primary} />
          </View>

          <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
            {step === 'password' ? 'Authentication Required' : step === 'old' ? 'Verify PIN' : step === 'new' ? 'New Transaction PIN' : 'Confirm New PIN'}
          </Text>
          <Text className="text-center mb-10 font-medium leading-6 px-4" style={{ color: colors.textSecondary }}>
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
              <View className="rounded-2xl px-4 py-4 flex-row items-center border shadow-sm mb-6" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
                <Feather name="shield" size={20} color={colors.textSecondary} className="mr-3" />
                <TextInput
                  className="flex-1 font-bold text-lg"
                  style={{ color: colors.text }}
                  placeholder="Account Password"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  autoFocus
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => password.length > 0 && setStep('old')}
                className="w-full h-16 rounded-2xl items-center justify-center"
                style={{ backgroundColor: password.length > 0 ? colors.primary : colors.disabledBg }}
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
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: i < pin.length ? colors.primary : colors.disabled }}
                  />
                ))}
              </View>
            </View>
          )}

          {changePinMutation.isPending && (
            <View className="px-6 py-3 rounded-2xl shadow-sm border flex-row items-center mt-4" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text className="ml-3 font-bold" style={{ color: colors.primary }}>Updating PIN...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {step !== 'password' && (
        <View className="rounded-t-[48px] px-10 pt-10 pb-12 shadow-2xl border-t" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
          <View className="flex-row flex-wrap justify-between gap-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => item === 'del' ? handlePinDelete() : item !== '' && handlePinPress(item.toString())}
                disabled={changePinMutation.isPending}
                className={`w-[28%] aspect-square items-center justify-center rounded-3xl ${item === '' ? 'opacity-0' : ''}`}
                activeOpacity={0.6}
              >
                {item === 'del' ? (
                  <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: colors.errorLight }}>
                    <Ionicons name="backspace-outline" size={24} color={colors.error} />
                  </View>
                ) : item === '' ? null : (
                  <Text className="text-2xl font-bold" style={{ color: colors.text }}>{item}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
