import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import * as SecureStore from "expo-secure-store";
import { Config } from "@/constants/Config";

/**
 * Industrial-Grade Auth Service
 * Manages all authentication-related API interactions and session state.
 */
export const AuthService = {
  /**
   * Log in a user and secure their session token.
   */
  login: async (credentials: any) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    // Industrial-grade token extraction: handling multiple naming conventions and nesting
    const data = response.data;
    const token =
      data?.token ||
      data?.access_token ||
      data?.user?.token ||
      data?.user?.access_token ||
      data?.data?.token ||
      data?.data?.access_token;

    if (token) {
      await SecureStore.setItemAsync(Config.auth.tokenKey, token);
    }
    return response.data;
  },

  /**
   * Register a new user account.
   */
  register: async (userData: any) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  /**
   * Verify user account.
   */
  verifyAccount: async (credentials: any) => {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.VERIFY_ACCOUNT,
      credentials,
    );
    return response.data;
  },
};
