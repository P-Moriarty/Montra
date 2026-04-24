import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '@/constants/Config';
import { authSwitchboard } from './auth-switchboard';

/**
 * Centralized API client with secure token injection and global error handling.
 */
const apiClient = axios.create({
  baseURL: Config.api.baseUrl,
  timeout: Config.api.timeout,
  headers: Config.api.headers,
});

// Request Interceptor: Inject Authorization Token
apiClient.interceptors.request.use(
  async (config: any) => {
    if (config.skipAuth) {
      return config;
    }

    try {
      const token = await SecureStore.getItemAsync(Config.auth.tokenKey);

      console.log('[API Client] token exists:', !!token);
      console.log('[API Client] request url:', config.url);

      if (token) {
        const authValue = `Bearer ${token.trim()}`;

        if (typeof config.headers?.set === 'function') {
          config.headers.set('Authorization', authValue);
        } else {
          config.headers = config.headers ?? {};
          config.headers.Authorization = authValue;
        }

        console.log('[API Client] Authorization attached:', `${authValue.slice(0, 25)}...`);
      } else {
        console.warn('[API Client] No token found in SecureStore for authenticated request.');
      }
    } catch (error) {
      console.error('[API Client] Failed to retrieve token from SecureStore:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle responses and global error states
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}:`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      const isPublicRequest = error.config?.skipAuth;

      if (!isPublicRequest) {
        console.warn('[API Client] 401 Unauthorized detected at:', new Date().toISOString());
        console.log('[API Client] Emitting "session:expired" event.');
        authSwitchboard.emit('session:expired');
      } else {
        console.log('[API Client] 401 occurred on a public request. Skipping session expiration.');
      }

      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    if (error.response?.status >= 500) {
      console.error('[API Client] Server error detected:', error.response.status);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
