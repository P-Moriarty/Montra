import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/hooks/api/use-api';
import { NotificationService } from '@/services/modules/notification.service';
import { useRouter } from 'expo-router';

const TYPE_CONFIG: Record<string, { icon: any; family: string; color: string; bg: string }> = {
  WITHDRAWAL: { icon: "arrow-down-circle", family: "Ionicons", color: "#EF4444", bg: "#FEF2F2" },
  SWAP: { icon: "repeat", family: "Feather", color: "#5154F4", bg: "#EEF2FF" },
  VAS_AIRTIME: { icon: "call-outline", family: "Ionicons", color: "#F59E0B", bg: "#FFFBEB" },
  REWARD_CASHBACK: { icon: "gift-outline", family: "Ionicons", color: "#10B981", bg: "#ECFDF5" },
  DEPOSIT: { icon: "arrow-up-circle", family: "Ionicons", color: "#10B981", bg: "#ECFDF5" },
  TRANSFER: { icon: "swap-horizontal-outline", family: "Ionicons", color: "#5154F4", bg: "#EEF2FF" },
  PAYMENT_REQUEST: { icon: "wallet-outline", family: "Ionicons", color: "#8B5CF6", bg: "#F5F3FF" },
  DEFAULT: { icon: "bell", family: "Feather", color: "#6C7278", bg: "#F3F4F6" },
};

const getTypeConfig = (type?: string) => {
  return TYPE_CONFIG[type?.toUpperCase() || ""] || TYPE_CONFIG.DEFAULT;
};

const getStatusIcon = (status?: string) => {
  const s = status?.toLowerCase();
  if (s === "success") return "checkmark-circle";
  if (s === "failed") return "close-circle";
  return "time-outline";
};

const extractItems = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.notifications)) return data.notifications;
  if (Array.isArray(data.data)) {
    if (data.data.length > 0 && Array.isArray(data.data[0])) return data.data[0];
    if (data.data.length > 0 && data.data[0]?.notifications) return data.data[0].notifications;
    return data.data;
  }
  if (data.data && Array.isArray(data.data.notifications)) return data.data.notifications;
  if (data.data && Array.isArray(data.data.data)) return data.data.data;
  return [];
};

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const { isLoading, refetch, isRefetching } = useApiQuery(
    ["notifications", "all"],
    async () => {
      const response = await NotificationService.getNotifications({ page: 1, limit: 20 });
      const items = extractItems(response);
      setAllItems(items);
      setHasMore(response?.has_more || response?.data?.has_more || false);
      setPage(1);
      return response;
    },
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await NotificationService.getNotifications({ page: nextPage, limit: 20 });
      const newItems = extractItems(response);
      setAllItems(prev => [...prev, ...newItems]);
      setHasMore(response?.has_more || response?.data?.has_more || false);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  const markAsReadMutation = useApiMutation(NotificationService.markAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-badge"] });
    },
  });

  const markAllAsReadMutation = useApiMutation(NotificationService.markAllAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-badge"] });
      setAllItems(prev => prev.map((n: any) => ({ ...n, is_read: true })));
    },
  });

  const hasUnread = useMemo(() => {
    return allItems.some((n: any) => n.is_read === false || n.isRead === false);
  }, [allItems]);

  const handleMarkAsRead = useCallback((item: any) => {
    if (item.is_read === false || item.isRead === false) {
      markAsReadMutation.mutate(item.id);
      setAllItems(prev => prev.map((n: any) => n.id === item.id ? { ...n, is_read: true } : n));
    }
  }, [markAsReadMutation]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setAllItems([]);
    refetch();
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const isUnread = item.is_read === false || item.isRead === false;
    const config = getTypeConfig(item.type);
    const IconComponent = config.family === "Feather" ? Feather
      : config.family === "MaterialCommunityIcons" ? MaterialCommunityIcons
      : config.family === "FontAwesome6" ? FontAwesome6
      : Ionicons;

    return (
      <TouchableOpacity
        onPress={() => handleMarkAsRead(item)}
        disabled={!isUnread || markAsReadMutation.isPending}
        className={`flex-row items-start px-6 py-4 ${isUnread ? "bg-blue-50/40" : ""} border-b border-gray-100`}
      >
        <View className={`w-11 h-11 rounded-full items-center justify-center mr-3 mt-0.5`} style={{ backgroundColor: config.bg }}>
          <IconComponent name={config.icon} size={20} color={config.color} />
        </View>
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center justify-between mb-0.5">
            <Text className={`text-sm ${isUnread ? "font-bold text-[#1F2C37]" : "font-medium text-[#4B5563]"}`} numberOfLines={1}>
              {item.title || "Notification"}
            </Text>
            {isUnread && <View className="w-2 h-2 rounded-full bg-[#5154F4] ml-2 flex-shrink-0" />}
          </View>
          <Text className="text-[#6C7278] text-sm leading-5 mb-1.5" numberOfLines={2}>
            {item.message || item.subtitle || ""}
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name={getStatusIcon(item.status)} size={12} color={item.status?.toLowerCase() === "success" ? "#10B981" : item.status?.toLowerCase() === "failed" ? "#EF4444" : "#9CA3AF"} />
              <Text className={`text-xs font-medium ${item.status?.toLowerCase() === "success" ? "text-green-600" : item.status?.toLowerCase() === "failed" ? "text-red-500" : "text-gray-400"}`}>
                {item.status || ""}
              </Text>
            </View>
            <Text className="text-[#9DA3B6] text-xs">
              {item.display_time || item.created_at || ""}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [markAsReadMutation.isPending, handleMarkAsRead]);

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-6 py-4">
      <View className="flex-row items-center flex-1">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="text-[#1F2C37] text-xl font-bold ml-4">Notifications</Text>
      </View>
      {hasUnread && (
        <TouchableOpacity
          onPress={() => markAllAsReadMutation.mutate(undefined as any)}
          disabled={markAllAsReadMutation.isPending}
          className="bg-[#F0F1FF] px-3 py-2 rounded-xl"
        >
          {markAllAsReadMutation.isPending ? (
            <ActivityIndicator size="small" color="#5154F4" />
          ) : (
            <Text className="text-[#5154F4] font-bold text-sm">Mark All Read</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="items-center justify-center px-6 mt-20">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="notifications-off-outline" size={36} color="#9DA3B6" />
        </View>
        <Text className="text-[#1F2C37] text-lg font-bold text-center">No notifications yet</Text>
        <Text className="text-[#9DA3B6] text-sm text-center mt-1">We&apos;ll let you know when something arrives</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#5154F4" />
        </View>
      );
    }
    if (!hasMore && allItems.length > 0) {
      return (
        <View className="py-6 items-center">
          <Text className="text-[#9DA3B6] text-xs">You&apos;re all caught up</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FE]" edges={["top"]}>
      {renderHeader()}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5154F4" />
        </View>
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item: any) => item.id || Math.random().toString()}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#5154F4" />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
