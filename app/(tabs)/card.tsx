import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CardScreen() {
  const [isFrozen, setIsFrozen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-8">
          <Text className="text-[#1F2C37] text-2xl font-bold">My Cards</Text>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
            <Ionicons name="add" size={24} color="#1F2C37" />
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
            <View className="absolute inset-0 bg-[#5154F4]/50" />
            
            <View className="flex-1 p-8 justify-between">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-white/80 text-xs font-bold mb-1 uppercase tracking-widest">Total Balance</Text>
                  <Text className="text-white text-3xl font-extrabold tracking-tight">$25,400.00</Text>
                </View>
                <View className="px-3 py-1.5 bg-white/20 rounded-xl border border-white/40">
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
                  <Ionicons name="snow" size={20} color="#5154F4" className="mr-2" />
                  <Text className="text-[#5154F4] font-black uppercase tracking-widest text-xs">Frozen</Text>
                </LinearGradient>
              </BlurView>
            )}
          </View>
        </View>

        {/* Premium Card Controls */}
        <View className="flex-row justify-between mt-10">
           {[
             { label: 'Freeze', icon: 'snow', color: '#5154F4', action: () => setIsFrozen(!isFrozen), active: isFrozen },
             { label: 'Details', icon: 'eye-outline', color: '#1F2C37', action: () => setShowDetails(!showDetails), active: showDetails },
             { label: 'Limits', icon: 'options-outline', color: '#1F2C37', action: () => {} },
             { label: 'Security', icon: 'shield-checkmark-outline', color: '#1F2C37', action: () => {} },
           ].map((control, index) => (
             <TouchableOpacity 
               key={index} 
               onPress={control.action}
               className="items-center"
             >
               <View className={`w-16 h-16 rounded-[24px] items-center justify-center shadow-md mb-2 ${control.active ? 'bg-[#5154F4]' : 'bg-white border border-gray-100'}`}>
                  <Ionicons name={control.icon as any} size={26} color={control.active ? 'white' : '#1F2C37'} />
               </View>
               <Text className={`text-[10px] font-black uppercase tracking-tighter ${control.active ? 'text-[#5154F4]' : 'text-[#9DA3B6]'}`}>{control.label}</Text>
             </TouchableOpacity>
           ))}
        </View>

        {/* Engineering Spending Hub */}
        <View className="mt-10">
          <Text className="text-[#1F2C37] text-lg font-bold mb-6">Spending Hub</Text>
          <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex-row items-center">
             {/* Circular Progress (Simplified High-Fidelity) */}
             <View className="relative w-24 h-24 items-center justify-center mr-8">
               <View className="absolute w-full h-full rounded-full border-[10px] border-gray-50" />
               <View className="absolute w-full h-full rounded-full border-[10px] border-[#5154F4] border-t-transparent border-l-transparent rotate-[-45deg]" />
               <View className="items-center">
                 <Text className="text-[#1F2C37] text-lg font-black">24%</Text>
                 <Text className="text-[#9DA3B6] text-[8px] uppercase font-bold">Used</Text>
               </View>
             </View>

             <View className="flex-1">
                <Text className="text-[#6C7278] text-sm font-semibold mb-2 uppercase tracking-widest">Monthly Limit</Text>
                <Text className="text-[#1F2C37] text-3xl font-extrabold mb-2">$5,000</Text>
                <View className="flex-row items-center">
                   <Text className="text-green-500 font-bold text-xs">$3,800 remaining</Text>
                </View>
             </View>
          </View>
        </View>

        {/* Industrial Grade Activity Feed */}
        <View className="mt-10">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-[#1F2C37] text-lg font-bold">Vault Activity</Text>
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-xl">
              <Text className="text-[#5154F4] text-xs font-bold uppercase">All logs</Text>
            </TouchableOpacity>
          </View>

          {[
            { title: 'Cloud Subscription', date: 'Today, 08:30 AM', amount: '-$14.99', icon: 'cloud-outline', status: 'Authorized' },
            { title: 'Food Delivery', date: 'Yesterday, 07:15 PM', amount: '-$42.50', icon: 'restaurant-outline', status: 'Pending' },
          ].map((item, index) => (
            <View key={index} className="bg-white p-5 rounded-[32px] flex-row items-center mb-4 border border-gray-50 shadow-sm">
              <View className="w-14 h-14 bg-[#F8F9FB] rounded-2xl items-center justify-center mr-4">
                <Ionicons name={item.icon as any} size={24} color="#1F2C37" />
              </View>
              <View className="flex-1">
                <Text className="text-[#1F2C37] font-bold text-base mb-1">{item.title}</Text>
                <View className="flex-row items-center">
                  <Text className="text-[#9DA3B6] text-xs">{item.date}</Text>
                  <Text className="text-[#5154F4]/40 text-xs mx-2">|</Text>
                  <Text className="text-[#5154F4] text-[10px] font-bold uppercase">{item.status}</Text>
                </View>
              </View>
              <Text className="text-[#1F2C37] font-black text-base">{item.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
