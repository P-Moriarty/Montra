import { Config } from "@/constants/Config";
import { getCurrencySymbol, CURRENCY_MAP } from "@/constants/currencies";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { useTheme } from '@/context/ThemeContext';
import { useApiQuery } from "@/hooks/api/use-api";
import { NotificationService } from "@/services/modules/notification.service";
import { ProfileService } from "@/services/modules/profile.service";
import { TransactionService } from "@/services/modules/transaction.service";
import { WalletService } from "@/services/modules/wallet.service";
import {
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { colors } = useTheme();
  const [showBalance, setShowBalance] = useState(true);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const { selectedCurrencyCode, setSelectedCurrencyCode } = useWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);

  const exchangePairs = [
    { from: "USD", to: "NGN", rate: "1,400.00", fromFlag: "us", toFlag: "ng" },
    { from: "EUR", to: "USD", rate: "1.08", fromFlag: "eu", toFlag: "us" },
    { from: "GBP", to: "USD", rate: "1.26", fromFlag: "gb", toFlag: "us" },
    { from: "USD", to: "GBP", rate: "0.79", fromFlag: "us", toFlag: "gb" },
    { from: "GBP", to: "NGN", rate: "1,780.00", fromFlag: "gb", toFlag: "ng" },
    { from: "EUR", to: "NGN", rate: "1,520.00", fromFlag: "eu", toFlag: "ng" },
  ];

  // Auto-scroll logic for continuous ticker
  const flatListRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);
  const [tickerData] = useState([
    ...exchangePairs,
    ...exchangePairs,
    ...exchangePairs,
  ]); // Triplicate for safety
  const CARD_WIDTH = 260;
  const GAP = 16;
  const TOTAL_CARD_WIDTH = CARD_WIDTH + GAP;
  const TOTAL_CONTENT_WIDTH = exchangePairs.length * TOTAL_CARD_WIDTH;

  useEffect(() => {
    let intervalId: any;

    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        if (flatListRef.current) {
          scrollX.current += 1;

          if (scrollX.current >= TOTAL_CONTENT_WIDTH) {
            scrollX.current = 0;
            flatListRef.current.scrollTo({ x: 0, animated: false });
          } else {
            flatListRef.current.scrollTo({
              x: scrollX.current,
              animated: false,
            });
          }
        }
      }, 30);
    };

    startAutoScroll();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [TOTAL_CONTENT_WIDTH]);

  const { userToken, isLoading: isAuthLoading } = useAuth();

  const canFetchProtectedData = !isAuthLoading && !!userToken;

  const { data: user, isLoading: isProfileLoading } = useApiQuery(
    ["profile"],
    async () => {
      const response = await ProfileService.getProfile();
      // console.log('[Savings Debug] Profile Response:', JSON.stringify(response, null, 2));
      return response;
    },
    {
      enabled: canFetchProtectedData,
    },
  );

  const { data: transactionsData, isLoading: isTransactionsLoading } =
    useApiQuery(
      ["transactions", "recent"],
      () => TransactionService.getRecentTransactions(3),
      { enabled: canFetchProtectedData },
    );

  const transactions = useMemo(() => {
    const all = transactionsData?.data || transactionsData?.transactions || [];
    const seen = new Set();
    const swapSessions = new Map();
    return all.filter((t: any) => {
      const id = t.id || t._id;
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);

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
  }, [transactionsData]);

  const {
    data: walletData,
    isLoading: isWalletLoading,
    error: walletError,
    refetch: refetchWallets,
    isRefetching: isWalletRefetching,
  } = useApiQuery(["wallet"], WalletService.getWalletBalance, {
    enabled: canFetchProtectedData,
  });

  const { data: notificationsData } = useApiQuery(
    ["notifications-badge"],
    async () => {
      const response = await NotificationService.getNotifications({
        page: 1,
        limit: 10,
      });
      // console.log('[Dashboard Debug] Notifications:', JSON.stringify(response, null, 2));
      return response;
    },
    { enabled: canFetchProtectedData },
  );

  const notifications = useMemo(() => {
    if (!notificationsData) return [];
    if (Array.isArray(notificationsData)) return notificationsData;
    if (Array.isArray(notificationsData.data)) return notificationsData.data;
    if (Array.isArray(notificationsData.notifications))
      return notificationsData.notifications;
    if (
      notificationsData.data &&
      Array.isArray(notificationsData.data.notifications)
    )
      return notificationsData.data.notifications;
    if (notificationsData.data && Array.isArray(notificationsData.data.data))
      return notificationsData.data.data;
    return [];
  }, [notificationsData]);

  const hasUnreadNotifications = notifications.some(
    (n: any) =>
      n.isRead === false || n.is_read === false || n.status === "unread",
  );

  const getCategoryConfig = (category: string) => {
    switch (category?.toLowerCase()) {
      case "deposit":
        return {
          icon: "arrow-downward",
          color: colors.green,
          bgStyle: { backgroundColor: colors.successLight },
          family: "MaterialIcons",
        };
      case "outward":
        return {
          icon: "arrow-upward",
          color: colors.error,
          bgStyle: { backgroundColor: colors.errorLight },
          family: "MaterialIcons",
        };
      case "swap":
        return {
          icon: "repeat",
          color: colors.primary,
          bgStyle: { backgroundColor: colors.iconBg },
          family: "Feather",
        };
      case "transfer":
        return {
          icon: "send",
          color: colors.info,
          bgStyle: { backgroundColor: colors.infoLight },
          family: "Feather",
        };
      case "onramp":
        return {
          icon: "plus-circle",
          color: colors.green,
          bgStyle: { backgroundColor: colors.successLight },
          family: "Feather",
        };
      case "offramp":
        return {
          icon: "minus-circle",
          color: colors.error,
          bgStyle: { backgroundColor: colors.errorLight },
          family: "Feather",
        };
      case "save":
        return {
          icon: "savings",
          color: colors.purple,
          bgStyle: { backgroundColor: colors.iconBg },
          family: "MaterialIcons",
        };
      case "reward":
        return {
          icon: "card-giftcard",
          color: colors.warning,
          bgStyle: { backgroundColor: colors.warningLight },
          family: "MaterialIcons",
        };
      case "airtime":
        return {
          icon: "smartphone",
          color: colors.info,
          bgStyle: { backgroundColor: colors.infoLight },
          family: "Feather",
        };
      case "data":
        return {
          icon: "wifi",
          color: colors.info,
          bgStyle: { backgroundColor: colors.infoLight },
          family: "Feather",
        };
      case "cable":
        return {
          icon: "tv",
          color: colors.info,
          bgStyle: { backgroundColor: colors.infoLight },
          family: "Feather",
        };
      case "electricity":
        return {
          icon: "zap",
          color: colors.warning,
          bgStyle: { backgroundColor: colors.warningLight },
          family: "Feather",
        };
      case "payment_request":
        return {
          icon: "request-page",
          color: colors.primary,
          bgStyle: { backgroundColor: colors.iconBg },
          family: "MaterialIcons",
        };
      default:
        return {
          icon: "payment",
          color: colors.textTertiary,
          bgStyle: { backgroundColor: colors.chevronBg },
          family: "MaterialIcons",
        };
    }
  };

  const availableCurrencies = useMemo(() => {
    const wallets = walletData?.wallets ?? [];
    return wallets.map((wallet: any) => {
      const code = String(wallet.currency || "").toUpperCase();
      const meta = CURRENCY_MAP[code] || {
        symbol: code,
        flag: "us",
        name: code,
      };
      return {
        ...wallet,
        code,
        ...meta,
      };
    });
  }, [walletData?.wallets]);

  // Sync selection with available wallets
  React.useEffect(() => {
    if (availableCurrencies.length > 0) {
      // Priority: 1. Current selectedCurrencyCode from context, 2. First available wallet
      const targetCode = selectedCurrencyCode || availableCurrencies[0].code;
      const found =
        availableCurrencies.find((c) => c.code === targetCode) ||
        availableCurrencies[0];

      if (
        !selectedCurrency ||
        selectedCurrency.code !== found.code ||
        selectedCurrency.balance !== found.balance
      ) {
        setSelectedCurrency(found);
        if (selectedCurrencyCode !== found.code) {
          setSelectedCurrencyCode(found.code);
        }
      }
    }
  }, [
    availableCurrencies,
    selectedCurrencyCode,
    selectedCurrency,
    setSelectedCurrencyCode,
  ]);

  const currentWallet = selectedCurrency || {
    balance: 0,
    symbol: "",
    code: "",
    flag: "us",
  };

  const imageUrl = useMemo(() => {
    const avatar = user?.profilePicture;

    if (!avatar) return "https://i.pravatar.cc/150";
    if (avatar.startsWith("http")) return avatar;

    const baseUrl = Config.api.baseUrl
      .replace("/api/v1", "")
      .replace(/\/$/, "");

    const cleanAvatar = avatar.startsWith("/") ? avatar : `/${avatar}`;

    return `${baseUrl}${cleanAvatar}?t=${Date.now()}`;
  }, [user?.profilePicture]);

  const isInitialDashboardLoading =
    isAuthLoading ||
    ((isProfileLoading || isWalletLoading) && (!user || !walletData));

  if (isInitialDashboardLoading) {
    return <HomeSkeleton />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Header Section */}
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push("/account/my-profile")}
              className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-3"
            >
              <Image
                source={{ uri: imageUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </TouchableOpacity>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              {isProfileLoading
                ? "Loading..."
                : `Hello, ${user?.full_name?.split(" ")[0] || "User"}`}
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => refetchWallets()}
              disabled={isWalletRefetching}
              className="w-10 h-10 rounded-full items-center justify-center shadow-sm mr-2" style={{ backgroundColor: colors.surface }}
            >
              {isWalletRefetching ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="refresh" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/account/notifications" as any)}
              className="w-10 h-10 rounded-full items-center justify-center shadow-sm relative" style={{ backgroundColor: colors.surface }}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.text}
              />
              {hasUnreadNotifications && (
                <View className="absolute top-2 right-2 w-2 h-2 rounded-full border border-white" style={{ backgroundColor: colors.error }} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Multi-Currency Balance Switcher */}
        <View className="mt-10 items-center" style={{ backgroundColor: colors.background }}>
          <Text className="text-sm mb-4 font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
            Available balance
          </Text>

          {isWalletLoading ? (
            <ActivityIndicator color={colors.primary} className="mb-6" />
          ) : walletError ? (
              <Text className="text-sm mb-6" style={{ color: colors.error }}>
                Unable to load wallet balance
              </Text>
          ) : (
            <View className="flex-row items-center mb-6">
              <Text className="text-4xl font-extrabold mr-3" style={{ color: colors.text }}>
                {showBalance
                  ? `${currentWallet.symbol}${Number(
                      (currentWallet.balance ?? 0) / 100,
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "••••••"}
              </Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                <Ionicons
                  name={showBalance ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Currency Dropdown Selector */}
          <View className="relative">
            <TouchableOpacity
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
              className="flex-row items-center px-5 py-3 rounded-full shadow-sm border border-gray-100" style={{ backgroundColor: colors.surface }}
            >
              <Image
                source={{
                  uri: `https://flagcdn.com/w80/${currentWallet.flag}.png`,
                }}
                className="w-6 h-4 rounded-sm mr-2"
              />
              <Text className="font-bold mr-2" style={{ color: colors.text }}>
                {currentWallet.code}
              </Text>
              <Feather
                name={showCurrencyPicker ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.text}
              />
            </TouchableOpacity>

            {showCurrencyPicker && availableCurrencies.length > 0 && (
              <View className="absolute top-14 left-0 right-0 rounded-3xl p-2 shadow-xl z-50 border border-gray-100 min-w-[120px]" style={{ backgroundColor: colors.surface }}>
                {availableCurrencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    onPress={() => {
                      setSelectedCurrencyCode(currency.code);
                      setShowCurrencyPicker(false);
                    }}
                    className="flex-row items-center p-3 rounded-2xl"
                    style={selectedCurrency.code === currency.code ? { backgroundColor: colors.iconBg } : undefined}
                  >
                    <Image
                      source={{
                        uri: `https://flagcdn.com/w80/${currency.flag}.png`,
                      }}
                      className="w-5 h-3.5 rounded-sm mr-2"
                    />
                    <Text
                      className="font-bold"
                      style={{ color: selectedCurrency.code === currency.code ? colors.primary : colors.text }}
                    >
                      {currency.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mt-12 p-6 rounded-[32px] shadow-sm" style={{ backgroundColor: colors.surface }}>
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/transfer")}
          >
            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: colors.primary }}>
              <Feather name="send" size={24} color="white" />
            </View>
            <Text className="font-bold" style={{ color: colors.textTertiary }}>Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/transfer/deposit-ngn")}
          >
            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: colors.primary + '1A' }}>
              <Ionicons name="download-outline" size={24} color={colors.primary} />
            </View>
            <Text className="font-bold" style={{ color: colors.textTertiary }}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/request")}
          >
            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: colors.infoLight }}>
              <FontAwesome6
                name="hand-holding-dollar"
                size={24}
                color={colors.primary}
              />
            </View>
            <Text className="font-bold" style={{ color: colors.textTertiary }}>Request</Text>
          </TouchableOpacity>
        </View>

          {/* Exchange Rate Carousel */}
          <View className="mt-8">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
              Exchange Rates
            </Text>
            <ScrollView
              ref={flatListRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              onScroll={(e) => {
                scrollX.current = e.nativeEvent.contentOffset.x;
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {tickerData.map((item, index) => (
                <View
                  key={`${item.from}-${item.to}-${index}`}
                  className="p-5 rounded-[32px] flex-row items-center justify-between mr-4 shadow-sm"
                  style={{ width: 200, backgroundColor: colors.surface, borderColor: colors.cardBorder }}
                >
                  <View className="flex-row items-center mr-2">
                    <View className="flex-row items-center mr-3">
                      <Image
                        source={{
                          uri: `https://flagcdn.com/w80/${item.fromFlag}.png`,
                        }}
                        className="w-7 h-4 rounded-sm z-10 border border-white"
                      />
                      <Image
                        source={{
                          uri: `https://flagcdn.com/w80/${item.toFlag}.png`,
                        }}
                        className="w-7 h-4 rounded-sm -ml-2 border border-white"
                      />
                    </View>
                    <View>
                      <Text className="font-bold text-sm" style={{ color: colors.text }}>
                        {item.from}/{item.to}
                      </Text>
                      <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                        Standard Rate
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="font-extrabold text-base" style={{ color: colors.primary }}>
                      {item.to === "NGN"
                        ? "₦"
                        : item.to === "USD"
                          ? "$"
                          : item.to === "GBP"
                            ? "£"
                            : "€"}
                      {item.rate}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Feather name="trending-up" size={10} color={colors.green} />
                      <Text className="text-[10px] font-bold ml-1" style={{ color: colors.green }}>
                        +0.24%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

        {/* Quick Services */}
        <View className="mt-8">
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            Quick Services
          </Text>
          <View className="flex-row justify-between">
            {[
              {
                label: "Savings",
                icon: "piggy-bank-outline",
                lib: "MaterialCommunityIcons",
              },
              { label: "Pay bills", icon: "rss", lib: "Feather" },
              { label: "Rewards", icon: "gift-outline", lib: "Ionicons" },
              { label: "Referral", icon: "users", lib: "Feather" },
            ].map((service, index) => (
              <TouchableOpacity
                key={index}
                className="items-center"
                onPress={() => {
                  if (service.label === "Pay bills") router.push("/pay-bills");
                  if (service.label === "Savings") router.push("/savings");
                  if (service.label === "Rewards") router.push("/rewards");
                  if (service.label === "Referral") router.push("/rewards/refer");
                }}
              >
                <View className="w-16 h-16 rounded-full items-center justify-center shadow-sm mb-2" style={{ backgroundColor: colors.iconBg }}>
                  {service.lib === "MaterialCommunityIcons" && (
                    <MaterialCommunityIcons
                      name={service.icon as any}
                      size={26}
                      color={colors.primary}
                    />
                  )}
                  {service.lib === "Feather" && (
                    <Feather
                      name={service.icon as any}
                      size={24}
                      color={colors.primary}
                    />
                  )}
                  {service.lib === "Ionicons" && (
                    <Ionicons
                      name={service.icon as any}
                      size={26}
                      color={colors.primary}
                    />
                  )}
                </View>
                <Text className="text-sm font-medium" style={{ color: colors.textTertiary }}>
                  {service.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Recent transaction
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push("/transaction/transaction-history")}
            >
              <Text className="font-bold mr-1" style={{ color: colors.primary }}>
                View more
              </Text>
              <Feather name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {isTransactionsLoading ? (
            <ActivityIndicator color={colors.primary} className="my-8" />
          ) : transactions.length === 0 ? (
            <View className="p-8 rounded-3xl items-center justify-center border border-gray-100" style={{ backgroundColor: colors.surface }}>
              <Feather name="list" size={32} color={colors.textSecondary} />
              <Text className="mt-2 font-bold" style={{ color: colors.textSecondary }}>
                No transactions yet
              </Text>
            </View>
          ) : (
            transactions.map((item: any, index: number) => {
              const config = getCategoryConfig(item.category || item.type);
              const isCredit =
                item.type?.toLowerCase() === "credit" ||
                ["deposit", "onramp", "reward", "payment_request"].includes(
                  item.category?.toLowerCase(),
                );

              // Format date and time
              const dateObj = new Date(item.created_at);
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

              return (
                <TouchableOpacity
                  key={`${item.id || index}-${index}`}
                  onPress={() => router.push(`/transaction/${item.id}` as any)}
                  className="p-4 rounded-3xl flex-row items-center mb-3 shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={config.bgStyle}
                  >
                    {config.family === "MaterialIcons" ? (
                      <MaterialIcons
                        name={config.icon as any}
                        size={20}
                        color={config.color}
                      />
                    ) : (
                      <Feather
                        name={config.icon as any}
                        size={20}
                        color={config.color}
                      />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-bold text-base mb-1"
                      style={{ color: colors.text }}
                      numberOfLines={1}
                    >
                      {item.category}
                    </Text>
                    <View className="flex-row items-center">
                      <Image
                        source={{
                          uri: `https://flagcdn.com/w80/${item.flag || "us"}.png`,
                        }}
                        className="w-4 h-3 rounded-sm mr-2"
                      />
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        {formattedDate}
                        {formattedTime}
                       </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text
                      className="font-bold text-base"
                      style={{ color: item.status?.toLowerCase() === "failed" ? colors.error : isCredit ? colors.green : colors.text }}
                    >
                      {isCredit ? "+" : "-"}{getCurrencySymbol(item.currency)}
                      {Number(Math.abs(item.amount) / 100).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 },
                      )}
                    </Text>
                    <View
                      className="px-2 py-0.5 rounded-md mt-1"
                      style={{ backgroundColor: item.status?.toLowerCase() === "failed" ? colors.errorLight : colors.successLight }}
                    >
                      <Text
                        className="text-[10px] font-bold capitalize"
                        style={{ color: item.status?.toLowerCase() === "failed" ? colors.error : colors.success }}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeSkeleton() {
  const { colors } = useTheme();
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <View className="px-5">
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full mr-3 animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
            <View className="w-32 h-6 rounded-xl animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
          </View>
          <View className="flex-row">
            <View className="w-10 h-10 rounded-full mr-2 animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
            <View className="w-10 h-10 rounded-full animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
          </View>
        </View>

        <View className="mt-10 items-center">
          <View className="w-40 h-4 rounded-md mb-4 animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
          <View className="w-64 h-12 rounded-2xl mb-6 animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
          <View className="w-24 h-10 rounded-full animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
        </View>

        <View className="flex-row justify-between p-6 rounded-[32px] mt-10" style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.border }}>
          {[1, 2, 3].map((_, i) => (
            <View key={i} className="items-center">
              <View className="w-14 h-14 rounded-2xl mb-2 animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
              <View className="w-12 h-3 rounded animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
            </View>
          ))}
        </View>

        <View className="mt-10">
          <View className="w-32 h-6 rounded-lg mb-4 animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
          <View className="flex-row justify-between">
            {[1, 2, 3, 4].map((_, i) => (
              <View key={i} className="items-center">
                <View className="w-16 h-16 rounded-full mb-2 animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
                <View className="w-12 h-3 rounded animate-pulse" style={{ backgroundColor: colors.surfaceSecondary }} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}


