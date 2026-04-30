import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface SetPinPayload {
  account_pin: string;
  confirm_account_pin: string;
}

export interface VerifyPinResetPayload {
  email: string,
  verification_code: string
}

export interface ChangePinPayload {
  current_password: string,
  new_pin: string,
  old_pin: string
}

export interface EnableBiometricPayload {
  public_key: string;
}

/**
 * Account & Security Service
 * Industrial-grade security management for PIN and Biometrics.
 */
export const AccountService = {
  /**
   * Set a new security PIN
   */
  setPin: async (payload: SetPinPayload) => {
    const response = await apiClient.post(ENDPOINTS.ACCOUNT.SET_PIN, payload);
    return response.data;
  },

  /**
   * Verify OTP and reset PIN
   */
  verifyPinReset: async (payload: VerifyPinResetPayload) => {
    const response = await apiClient.post(ENDPOINTS.ACCOUNT.VERIFY_PIN_RESET, payload);
    return response.data;
  },

  /**
   * Resend PIN reset OTP
   */
  resendPinOtp: async () => {
    const response = await apiClient.post(ENDPOINTS.ACCOUNT.RESEND_PIN_OTP);
    return response.data;
  },

  /**
   * Trigger forgot PIN flow (sends OTP)
   */
  forgotPin: async () => {
    const response = await apiClient.post(ENDPOINTS.ACCOUNT.FORGOT_PIN);
    return response.data;
  },

  /**
   * Enable biometric authentication
   */
  enableBiometric: async (payload: EnableBiometricPayload) => {
    const response = await apiClient.post(ENDPOINTS.ACCOUNT.ENABLE_BIOMETRIC, payload);
    return response.data;
  },

  /**
   * Disable biometric authentication
   */
  disableBiometric: async () => {
    const response = await apiClient.post(ENDPOINTS.ACCOUNT.DISABLE_BIOMETRIC);
    return response.data;
  },

  /**
   * Change existing security PIN
   */
  changePin: async (payload: ChangePinPayload) => {
    const response = await apiClient.post(ENDPOINTS.ACCOUNT.CHANGE_PIN, payload);
    return response.data;
  },
};
