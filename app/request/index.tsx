import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TransferService } from "@/services/modules/transfer.service";
import { useTheme } from '@/context/ThemeContext';

export default function RequestMoneyScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<"request" | "pending">("request");
  const [payID, setPayID] = useState("");
  const [accountName, setAccountName] = useState("");
  const [narration, setNarration] = useState("");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
    }, []),
  );

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await TransferService.getRequests();
      // Ensure the response data is an array
      let requestsData = [];
      if (Array.isArray(response)) {
        requestsData = response;
      } else if (response && Array.isArray(response.data)) {
        requestsData = response.data;
      } else if (
        response &&
        response.data &&
        Array.isArray(response.data.requests)
      ) {
        requestsData = response.data.requests;
      } else if (response && Array.isArray(response.requests)) {
        requestsData = response.requests;
      }

      console.log(
        "Parsed Requests Data:",
        JSON.stringify(requestsData, null, 2),
      );
      console.log("Raw API Response:", JSON.stringify(response, null, 2));
      setPendingRequests(requestsData);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resolvePayID = async (id: string) => {
    if (id.length < 5) return;

    setIsResolving(true);
    try {
      const response = await TransferService.searchPayID(id);
      const data = response?.data || response;
      const name = data?.full_name;

      if (name) {
        setAccountName(name);
      } else {
        setAccountName("Unknown Recipient");
      }
    } catch (error: any) {
      console.error("Failed to resolve PayID:", error);
      setAccountName("");
    } finally {
      setIsResolving(false);
    }
  };

  const handleContinue = () => {
    if (!payID) {
      Alert.alert("Error", "Please enter a Payment ID");
      return;
    }
    if (!accountName || accountName === "Unknown Recipient") {
      Alert.alert("Error", "Please enter or resolve a valid account name");
      return;
    }
    router.push(
      `/request/amount?name=${accountName}&identifier=${payID}&narration=${narration}`,
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>
          Request money
        </Text>
      </View>

      <View className="flex-1 px-6">
        {/* Tab Switcher */}
        <View className="flex-row p-1.5 rounded-[32px] mt-6 mb-8 border" style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.border }}>
          <TouchableOpacity
            onPress={() => setActiveTab("request")}
            className={`flex-1 py-4 rounded-[28px] items-center justify-center`}
            style={{ backgroundColor: activeTab === "request" ? colors.text : 'transparent' }}
          >
            <Text
              className={`font-bold`}
              style={{ color: activeTab === "request" ? colors.surface : colors.textTertiary }}
            >
              Request
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("pending")}
            className={`flex-row flex-1 py-4 rounded-[28px] items-center justify-center`}
            style={{ backgroundColor: activeTab === "pending" ? colors.text : 'transparent' }}
          >
            <Text
              className={`font-bold`}
              style={{ color: activeTab === "pending" ? colors.surface : colors.textTertiary }}
            >
              Pending
            </Text>
            <View className="ml-2 w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: colors.textTertiary }}>
              <Text className="text-white text-[10px] font-bold">
                {pendingRequests.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {activeTab === "request" ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Request Form */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  Payment ID
                </Text>
                {isResolving && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
              </View>
              <TextInput
                className="w-full h-16 border rounded-2xl px-5 font-medium" style={{ borderColor: colors.cardBorder, color: colors.text, backgroundColor: colors.surface }}
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

            <View className="mb-6">
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                Account Name
              </Text>
              <TextInput
                className="w-full h-16 border rounded-2xl px-5 font-medium" style={{ borderColor: colors.cardBorder, color: colors.text, backgroundColor: colors.chevronBg }}
                placeholder="Resolved account name"
                placeholderTextColor={colors.textSecondary}
                value={accountName}
                editable={false}
              />
            </View>

            <View className="mb-10">
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

            <TouchableOpacity
              onPress={handleContinue}
              className="py-5 rounded-[28px] shadow-lg shadow-indigo-100" style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white text-center text-lg font-bold">
                Continue
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Pending List */}
            {isLoading ? (
              <View className="py-10 items-center">
                <Text style={{ color: colors.textSecondary }}>Loading requests...</Text>
              </View>
            ) : pendingRequests.length === 0 ? (
              <View className="py-10 items-center">
                <Text style={{ color: colors.textSecondary }}>No pending requests</Text>
              </View>
            ) : (
              pendingRequests.map((item) => {
                const isMyRequest = item.requester_name === "Me";
                const displayName = isMyRequest
                  ? item.payer_name
                  : item.requester_name;
                const displayIdentifier = isMyRequest
                  ? item.payer_id
                  : item.requester_id;
                const displayLabel = isMyRequest
                  ? `Request to ${displayName}`
                  : `Request from ${displayName}`;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      router.push({
                        pathname: "/request/confirm",
                        params: {
                          id: item.id,
                          amount: item.amount,
                          name: displayName || "Unknown",
                          identifier: displayIdentifier || "Unknown",
                          narration: item.narration,
                          status: item.status,
                          type: "pending", // to distinguish in confirm screen
                        },
                      })
                    }
                    className="p-4 rounded-[32px] flex-row items-center mb-4 shadow-sm border" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}
                  >
                    <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: colors.chevronBg }}>
                      <MaterialCommunityIcons
                        name="hands-pray"
                        size={24}
                        color={colors.text}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-bold text-sm mb-1"
                        style={{ color: colors.text }}
                        numberOfLines={1}
                      >
                        {displayLabel}
                      </Text>
                      <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                        {new Date(
                          (item.created_at || "")
                            .replace(" +0000 UTC", "Z")
                            .replace(" ", "T") || Date.now(),
                        ).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-bold text-sm" style={{ color: colors.text }}>
                        ₦{Number(item.amount).toLocaleString()}
                      </Text>
                      <View className="bg-amber-100 px-2 py-0.5 rounded-md mt-1">
                        <Text className="text-amber-500 text-[10px] font-bold uppercase">
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// Icon Import for the pending list
