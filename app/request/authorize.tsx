import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomKeypad } from '@/components/custom-keypad';

export default function RequestAuthorizeScreen() {
  const params = useLocalSearchParams();
  const [pin, setPin] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePinPress = (key: string) => {
    if (key === 'delete') {
      setPin(pin.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(pin + key);
    }
  };

  const handleDone = () => {
    if (pin.length === 4) {
      setIsSuccess(true);
      // Simulate success and navigate back
      setTimeout(() => {
        router.dismissAll();
        router.push('/(tabs)');
      }, 2000);
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
        <View className="flex-row justify-between w-64 space-x-4 mb-16">
          {[1, 2, 3, 4].map((i) => (
            <View 
              key={i}
              className={`w-18 h-18 rounded-[24px] items-center justify-center border-2 ${pin.length + 1 === i ? 'bg-white border-[#5154F4] shadow-sm' : pin.length >= i ? 'bg-white border-transparent' : 'bg-white/40 border-transparent'}`}
            >
              <Text className="text-[#1F2C37] text-4xl mb-2 font-bold leading-none">
                {pin.length >= i ? '*' : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Done Button */}
        <TouchableOpacity 
          onPress={handleDone}
          className={`w-full py-5 rounded-[28px] shadow-lg ${pin.length === 4 ? 'bg-[#5154F4] shadow-indigo-100' : 'bg-indigo-300 shadow-none'}`}
          disabled={pin.length < 4}
        >
          <Text className="text-white text-center text-lg font-bold">Done</Text>
        </TouchableOpacity>

        {/* Success Feedback */}
        {isSuccess && (
          <View className="mt-10 items-center">
             <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
               <Ionicons name="checkmark" size={32} color="#22C55E" />
             </View>
             <Text className="text-[#1F2C37] font-bold">Request Sent Successfully!</Text>
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
