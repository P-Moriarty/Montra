import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Industrial-Grade Device Service
 * Manages user devices (trusted and untrusted).
 */
export const DeviceService = {
  /**
   * Get a list of all devices (trusted and untrusted) that have logged into this account.
   */
  getAll: async () => {
    const response = await apiClient.get(ENDPOINTS.DEVICES.GET_ALL);
    return response.data;
  },

  /**
   * Resend the verification code for device trust to the user's email.
   */
  resendOtp: async (data: { email: string }) => {
    const response = await apiClient.post(ENDPOINTS.DEVICES.RESEND_OTP, data, { skipAuth: true });
    return response.data;
  },

  /**
   * Verify a new device with OTP sent to the user's email.
   */
  verifyNewDevice: async (data: { email: string; verification_code: string }) => {
    const response = await apiClient.post(ENDPOINTS.DEVICES.VERIFY_NEW_DEVICE, data, { skipAuth: true });
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
    const response = await apiClient.patch(
      ENDPOINTS.DEVICES.UPDATE_TOKEN(deviceId),
      data,
    );
    return response.data;
  },
};
