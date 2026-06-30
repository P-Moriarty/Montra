import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function CardScreen() {
  const { colors } = useTheme();
  const [isFrozen, setIsFrozen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-8">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>My Cards</Text>
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Virtual Card: Glassmorphism Edition */}
        <View className="relative overflow-hidden shadow-2xl shadow-indigo-200 rounded-[32px]">
          <View className="w-full aspect-[1.6/1] overflow-hidden rounded-[32px]">
            {/* Base Texture */}
            <Image 
              source={require('@/assets/images/card-bg.png')} 
              className="absolute inset-0 w-full h-full"
              resizeMode="cover"
            />
            
            {/* Glass Layers */}
            <View className="absolute inset-0" style={{ backgroundColor: colors.primary, opacity: 0.5 }} />
            
            <View className="flex-1 p-8 justify-between">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-white/80 text-xs font-bold mb-1 uppercase tracking-widest">Total Balance</Text>
                  <Text className="text-white text-3xl font-extrabold tracking-tight">$25,400.00</Text>
                </View>
                <View className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: colors.border }}>
                  <Text className="text-white text-xs font-black italic">VISA</Text>
                </View>
              </View>

              <View>
                <Text className="text-white text-xl font-medium tracking-[6px] mb-6">
                  {showDetails ? '4532 1290 8831 0042' : '•••• •••• •••• 0042'}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white/60 text-[9px] font-bold uppercase tracking-widest">Card Holder</Text>
                    <Text className="text-white text-sm font-bold uppercase">Ifeanyi Montra</Text>
                  </View>
                  <View>
                    <Text className="text-white/60 text-[9px] font-bold uppercase tracking-widest text-right">Expires</Text>
                    <Text className="text-white text-sm font-bold">12/28</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Frost Overlay for Frozen State */}
            {isFrozen && (
              <BlurView
                intensity={80}
                tint="light"
                className="absolute inset-0 items-center justify-center"
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
                  className="px-8 py-3 rounded-full border border-white/50 flex-row items-center"
                >
                  <Ionicons name="snow" size={20} color={colors.primary} className="mr-2" />
                  <Text className="font-black uppercase tracking-widest text-xs" style={{ color: colors.primary }}>Frozen</Text>
                </LinearGradient>
              </BlurView>
            )}
          </View>
        </View>

        {/* Premium Card Controls */}
        <View className="flex-row justify-between mt-10">
           {[
              { label: 'Freeze', icon: 'snow', color: colors.primary, action: () => setIsFrozen(!isFrozen), active: isFrozen },
              { label: 'Details', icon: 'eye-outline', color: colors.text, action: () => setShowDetails(!showDetails), active: showDetails },
              { label: 'Limits', icon: 'options-outline', color: colors.text, action: () => {} },
              { label: 'Security', icon: 'shield-checkmark-outline', color: colors.text, action: () => {} },
           ].map((control, index) => (
             <TouchableOpacity 
               key={index} 
               onPress={control.action}
               className="items-center"
             >
                <View className="w-16 h-16 rounded-[24px] items-center justify-center shadow-md mb-2" style={{ backgroundColor: control.active ? colors.primary : colors.surface, borderColor: control.active ? undefined : colors.cardBorder }}>
                   <Ionicons name={control.icon as any} size={26} color={control.active ? 'white' : colors.text} />
                </View>
                <Text className="text-[10px] font-black uppercase tracking-tighter" style={{ color: control.active ? colors.primary : colors.textSecondary }}>{control.label}</Text>
             </TouchableOpacity>
           ))}
        </View>

        {/* Engineering Spending Hub */}
        <View className="mt-10">
          <Text className="text-lg font-bold mb-6" style={{ color: colors.text }}>Spending Hub</Text>
          <View className="p-8 rounded-[40px] shadow-sm flex-row items-center" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
             {/* Circular Progress (Simplified High-Fidelity) */}
             <View className="relative w-24 h-24 items-center justify-center mr-8">
                <View className="absolute w-full h-full rounded-full border-[10px]" style={{ borderColor: colors.chevronBg }} />
                <View className="absolute w-full h-full rounded-full border-[10px] border-t-transparent border-l-transparent rotate-[-45deg]" style={{ borderColor: colors.primary }} />
               <View className="items-center">
                  <Text className="text-lg font-black" style={{ color: colors.text }}>24%</Text>
                  <Text className="text-[8px] uppercase font-bold" style={{ color: colors.textSecondary }}>Used</Text>
               </View>
             </View>

             <View className="flex-1">
                 <Text className="text-sm font-semibold mb-2 uppercase tracking-widest" style={{ color: colors.textTertiary }}>Monthly Limit</Text>
                 <Text className="text-3xl font-extrabold mb-2" style={{ color: colors.text }}>$5,000</Text>
                 <View className="flex-row items-center">
                    <Text className="font-bold text-xs" style={{ color: colors.success }}>$3,800 remaining</Text>
                </View>
             </View>
          </View>
        </View>

        {/* Industrial Grade Activity Feed */}
        <View className="mt-10">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>Vault Activity</Text>
            <TouchableOpacity className="px-4 py-2 rounded-xl" style={{ backgroundColor: colors.chevronBg }}>
              <Text className="text-xs font-bold uppercase" style={{ color: colors.primary }}>All logs</Text>
            </TouchableOpacity>
          </View>

          {[
            { title: 'Cloud Subscription', date: 'Today, 08:30 AM', amount: '-$14.99', icon: 'cloud-outline', status: 'Authorized' },
            { title: 'Food Delivery', date: 'Yesterday, 07:15 PM', amount: '-$42.50', icon: 'restaurant-outline', status: 'Pending' },
          ].map((item, index) => (
            <View key={index} className="p-5 rounded-[32px] flex-row items-center mb-4 shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
              <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: colors.chevronBg }}>
                <Ionicons name={item.icon as any} size={24} color={colors.text} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-base mb-1" style={{ color: colors.text }}>{item.title}</Text>
                <View className="flex-row items-center">
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>{item.date}</Text>
                  <Text className="text-xs mx-2" style={{ color: colors.primary, opacity: 0.4 }}>|</Text>
                  <Text className="text-[10px] font-bold uppercase" style={{ color: colors.primary }}>{item.status}</Text>
                </View>
              </View>
              <Text className="font-black text-base" style={{ color: colors.text }}>{item.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
