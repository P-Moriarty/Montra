import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useApiQuery, useApiMutation } from '@/hooks/api/use-api';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/services/modules/notification.service';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useApiQuery(
    ['notifications', 'all'],
    () => NotificationService.getNotifications({ page: 1, limit: 50 })
  );

  const markAsReadMutation = useApiMutation(NotificationService.markAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useApiMutation(NotificationService.markAllAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const notifications = useMemo(() => {
    if (!notificationsData) return [];
    if (Array.isArray(notificationsData)) return notificationsData;
    if (Array.isArray(notificationsData.data)) return notificationsData.data;
    if (Array.isArray(notificationsData.notifications)) return notificationsData.notifications;
    if (notificationsData.data && Array.isArray(notificationsData.data.notifications)) return notificationsData.data.notifications;
    if (notificationsData.data && Array.isArray(notificationsData.data.data)) return notificationsData.data.data;
    return [];
  }, [notificationsData]);

  const hasUnread = notifications.some((n: any) => !n.isRead);

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
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

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoading ? (
          <ActivityIndicator color="#5154F4" className="mt-10" />
        ) : notifications.length === 0 ? (
          <View className="bg-white p-10 rounded-[32px] items-center justify-center mt-6 border border-gray-100 italic">
            <Ionicons name="notifications-off-outline" size={40} color="#9DA3B6" />
            <Text className="text-[#9DA3B6] mt-4 font-bold text-center">No notifications yet</Text>
          </View>
        ) : (
          notifications.map((item: any) => (
            <TouchableOpacity 
              key={item.id || Math.random().toString()} 
              onPress={() => {
                if (!item.isRead) {
                  markAsReadMutation.mutate(item.id);
                }
              }}
              disabled={item.isRead || markAsReadMutation.isPending}
              className={`bg-white p-4 rounded-[32px] flex-row items-center mb-3 border ${item.isRead ? 'border-gray-50 opacity-70' : 'border-blue-200'} shadow-sm`}
            >
              <View className="w-12 h-12 bg-indigo-50 rounded-full items-center justify-center mr-4">
                <Feather name="bell" size={20} color="#5154F4" />
              </View>
              <View className="flex-1">
                <Text className="text-[#1F2C37] font-bold text-sm mb-1" numberOfLines={2}>
                  {item.title || item.message || 'Notification'}
                </Text>
                <Text className="text-[#9DA3B6] text-[10px]">{item.date || item.createdAt || 'Just now'}</Text>
              </View>
              {!item.isRead && (
                 <View className="w-3 h-3 bg-red-500 rounded-full ml-2" />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
