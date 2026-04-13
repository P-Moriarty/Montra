import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CustomKeypadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
}

const { width } = Dimensions.get('window');

export function CustomKeypad({ onPress, onDelete }: CustomKeypadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  return (
    <View className="bg-[#E9EBEE] pt-8 pb-12 rounded-t-[40px] absolute bottom-0 w-full px-4">
      <View className="flex-row flex-wrap justify-center gap-y-4">
        {keys.map((key, index) => {
          if (key === '') {
            return <View key={index} className="w-1/3 h-20 items-center justify-center" />;
          }

          return (
            <TouchableOpacity
              key={index}
              className="w-1/3 h-16 items-center justify-center"
              onPress={() => (key === 'delete' ? onDelete() : onPress(key))}
              activeOpacity={0.6}
            >
              {key === 'delete' ? (
                <Feather name="delete" size={26} color="#1F2C37" />
              ) : (
                <View className="bg-white w-[85%] h-full rounded-xl items-center justify-center shadow-sm">
                   <Text className="text-[#1F2C37] text-3xl font-bold">{key}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
