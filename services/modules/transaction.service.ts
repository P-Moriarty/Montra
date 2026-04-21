import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface TransactionFilters {
  status?: string;
  type?: string;
  category?: string;
  method?: string;
  currency?: string;
  page?: number;
  limit?: number;
}

/**
 * Industrial-Grade Transaction Service
 * Manages the high-fidelity retrieval and filtering of financial history.
 */
export const TransactionService = {
  /**
   * Fetch transaction history with comprehensive filtering and pagination.
   */
  getTransactions: async (filters: TransactionFilters = {}) => {
    const response = await apiClient.get(ENDPOINTS.TRANSACTIONS, {
      params: {
        page: 1,
        limit: 20,
        ...filters,
      },
    });
    return response.data;
  },

  /**
   * Fetch recent transactions for dashboard overview.
   */
  getRecentTransactions: async (limit: number = 3) => {
    const response = await apiClient.get(ENDPOINTS.TRANSACTIONS, {
      params: {
        page: 1,
        limit,
      },
    });
    return response.data;
  },
};
