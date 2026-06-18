import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export const ReferralService = {
  getCount: async () => {
    const response = await apiClient.get(ENDPOINTS.REFERRALS.COUNT);
    return response.data;
  },

  getBalance: async () => {
    const response = await apiClient.get(ENDPOINTS.REFERRALS.BALANCE);
    return response.data;
  },

  redeem: async () => {
    const response = await apiClient.post(ENDPOINTS.REFERRALS.REDEEM);
    return response.data;
  },
};
