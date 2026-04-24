import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface NotificationFilters {
  page?: number;
  limit?: number;
}

/**
 * Industrial-Grade Notification Service
 * Manages the retrieval of user notifications.
 */
export const NotificationService = {
  /**
   * Fetch notifications with pagination.
   */
  getNotifications: async (filters: NotificationFilters = {}) => {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS, {
      params: {
        page: 1,
        limit: 20,
        ...filters,
      },
    });
    return response.data;
  },
};
