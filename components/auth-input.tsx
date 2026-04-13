import React from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface AuthInputProps extends TextInputProps {
  icon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
}

export function AuthInput({ icon, rightIcon, onRightIconPress, ...props }: AuthInputProps) {
  return (
    <View className="flex-row items-center bg-white border border-gray-200 h-[64px] rounded-[16px] px-5 mb-4 shadow-sm">
      {icon && (
        <Feather name={icon} size={20} color="#9DA3B6" className="mr-3" />
      )}
      <TextInput
        className="flex-1 text-[#1F2C37] text-base font-medium h-full"
        placeholderTextColor="#9DA3B6"
        {...props}
      />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress}>
          <Feather name={rightIcon} size={20} color="#9DA3B6" />
        </TouchableOpacity>
      )}
    </View>
  );
}
