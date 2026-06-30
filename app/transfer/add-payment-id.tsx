import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TransferService } from '@/services/modules/transfer.service';
import { BeneficiaryService } from '@/services/modules/beneficiary.service';
import { useTheme } from '@/context/ThemeContext';

export default function AddPaymentIDScreen() {
  const { colors } = useTheme();
  const [payID, setPayID] = useState('');
  const [accountName, setAccountName] = useState('');
  const [saveAsBeneficiary, setSaveAsBeneficiary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resolvePayID = async (id: string) => {
    if (id.length < 5) return;
    
    setIsLoading(true);
    try {
      const response = await TransferService.searchPayID(id);
      // Assuming response.data.name or similar based on user prompt "return the user's full name"
      const data = response?.data || response;
      const name = data?.full_name
      
      if (name) {
        setAccountName(name);
      } else {
        setAccountName('Unknown Recipient');
      }
    } catch (error: any) {
      console.error('Failed to resolve PayID:', error);
      setAccountName('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!payID) {
      Alert.alert('Error', 'Please enter a Payment ID');
      return;
    }
    if (!accountName || accountName === 'Unknown Recipient') {
      Alert.alert('Error', 'Please enter or resolve a valid account name');
      return;
    }

    if (saveAsBeneficiary) {
      try {
        setIsLoading(true);
        await BeneficiaryService.createBeneficiary({
          account_name: accountName,
          bank_code: '',
          bank_name: '',
          currency: 'NGN', // Default
          number: payID,
          pay_id: payID,
          type: 'payid',
        });
      } catch (error) {
        console.error('Failed to save beneficiary:', error);
        // We might not want to block navigation if saving fails, but let's notify
        Alert.alert('Notice', 'Could not save beneficiary, but you can still proceed with the transfer.');
      } finally {
        setIsLoading(false);
      }
    }

    // Navigate to amount entry with Payment ID context
    router.push(`/transfer/amount?name=${accountName}&identifier=${payID}&type=payid`);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#F8F9FB] items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>Payment ID</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="mt-8 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold" style={{ color: colors.text }}>Payment ID</Text>
            {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
          <TextInput
            className="w-full h-16 bg-white border rounded-2xl px-5 font-medium" style={{ borderColor: colors.cardBorder, color: colors.text, backgroundColor: colors.surface }}
            placeholder="Enter recipient payment ID"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={payID}
            onChangeText={(text) => {
              setPayID(text);
              if (text.length >= 6) resolvePayID(text);
            }}
          />
        </View>

        {/* Account Name Input */}
        <View className="mb-10">
          <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Account Name</Text>
          <TextInput
            className="w-full h-16 bg-white border rounded-2xl px-5 font-medium" style={{ borderColor: colors.cardBorder, color: colors.text, backgroundColor: colors.surface }}
            placeholder="Enter recipient account name"
            placeholderTextColor={colors.textSecondary}
            value={accountName}
            onChangeText={setAccountName}
            editable={!isLoading}
          />
        </View>

        {/* Save as Beneficiary */}
        <View className="flex-row items-center justify-between mb-20">
          <Text className="text-base font-medium" style={{ color: colors.text }}>Save as beneficiary</Text>
          <Switch
            trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
            thumbColor={'#fff'}
            ios_backgroundColor={colors.switchTrackOff}
            onValueChange={() => setSaveAsBeneficiary(!saveAsBeneficiary)}
            value={saveAsBeneficiary}
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          onPress={handleContinue}
          disabled={isLoading}
          className="py-5 rounded-[28px] shadow-lg shadow-indigo-100 items-center justify-center" style={{ backgroundColor: colors.primary }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center text-lg font-bold">Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
