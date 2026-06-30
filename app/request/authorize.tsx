import { CustomKeypad } from '@/components/custom-keypad';
import { TransferService } from '@/services/modules/transfer.service';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BiometricService } from '@/services/biometric';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const PIN_STORAGE_KEY = 'montra_transaction_pin';

export default function RequestAuthorizeScreen() {
  const { colors } = useTheme();
  const { isBiometricEnabled, updatePinStatus } = useAuth();
  const params = useLocalSearchParams();
  const [pin, setPin] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('FaceID');
  const [successMessage, setSuccessMessage] = useState('Request Sent Successfully!');

const handlePinPress = (key: string) => {
  if (key === 'delete') {
    setPin((prev) => prev.slice(0, -1));
  } else {
    setPin((prev) => (prev.length < 4 ? prev + key : prev));
  }
};


  useEffect(() => {
    BiometricService.getBiometricLabel().then(setBiometricLabel);
  }, []);

  const handleBiometricConfirm = async () => {
    setBiometricLoading(true);
    try {
      const authenticated = await BiometricService.authenticate('Authorize request');
      if (!authenticated) { setBiometricLoading(false); return; }
      const storedPin = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
      if (!storedPin) {
        Alert.alert('No PIN Stored', 'Please set a transaction PIN first.');
        setBiometricLoading(false);
        return;
      }
      setPin(storedPin);
      setTimeout(() => { handleDone(storedPin); setBiometricLoading(false); }, 300);
    } catch (e) {
      setBiometricLoading(false);
    }
  };

  const handleDone = async (submittedPin?: any) => {
    const currentPin = typeof submittedPin === 'string' ? submittedPin : pin;
    if (currentPin.length === 4) {
      SecureStore.setItemAsync(PIN_STORAGE_KEY, currentPin);
      updatePinStatus(true);
      try {
        setIsLoading(true);
        if (params.type === 'pending') {
          // Accept pending request
          await TransferService.actionRequest({
            request_id: params.id as string,
            status: 'accepted',
            auth_method: 'pin',
            credential: currentPin,
          });
          setSuccessMessage('Request Accepted Successfully!');
        } else {
          // Create new request
          // Clean amount string to number
          const cleanAmount = Number(params.amount?.toString().replace(/[^0-9.]/g, '')) || 0;

          await TransferService.createRequest({
            amount: cleanAmount,
            pay_id: params.identifier as string,
            currency: 'ngn', // Defaulting to ngn
            narration: params.narration as string,
            auth_method: 'pin',
            credential: currentPin,
          });
          setSuccessMessage('Request Sent Successfully!');
        }

        setIsSuccess(true);
        setTimeout(() => {
          router.dismissAll();
          router.push('/(tabs)');
        }, 2000);
      } catch (error: any) {
        console.error('Request failed:', error);
        const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
        Alert.alert('Request Failed', errorMsg);
        setPin(''); // Reset PIN on failure
      } finally {
        setIsLoading(false);
      }
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
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Enter Pin</Text>
      </View>

      <View className="flex-1 px-6 justify-center items-center pb-20">
        <Text className="text-2xl font-bold mb-12" style={{ color: colors.text }}>Enter Pin</Text>

        {/* PIN Dots */}
     <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 256, marginBottom: 64 }}>
  {[1, 2, 3, 4].map((i) => (
    <View
      key={i}
      style={{
        width: 64,
        height: 64,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        backgroundColor: pin.length >= i ? colors.surface : `${colors.surface}66`,
        borderColor: pin.length + 1 === i ? colors.primary : 'transparent',
      }}
    >
      <Text style={{ color: colors.text, fontSize: 32, fontWeight: '700' }}>
        {pin.length >= i ? '*' : ''}
      </Text>
    </View>
  ))}
</View>

{isBiometricEnabled && (
          <TouchableOpacity
            onPress={handleBiometricConfirm}
            disabled={isLoading || biometricLoading}
            className="flex-row items-center justify-center py-3 mb-4 rounded-2xl border w-full"
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

        {/* Done Button */}
        <TouchableOpacity
          onPress={handleDone}
          disabled={pin.length < 4 || isLoading}
          className={`w-full py-5 rounded-[28px] shadow-lg items-center justify-center`}
          style={{
            backgroundColor: pin.length === 4 ? colors.primary : colors.disabledBg,
            shadowColor: pin.length === 4 ? colors.primary : 'transparent'
          }}
        >
          {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center text-lg font-bold">Done</Text>}
        </TouchableOpacity>

        {/* Success Feedback */}
        {isSuccess && (
          <View className="mt-10 items-center">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.successLight }}>
              <Ionicons name="checkmark" size={32} color={colors.success} />
            </View>
            <Text className="font-bold" style={{ color: colors.text }}>{successMessage}</Text>
          </View>
        )}
      </View>

      {/* Custom Keypad */}
      <View className="pt-4 rounded-t-[40px]" style={{ backgroundColor: `${colors.switchTrackOff}30` }}>
        <CustomKeypad
          onPress={(key) => handlePinPress(key)}
          onDelete={() => handlePinPress('delete')}
        />
      </View>
    </SafeAreaView>
  );
}
