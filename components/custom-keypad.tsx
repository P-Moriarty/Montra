import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CustomKeypadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
  hideDecimal?: boolean;
}

const { width } = Dimensions.get('window');

export function CustomKeypad({ onPress, onDelete, hideDecimal }: CustomKeypadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', hideDecimal ? 'empty' : '.', '0', 'delete'];

  return (
    <View className="bg-[#E9EBEE] pt-8 pb-12 rounded-t-[40px] w-full px-4">
      <View className="flex-row flex-wrap justify-center gap-y-4">
        {keys.map((key, index) => {
          if (key === 'empty') {
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
                <View className="bg-white w-[85%] h-full rounded-xl items-center justify-center shadow-sm">
                  <Feather name="delete" size={26} color="#1F2C37" />
                </View>
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
