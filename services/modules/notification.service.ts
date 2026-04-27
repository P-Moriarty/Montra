import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface NotificationFilters {
  page?: number;
  limit?: number;
}

/**
 * Industrial-Grade Notification Service
 * Manages the retrieval and status of user notifications.
 */
export const NotificationService = {
  /**
   * Fetch notifications with pagination.
   */
  getNotifications: async (filters: NotificationFilters = {}) => {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.GET_ALL, {
      params: {
        page: 1,
        limit: 20,
        ...filters,
      },
    });
    return response.data;
  },

  /**
   * Fetch unread notifications with pagination.
   */
  getUnreadNotifications: async (filters: NotificationFilters = {}) => {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.UNREAD, {
      params: {
        page: 1,
        limit: 20,
        ...filters,
      },
    });
    return response.data;
  },

  /**
   * Mark a specific notification as read.
   */
  markAsRead: async (notificationId: string) => {
    const response = await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
    return response.data;
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async () => {
    const response = await apiClient.patch(ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return response.data;
  },
};
