import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather} from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';
import { useApiMutation } from '@/hooks/api/use-api';
import { VasService } from '@/services/modules/vas.service';
import { Toast } from '@/components/ui/toast';

export default function BillConfirmScreen() {
  const { type, name, provider, providerId, identifier, amount, planCode, planName } = useLocalSearchParams();
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handlePinPress = (key: string) => {
    if (pin.length < 4 && !isProcessing) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 4) {
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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Confirmation</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mt-10 mb-8">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-sm mb-4 border border-gray-50">
            <Feather name={type === 'airtime' || type === 'data' ? 'phone' : 'zap'} size={40} color="#5154F4" />
          </View>
          <Text className="text-[#1F2C37] text-2xl font-bold">{provider}</Text>
          <Text className="text-[#9DA3B6] text-base mt-1">{identifier}</Text>
        </View>

        {/* Transaction Card */}
        <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 mb-8">
          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Biller Category</Text>
            <Text className="text-[#1F2C37] font-bold">{name}</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Customer ID</Text>
            <Text className="text-[#1F2C37] font-bold">{identifier}</Text>
          </View>

          {planName && (
            <View className="flex-row justify-between mb-6">
              <Text className="text-[#6C7278] font-medium">Plan</Text>
              <Text className="text-[#1F2C37] font-bold flex-1 text-right ml-4">{planName}</Text>
            </View>
          )}

          <View className="h-[1px] bg-gray-100 mb-6" />

          <View className="flex-row justify-between mb-4">
            <Text className="text-[#6C7278] font-medium">Amount</Text>
            <Text className="text-[#1F2C37] font-bold">₦{amount}</Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="text-[#6C7278] font-medium">Fee</Text>
            <Text className="text-[#1F2C37] font-bold">₦0.00</Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-[#1F2C37] font-extrabold text-lg">Total Amount</Text>
            <Text className="text-[#1F2C37] font-extrabold text-lg">₦{amount}</Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity 
          onPress={() => setShowPin(true)}
          className="bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100"
        >
          <Text className="text-white text-center text-lg font-bold">Confirm & Pay</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* PIN Modal */}
      <Modal visible={showPin} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[48px] px-6 pt-10 pb-12">
            <View className="flex-row justify-between items-center mb-10">
              <View>
                <Text className="text-[#1F2C37] text-2xl font-bold">Enter PIN</Text>
                <Text className="text-[#9DA3B6] text-sm mt-1">Verify payment of ₦{amount}</Text>
              </View>
              <TouchableOpacity onPress={() => { setShowPin(false); setPin(''); }}>
                <Ionicons name="close-circle" size={32} color="#E5E7EB" />
              </TouchableOpacity>
            </View>

            {/* PIN Dots */}
            <View className="flex-row justify-center gap-4 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <View 
                  key={i} 
                  className={`w-4 h-4 rounded-full ${pin.length >= i ? 'bg-[#5154F4]' : 'bg-gray-200'}`} 
                />
              ))}
            </View>

            {/* Keypad */}
            {isProcessing ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color="#5154F4" />
                <Text className="text-[#1F2C37] font-bold mt-4">Processing payment...</Text>
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
