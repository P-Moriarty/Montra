import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { AuthInput } from '@/components/auth-input';
import { useApiQuery } from '@/hooks/api/use-api';
import { VasService } from '@/services/modules/vas.service';

export default function BillFormScreen() {
  const { type, name } = useLocalSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planSearch, setPlanSearch] = useState('');
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const isData = type === 'data';
  const isCable = type === 'cable';
  const isElectricity = type === 'electricity';
  const isAirtime = type === 'airtime';

  const providers = {
    airtime: [{ name: 'MTN', id: 'mtn', icon: 'flare' }, { name: 'Airtel', id: 'airtel', icon: 'circle' }, { name: 'Glo', id: 'glo', icon: 'leaf' }, { name: '9Mobile', id: '9mobile', icon: 'grid' }],
    electricity: [{ name: 'EKEDC', id: 'eko-electric', icon: 'flash' }, { name: 'IKEDC', id: 'ikeja-electric', icon: 'flash' }, { name: 'AEDC', id: 'abuja-electric', icon: 'flash' }, { name: 'KEDCO', id: 'kano-electric', icon: 'flash' }],
    cable: [{ name: 'DSTV', id: 'dstv', icon: 'television-box' }, { name: 'GOTV', id: 'gotv', icon: 'television-box' }, { name: 'Startimes', id: 'startimes', icon: 'television-box' }, { name: 'Showmax', icon: 'play-circle', id: 'showmax' }],
    data: [{ name: 'MTN Data', id: 'mtn-data', icon: 'wifi' }, { name: 'Airtel Data', id: 'airtel-data', icon: 'wifi' }, { name: 'Glo Data', id: 'glo-data', icon: 'wifi' }, { name: '9Mobile Data', id: '9mobile-data', icon: 'wifi' }],
    internet: [{ name: 'Smile', id: 'smile-direct', icon: 'wifi' }, { name: 'Spectranet', id: 'spectranet', icon: 'wifi' }],
  }[type as string] || [];

  const { data: variations, isLoading: isLoadingVariations, error: errorVariations } = useApiQuery(
    ['vasVariations', type, selectedProvider?.id],
    () => {
      if (isData && selectedProvider) {
        // Strip -data suffix if it exists for the network parameter
        const network = selectedProvider.id.replace('-data', '');
        return VasService.getDataVariations(network, selectedProvider.id);
      }
      if (isCable && selectedProvider) return VasService.getCableVariations(selectedProvider.id);
      return Promise.resolve({ data: { variations: [] } });
    },
    { enabled: !!selectedProvider && (isData || isCable) }
  );

  const plans = useMemo(() => {
    if (!variations) return [];
    const data = variations.data || variations;
    
    // If the response is keyed by provider ID (e.g., variations.dstv)
    if (selectedProvider && data[selectedProvider.id]) {
      return data[selectedProvider.id];
    }
    
    const content = data.content || data;
    return content.variations || (Array.isArray(data) ? data : []);
  }, [variations, selectedProvider]);

  const filteredPlans = useMemo(() => {
    if (!planSearch) return plans;
    return plans.filter((p: any) => 
      p.name.toLowerCase().includes(planSearch.toLowerCase())
    );
  }, [plans, planSearch]);

  const labels = {
    airtime: 'Phone Number',
    electricity: 'Meter Number',
    cable: 'Smart Card Number',
    data: 'Phone Number',
    internet: 'Customer ID',
    water: 'Customer ID'
  }[type as string] || 'Account ID';

  // Automatic Verification Effect
  React.useEffect(() => {
    const verify = async () => {
      if ((isElectricity || isCable) && selectedProvider && identifier.length >= 10) {
        setIsVerifying(true);
        setVerificationResult(null);
        try {
          let res;
          if (isElectricity) {
            res = await VasService.verifyDiscoNumber({
              disco: selectedProvider.id,
              number: identifier,
              type: 'prepaid'
            });
          } else {
            res = await VasService.verifyCableNumber({
              cable_type: selectedProvider.id,
              number: identifier
            });
          }
          setVerificationResult(res.data || res);
        } catch (err) {
          console.error('Verification failed', err);
        } finally {
          setIsVerifying(false);
        }
      }
    };
    const timer = setTimeout(verify, 1000);
    return () => clearTimeout(timer);
  }, [identifier, selectedProvider, isElectricity, isCable]);

  const handleContinue = () => {
    if (!identifier || !selectedProvider) {
      alert("Please fill all fields");
      return;
    }
    if ((isData || isCable) && !selectedPlan) {
      alert("Please select a plan");
      return;
    }
    router.push({
      pathname: '/pay-bills/amount',
      params: { 
        type, 
        name, 
        provider: selectedProvider.name, 
        providerId: selectedProvider.id,
        identifier,
        planCode: selectedPlan?.variation_code || selectedPlan?.code,
        planName: selectedPlan?.name,
        fixedAmount: selectedPlan?.variation_amount || selectedPlan?.amount
      }
    });
  };

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
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">{name}</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[#6C7278] text-base font-medium mt-6 mb-8">
          Select your provider and enter your {"\n"}{labels} to continue.
        </Text>

        {/* Sandbox Test Tips (Only for development) */}
        <View className="bg-amber-50 p-4 rounded-2xl mb-8 border border-amber-100">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={18} color="#D97706" />
            <Text className="text-[#D97706] font-bold ml-2 text-xs uppercase tracking-widest">Sandbox Test Numbers</Text>
          </View>
          <Text className="text-[#92400E] text-[11px] leading-4">
            • Success: <Text className="font-bold">1212121212</Text> {"\n"}
            • Pending: <Text className="font-bold">201000000000</Text> {"\n"}
            • Failure: Any other number
          </Text>
        </View>

        {/* Provider Selection */}
        <Text className="text-[#1F2C37] text-lg font-bold mb-4">Select Provider</Text>
        <View className="flex-row flex-wrap gap-3 mb-10">
          {providers.map((p) => (
            <TouchableOpacity 
              key={p.id}
              onPress={() => {
                setSelectedProvider(p);
                setSelectedPlan(null); // Reset plan when provider changes
              }}
              className={`px-6 py-4 rounded-3xl border ${selectedProvider?.id === p.id ? 'bg-[#5154F4] border-[#5154F4]' : 'bg-white border-gray-100'} items-center flex-row shadow-sm`}
            >
              <MaterialCommunityIcons name={p.icon as any} size={20} color={selectedProvider?.id === p.id ? 'white' : '#5154F4'} className="mr-2" />
              <Text className={`font-bold ${selectedProvider?.id === p.id ? 'text-white' : 'text-[#1F2C37]'}`}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Identifier Input */}
        <Text className="text-[#1F2C37] text-lg font-bold mb-4">{labels}</Text>
        <View className="bg-white rounded-[32px] p-2 border border-white shadow-sm mb-4">
          <AuthInput 
            icon={type === 'airtime' || type === 'data' ? 'phone' : 'credit-card'} 
            placeholder={`Enter ${labels.toLowerCase()}`}
            keyboardType="numeric"
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              setVerificationResult(null); // Reset verification when text changes
            }}
          />
        </View>

        {/* Verification Status */}
        {(isVerifying || verificationResult) && (
          <View className="flex-row items-center px-4 mb-10">
            {isVerifying ? (
              <>
                <ActivityIndicator size="small" color="#5154F4" />
                <Text className="text-[#5154F4] text-xs font-bold ml-2">Verifying account...</Text>
              </>
            ) : verificationResult?.Customer_Name ? (
              <View className="bg-green-50 px-3 py-2 rounded-xl flex-row items-center flex-1 border border-green-100">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text className="text-[#10B981] text-xs font-bold ml-2 flex-1">
                  Verified: {verificationResult.Customer_Name}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Plan Selection (for Data and Cable) */}
        {(isData || isCable) && selectedProvider && (
          <>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[#1F2C37] text-lg font-bold">Select Plan</Text>
              {plans.length > 5 && (
                <TouchableOpacity onPress={() => setShowAllPlans(!showAllPlans)}>
                  <Text className="text-[#5154F4] font-bold text-xs">{showAllPlans ? 'Show Less' : `View All (${plans.length})`}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Plan Search */}
            <View className="bg-white rounded-2xl px-4 py-1 border border-gray-100 shadow-sm mb-4 flex-row items-center">
              <Ionicons name="search" size={18} color="#9DA3B6" />
              <TextInput 
                className="flex-1 ml-2 py-3 text-[#1F2C37] font-medium"
                placeholder="Search for a plan..."
                placeholderTextColor="#9DA3B6"
                value={planSearch}
                onChangeText={setPlanSearch}
              />
            </View>

            {isLoadingVariations ? (
              <ActivityIndicator color="#5154F4" className="mb-10" />
            ) : errorVariations ? (
              <Text className="text-red-500 text-sm italic mb-10 text-center">
                Error: {(errorVariations as any).response?.data?.message || (errorVariations as any).message || 'Failed to fetch plans'}
              </Text>
            ) : filteredPlans.length > 0 ? (
              <View className="mb-10">
                {(showAllPlans || planSearch ? filteredPlans : filteredPlans.slice(0, 5)).map((plan: any) => (
                  <TouchableOpacity 
                    key={plan.variation_code || plan.code}
                    onPress={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-2xl border mb-3 flex-row justify-between items-center ${selectedPlan?.code === plan.code ? 'bg-[#5154F4]/5 border-[#5154F4]' : 'bg-white border-gray-100'} shadow-sm`}
                  >
                    <View className="flex-1 pr-4">
                      <Text className={`font-bold text-sm ${selectedPlan?.code === plan.code ? 'text-[#5154F4]' : 'text-[#1F2C37]'}`}>
                        {plan.name}
                      </Text>
                    </View>
                    <Text className="text-[#1F2C37] font-bold text-base">
                      ₦{Number(plan.amount).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text className="text-[#9DA3B6] text-sm italic mb-10 text-center">No plans match your search</Text>
            )}
          </>
        )}

        {/* Continue Button */}
        <TouchableOpacity 
          onPress={handleContinue}
          className="bg-[#5154F4] mb-12 py-5 rounded-[28px] shadow-lg shadow-indigo-100"
        >
          <Text className="text-white text-center text-lg font-bold">
            {isAirtime ? 'Top Up Airtime' : isData ? 'Buy Data' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
