import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

        {/* Virtual Card Visualization */}
        <View className="relative overflow-hidden">
          <View className={`w-full aspect-[1.6/1] bg-[#5154F4] rounded-[32px] p-6 shadow-xl shadow-indigo-200 ${isFrozen ? 'opacity-60' : ''}`}>
             
            {/* Card Content */}
            <View className="flex-1 justify-between">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-white/60 text-xs font-medium mb-1">Total Balance</Text>
                  <Text className="text-white text-2xl font-bold">$25,400.00</Text>
                </View>
                <View className="w-12 h-8 bg-white/20 rounded-md items-center justify-center border border-white/30">
                  <Text className="text-white text-[10px] font-extrabold italic">VISA</Text>
                </View>
              </View>

              <View>
                <Text className="text-white text-lg font-bold tracking-[4px] mb-4">
                  {showDetails ? '4532 1290 8831 0042' : '**** **** **** 0042'}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white/60 text-[10px] font-medium uppercase">Card Holder</Text>
                    <Text className="text-white text-sm font-bold">Ifeanyi Montra</Text>
                  </View>
                  <View>
                    <Text className="text-white/60 text-[10px] font-medium uppercase text-right">Expires</Text>
                    <Text className="text-white text-sm font-bold">12/28</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Frost Overlay if Frozen */}
            {isFrozen && (
               <View className="absolute inset-0 bg-white/10 items-center justify-center">
                  <View className="bg-white/90 px-4 py-2 rounded-full shadow-sm">
                    <Text className="text-[#5154F4] font-bold">Frozen</Text>
                  </View>
               </View>
            )}
          </View>
        </View>

        {/* Card Controls */}
        <View className="flex-row justify-between mt-8">
           {[
             { label: 'Freeze', icon: 'snow', color: '#5154F4', action: () => setIsFrozen(!isFrozen), active: isFrozen },
             { label: 'Details', icon: 'eye-outline', color: '#1F2C37', action: () => setShowDetails(!showDetails), active: showDetails },
             { label: 'Limits', icon: 'options-outline', color: '#1F2C37', action: () => {} },
             { label: 'Reset', icon: 'refresh-outline', color: '#1F2C37', action: () => {} },
           ].map((control, index) => (
             <TouchableOpacity 
               key={index} 
               onPress={control.action}
               className="items-center"
             >
               <View className={`w-14 h-14 rounded-full items-center justify-center shadow-sm mb-2 ${control.active ? 'bg-[#5154F4]' : 'bg-white'}`}>
                  <Ionicons name={control.icon as any} size={24} color={control.active ? 'white' : '#1F2C37'} />
               </View>
               <Text className={`text-xs font-bold ${control.active ? 'text-[#5154F4]' : 'text-[#6C7278]'}`}>{control.label}</Text>
             </TouchableOpacity>
           ))}
        </View>

        {/* Spending limit */}
        <View className="bg-white p-6 rounded-3xl mt-8 shadow-sm border border-gray-50">
           <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[#1F2C37] text-lg font-bold">Monthly Spending</Text>
              <Text className="text-[#5154F4] font-bold">$1,200 / $5,000</Text>
           </View>
           {/* Progress Bar Container */}
           <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <View className="w-[24%] h-full bg-[#5154F4] rounded-full" />
           </View>
           <Text className="text-[#6C7278] text-xs mt-3">You have used 24% of your monthly limit.</Text>
        </View>

        {/* Card Activity */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#1F2C37] text-lg font-bold">Card Activity</Text>
            <TouchableOpacity>
              <Text className="text-[#5154F4] font-bold">View All</Text>
            </TouchableOpacity>
          </View>

          {/* Activity List */}
          {[
            { title: 'Cloud Subscription', date: 'Today, 08:30 AM', amount: '-$14.99', icon: 'cloud-outline' },
            { title: 'Food Delivery', date: 'Yesterday, 07:15 PM', amount: '-$42.50', icon: 'restaurant-outline' },
          ].map((item, index) => (
            <View key={index} className="bg-white p-4 rounded-3xl flex-row items-center mb-3">
              <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mr-4">
                <Ionicons name={item.icon as any} size={20} color="#1F2C37" />
              </View>
              <View className="flex-1">
                <Text className="text-[#1F2C37] font-bold text-base mb-1">{item.title}</Text>
                <Text className="text-[#9DA3B6] text-xs">{item.date}</Text>
              </View>
              <Text className="text-[#1F2C37] font-bold text-base">{item.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
