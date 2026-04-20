import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import * as SecureStore from 'expo-secure-store';
import { Config } from '@/constants/Config';

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
    const { token } = response.data;
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
   * Verifies the user's transaction PIN.
   */
  verifyPin: async (pin: string) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_PIN, { pin });
    return response.data;
  },

  /**
   * Clears the current session and logs the user out.
   */
  logout: async () => {
    await SecureStore.deleteItemAsync(Config.auth.tokenKey);
    // Any complementary API logout calls can go here
  },

  /**
   * Retrieves the current user's profile data.
   */
  getMe: async () => {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);
    return response.data;
  }
};
