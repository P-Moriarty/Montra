import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WithdrawalService, Bank } from '@/services/modules/withdrawal.service';
import { Toast } from '@/components/ui/toast';

export default function AddRecipientScreen() {
  const [accountnumber, setAccountnumber] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accountName, setAccountName] = useState('');
  const [narration, setNarration] = useState('');
  const [saveAsBeneficiary, setSaveAsBeneficiary] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    const cleanNumber = accountnumber.replace(/\D/g, '');
    if (cleanNumber.length === 10 && selectedBank?.code) {
      resolveAccount(cleanNumber, selectedBank.code);
    } else {
      setAccountName('');
    }
  }, [accountnumber, selectedBank]);

  const fetchBanks = async () => {
    setIsLoadingBanks(true);
    try {
      const data = await WithdrawalService.listBanks();
      const defaultBanks: Bank[] = [
        { name: 'First Bank of Nigeria', code: '011' },
        { name: 'Zenith Bank', code: '057' },
        { name: 'Guaranty Trust Bank', code: '058' },
        { name: 'Access Bank', code: '044' },
      ];

      if (Array.isArray(data) && data.length > 0) {
        setBanks(data);
      } else {
        setBanks(defaultBanks);
      }
    } catch (error) {
      console.error('Failed to fetch banks:', error);
      setBanks([
        { name: 'First Bank of Nigeria', code: '011' },
        { name: 'Zenith Bank', code: '057' },
        { name: 'Guaranty Trust Bank', code: '058' },
      ]);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const resolveAccount = async (num: string, bCode: string) => {
    if (num.length !== 10) return;

    setIsResolving(true);
    try {
      const response = await WithdrawalService.resolveAccount({
        accountnumber: num,
        bankcode: bCode,
      });

      const resolvedName =
        response?.data?.accountname ||
        response?.data?.account_name ||
        response?.accountname ||
        response?.account_name ||
        '';

      setAccountName(resolvedName);
    } catch (error) {
      console.error('Failed to resolve account:', error);
      setAccountName('');
      setToast({
        visible: true,
        message: 'Unable to resolve account details',
        type: 'error',
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleContinue = () => {
    if (!accountnumber || !selectedBank || !accountName) {
      setToast({
        visible: true,
        message: 'Please complete all fields',
        type: 'error',
      });
      return;
    }

    router.push(
      `/transfer/amount?name=${encodeURIComponent(accountName)}&account=${encodeURIComponent(accountnumber)}&bank=${encodeURIComponent(selectedBank.name)}&bank_code=${encodeURIComponent(selectedBank.code)}&type=bank&narration=${encodeURIComponent(narration)}`
    );
  };

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <>
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
            Bank transfer
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="mt-8 mb-6">
            <Text className="text-[#1F2C37] text-base font-semibold mb-3">
              Account number
            </Text>
            <TextInput
              className="w-full h-16 bg-white border border-gray-200 rounded-2xl px-5 text-[#1F2C37] font-medium"
              placeholder="Enter 10-digit account number"
              placeholderTextColor="#9DA3B6"
              keyboardType="numeric"
              value={accountnumber}
              onChangeText={(text) =>
                setAccountnumber(text.replace(/\D/g, '').slice(0, 10))
              }
            />
          </View>

          <View className="mb-6">
            <Text className="text-[#1F2C37] text-base font-semibold mb-3">
              Bank Name
            </Text>
            <TouchableOpacity
              onPress={() => setShowBankModal(true)}
              className="w-full h-16 bg-white border border-gray-200 rounded-2xl px-5 flex-row items-center justify-between"
            >
              <Text
                className={
                  selectedBank
                    ? 'text-[#1F2C37] font-medium'
                    : 'text-[#9DA3B6] font-medium'
                }
              >
                {selectedBank ? selectedBank.name : 'Select Bank name'}
              </Text>
              {isLoadingBanks ? (
                <ActivityIndicator size="small" color="#5154F4" />
              ) : (
                <Ionicons name="chevron-down" size={20} color="#9DA3B6" />
              )}
            </TouchableOpacity>
          </View>

          {selectedBank && (
            <View className="mb-6">
              <Text className="text-[#1F2C37] text-base font-semibold mb-3">
                Bank Code
              </Text>
              <View className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-5 justify-center">
                <Text className="text-[#9DA3B6] font-medium">
                  {selectedBank.code}
                </Text>
              </View>
            </View>
          )}

          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[#1F2C37] text-base font-semibold">
                Account Name
              </Text>
              {isResolving && (
                <ActivityIndicator size="small" color="#5154F4" />
              )}
            </View>
            <TextInput
              className="w-full h-16 bg-white border border-gray-200 rounded-2xl px-5 text-[#1F2C37] font-medium"
              placeholder="Resolved account name"
              placeholderTextColor="#9DA3B6"
              value={accountName}
              onChangeText={setAccountName}
              editable={!isResolving}
            />
          </View>

          <View className="mb-8">
            <Text className="text-[#1F2C37] text-base font-semibold mb-3">
              Narration
            </Text>
            <TextInput
              className="w-full h-16 bg-white border border-gray-200 rounded-2xl px-5 text-[#1F2C37] font-medium"
              placeholder="Optional"
              placeholderTextColor="#9DA3B6"
              value={narration}
              onChangeText={setNarration}
            />
          </View>

          <View className="flex-row items-center justify-between mb-12">
            <Text className="text-[#1F2C37] text-base font-medium">
              Save as beneficiary
            </Text>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#5154F4' }}
              thumbColor="#fff"
              ios_backgroundColor="#E2E8F0"
              onValueChange={() => setSaveAsBeneficiary(!saveAsBeneficiary)}
              value={saveAsBeneficiary}
            />
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            className="bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100"
          >
            <Text className="text-white text-center text-lg font-bold">
              Continue
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={showBankModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[48px] px-6 pt-10 pb-10 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#1F2C37] text-2xl font-bold">
                Select Bank
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowBankModal(false);
                  setBankSearch('');
                }}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={28}
                  color="#9DA3B6"
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-[#F8F9FB] h-14 rounded-2xl px-4 border border-gray-100 mb-6">
              <Ionicons name="search" size={20} color="#9DA3B6" />
              <TextInput
                className="flex-1 ml-3 text-[#1F2C37] font-medium"
                placeholder="Search bank name"
                placeholderTextColor="#9DA3B6"
                value={bankSearch}
                onChangeText={setBankSearch}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredBanks.length > 0 ? (
                filteredBanks.map((item, index) => (
                  <TouchableOpacity
                    key={item.code || index.toString()}
                    onPress={() => {
                      setSelectedBank(item);
                      setShowBankModal(false);
                      setBankSearch('');
                    }}
                    className="py-5 border-b border-gray-50 flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text className="text-[#1F2C37] text-lg font-medium">
                        {item.name}
                      </Text>
                    </View>
                    {selectedBank?.code === item.code && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#5154F4"
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View className="py-20 items-center">
                  <Text className="text-[#9DA3B6] text-base">
                    No banks available
                  </Text>
                  <TouchableOpacity onPress={fetchBanks} className="mt-4">
                    <Text className="text-[#5154F4] font-bold">Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
