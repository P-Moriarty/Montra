import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';
import { useApiMutation } from '@/hooks/api/use-api';
import { VasService } from '@/services/modules/vas.service';
import { BiometricService } from '@/services/biometric';
import { Toast } from '@/components/ui/toast';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const PIN_STORAGE_KEY = 'montra_transaction_pin';

export default function BillConfirmScreen() {
  const { colors } = useTheme();
  const { isBiometricEnabled, updatePinStatus } = useAuth();
  const { type, name, provider, providerId, identifier, amount, planCode, planName } = useLocalSearchParams();
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('FaceID');
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const purchaseMutation = useApiMutation(
    async (payload: any) => {
      switch (type) {
        case 'airtime': return VasService.purchaseAirtime(payload);
        case 'data': return VasService.purchaseData(payload);
        case 'cable': return VasService.purchaseCable(payload);
        case 'electricity': return VasService.purchaseElectricity(payload);
        default: throw new Error('Invalid bill type');
      }
    },
    {
      onSuccess: (data) => {
        setIsProcessing(false);
        const status = (data?.status || data?.data?.status || '').toLowerCase();
        
        // Robust message extraction to avoid [object Object]
        const rawMessage = data?.message || data?.data?.message || 'Transaction processed';
        const message = typeof rawMessage === 'string' ? rawMessage : 
                        typeof rawMessage === 'object' ? (rawMessage.message || JSON.stringify(rawMessage)) : 
                        'Transaction processed';

        if (['success', 'successful', 'delivered'].includes(status)) {
          setToast({ visible: true, message: `${name} payment successful!`, type: 'success' });
          setTimeout(() => router.replace('/(tabs)'), 2000);
        } else if (['pending', 'initiated'].includes(status)) {
          setToast({ visible: true, message: 'Transaction is pending. We will notify you once completed.', type: 'info' });
          setTimeout(() => router.replace('/(tabs)'), 3000);
        } else {
          setToast({ visible: true, message: message, type: 'error' });
          setShowPin(false);
          setPin('');
        }
      },
      onError: (error: any) => {
        setIsProcessing(false);
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || errorData?.data?.message || error.message || 'Transaction failed. Please try again.';
        const displayMessage = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);

        setToast({ 
          visible: true, 
          message: displayMessage, 
          type: 'error' 
        });
        setShowPin(false);
        setPin('');
      }
    }
  );

  useEffect(() => {
    BiometricService.getBiometricLabel().then(setBiometricLabel);
  }, []);

  const handlePinPress = (key: string) => {
    if (pin.length < 4 && !isProcessing) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 4) {
        SecureStore.setItemAsync(PIN_STORAGE_KEY, newPin);
        updatePinStatus(true);
        setIsProcessing(true);
        
        const rawAmount = parseFloat(String(amount).replace(/,/g, ''));
        const scaledAmount = Math.round(rawAmount * 100); // Convert to cents/raw units

        const payload: any = {
          auth_method: 'pin',
          credential: newPin,
        };

        if (type === 'airtime') {
          payload.amount = scaledAmount;
          payload.network = providerId;
          payload.phone = identifier;
        } else if (type === 'data') {
          payload.network = providerId;
          payload.phone = identifier;
          payload.code = planCode;
          payload.serviceID = providerId;
        } else if (type === 'cable') {
          payload.cable_type = providerId;
          payload.code = planCode;
          payload.number = identifier;
        } else if (type === 'electricity') {
          payload.amount = scaledAmount;
          payload.disco = providerId;
          payload.meter_number = identifier;
          payload.meter_type = 'prepaid';
        }

        purchaseMutation.mutate(payload);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleBiometricConfirm = async () => {
    setBiometricLoading(true);
    try {
      const authenticated = await BiometricService.authenticate('Authorize payment');
      if (!authenticated) { setBiometricLoading(false); return; }
      const storedPin = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
      if (!storedPin) {
        setToast({ visible: true, message: 'No PIN stored. Please set a transaction PIN first.', type: 'error' });
        setBiometricLoading(false);
        return;
      }
      setShowPin(false);
      setPin(storedPin);
      setTimeout(() => {
        setIsProcessing(true);
        const rawAmount = parseFloat(String(amount).replace(/,/g, ''));
        const scaledAmount = Math.round(rawAmount * 100);
        const payload: any = { auth_method: 'pin', credential: storedPin };
        if (type === 'airtime') {
          payload.amount = scaledAmount;
          payload.network = providerId;
          payload.phone = identifier;
        } else if (type === 'data') {
          payload.network = providerId;
          payload.phone = identifier;
          payload.code = planCode;
          payload.serviceID = providerId;
        } else if (type === 'cable') {
          payload.cable_type = providerId;
          payload.code = planCode;
          payload.number = identifier;
        } else if (type === 'electricity') {
          payload.amount = scaledAmount;
          payload.disco = providerId;
          payload.meter_number = identifier;
          payload.meter_type = 'prepaid';
        }
        purchaseMutation.mutate(payload);
        setBiometricLoading(false);
      }, 300);
    } catch (e) {
      setBiometricLoading(false);
    }
  };

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
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Confirmation</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mt-10 mb-8">
          <View className="w-20 h-20 rounded-full items-center justify-center shadow-sm mb-4 border" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
            <Feather name={type === 'airtime' || type === 'data' ? 'phone' : 'zap'} size={40} color={colors.primary} />
          </View>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>{provider}</Text>
          <Text className="text-base mt-1" style={{ color: colors.textSecondary }}>{identifier}</Text>
        </View>

        {/* Transaction Card */}
        <View className="p-8 rounded-[40px] shadow-sm border mb-8" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
          <View className="flex-row justify-between mb-6">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Biller Category</Text>
            <Text className="font-bold" style={{ color: colors.text }}>{name}</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Customer ID</Text>
            <Text className="font-bold" style={{ color: colors.text }}>{identifier}</Text>
          </View>

          {planName && (
            <View className="flex-row justify-between mb-6">
              <Text className="font-medium" style={{ color: colors.textTertiary }}>Plan</Text>
              <Text className="font-bold flex-1 text-right ml-4" style={{ color: colors.text }}>{planName}</Text>
            </View>
          )}

          <View className="h-[1px] mb-6" style={{ backgroundColor: colors.cardBorder }} />

          <View className="flex-row justify-between mb-4">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Amount</Text>
            <Text className="font-bold" style={{ color: colors.text }}>₦{amount}</Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Fee</Text>
            <Text className="font-bold" style={{ color: colors.text }}>₦0.00</Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="font-extrabold text-lg" style={{ color: colors.text }}>Total Amount</Text>
            <Text className="font-extrabold text-lg" style={{ color: colors.text }}>₦{amount}</Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity 
          onPress={() => setShowPin(true)}
          className="py-5 rounded-[28px] shadow-lg shadow-indigo-100" style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white text-center text-lg font-bold">Confirm & Pay</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* PIN Modal */}
      <Modal visible={showPin} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}>
          <View className="rounded-t-[48px] px-6 pt-10 pb-12" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row justify-between items-center mb-10">
              <View>
                <Text className="text-2xl font-bold" style={{ color: colors.text }}>Enter PIN</Text>
                <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>Verify payment of ₦{amount}</Text>
              </View>
              <TouchableOpacity onPress={() => { setShowPin(false); setPin(''); }}>
                <Ionicons name="close-circle" size={32} color={colors.cardBorder} />
              </TouchableOpacity>
            </View>

            {/* PIN Dots */}
            <View className="flex-row justify-center gap-4 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <View 
                  key={i} 
                  className={`w-4 h-4 rounded-full ${pin.length >= i ? '' : ''}`}
                  style={{ backgroundColor: pin.length >= i ? colors.primary : colors.cardBorder }}
                />
              ))}
            </View>

{isBiometricEnabled && (
              <TouchableOpacity
                onPress={handleBiometricConfirm}
                disabled={isProcessing || biometricLoading}
                className="flex-row items-center justify-center py-3 mb-6 rounded-2xl border"
                style={{ borderColor: colors.cardBorder, backgroundColor: colors.surfaceSecondary }}
              >
                {biometricLoading ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="face-recognition" size={22} color={colors.primary} />
                    <Text className="ml-2 font-bold" style={{ color: colors.text }}>
                      Use {biometricLabel}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Keypad */}
            {isProcessing ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="font-bold mt-4" style={{ color: colors.text }}>Processing payment...</Text>
              </View>
            ) : (
              <CustomKeypad onPress={handlePinPress} onDelete={handleDelete} hideDecimal={true} />
            )}
          </View>
        </View>
      </Modal>

      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
