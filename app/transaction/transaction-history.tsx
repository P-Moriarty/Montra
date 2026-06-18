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

export default function TransactionHistoryScreen() {
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
          color: "#10B981",
          bgColor: "bg-green-50",
          family: "MaterialIcons",
        };
      case "outward":
        return {
          icon: "arrow-upward",
          color: "#EF4444",
          bgColor: "bg-red-50",
          family: "MaterialIcons",
        };
      case "swap":
        return {
          icon: "repeat",
          color: "#5154F4",
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
          color: "#10B981",
          bgColor: "bg-green-50",
          family: "Feather",
        };
      case "offramp":
        return {
          icon: "minus-circle",
          color: "#EF4444",
          bgColor: "bg-red-50",
          family: "Feather",
        };
      case "save":
        return {
          icon: "savings",
          color: "#8B5CF6",
          bgColor: "bg-purple-50",
          family: "MaterialIcons",
        };
      case "reward":
        return {
          icon: "card-giftcard",
          color: "#F59E0B",
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
          color: "#F59E0B",
          bgColor: "bg-amber-50",
          family: "Feather",
        };
      case "payment_request":
        return {
          icon: "request-page",
          color: "#5154F4",
          bgColor: "bg-indigo-50",
          family: "MaterialIcons",
        };
      default:
        return {
          icon: "payment",
          color: "#6C7278",
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
        className="bg-white p-4 rounded-[32px] flex-row items-center mb-3 border border-gray-50 shadow-sm"
      >
        <View
          className={`w-12 h-12 ${config.bgColor} rounded-full items-center justify-center mr-4`}
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
            className="text-[#1F2C37] font-bold text-sm mb-1 capitalize"
            numberOfLines={1}
          >
            {item.category}
          </Text>
          <Text className="text-[#9DA3B6] text-[10px]">
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
            className={`font-bold text-sm ${item.status?.toLowerCase() === "failed" ? "text-red-500" : isCredit ? "text-green-600" : "text-[#1F2C37]"}`}
          >
            {isCredit ? "+" : "-"}{getCurrencySymbol(item.currency)}
            {Number(Math.abs(item.amount) / 100).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </Text>
          <View
            className={`${item.status?.toLowerCase() === "failed" || item.status?.toLowerCase() === "reversed" ? "bg-red-50" : item.status?.toLowerCase() === "pending" ? "bg-amber-50" : "bg-green-50"} px-2 py-0.5 rounded-md mt-1 border ${item.status?.toLowerCase() === "failed" ? "border-red-100" : item.status?.toLowerCase() === "pending" ? "border-amber-100" : "border-green-100"}`}
          >
            <Text
              className={`${item.status?.toLowerCase() === "failed" || item.status?.toLowerCase() === "reversed" ? "text-red-500" : item.status?.toLowerCase() === "pending" ? "text-amber-500" : "text-green-500"} text-[10px] font-bold capitalize`}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          Transactions History
        </Text>
      </View>

      {/* Search & Filter Row */}
      <View className="flex-row items-center px-5 mb-4">
        <View className="flex-1 flex-row items-center bg-white h-14 rounded-2xl px-4 border border-gray-100 shadow-sm">
          <Feather name="search" size={20} color="#9DA3B6" />
          <TextInput
            className="flex-1 ml-3 text-[#1F2C37] font-medium"
            placeholder="Search transaction"
            placeholderTextColor="#9DA3B6"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowFilter(true)}
          className="w-14 h-14 bg-white rounded-2xl items-center justify-center ml-3 border border-gray-100 shadow-sm"
        >
          <Feather
            name="sliders"
            size={20}
            color={
              activeType !== "All" || activeStatus !== "All"
                ? "#5154F4"
                : "#1F2C37"
            }
          />
          {(activeType !== "All" || activeStatus !== "All") && (
            <View className="absolute top-3 right-3 w-2 h-2 bg-[#5154F4] rounded-full" />
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
          <Text className="text-[#6C7278] text-sm font-bold mb-4 uppercase tracking-wider mt-2">
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
            <ActivityIndicator color="#5154F4" className="mt-10" />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="bg-white p-10 rounded-[32px] items-center justify-center mt-6 border border-gray-100 italic">
              <Feather name="list" size={40} color="#9DA3B6" />
              <Text className="text-[#9DA3B6] mt-4 font-bold text-center">
                No transactions found matching your criteria
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color="#5154F4" className="py-4" />
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[48px] px-6 pt-10 pb-12">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-[#1F2C37] text-2xl font-bold">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="close-circle" size={32} color="#E5E7EB" />
              </TouchableOpacity>
            </View>

            <Text className="text-[#1F2C37] font-bold text-lg mb-4">
              Transaction Type
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-8">
              {types.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setActiveType(f)}
                  className={`px-6 py-3 rounded-2xl border ${activeType === f ? "bg-[#5154F4] border-[#5154F4]" : "bg-white border-gray-100"}`}
                >
                  <Text
                    className={`font-bold ${activeType === f ? "text-white" : "text-[#6C7278]"}`}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-[#1F2C37] font-bold text-lg mb-4">
              Transaction Status
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {statuses.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setActiveStatus(s)}
                  className={`px-6 py-3 rounded-2xl border ${activeStatus === s ? "bg-[#5154F4] border-[#5154F4]" : "bg-white border-gray-100"}`}
                >
                  <Text
                    className={`font-bold ${activeStatus === s ? "text-white" : "text-[#6C7278]"}`}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowFilter(false)}
              className="bg-[#333] mt-10 py-5 rounded-[28px] shadow-lg shadow-gray-200"
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
