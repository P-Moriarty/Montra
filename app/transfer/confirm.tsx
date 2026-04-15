import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';

export default function ConfirmTransferScreen() {
  const params = useLocalSearchParams();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');

  const handlePinPress = (key: string) => {
    if (key === 'delete') {
      setPin(pin.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(pin + key);
    }
  };

  const handleConfirm = () => {
    // Navigate home after "success"
    setShowPinModal(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#F8F9FB] items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Confirm transfer</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Beneficiary Header */}
        <View className="mt-10 items-center">
          <View className="w-24 h-24 bg-[#E34800] rounded-full items-center justify-center mb-4 overflow-hidden shadow-lg border-4 border-white">
             <View className="items-center justify-center p-4">
               <View className="w-5 h-5 bg-white mb-2 self-end" />
               <Text className="text-white text-base font-bold tracking-tighter">GTCO</Text>
             </View>
          </View>
          <Text className="text-[#1F2C37] text-xl font-bold mb-1">{params.name || 'Emezue Chinonso'}</Text>
          <Text className="text-[#9DA3B6] text-sm">{params.account || '8323847728'} - {params.bank || 'Gtbank'}</Text>
        </View>

        {/* Amount Summary */}
        <View className="bg-[#F8F9FB] w-full p-8 rounded-[40px] mt-10">
          <View className="items-center mb-10">
            <Text className="text-[#1F2C37] text-5xl font-extrabold">₦{params.amount || '5,000.00'}</Text>
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">From</Text>
            <View className="items-end">
              <Text className="text-[#1F2C37] font-bold">Available balance</Text>
              <Text className="text-[#9DA3B6] text-xs">(₦20,000.00)</Text>
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
            <Text className="text-[#1F2C37] text-lg font-bold">₦{params.amount || '5,000.00'}</Text>
          </View>
        </View>

        {/* Primary Confirm Button */}
        <View className="w-full mt-10 mb-8">
           <TouchableOpacity 
             onPress={() => setShowPinModal(true)}
             className="bg-[#5154F4] py-5 rounded-[28px] shadow-lg shadow-indigo-100"
           >
             <Text className="text-white text-center text-lg font-bold">Confirm</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PIN entry Modal */}
      <Modal visible={showPinModal} animationType="slide" transparent={true}>
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
                    className={`w-14 h-14 rounded-2xl items-center justify-center border-2 ${pin.length >= i ? 'bg-[#F8F9FB] border-[#5154F4]' : 'bg-[#F8F9FB] border-transparent'}`}
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
              className={`py-5 rounded-[28px] mb-8 shadow-lg ${pin.length === 4 ? 'bg-[#5154F4] shadow-indigo-100' : 'bg-indigo-200 shadow-none'}`}
              disabled={pin.length < 4}
            >
              <Text className="text-white text-center text-lg font-bold">Send</Text>
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
