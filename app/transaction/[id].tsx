import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/api/use-api";
import { TransactionService } from "@/services/modules/transaction.service";
import { getCurrencySymbol } from "@/constants/currencies";

const safeFormat = (value: any, symbol = "") => {
  const num = Number(value);
  if (isNaN(num) || num === 0) return `${symbol}0.00`;
  return `${symbol}${Math.abs(num / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
};

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();

  // Try to find the transaction in any cached transactions query
  const cachedTransaction = useMemo(() => {
    const allQueries = queryClient.getQueryCache().findAll({
      queryKey: ["transactions"],
    });

    for (const query of allQueries) {
      const data = query.state.data as any;
      if (!data) continue;

      // Handle both useQuery (single page) and useInfiniteQuery (multiple pages) structures
      const items = data.pages
        ? data.pages.flatMap(
            (page: any) => page.items || page.data || page.transactions || [],
          )
        : data.items ||
          data.data ||
          data.transactions ||
          (Array.isArray(data) ? data : []);

      const found = items.find((t: any) => String(t.id) === String(id));
      if (found) return found;
    }
    return null;
  }, [queryClient, id]);

  // Fallback fetch if not in cache (fetches first page)
  const { data: fallbackData, isLoading } = useApiQuery(
    ["transactions", "detail-fallback", id as string],
    () => TransactionService.getTransactions({ limit: 50 }),
    { enabled: !cachedTransaction },
  );

  const transaction = useMemo(() => {
    let found = null;
    if (cachedTransaction) {
      found = cachedTransaction;
    } else if (fallbackData) {
      const items =
        fallbackData.items ||
        fallbackData.data ||
        fallbackData.transactions ||
        (Array.isArray(fallbackData) ? fallbackData : []);
      found = items.find((t: any) => String(t.id) === String(id));
    }

    if (
      found?.category?.toLowerCase() === "electricity" ||
      found?.category?.toLowerCase() === "outward" ||
      found?.category?.toLowerCase() === "swap"
    ) {
      console.log(
        `[${found?.category} Debug] Transaction Data:`,
        JSON.stringify(found, null, 2),
      );
    }

    return found;
  }, [cachedTransaction, fallbackData, id]);

  if (isLoading && !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FE] items-center justify-center">
        <ActivityIndicator size="large" color="#5154F4" />
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FE] items-center justify-center px-6">
        <Feather name="alert-circle" size={48} color="#9DA3B6" />
        <Text className="mt-4 text-[#1F2C37] text-lg font-bold">
          Transaction not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-[#5154F4] px-8 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Format date and time
  const dateObj = new Date(transaction.created_at);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const isCredit =
    transaction.type?.toLowerCase() === "credit" ||
    ["deposit", "onramp", "reward", "payment_request"].includes(
      transaction.category?.toLowerCase(),
    );
  const currencySymbol = getCurrencySymbol(transaction.currency);

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">
          Details
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Status Badge & Amount */}
        <View className="items-center mt-8 mb-10">
          <View
            className={`w-20 h-20 ${transaction.status?.toLowerCase() === "failed" || transaction.status?.toLowerCase() === "reversed" ? "bg-red-50" : "bg-green-50"} rounded-full items-center justify-center mb-4`}
          >
            <Ionicons
              name={
                transaction.status?.toLowerCase() === "failed" ||
                transaction.status?.toLowerCase() === "reversed"
                  ? "close"
                  : "checkmark"
              }
              size={40}
              color={
                transaction.status?.toLowerCase() === "failed" ||
                transaction.status?.toLowerCase() === "reversed"
                  ? "#EF4444"
                  : "#22C55E"
              }
            />
          </View>
          {transaction.category?.toLowerCase() === "swap" && (
            <Text className="text-[#9DA3B6] text-sm font-medium mb-2">
              {safeFormat(transaction.from_amount, getCurrencySymbol(transaction.from_currency))}{" "}
              {transaction.from_currency?.toUpperCase() || "?"} →{" "}
              {safeFormat(transaction.to_amount, getCurrencySymbol(transaction.to_currency))}{" "}
              {transaction.to_currency?.toUpperCase() || "?"}
            </Text>
          )}
          <Text className="text-[#1F2C37] text-4xl font-extrabold mb-2">
            {isCredit ? "+" : "-"}
            {currencySymbol}
            {Number(Math.abs(transaction.amount) / 100).toLocaleString(
              undefined,
              { minimumFractionDigits: 2 },
            )}
          </Text>
          <View
            className={`px-4 py-1.5 rounded-full ${transaction.status?.toLowerCase() === "failed" || transaction.status?.toLowerCase() === "reversed" ? "bg-red-50" : "bg-green-50"}`}
          >
            <Text
              className={`${transaction.status?.toLowerCase() === "failed" || transaction.status?.toLowerCase() === "reversed" ? "text-red-500" : "text-green-500"} font-bold text-sm`}
            >
              {transaction.status}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 mb-6">
          {transaction.category?.toLowerCase() === "outward" && (
            <>
              <View className="flex-row justify-between mb-6">
                <Text className="text-[#6C7278] font-medium">Bank Name</Text>
                <Text className="text-[#1F2C37] font-bold text-right">
                  {transaction.bank_name || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between mb-6">
                <Text className="text-[#6C7278] font-medium">Account Name</Text>
                <Text className="text-[#1F2C37] font-bold text-right">
                  {transaction.account_name || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between mb-6">
                <Text className="text-[#6C7278] font-medium">
                  Account Number
                </Text>
                <Text className="text-[#1F2C37] font-bold text-right">
                  {transaction.account_number || "N/A"}
                </Text>
              </View>
            </>
          )}

          {transaction.category?.toLowerCase() === "swap" ? (
            <>
              <View className="flex-row justify-between mb-6">
                <Text className="text-[#6C7278] font-medium">From</Text>
                <Text className="text-[#1F2C37] font-bold text-right">
                  {safeFormat(transaction.from_amount, getCurrencySymbol(transaction.from_currency))}{" "}
                  {transaction.from_currency?.toUpperCase() || ""}
                </Text>
              </View>
              <View className="flex-row justify-between mb-6">
                <Text className="text-[#6C7278] font-medium">To</Text>
                <Text className="text-[#1F2C37] font-bold text-right">
                  {safeFormat(transaction.to_amount, getCurrencySymbol(transaction.to_currency))}{" "}
                  {transaction.to_currency?.toUpperCase() || ""}
                </Text>
              </View>
              {transaction.rate && (
                <View className="flex-row justify-between mb-6">
                  <Text className="text-[#6C7278] font-medium">Swap Rate</Text>
                  <Text className="text-[#1F2C37] font-bold text-right">
                    1 {transaction.from_currency?.toUpperCase() || "?"} = {transaction.rate}{" "}
                    {transaction.to_currency?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}
            </>
          ) : transaction.category?.toLowerCase() !== "outward" && (
            <View className="flex-row justify-between mb-6">
              <Text className="text-[#6C7278] font-medium">
                {transaction.category?.toLowerCase() === "electricity"
                  ? "Disco"
                  : "Recipient"}
              </Text>
              <View className="items-end max-w-[60%]">
                <Text
                  className="text-[#1F2C37] font-bold text-right"
                  numberOfLines={1}
                >
                  {transaction.recipient_name ||
                    transaction.account_name ||
                    transaction.requester_name ||
                    transaction.phone_number ||
                    transaction.disco ||
                    "N/A"}
                </Text>
                <Text className="text-[#9DA3B6] text-xs mt-1">
                  {transaction.account_number ||
                    transaction.recipient_pay_id ||
                    transaction.requester_pay_id ||
                    (transaction.category?.toLowerCase() === "airtime"
                      ? ""
                      : transaction.network)}
                </Text>
              </View>
            </View>
          )}

          {transaction.category?.toLowerCase() !== "swap" && transaction.category?.toLowerCase() !== "outward" && (
            <View className="flex-row justify-between mb-6">
              <Text className="text-[#6C7278] font-medium">
                {transaction.category?.toLowerCase() === "airtime"
                  ? "Network"
                  : transaction.category?.toLowerCase() === "electricity"
                    ? "Token"
                    : "Sender"}
              </Text>
              <View className="items-end max-w-[60%]">
                <Text
                  className="text-[#1F2C37] font-bold text-right"
                  numberOfLines={1}
                >
                  {transaction.category?.toLowerCase() === "airtime"
                    ? transaction.network
                    : transaction.category?.toLowerCase() === "electricity"
                      ? transaction.token
                      : transaction.sender_name || transaction.payer_name}
                </Text>
                {transaction.category?.toLowerCase() !== "airtime" &&
                  transaction.category?.toLowerCase() !== "electricity" && (
                    <Text className="text-[#9DA3B6] text-xs mt-1">
                      {transaction.sender_account ||
                        transaction.sender_pay_id ||
                        transaction.payer_pay_id ||
                        "N/A"}
                    </Text>
                  )}
              </View>
            </View>
          )}

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Transaction Type</Text>
            <Text className="text-[#1F2C37] font-bold capitalize">
              {transaction.type}
            </Text>
          </View>

          {transaction.category?.toLowerCase() === "electricity" && (
            <>
              <View className="flex-row justify-between mb-6">
                <Text className="text-[#6C7278] font-medium">Meter Number</Text>
                <Text className="text-[#1F2C37] font-bold">
                  {transaction.meter_number || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between mb-6">
                <Text className="text-[#6C7278] font-medium">Meter Type</Text>
                <Text className="text-[#1F2C37] font-bold capitalize">
                  {transaction.meter_type || "N/A"}
                </Text>
              </View>
            </>
          )}

          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Category</Text>
            <View className="flex-row items-center">
              {transaction.category?.toLowerCase() === "swap" && (
                <View className="bg-indigo-100 px-2.5 py-1 rounded-full mr-2">
                  <Text className="text-indigo-600 text-xs font-bold">⇄</Text>
                </View>
              )}
              <Text className="text-[#1F2C37] font-bold capitalize">
                {transaction.category}
              </Text>
            </View>
          </View>


          <View className="flex-row justify-between mb-6">
            <Text className="text-[#6C7278] font-medium">Date & Time</Text>
            <Text className="text-[#1F2C37] font-bold text-right">
              {formattedDate}, {formattedTime}
            </Text>
          </View>

          {(transaction.reference || transaction.id) && (
            <View className="mb-6">
              <Text className="text-[#6C7278] font-medium mb-2">Reference</Text>
              <Text className="text-[#1F2C37] font-bold bg-gray-50 p-3 rounded-xl" selectable>
                {transaction.reference ||
                  transaction.id}
              </Text>
            </View>
          )}

          {transaction.session_id && transaction.session_id !== transaction.id && (
            <View className="mb-6">
              <Text className="text-[#6C7278] font-medium mb-2">Session ID</Text>
              <Text className="text-[#1F2C37] font-bold bg-gray-50 p-3 rounded-xl" selectable>
                {transaction.session_id}
              </Text>
            </View>
          )}

          <View className="h-[1px] bg-gray-100 mb-6" />

          <View className="flex-row justify-between mb-4">
            <Text className="text-[#6C7278] font-medium">Amount</Text>
            <Text className="text-[#1F2C37] font-bold">
              {currencySymbol}
              {Number(transaction.amount / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="text-[#6C7278] font-medium">Fee</Text>
            <Text className="text-[#1F2C37] font-bold">
              {currencySymbol}
              {Number((transaction.fee || 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-[#1F2C37] font-extrabold text-lg">
              Total Amount
            </Text>
            <Text className="text-[#1F2C37] font-extrabold text-lg">
              {currencySymbol}
              {Number(
                (Number(transaction.amount) + Number(transaction.fee || 0)) /
                  100,
              ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Footer Actions */}
        <View className="flex-row gap-4 mb-10">
          <TouchableOpacity className="flex-1 bg-white border border-gray-100 py-5 rounded-[28px] items-center justify-center flex-row shadow-sm">
            <Feather name="share-2" size={20} color="#1F2C37" />
            <Text className="text-[#1F2C37] font-bold ml-2">Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              transaction.category?.toLowerCase() === "swap"
                ? router.push("/(tabs)/swap")
                : router.back()
            }
            className="flex-1 bg-[#5154F4] py-5 rounded-[28px] items-center justify-center flex-row shadow-lg shadow-indigo-100"
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-white font-bold ml-2">
              {transaction.category?.toLowerCase() === "swap"
                ? "New Swap"
                : "Repeat"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="items-center mb-10">
          <Text className="text-red-500 font-bold">Report a problem</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
