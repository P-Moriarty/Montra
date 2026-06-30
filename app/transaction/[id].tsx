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
import { useTheme } from "@/context/ThemeContext";

const safeFormat = (value: any, symbol = "") => {
  const num = Number(value);
  if (isNaN(num) || num === 0) return `${symbol}0.00`;
  return `${symbol}${Math.abs(num / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
};

export default function TransactionDetailScreen() {
  const { colors } = useTheme();
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
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
        <Feather name="alert-circle" size={48} color={colors.textSecondary} />
        <Text className="mt-4 text-lg font-bold" style={{ color: colors.text }}>
          Transaction not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 px-8 py-3 rounded-2xl" style={{ backgroundColor: colors.primary }}
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
          Details
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Status Badge & Amount */}
        <View className="items-center mt-8 mb-10">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: transaction.status?.toLowerCase() === "failed" || transaction.status?.toLowerCase() === "reversed" ? colors.errorLight : colors.successLight }}
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
                  ? colors.error
                  : colors.success
              }
            />
          </View>
          {transaction.category?.toLowerCase() === "swap" && (
            <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              {safeFormat(transaction.from_amount, getCurrencySymbol(transaction.from_currency))}{" "}
              {transaction.from_currency?.toUpperCase() || "?"} →{" "}
              {safeFormat(transaction.to_amount, getCurrencySymbol(transaction.to_currency))}{" "}
              {transaction.to_currency?.toUpperCase() || "?"}
            </Text>
          )}
          <Text className="text-4xl font-extrabold mb-2" style={{ color: colors.text }}>
            {isCredit ? "+" : "-"}
            {currencySymbol}
            {Number(Math.abs(transaction.amount) / 100).toLocaleString(
              undefined,
              { minimumFractionDigits: 2 },
            )}
          </Text>
          <View
            className="px-4 py-1.5 rounded-full"
            style={{ backgroundColor: transaction.status?.toLowerCase() === "failed" || transaction.status?.toLowerCase() === "reversed" ? colors.errorLight : colors.successLight }}
          >
            <Text
              className="font-bold text-sm"
              style={{ color: transaction.status?.toLowerCase() === "failed" || transaction.status?.toLowerCase() === "reversed" ? colors.error : colors.success }}
            >
              {transaction.status}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View className="p-8 rounded-[40px] shadow-sm mb-6" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
          {transaction.category?.toLowerCase() === "outward" && (
            <>
              <View className="flex-row justify-between mb-6">
                <Text className="font-medium" style={{ color: colors.textTertiary }}>Bank Name</Text>
                <Text className="font-bold text-right" style={{ color: colors.text }}>
                  {transaction.bank_name || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between mb-6">
                <Text className="font-medium" style={{ color: colors.textTertiary }}>Account Name</Text>
                <Text className="font-bold text-right" style={{ color: colors.text }}>
                  {transaction.account_name || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between mb-6">
                <Text className="font-medium" style={{ color: colors.textTertiary }}>
                  Account Number
                </Text>
                <Text className="font-bold text-right" style={{ color: colors.text }}>
                  {transaction.account_number || "N/A"}
                </Text>
              </View>
            </>
          )}

          {transaction.category?.toLowerCase() === "swap" ? (
            <>
              <View className="flex-row justify-between mb-6">
                <Text className="font-medium" style={{ color: colors.textTertiary }}>From</Text>
                <Text className="font-bold text-right" style={{ color: colors.text }}>
                  {safeFormat(transaction.from_amount, getCurrencySymbol(transaction.from_currency))}{" "}
                  {transaction.from_currency?.toUpperCase() || ""}
                </Text>
              </View>
              <View className="flex-row justify-between mb-6">
                <Text className="font-medium" style={{ color: colors.textTertiary }}>To</Text>
                <Text className="font-bold text-right" style={{ color: colors.text }}>
                  {safeFormat(transaction.to_amount, getCurrencySymbol(transaction.to_currency))}{" "}
                  {transaction.to_currency?.toUpperCase() || ""}
                </Text>
              </View>
              {transaction.rate && (
                <View className="flex-row justify-between mb-6">
                  <Text className="font-medium" style={{ color: colors.textTertiary }}>Swap Rate</Text>
                  <Text className="font-bold text-right" style={{ color: colors.text }}>
                    1 {transaction.from_currency?.toUpperCase() || "?"} = {transaction.rate}{" "}
                    {transaction.to_currency?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}
            </>
          ) : transaction.category?.toLowerCase() !== "outward" && (
            <View className="flex-row justify-between mb-6">
              <Text className="font-medium" style={{ color: colors.textTertiary }}>
                {transaction.category?.toLowerCase() === "electricity"
                  ? "Disco"
                  : "Recipient"}
              </Text>
              <View className="items-end max-w-[60%]">
                <Text
                  className="font-bold text-right"
                  style={{ color: colors.text }}
                  numberOfLines={1}
                >
                  {transaction.recipient_name ||
                    transaction.account_name ||
                    transaction.requester_name ||
                    transaction.phone_number ||
                    transaction.disco ||
                    "N/A"}
                </Text>
                <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
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
              <Text className="font-medium" style={{ color: colors.textTertiary }}>
                {transaction.category?.toLowerCase() === "airtime"
                  ? "Network"
                  : transaction.category?.toLowerCase() === "electricity"
                    ? "Token"
                    : "Sender"}
              </Text>
              <View className="items-end max-w-[60%]">
                <Text
                  className="font-bold text-right"
                  style={{ color: colors.text }}
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
                    <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
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
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Transaction Type</Text>
            <Text className="font-bold capitalize" style={{ color: colors.text }}>
              {transaction.type}
            </Text>
          </View>

          {transaction.category?.toLowerCase() === "electricity" && (
            <>
              <View className="flex-row justify-between mb-6">
                <Text className="font-medium" style={{ color: colors.textTertiary }}>Meter Number</Text>
                <Text className="font-bold" style={{ color: colors.text }}>
                  {transaction.meter_number || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between mb-6">
                <Text className="font-medium" style={{ color: colors.textTertiary }}>Meter Type</Text>
                <Text className="font-bold capitalize" style={{ color: colors.text }}>
                  {transaction.meter_type || "N/A"}
                </Text>
              </View>
            </>
          )}

          <View className="flex-row justify-between mb-6">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Category</Text>
            <View className="flex-row items-center">
              {transaction.category?.toLowerCase() === "swap" && (
                <View className="px-2.5 py-1 rounded-full mr-2" style={{ backgroundColor: colors.primary + '20' }}>
                  <Text className="text-xs font-bold" style={{ color: colors.primary }}>⇄</Text>
                </View>
              )}
              <Text className="font-bold capitalize" style={{ color: colors.text }}>
                {transaction.category}
              </Text>
            </View>
          </View>


          <View className="flex-row justify-between mb-6">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Date & Time</Text>
            <Text className="font-bold text-right" style={{ color: colors.text }}>
              {formattedDate}, {formattedTime}
            </Text>
          </View>

          {(transaction.reference || transaction.id) && (
            <View className="mb-6">
              <Text className="font-medium mb-2" style={{ color: colors.textTertiary }}>Reference</Text>
              <Text className="font-bold p-3 rounded-xl" style={{ color: colors.text, backgroundColor: colors.surfaceSecondary }} selectable>
                {transaction.reference ||
                  transaction.id}
              </Text>
            </View>
          )}

          {transaction.session_id && transaction.session_id !== transaction.id && (
            <View className="mb-6">
              <Text className="font-medium mb-2" style={{ color: colors.textTertiary }}>Session ID</Text>
              <Text className="font-bold p-3 rounded-xl" style={{ color: colors.text, backgroundColor: colors.surfaceSecondary }} selectable>
                {transaction.session_id}
              </Text>
            </View>
          )}

          <View className="h-[1px] mb-6" style={{ backgroundColor: colors.cardBorder }} />

          <View className="flex-row justify-between mb-4">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Amount</Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {currencySymbol}
              {Number(transaction.amount / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="font-medium" style={{ color: colors.textTertiary }}>Fee</Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              {currencySymbol}
              {Number((transaction.fee || 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="font-extrabold text-lg" style={{ color: colors.text }}>
              Total Amount
            </Text>
            <Text className="font-extrabold text-lg" style={{ color: colors.text }}>
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
          <TouchableOpacity className="flex-1 py-5 rounded-[28px] items-center justify-center flex-row shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
            <Feather name="share-2" size={20} color={colors.text} />
            <Text className="font-bold ml-2" style={{ color: colors.text }}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              transaction.category?.toLowerCase() === "swap"
                ? router.push("/(tabs)/swap")
                : router.back()
            }
            className="flex-1 py-5 rounded-[28px] items-center justify-center flex-row" style={{ backgroundColor: colors.primary }}
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
          <Text className="font-bold" style={{ color: colors.error }}>Report a problem</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
