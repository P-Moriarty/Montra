import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SavingsIndexScreen() {
  const activeGoals = [
    { id: '1', name: 'New iPhone 16 Pro', target: '₦1,200,000', saved: '₦450,000', progress: 37, category: 'gadget', icon: 'phone-portrait-outline', color: '#5154F4' },
    { id: '2', name: 'Summer Vacation', target: '₦5,000,000', saved: '₦3,800,000', progress: 76, category: 'travel', icon: 'airplane-outline', color: '#FF9500' },
  ];

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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Savings Vault</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Total Savings Card */}
        <View className="mt-6">
          <View className="bg-[#5154F4] p-8 rounded-[40px] shadow-2xl shadow-indigo-300 relative overflow-hidden">
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <Text className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">Total Savings</Text>
            <Text className="text-white text-4xl font-extrabold mb-8">₦4,250,000.00</Text>
            
            <View className="flex-row items-center">
              <View className="bg-white/20 px-4 py-2 rounded-2xl border border-white/30">
                <Text className="text-white font-bold text-xs">+12.5% this month</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Row */}
        <View className="flex-row gap-4 mt-8">
           <TouchableOpacity 
             onPress={() => router.push('/savings/create')}
             className="flex-1 bg-white p-6 rounded-[32px] items-center border border-gray-50 shadow-sm"
           >
             <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mb-3">
               <Ionicons name="add" size={24} color="#5154F4" />
             </View>
             <Text className="text-[#1F2C37] font-bold">New Goal</Text>
           </TouchableOpacity>

           <TouchableOpacity className="flex-1 bg-white p-6 rounded-[32px] items-center border border-gray-50 shadow-sm">
             <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mb-3">
               <MaterialCommunityIcons name="auto-fix" size={24} color="#22C55E" />
             </View>
             <Text className="text-[#1F2C37] font-bold">Auto-Save</Text>
           </TouchableOpacity>
        </View>

        {/* Active Goals */}
        <View className="mt-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-[#1F2C37] text-lg font-bold">Active Goals</Text>
            <Text className="text-[#5154F4] font-bold">2 Goals</Text>
          </View>

          {activeGoals.map((goal) => (
            <TouchableOpacity 
              key={goal.id} 
              onPress={() => router.push({
                pathname: '/savings/fund',
                params: { ...goal }
              })}
              className="bg-white p-6 rounded-[40px] mb-4 border border-gray-50 shadow-sm"
            >
              <View className="flex-row items-center mb-6">
                <View className="w-14 h-14 rounded-3xl items-center justify-center mr-4 bg-[#F8F9FB]">
                  <Ionicons name={goal.icon as any} size={28} color={goal.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-[#1F2C37] font-bold text-base mb-1">{goal.name}</Text>
                  <Text className="text-[#9DA3B6] text-xs uppercase font-bold tracking-widest">{goal.category}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[#1F2C37] font-black text-base">{goal.saved}</Text>
                  <Text className="text-[#9DA3B6] text-[10px]">Target: {goal.target}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="w-full h-3 bg-gray-50 rounded-full overflow-hidden mb-2">
                 <View 
                   className="h-full rounded-full" 
                   style={{ width: `${goal.progress}%`, backgroundColor: goal.color }} 
                 />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-[#9DA3B6] text-[10px] font-bold">{goal.progress}% Completed</Text>
                <Text className="text-[#9DA3B6] text-[10px] font-bold">₦750,000 left</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggestion Card */}
        <View className="bg-[#1F2C37] p-8 rounded-[40px] mt-6 flex-row items-center border border-white/10 shadow-xl overflow-hidden">
           <View className="flex-1">
             <Text className="text-white text-lg font-bold mb-2">Start an Emergency Fund</Text>
             <Text className="text-white/60 text-xs leading-5">Secure your future with a dedicated vault for unexpected life events.</Text>
           </View>
           <View className="w-16 h-16 bg-white/10 rounded-full items-center justify-center ml-4">
             <Ionicons name="shield-checkmark" size={32} color="white" />
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
