import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { WithdrawalService, Bank } from "@/services/modules/withdrawal.service";
import { BeneficiaryService } from "@/services/modules/beneficiary.service";
import { Toast } from "@/components/ui/toast";
import { useTheme } from '@/context/ThemeContext';

export default function AddRecipientScreen() {
  const { colors } = useTheme();
  const [accountnumber, setAccountnumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accountName, setAccountName] = useState("");
  const [narration, setNarration] = useState("");
  const [saveAsBeneficiary, setSaveAsBeneficiary] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    const cleanNumber = accountnumber.replace(/\D/g, "");
    if (cleanNumber.length === 10 && selectedBank?.code) {
      resolveAccount(cleanNumber, selectedBank.code);
    } else {
      setAccountName("");
    }
  }, [accountnumber, selectedBank]);

  const fetchBanks = async () => {
    setIsLoadingBanks(true);
    try {
      const data = await WithdrawalService.listBanks();
      const defaultBanks: Bank[] = [
        { name: "First Bank of Nigeria", code: "011" },
        { name: "Zenith Bank", code: "057" },
        { name: "Guaranty Trust Bank", code: "058" },
        { name: "Access Bank", code: "044" },
      ];

      if (Array.isArray(data) && data.length > 0) {
        setBanks(data);
      } else {
        setBanks(defaultBanks);
      }
    } catch (error) {
      console.error("Failed to fetch banks:", error);
      setBanks([
        { name: "First Bank of Nigeria", code: "011" },
        { name: "Zenith Bank", code: "057" },
        { name: "Guaranty Trust Bank", code: "058" },
      ]);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const resolveAccount = async (num: string, bCode: string) => {
    if (num.length !== 10) return;

    setIsResolving(true);
    try {
      const response = await WithdrawalService.resolveAccount({
        accountnumber: num,
        bankcode: bCode,
      });

      const resolvedName =
        response?.data?.accountname ||
        response?.data?.account_name ||
        response?.accountname ||
        response?.account_name ||
        "";

      setAccountName(resolvedName);
    } catch (error) {
      console.error("Failed to resolve account:", error);
      setAccountName("");
      setToast({
        visible: true,
        message: "Unable to resolve account details",
        type: "error",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleContinue = async () => {
    if (!accountnumber || !selectedBank || !accountName) {
      setToast({
        visible: true,
        message: "Please complete all fields",
        type: "error",
      });
      return;
    }

    if (saveAsBeneficiary) {
      try {
        setIsSaving(true);
        await BeneficiaryService.createBeneficiary({
          account_name: accountName,
          bank_code: selectedBank.code,
          bank_name: selectedBank.name,
          currency: "NGN",
          number: accountnumber,
          pay_id: "",
          type: "bank",
        });
      } catch (error) {
        console.error("Failed to save beneficiary:", error);
      } finally {
        setIsSaving(false);
      }
    }

    router.push(
      `/transfer/amount?name=${encodeURIComponent(accountName)}&account=${encodeURIComponent(accountnumber)}&bank=${encodeURIComponent(selectedBank.name)}&bank_code=${encodeURIComponent(selectedBank.code)}&type=bank&narration=${encodeURIComponent(narration)}`,
    );
  };

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );

  return (
    <>
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        />

        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F9FB] items-center justify-center shadow-sm"
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>
            Bank transfer
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="mt-8 mb-6">
            <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
              Account number
            </Text>
            <TextInput
              className="w-full h-16 border rounded-2xl px-5 font-medium" style={{ borderColor: colors.cardBorder, color: colors.text, backgroundColor: colors.surface }}
              placeholder="Enter 10-digit account number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={accountnumber}
              onChangeText={(text) =>
                setAccountnumber(text.replace(/\D/g, "").slice(0, 10))
              }
            />
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
              Bank Name
            </Text>
            <TouchableOpacity
              onPress={() => setShowBankModal(true)}
              className="w-full h-16 border rounded-2xl px-5 flex-row items-center justify-between" style={{ borderColor: colors.cardBorder, backgroundColor: colors.surface }}
            >
              <Text
                className={"font-medium"}
                style={{ color: selectedBank ? colors.text : colors.textSecondary }}
              >
                {selectedBank ? selectedBank.name : "Select Bank name"}
              </Text>
              {isLoadingBanks ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* {selectedBank && (
            <View className="mb-6">
              <Text className="text-[#1F2C37] text-base font-semibold mb-3">
                Bank Code
              </Text>
              <View className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-5 justify-center">
                <Text className="text-[#9DA3B6] font-medium">
                  {selectedBank.code}
                </Text>
              </View>
            </View>
          )} */}

          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                Account Name
              </Text>
              {isResolving && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </View>
            <TextInput
              className="w-full h-16 border rounded-2xl px-5 font-medium" style={{ borderColor: colors.cardBorder, color: colors.text, backgroundColor: colors.chevronBg }}
              placeholder="Resolved account name"
              placeholderTextColor={colors.textSecondary}
              value={accountName}
              editable={false}
            />
          </View>

          <View className="mb-8">
            <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
              Narration
            </Text>
            <TextInput
              className="w-full h-16 border rounded-2xl px-5 font-medium" style={{ borderColor: colors.cardBorder, color: colors.text, backgroundColor: colors.surface }}
              placeholder="Optional"
              placeholderTextColor={colors.textSecondary}
              value={narration}
              onChangeText={setNarration}
            />
          </View>

          <View className="flex-row items-center justify-between mb-12">
            <Text className="text-base font-medium" style={{ color: colors.text }}>
              Save as beneficiary
            </Text>
            <Switch
              trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
              thumbColor="#fff"
              ios_backgroundColor={colors.switchTrackOff}
              onValueChange={() => setSaveAsBeneficiary(!saveAsBeneficiary)}
              value={saveAsBeneficiary}
            />
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            disabled={isSaving}
            className="py-5 rounded-[28px] shadow-lg shadow-indigo-100 items-center justify-center" style={{ backgroundColor: colors.primary }}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-bold">
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={showBankModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}>
          <View className="rounded-t-[48px] px-6 pt-10 pb-10 h-[80%]" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                Select Bank
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowBankModal(false);
                  setBankSearch("");
                }}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-[#F8F9FB] h-14 rounded-2xl px-4 border mb-6" style={{ borderColor: colors.cardBorder }}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                className="flex-1 ml-3 font-medium" style={{ color: colors.text }}
                placeholder="Search bank name"
                placeholderTextColor={colors.textSecondary}
                value={bankSearch}
                onChangeText={setBankSearch}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredBanks.length > 0 ? (
                filteredBanks.map((item, index) => (
                  <TouchableOpacity
                    key={item.code || index.toString()}
                    onPress={() => {
                      setSelectedBank(item);
                      setShowBankModal(false);
                      setBankSearch("");
                    }}
                    className="py-5 border-b flex-row items-center justify-between" style={{ borderColor: colors.cardBorder }}
                  >
                    <View className="flex-1">
                      <Text className="text-lg font-medium" style={{ color: colors.text }}>
                        {item.name}
                      </Text>
                    </View>
                    {selectedBank?.code === item.code && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View className="py-20 items-center">
                  <Text className="text-base" style={{ color: colors.textSecondary }}>
                    No banks available
                  </Text>
                  <TouchableOpacity onPress={fetchBanks} className="mt-4">
                    <Text className="font-bold" style={{ color: colors.primary }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
