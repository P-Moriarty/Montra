import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { AuthInput } from "@/components/auth-input";
import { useApiQuery } from "@/hooks/api/use-api";
import { VasService } from "@/services/modules/vas.service";
import { providerLogos } from "@/constants/providerLogos";
import { Image } from "expo-image";
import { useTheme } from '@/context/ThemeContext';

export default function BillFormScreen() {
  const { colors } = useTheme();
  const { type, name } = useLocalSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planSearch, setPlanSearch] = useState("");
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const isData = type === "data";
  const isCable = type === "cable";
  const isElectricity = type === "electricity";
  const isAirtime = type === "airtime";

  const providers =
    {
      airtime: [
        { name: "MTN", id: "mtn", icon: providerLogos.mtn },
        { name: "Airtel", id: "airtel", icon: providerLogos.airtel },
        { name: "Glo", id: "glo", icon: providerLogos.glo },
        { name: "9Mobile", id: "9mobile", icon: providerLogos["9mobile"] },
      ],
      electricity: [
        { name: "EKEDC", id: "eko-electric", icon: providerLogos["eko-electric"] },
        { name: "IKEDC", id: "ikeja-electric", icon: providerLogos["ikeja-electric"] },
        { name: "AEDC", id: "abuja-electric", icon: providerLogos["abuja-electric"] },
        { name: "KEDCO", id: "kano-electric", icon: providerLogos["kano-electric"] },
        { name: "PHED", id: "port-harcourt-electric", icon: providerLogos["port-harcourt-electric"] },
        { name: "JED", id: "jos-electric", icon: providerLogos["jos-electric"] },
        { name: "IBEDC", id: "ibadan-electric", icon: providerLogos["ibadan-electric"] },
        { name: "KAEDCO", id: "kaduna-electric", icon: providerLogos["kaduna-electric"] },
        { name: "EEDC", id: "enugu-electric", icon: providerLogos["enugu-electric"] },
        { name: "BEDC", id: "benin-electric", icon: providerLogos["benin-electric"] },
        { name: "ABA", id: "aba-electric", icon: providerLogos["aba-electric"] },
        { name: "YEDC", id: "yola-electric", icon: providerLogos["yola-electric"] },
      ],
      cable: [
        { name: "DSTV", id: "dstv", icon: providerLogos.dstv },
        { name: "GOTV", id: "gotv", icon: providerLogos.gotv },
        { name: "Startimes", id: "startimes", icon: providerLogos.startimes },
        { name: "Showmax", icon: providerLogos.showmax, id: "showmax" },
      ],
      data: [
        { name: "MTN Data", id: "mtn-data", icon: providerLogos["mtn-data"] },
        { name: "Airtel Data", id: "airtel-data", icon: providerLogos["airtel-data"] },
        { name: "Glo Data", id: "glo-data", icon: providerLogos["glo-data"] },
        { name: "9Mobile Data", id: "9mobile-data", icon: providerLogos["9mobile-data"] },
      ],
      internet: [
        { name: "Smile", id: "smile-direct", icon: providerLogos["smile-direct"] },
        { name: "Spectranet", id: "spectranet", icon: providerLogos.spectranet },
      ],
    }[type as string] || [];

  const {
    data: variations,
    isLoading: isLoadingVariations,
    error: errorVariations,
  } = useApiQuery(
    ["vasVariations", type, selectedProvider?.id],
    () => {
      if (isData && selectedProvider) {
        // Strip -data suffix if it exists for the network parameter
        const network = selectedProvider.id.replace("-data", "");
        return VasService.getDataVariations(network, selectedProvider.id);
      }
      if (isCable && selectedProvider)
        return VasService.getCableVariations(selectedProvider.id);
      return Promise.resolve({ data: { variations: [] } });
    },
    { enabled: !!selectedProvider && (isData || isCable) },
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
      p.name.toLowerCase().includes(planSearch.toLowerCase()),
    );
  }, [plans, planSearch]);

  const labels =
    {
      airtime: "Phone Number",
      electricity: "Meter Number",
      cable: "Smart Card Number",
      data: "Phone Number",
      internet: "Customer ID",
      water: "Customer ID",
    }[type as string] || "Account ID";

  // Automatic Verification Effect
  React.useEffect(() => {
    const verify = async () => {
      if (
        (isElectricity || isCable) &&
        selectedProvider &&
        identifier.length >= 10
      ) {
        setIsVerifying(true);
        setVerificationResult(null);
        try {
          let res;
          if (isElectricity) {
            res = await VasService.verifyDiscoNumber({
              disco: selectedProvider.id,
              number: identifier,
              type: "prepaid",
            });
          } else {
            res = await VasService.verifyCableNumber({
              cable_type: selectedProvider.id,
              number: identifier,
            });
          }
          setVerificationResult(res.data || res);
        } catch (err) {
          console.error("Verification failed", err);
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
      pathname: "/pay-bills/amount",
      params: {
        type,
        name,
        provider: selectedProvider.name,
        providerId: selectedProvider.id,
        identifier,
        planCode: selectedPlan?.variation_code || selectedPlan?.code,
        planName: selectedPlan?.name,
        fixedAmount: selectedPlan?.variation_amount || selectedPlan?.amount,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>
            {name}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-base font-medium mt-6 mb-8" style={{ color: colors.textTertiary }}>
            Select your provider and enter your {"\n"}
            {labels} to continue.
          </Text>

          {/* Sandbox Test Tips (Only for development) */}
          <View className="p-4 rounded-2xl mb-8 border border-amber-100" style={{ backgroundColor: colors.warningLight }}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={18} color="#D97706" />
              <Text className="text-[#D97706] font-bold ml-2 text-xs uppercase tracking-widest">
                Sandbox Test Numbers
              </Text>
            </View>
            <Text className="text-[#92400E] text-[11px] leading-4">
              • Success: <Text className="font-bold">1212121212</Text> {"\n"}•
              Pending: <Text className="font-bold">201000000000</Text> {"\n"}•
              Failure: Any other number
            </Text>
          </View>

          {/* Provider Selection */}
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            Select Provider
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-10">
            {providers.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  setSelectedProvider(p);
                  setSelectedPlan(null);
                }}
                className={`px-6 py-4 rounded-3xl border items-center flex-row shadow-sm`}
                style={{
                  backgroundColor: selectedProvider?.id === p.id ? colors.primary : colors.surface,
                  borderColor: selectedProvider?.id === p.id ? colors.primary : colors.cardBorder
                }}
              >
                <Image
                  source={providerLogos[p.id as keyof typeof providerLogos]}
                  style={{
                    width: 30,
                    height: 30,
                    marginRight: 8,
                  }}
                  resizeMode="contain"
                />

                <Text
                  className={`font-bold`}
                  style={{ color: selectedProvider?.id === p.id ? '#FFFFFF' : colors.text }}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Identifier Input */}
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            {labels}
          </Text>
          <View className="rounded-[32px] p-2 border shadow-sm mb-4" style={{ backgroundColor: colors.surface, borderColor: colors.surface }}>
            <AuthInput
              icon={
                type === "airtime" || type === "data" ? "phone" : "credit-card"
              }
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
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text className="text-xs font-bold ml-2" style={{ color: colors.primary }}>
                    Verifying account...
                  </Text>
                </>
              ) : verificationResult?.Customer_Name ? (
                <View className="px-3 py-2 rounded-xl flex-row items-center flex-1 border border-green-100" style={{ backgroundColor: colors.successLight }}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.green} />
                  <Text className="text-xs font-bold ml-2 flex-1" style={{ color: colors.green }}>
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
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  Select Plan
                </Text>
                {plans.length > 5 && (
                  <TouchableOpacity
                    onPress={() => setShowAllPlans(!showAllPlans)}
                  >
                    <Text className="font-bold text-xs" style={{ color: colors.primary }}>
                      {showAllPlans
                        ? "Show Less"
                        : `View All (${plans.length})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Plan Search */}
              <View className="rounded-2xl px-4 py-1 border shadow-sm mb-4 flex-row items-center" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}>
                <Ionicons name="search" size={18} color={colors.textSecondary} />
                <TextInput
                  className="flex-1 ml-2 py-3 font-medium" style={{ color: colors.text }}
                  placeholder="Search for a plan..."
                  placeholderTextColor={colors.textSecondary}
                  value={planSearch}
                  onChangeText={setPlanSearch}
                />
              </View>

              {isLoadingVariations ? (
                <ActivityIndicator color={colors.primary} className="mb-10" />
              ) : errorVariations ? (
                <Text className="text-red-500 text-sm italic mb-10 text-center">
                  Error:{" "}
                  {(errorVariations as any).response?.data?.message ||
                    (errorVariations as any).message ||
                    "Failed to fetch plans"}
                </Text>
              ) : filteredPlans.length > 0 ? (
                <View className="mb-10">
                  {(showAllPlans || planSearch
                    ? filteredPlans
                    : filteredPlans.slice(0, 5)
                  ).map((plan: any) => (
                    <TouchableOpacity
                      key={plan.variation_code || plan.code}
                      onPress={() => setSelectedPlan(plan)}
                      className={`p-4 rounded-2xl border mb-3 flex-row justify-between items-center shadow-sm`}
                      style={{
                        backgroundColor: selectedPlan?.code === plan.code ? `${colors.primary}0D` : colors.surface,
                        borderColor: selectedPlan?.code === plan.code ? colors.primary : colors.cardBorder
                      }}
                    >
                      <View className="flex-1 pr-4">
                        <Text
                          className={`font-bold text-sm`}
                          style={{ color: selectedPlan?.code === plan.code ? colors.primary : colors.text }}
                        >
                          {plan.name}
                        </Text>
                      </View>
                      <Text className="font-bold text-base" style={{ color: colors.text }}>
                        ₦{Number(plan.amount).toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text className="text-sm italic mb-10 text-center" style={{ color: colors.textSecondary }}>
                  No plans match your search
                </Text>
              )}
            </>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            className="mb-12 py-5 rounded-[28px] shadow-lg shadow-indigo-100" style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white text-center text-lg font-bold">
              {isAirtime ? "Top Up Airtime" : isData ? "Buy Data" : "Continue"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
