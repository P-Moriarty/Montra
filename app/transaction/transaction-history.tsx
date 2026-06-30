import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { TransactionService } from "@/services/modules/transaction.service";
import { getCurrencySymbol } from "@/constants/currencies";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function TransactionHistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [activeType, setActiveType] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeCurrency, setActiveCurrency] = useState("All");

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [
      "transactions",
      activeType,
      activeStatus,
      activeCurrency,
      search,
    ],
    queryFn: ({ pageParam = 1 }) =>
      TransactionService.getTransactions({
        type: activeType === "All" ? undefined : activeType.toLowerCase(),
        status: activeStatus === "All" ? undefined : activeStatus.toLowerCase(),
        currency: activeCurrency === "All" ? undefined : activeCurrency,
        page: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.has_more || lastPage.hasNextPage) {
        return (lastPage.page || lastPage.currentPage || 1) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const transactions = useMemo(() => {
    const all =
      infiniteData?.pages.flatMap(
        (page) => page.items || page.data || page.transactions || [],
      ) || [];

    // Deduplicate by ID
    const seen = new Set();
    const swapSessions = new Map();
    return all.filter((t: any) => {
      const id = t.id || t._id;
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);

      // For swap transactions, only keep one per session (prefer credit)
      if (t.category?.toLowerCase() === "swap" && t.session_id) {
        if (swapSessions.has(t.session_id)) {
          const kept = swapSessions.get(t.session_id);
          if (t.type?.toLowerCase() === "credit" && kept.type?.toLowerCase() !== "credit") {
            swapSessions.set(t.session_id, t);
            return true;
          }
          return false;
        }
        swapSessions.set(t.session_id, t);
      }
      return true;
    });
  }, [infiniteData]);

  const getCategoryConfig = (category: string) => {
    switch (category?.toLowerCase()) {
      case "deposit":
        return {
          icon: "arrow-downward",
          color: colors.success,
          bgColor: "bg-green-50",
          family: "MaterialIcons",
        };
      case "outward":
        return {
          icon: "arrow-upward",
          color: colors.error,
          bgColor: "bg-red-50",
          family: "MaterialIcons",
        };
      case "swap":
        return {
          icon: "repeat",
          color: colors.primary,
          bgColor: "bg-indigo-50",
          family: "Feather",
        };
      case "transfer":
        return {
          icon: "send",
          color: "#3B82F6",
          bgColor: "bg-blue-50",
          family: "Feather",
        };
      case "onramp":
        return {
          icon: "plus-circle",
          color: colors.success,
          bgColor: "bg-green-50",
          family: "Feather",
        };
      case "offramp":
        return {
          icon: "minus-circle",
          color: colors.error,
          bgColor: "bg-red-50",
          family: "Feather",
        };
      case "save":
        return {
          icon: "savings",
          color: colors.purple,
          bgColor: "bg-purple-50",
          family: "MaterialIcons",
        };
      case "reward":
        return {
          icon: "card-giftcard",
          color: colors.warning,
          bgColor: "bg-amber-50",
          family: "MaterialIcons",
        };
      case "airtime":
        return {
          icon: "smartphone",
          color: "#3B82F6",
          bgColor: "bg-blue-50",
          family: "Feather",
        };
      case "data":
        return {
          icon: "wifi",
          color: "#3B82F6",
          bgColor: "bg-blue-50",
          family: "Feather",
        };
      case "cable":
        return {
          icon: "tv",
          color: "#3B82F6",
          bgColor: "bg-blue-50",
          family: "Feather",
        };
      case "electricity":
        return {
          icon: "zap",
          color: colors.warning,
          bgColor: "bg-amber-50",
          family: "Feather",
        };
      case "payment_request":
        return {
          icon: "request-page",
          color: colors.primary,
          bgColor: "bg-indigo-50",
          family: "MaterialIcons",
        };
      default:
        return {
          icon: "payment",
          color: colors.textTertiary,
          bgColor: "bg-gray-50",
          family: "MaterialIcons",
        };
    }
  };

  const types = [
    "All",
    "Transfer",
    "Swap",
    "Deposit",
    "Outward",
    "Onramp",
    "Offramp",
    "Save",
    "Reward",
    "Airtime",
    "Data",
    "Cable",
    "Electricity",
    "Payment_Request",
  ];
  const statuses = ["All", "Completed", "Pending", "Failed"];

  const sections = useMemo(() => {
    const filtered = transactions.filter((t: any) =>
      (t.title || t.description || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

    const groups: { [key: string]: any[] } = {};

    const formatLabel = (dateStr: string) => {
      if (!dateStr) return "Unknown Date";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (d.toDateString() === today.toDateString()) return "Today";
      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    filtered.forEach((t: any) => {
      const label = formatLabel(t.date || t.created_at || t.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
    });

    return Object.keys(groups).map((title) => ({
      title,
      data: groups[title],
    }));
  }, [transactions, search]);

  const renderItem = ({ item }: { item: any }) => {
    const config = getCategoryConfig(item.category || item.type);
    const isCredit =
      item.type?.toLowerCase() === "credit" ||
      ["deposit", "onramp", "reward", "payment_request"].includes(
        item.category?.toLowerCase(),
      );

    return (
      <TouchableOpacity
        onPress={() => router.push(`/transaction/${item.id}` as any)}
        className="p-4 rounded-[32px] flex-row items-center mb-3 shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-4`}
          style={{ backgroundColor: config.bgColor.replace('bg-', '') === 'indigo-50' ? `${colors.primary}15` : config.bgColor.replace('bg-', '') === 'green-50' ? colors.successLight : config.bgColor.replace('bg-', '') === 'red-50' ? colors.errorLight : config.bgColor.replace('bg-', '') === 'amber-50' ? colors.warningLight : config.bgColor.replace('bg-', '') === 'purple-50' ? colors.purple + '20' : colors.surfaceSecondary }}
        >
          {config.family === "MaterialIcons" ? (
            <MaterialIcons
              name={config.icon as any}
              size={20}
              color={config.color}
            />
          ) : (
            <Feather name={config.icon as any} size={20} color={config.color} />
          )}
        </View>
        <View className="flex-1">
          <Text
            className="font-bold text-sm mb-1 capitalize"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {item.category}
          </Text>
          <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
            {item.time ||
              (item.created_at
                ? new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "...")}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className="font-bold text-sm"
            style={{ color: item.status?.toLowerCase() === "failed" ? colors.error : isCredit ? colors.success : colors.text }}
          >
            {isCredit ? "+" : "-"}{getCurrencySymbol(item.currency)}
            {Number(Math.abs(item.amount) / 100).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </Text>
          <View
            className="px-2 py-0.5 rounded-md mt-1"
            style={{
              backgroundColor: item.status?.toLowerCase() === "failed" || item.status?.toLowerCase() === "reversed" ? colors.errorLight : item.status?.toLowerCase() === "pending" ? colors.warningLight : colors.successLight,
              borderWidth: 1,
              borderColor: item.status?.toLowerCase() === "failed" ? colors.error + '40' : item.status?.toLowerCase() === "pending" ? colors.warning + '40' : colors.success + '40',
            }}
          >
            <Text
              className="text-[10px] font-bold capitalize"
              style={{ color: item.status?.toLowerCase() === "failed" || item.status?.toLowerCase() === "reversed" ? colors.error : item.status?.toLowerCase() === "pending" ? colors.warning : colors.success }}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
          Transactions History
        </Text>
      </View>

      {/* Search & Filter Row */}
      <View className="flex-row items-center px-5 mb-4">
        <View className="flex-1 flex-row items-center h-14 rounded-2xl px-4 shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            className="flex-1 ml-3 font-medium"
            placeholder="Search transaction"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={{ color: colors.text }}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowFilter(true)}
          className="w-14 h-14 rounded-2xl items-center justify-center ml-3 shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}
        >
          <Feather
            name="sliders"
            size={20}
            color={
              activeType !== "All" || activeStatus !== "All"
                ? colors.primary
                : colors.text
            }
          />
          {(activeType !== "All" || activeStatus !== "All") && (
            <View className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
          )}
        </TouchableOpacity>
      </View>

      <SectionList
        className="flex-1 px-5"
        sections={sections}
        keyExtractor={(item, index) =>
          `${item.id || item._id || index}-${index}`
        }
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="text-sm font-bold mb-4 uppercase tracking-wider mt-2" style={{ color: colors.textTertiary }}>
            {title}
          </Text>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          isLoading && !isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} className="mt-10" />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="p-10 rounded-[32px] items-center justify-center mt-6 italic" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
              <Feather name="list" size={40} color={colors.textSecondary} />
              <Text className="mt-4 font-bold text-center" style={{ color: colors.textSecondary }}>
                No transactions found matching your criteria
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} className="py-4" />
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}>
          <View className="rounded-t-[48px] px-6 pt-10 pb-12" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="close-circle" size={32} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>
              Transaction Type
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-8">
              {types.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setActiveType(f)}
                  className="px-6 py-3 rounded-2xl border"
                  style={{
                    backgroundColor: activeType === f ? colors.primary : colors.surface,
                    borderColor: activeType === f ? colors.primary : colors.cardBorder,
                  }}
                >
                  <Text
                    className="font-bold"
                    style={{ color: activeType === f ? "white" : colors.textTertiary }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>
              Transaction Status
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {statuses.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setActiveStatus(s)}
                  className="px-6 py-3 rounded-2xl border"
                  style={{
                    backgroundColor: activeStatus === s ? colors.primary : colors.surface,
                    borderColor: activeStatus === s ? colors.primary : colors.cardBorder,
                  }}
                >
                  <Text
                    className="font-bold"
                    style={{ color: activeStatus === s ? "white" : colors.textTertiary }}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowFilter(false)}
              className="mt-10 py-5 rounded-[28px]"
              style={{ backgroundColor: colors.text }}
            >
              <Text className="text-white text-center text-lg font-bold">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
