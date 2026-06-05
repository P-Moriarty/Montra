import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import * as SecureStore from "expo-secure-store";
import { Config } from "@/constants/Config";
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

const getDeviceHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    "device_name": Device.deviceName || 'Unknown Device',
  };

  try {
    let deviceId = '';
    if (Platform.OS === 'ios') {
      deviceId = await Application.getIosIdForVendorAsync() || '';
    } else if (Platform.OS === 'android') {
      deviceId = Application.getAndroidId();
    }
    
    if (!deviceId) {
      deviceId = 'device_' + (Device.osBuildId || 'unknown');
    }
    headers["device_id"] = deviceId;
  } catch (e) {
    console.warn("[Auth Service] Failed to get device ID", e);
  }

  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getLastKnownPositionAsync();
      if (location) {
        headers["latitude"] = location.coords.latitude.toString();
        headers["longitude"] = location.coords.longitude.toString();
      }
    }
  } catch (e) {
    console.warn("[Auth Service] Failed to get location", e);
  }

  return headers;
};

/**
 * Industrial-Grade Auth Service
 * Manages all authentication-related API interactions and session state.
 */
export const AuthService = {
  /**
   * Log in a user and secure their session token.
   */
  login: async (credentials: any) => {
    const deviceHeaders = await getDeviceHeaders();
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials, { 
      skipAuth: true,
      headers: deviceHeaders
    });
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
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData, { skipAuth: true });
    return response.data;
  },

  /**
   * Verify user account.
   */
  verifyAccount: async (credentials: any) => {
    const deviceHeaders = await getDeviceHeaders();
    const response = await apiClient.post(
      ENDPOINTS.AUTH.VERIFY_ACCOUNT,
      credentials,
      { 
        skipAuth: true,
        headers: deviceHeaders
      },
    );
    return response.data;
  },

  /**
   * Change user password.
   */
  changePassword: async (data: any) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  },

  /**
   * Request password reset.
   */
  forgotPassword: async (data: any) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, data, { skipAuth: true });
    return response.data;
  },

  /**
   * Log out the user.
   */
  logout: async () => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    await SecureStore.deleteItemAsync(Config.auth.tokenKey);
    return response.data;
  },

  /**
   * Refresh the user session token.
   */
  refreshToken: async () => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN);
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
   * Resend OTP.
   */
  resendOtp: async (data: any) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.RESEND_OTP, data, { skipAuth: true });
    return response.data;
  },

  /**
   * Verify reset password OTP.
   */
  verifyResetPasswordOtp: async (data: any) => {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.VERIFY_RESET_PASSWORD_OTP,
      data,
      { skipAuth: true },
    );
    return response.data;
  },
};
