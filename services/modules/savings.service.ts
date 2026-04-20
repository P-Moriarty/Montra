import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Industrial-Grade Savings Service
 * Orchestrates all long-term wealth management data and goal-related logic.
 */
export const SavingsService = {
  /**
   * Retrieves all active savings goals and the cumulative total saved.
   */
  getGoals: async () => {
    const response = await apiClient.get(ENDPOINTS.SAVINGS.GOALS);
    return response.data;
  },

  /**
   * Fetches high-fidelity details and progress for a specific goal.
   */
  getGoalDetails: async (id: string) => {
    const response = await apiClient.get(ENDPOINTS.SAVINGS.GOAL_DETAILS(id));
    return response.data;
  },

  /**
   * Executes a funding transaction to an active goal vault.
   */
  fundGoal: async (fundData: any) => {
    const response = await apiClient.post(ENDPOINTS.SAVINGS.FUND_GOAL, fundData);
    return response.data;
  }
};
