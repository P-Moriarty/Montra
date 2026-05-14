import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';
import { TransferService } from '@/services/modules/transfer.service';
import { WithdrawalService } from '@/services/modules/withdrawal.service';
import { WalletService } from '@/services/modules/wallet.service';
import { useApiQuery } from '@/hooks/api/use-api';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/ui/toast';

export default function ConfirmTransferScreen() {
  const params = useLocalSearchParams();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const [balance, setBalance] = useState('');
  const { userToken, isLoading: isAuthLoading } = useAuth();

  const { data: walletData } = useApiQuery(
    ['wallet'],
    WalletService.getWalletBalance,
    { enabled: !isAuthLoading && !!userToken }
  );

  const formatMoney = (balanceValue: number | string) => {
    const scale = 2; // API returns values in smallest units (e.g. Kobo)
    const formatted = (Number(balanceValue || 0) / Math.pow(10, scale)).toFixed(scale);
    return Number(formatted).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  useEffect(() => {
    if (walletData?.wallets) {
      const ngnWallet = walletData.wallets.find(w => 
        String(w.currency || '').toUpperCase() === 'NGN' || 
        String(w.currency || '').toUpperCase() === 'NAIRA'
      );
      if (ngnWallet) {
        setBalance(formatMoney(ngnWallet.balance));
      }
    }
  }, [walletData]);

  const getParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] ?? '' : value ?? '';

  const recipientName = getParam(params.name);
  const recipientAccount = getParam(params.account);
  const recipientBank = getParam(params.bank);
  const recipientBankCode = getParam(params.bank_code);
  const transferType = getParam(params.type);
  const narration = getParam(params.narration) || 'Transfer';
  const amount = getParam(params.amount);

  const handlePinPress = (key: string) => {
    if (key === 'delete') {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < 4) {
      setPin((prev) => prev + key);
    }
  };

  const handleConfirm = async () => {
    if (pin.length < 4) return;

    setIsSubmitting(true);

    try {
      // Robust parsing: strip everything except digits and decimal point
      const cleanAmount = (amount || '0').replace(/[^\d.]/g, '');
      const amountValue = parseFloat(cleanAmount);
      
      console.log('[ConfirmTransfer] Amount Analysis:', {
        raw: amount,
        clean: cleanAmount,
        parsed: amountValue
      });

      if (transferType === 'payid') {
        const wallets = walletData?.wallets || [];
        const ngnWallet = wallets.find(w => String(w.currency || '').toLowerCase() === 'ngn');
        
        const payload = {
          pay_id: getParam(params.identifier),
          payid: getParam(params.identifier),
          amount: amountValue * 100,
          amount_kobo: amountValue * 100,
          currency: 'ngn',
          currency_code: 'ngn',
          wallet_currency: 'ngn',
          from_currency: 'ngn',
          to_currency: 'ngn',
          wallet_id: ngnWallet?.id,
          sender_wallet_id: ngnWallet?.id,
          narration,
          pin,
          auth_method: 'pin',
          credential: pin,
        };

        console.log('[ConfirmTransfer] internalTransfer payload:', JSON.stringify(payload, null, 2));

        await TransferService.internalTransfer(payload);
      } else if (transferType === 'bank') {
        if (!recipientAccount || !recipientBankCode || !recipientName || !recipientBank) {
          setToast({
            visible: true,
            message: 'Missing recipient account details',
            type: 'error',
          });
          setIsSubmitting(false);
          return;
        }

        const payload = {
          accountname: recipientName.trim(),
          accountnumber: recipientAccount.trim(),
          amount: amountValue * 100, // Backend expects amount in Kobo (smallest unit)
          authmethod: 'pin',
          bankcode: recipientBankCode.trim(),
          bankname: recipientBank.trim(),
          credential: pin,
          narration: narration || 'Withdrawal',
        };

        console.log(
          '[ConfirmTransfer] withdrawal payload:',
          JSON.stringify(payload, null, 2)
        );

        await WithdrawalService.initiateWithdrawal(payload);
      }

      setToast({
        visible: true,
        message: 'Transfer completed successfully',
        type: 'success',
      });

      setShowPinModal(false);

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
    } catch (error: any) {
      console.error('Transfer failed:', error);

      const errorData = error?.response?.data;
      let errorMessage = 'Transfer failed. Please try again.';

      if (errorData) {
        if (typeof errorData?.message === 'object') {
          errorMessage = Object.values(errorData.message).join('\n');
        } else if (typeof errorData?.data?.message === 'object') {
          errorMessage = Object.values(errorData.data.message).join('\n');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The server is taking too long to respond. Please check your transaction history before retrying.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      setToast({
        visible: true,
        message: errorMessage,
        type: 'error',
      });

      setPin('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#F8F9FB] items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">
          Confirm transfer
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mt-10 items-center">
          <View className="w-24 h-24 bg-[#5154F4] rounded-full items-center justify-center mb-4 overflow-hidden shadow-lg border-4 border-white">
            <View className="items-center justify-center p-4">
              <Text className="text-white text-2xl font-black tracking-tighter uppercase">
                {recipientBank?.slice(0, 2) || 'MT'}
              </Text>
            </View>
          </View>
          <Text className="text-[#1F2C37] text-xl font-bold mb-1">
            {recipientName && recipientName !== 'undefined' ? recipientName : 'Recipient'}
          </Text>
          <Text className="text-[#9DA3B6] text-sm">
            {transferType === 'payid' 
              ? `PayID: ${getParam(params.identifier)}`
              : `${recipientAccount && recipientAccount !== 'undefined' ? recipientAccount : '---'} - ${recipientBank && recipientBank !== 'undefined' ? recipientBank : '---'}`
            }
          </Text>
        </View>

        <View className="bg-[#F8F9FB] w-full p-8 rounded-[40px] mt-10">
          <View className="items-center mb-10">
            <Text className="text-[#1F2C37] text-5xl font-extrabold">
              ₦{amount || '0.00'}
            </Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">From</Text>
            <View className="items-end">
              <Text className="text-[#1F2C37] font-bold">Available balance</Text>
              <Text className="text-[#9DA3B6] text-xs">(₦{balance})</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Fee</Text>
            <Text className="text-[#1F2C37] font-bold">₦0.00</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Transfer</Text>
            <Text className="text-[#1F2C37] font-bold">Instantly</Text>
          </View>

          <View className="h-[1px] bg-gray-200 mb-6" />

          <View className="flex-row justify-between">
            <Text className="text-[#6C7278] font-bold">Total</Text>
            <Text className="text-[#1F2C37] text-lg font-bold">₦{amount || '0.00'}</Text>
          </View>
        </View>

        <View className="w-full mt-10 mb-8">
          <TouchableOpacity
            onPress={() => setShowPinModal(true)}
            className="bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100"
          >
            <Text className="text-white text-center text-lg font-bold">Confirm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showPinModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[48px] px-6 pt-10 pb-4">
            <TouchableOpacity
              onPress={() => setShowPinModal(false)}
              className="self-end mb-4"
            >
              <Ionicons name="close-circle-outline" size={28} color="#9DA3B6" />
            </TouchableOpacity>

            <View className="items-center mb-10">
              <Text className="text-[#1F2C37] text-2xl font-bold mb-10">Enter Pin</Text>

              <View className="flex-row justify-between w-64">
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    className={`w-14 h-14 rounded-2xl items-center justify-center border-2 ${
                      pin.length >= i
                        ? 'bg-[#F8F9FB] border-[#5154F4]'
                        : 'bg-[#F8F9FB] border-transparent'
                    }`}
                  >
                    {pin.length >= i ? (
                      <Text className="text-[#1F2C37] text-2xl font-bold">*</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleConfirm}
              className={`py-5 rounded-[28px] mb-8 shadow-lg ${
                pin.length === 4 ? 'bg-[#5154F4] shadow-indigo-100' : 'bg-indigo-200 shadow-none'
              }`}
              disabled={pin.length < 4 || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-bold">Send</Text>
              )}
            </TouchableOpacity>

            <View className="bg-[#D1D5DB]/30 pt-4 rounded-[40px] -mx-6">
              <CustomKeypad
                onPress={(key) => handlePinPress(key)}
                onDelete={() => handlePinPress('delete')}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
