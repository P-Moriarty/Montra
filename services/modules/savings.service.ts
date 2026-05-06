import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Savings Service Interface Definitions
 */
export interface SavingsGoalPayload {
  name: string;
  description: string;
  target_amount: number;
  end_date: string;
  currency: string;
  preference: 'MANUAL' | 'AUTO';
}

export interface SaytPayload {
  enabled: boolean;
  percentage: number;
  end_date: string;
}

export interface SavingsFundPayload {
  amount: number;
}

export interface SavingsWithdrawPayload {
  amount: number;
}

/**
 * Savings Management Service
 */
export const SavingsService = {
  /**
   * Create a new savings goal
   */
  createGoal: async (payload: SavingsGoalPayload) => {
    const response = await apiClient.post(ENDPOINTS.SAVINGS.CREATE_GOAL, payload);
    return response.data;
  },

  /**
   * Configure SAYT (Save As You Trade/Spend)
   */
  configureSayt: async (payload: SaytPayload) => {
    const response = await apiClient.post(ENDPOINTS.SAVINGS.SAYT, payload);
    return response.data;
  },

  /**
   * Retrieve all savings goals for the user
   */
  getGoals: async () => {
    const response = await apiClient.get(ENDPOINTS.SAVINGS.GOALS);
    return response.data;
  },

  /**
   * Break a savings goal (Close/Liquidate)
   */
  breakGoal: async (id: string) => {
    const response = await apiClient.post(ENDPOINTS.SAVINGS.BREAK(id));
    return response.data;
  },

  /**
   * Fund a savings goal
   */
  fundGoal: async (id: string, payload: SavingsFundPayload) => {
    const response = await apiClient.post(ENDPOINTS.SAVINGS.FUND(id), payload);
    return response.data;
  },

  /**
   * Withdraw from a savings goal
   */
  withdrawFromGoal: async (id: string, payload: SavingsWithdrawPayload) => {
    const response = await apiClient.post(ENDPOINTS.SAVINGS.WITHDRAW(id), payload);
    return response.data;
  },

  /**
   * Retrieve transaction history for a specific savings goal
   */
  getGoalHistory: async (id: string) => {
    const response = await apiClient.get(ENDPOINTS.SAVINGS.HISTORY(id));
    return response.data;
  }
};
