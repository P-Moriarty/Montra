import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '@/constants/Config';
import { router } from 'expo-router';

/**
 * Industrial-Grade API Client
 * Orchestrates all network requests with centralized token injection and error handling.
 */

const apiClient = axios.create({
  baseURL: Config.api.baseUrl,
  timeout: Config.api.timeout,
  headers: Config.api.headers,
});

// Request Interceptor: Inject Authorization Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(Config.auth.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Error States
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Session Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Industrial-grade cleanup: clear tokens and redirect to login
      await SecureStore.deleteItemAsync(Config.auth.tokenKey);
      router.replace('/login');
      
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle 500+ Server Errors
    if (error.response?.status >= 500) {
      // Logic for global server error feedback can be added here
      console.error('Industrial-level server error detected:', error.response.status);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
