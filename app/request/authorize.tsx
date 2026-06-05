import { CustomKeypad } from '@/components/custom-keypad';
import { TransferService } from '@/services/modules/transfer.service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RequestAuthorizeScreen() {
  const params = useLocalSearchParams();
  const [pin, setPin] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Request Sent Successfully!');

const handlePinPress = (key: string) => {
  if (key === 'delete') {
    setPin((prev) => prev.slice(0, -1));
  } else {
    setPin((prev) => (prev.length < 4 ? prev + key : prev));
  }
};


  const handleDone = async () => {
    if (pin.length === 4) {
      try {
        setIsLoading(true);
        if (params.type === 'pending') {
          // Accept pending request
          await TransferService.actionRequest({
            request_id: params.id as string,
            status: 'accepted',
            auth_method: 'pin',
            credential: pin,
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
            credential: pin,
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
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Enter Pin</Text>
      </View>

      <View className="flex-1 px-6 justify-center items-center pb-20">
        <Text className="text-[#1F2C37] text-2xl font-bold mb-12">Enter Pin</Text>

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
        backgroundColor: pin.length >= i ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
        borderColor: pin.length + 1 === i ? '#5154F4' : 'transparent',
      }}
    >
      <Text style={{ color: '#1F2C37', fontSize: 32, fontWeight: '700' }}>
        {pin.length >= i ? '*' : ''}
      </Text>
    </View>
  ))}
</View>

        {/* Done Button */}
        <TouchableOpacity
          onPress={handleDone}
          disabled={pin.length < 4 || isLoading}
          className={`w-full py-5 rounded-[28px] shadow-lg items-center justify-center ${pin.length === 4 ? 'bg-[#5154F4] shadow-indigo-100' : 'bg-indigo-300 shadow-none'}`}
        >
          {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center text-lg font-bold">Done</Text>}
        </TouchableOpacity>

        {/* Success Feedback */}
        {isSuccess && (
          <View className="mt-10 items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark" size={32} color="#22C55E" />
            </View>
            <Text className="text-[#1F2C37] font-bold">{successMessage}</Text>
          </View>
        )}
      </View>

      {/* Custom Keypad */}
      <View className="bg-[#D1D5DB]/30 pt-4 rounded-t-[40px]">
        <CustomKeypad
          onPress={(key) => handlePinPress(key)}
          onDelete={() => handlePinPress('delete')}
        />
      </View>
    </SafeAreaView>
  );
}
