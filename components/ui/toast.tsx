import React, { useEffect } from 'react';
import { Animated, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  visible: boolean;
}

/**
 * High-Fidelity Cockpit Toast
 * Industrial-grade notification module featuring smooth animations and clear status feedback.
 */
export function Toast({ message, type = 'success', onClose, visible }: ToastProps) {
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 20,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();

      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }] },
        type === 'error' ? styles.errorBg : styles.successBg
      ]}
    >
      <View className="flex-row items-center px-4 py-10">
        <Feather 
          name={type === 'error' ? 'alert-circle' : 'check-circle'} 
          size={20} 
          color="white" 
        />
        <Text className="text-white text-sm font-bold flex-1 ml-3" numberOfLines={2}>
          {String(message)}
        </Text>
        <TouchableOpacity onPress={handleClose} className="ml-2">
          <Feather name="x" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  successBg: {
    backgroundColor: '#10B981',
  },
  errorBg: {
    backgroundColor: '#EF4444',
  }
});
