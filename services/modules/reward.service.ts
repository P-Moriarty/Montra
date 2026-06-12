import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export const RewardService = {
  getAll: async () => {
    const response = await apiClient.get(ENDPOINTS.REWARDS.GET_ALL);
    return response.data;
  },

  getBalance: async () => {
    const response = await apiClient.get(ENDPOINTS.REWARDS.BALANCE);
    return response.data;
  },

  redeemCashback: async () => {
    const response = await apiClient.post(ENDPOINTS.REWARDS.REDEEM);
    return response.data;
  },
};
