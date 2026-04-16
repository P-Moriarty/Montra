import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AuthInput } from '@/components/auth-input';

export default function CreateGoalScreen() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const categories = [
    { id: 'vacation', name: 'Vacation', icon: 'airplane-outline', color: '#FF9500' },
    { id: 'education', name: 'Education', icon: 'school-outline', color: '#5154F4' },
    { id: 'gadget', name: 'New Gadget', icon: 'phone-portrait-outline', color: '#34C759' },
    { id: 'home', name: 'Dream Home', icon: 'home-outline', color: '#FF3B30' },
    { id: 'wedding', name: 'Wedding', icon: 'heart-outline', color: '#FF2D55' },
    { id: 'emergency', name: 'Emergency', icon: 'shield-checkmark-outline', color: '#1F2C37' },
  ];

  const handleNext = () => {
    if (step === 1 && !selectedCategory) return;
    if (step === 2 && (!goalName || !targetAmount)) return;
    
    if (step === 1) setStep(2);
    else {
      // Logic for saving goal
      alert("Savings goal created successfully!");
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => step === 1 ? router.back() : setStep(1)}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">New Savings Goal</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-8 mb-10">
          <Text className="text-[#1F2C37] text-3xl font-extrabold mb-3">
            {step === 1 ? "What are you saving for?" : "Set your target"}
          </Text>
          <Text className="text-[#9DA3B6] text-base leading-6">
            {step === 1 ? "Pick a category that best describes your goal." : "Tell us how much you need and give it a name."}
          </Text>
        </View>

        {step === 1 ? (
          /* Step 1: Category Selection */
          <View className="flex-row flex-wrap justify-between">
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={`w-[48%] p-6 rounded-[32px] items-center mb-4 border border-white shadow-sm ${selectedCategory === cat.id ? 'bg-[#5154F4] border-[#5154F4]' : 'bg-white'}`}
              >
                <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-4 ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-indigo-50'}`}>
                  <Ionicons name={cat.icon as any} size={28} color={selectedCategory === cat.id ? 'white' : '#5154F4'} />
                </View>
                <Text className={`font-bold text-sm ${selectedCategory === cat.id ? 'text-white' : 'text-[#1F2C37]'}`}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Step 2: Goal Details */
          <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50">
            <Text className="text-[#1F2C37] font-bold mb-4">Goal Name</Text>
            <AuthInput 
              icon="edit-3" 
              placeholder="e.g. My New Laptop" 
              value={goalName}
              onChangeText={setGoalName}
            />
            
            <View className="h-6" />

            <Text className="text-[#1F2C37] font-bold mb-4">Target Amount</Text>
            <AuthInput 
              icon="dollar-sign" 
              placeholder="e.g. 500,000" 
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />

            <View className="h-6" />
            
            <Text className="text-[#1F2C37] font-bold mb-4">Target Date</Text>
            <TouchableOpacity className="bg-gray-50 p-5 rounded-2xl flex-row items-center justify-between border border-gray-100">
               <Text className="text-[#1F2C37] font-medium">Dec 25, 2025</Text>
               <Feather name="calendar" size={20} color="#9DA3B6" />
            </TouchableOpacity>
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity 
          onPress={handleNext}
          className="bg-[#5154F4] mt-12 py-5 rounded-[28px] shadow-lg shadow-indigo-100"
        >
          <Text className="text-white text-center text-lg font-bold">
            {step === 1 ? "Next" : "Create Goal"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
