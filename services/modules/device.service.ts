import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
// import * as SecureStore from "expo-secure-store";
// import { Config } from "@/constants/Config";

/**
 * Industrial-Grade Device Service
 * Manages user devices (trusted and untrusted).
 */
export const DeviceService = {
  /**
   * Get a list of all devices (trusted and untrusted) that have logged into this account.
   */
  getAll: async (deviceId: string) => {
    const response = await apiClient.get(ENDPOINTS.DEVICES.GET_ALL, {
      headers: {
        "device-id": deviceId,
      },
    });
    return response.data;
  },

  /**
   * Resend the verification code for device trust to the user's email.
   */
  resendOtp: async (deviceId: string, data: { email: string }) => {
    const response = await apiClient.post(ENDPOINTS.DEVICES.RESEND_OTP, data, {
      headers: {
        "device-id": deviceId,
      },
    });
    return response.data;
  },

  /**
   * Remove a device from the user's account by its ID.
   */
  removeDevice: async (deviceIdToRemove: string) => {
    const response = await apiClient.delete(
      ENDPOINTS.DEVICES.REMOVE(deviceIdToRemove),
    );
    return response.data;
  },

  /**
   * Update the Firebase Cloud Messaging token for a specific device.
   */
  updateToken: async (deviceId: string, data: { fcm_token: string }) => {
    const response = await apiClient.post(
      ENDPOINTS.DEVICES.UPDATE_TOKEN(deviceId),
      data,
    );
    return response.data;
  },
};
