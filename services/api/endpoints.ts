/**
 * Engineering Cockpit Endpoint Registry
 * Central registry for all industrial-grade API paths.
 */

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_ACCOUNT: "/auth/verify-account",
  },
  NOTIFICATIONS: {
    GET_ALL: "/notification/",
    READ_ALL: "/notification/read-all",
    UNREAD: "/notification/unread",
    MARK_READ: (id: string) => `/notification/${id}/read`,
  },
  PROFILE: "/profile/",
  PROFILE_UPDATE: "/profile/update",
  TRANSACTIONS: "/transactions",
  UPLOAD_AVATAR: "/uploads/user",
  WALLET_BALANCE: "/wallet/",
  SWAPS: {
    SWAPS: "/swaps",
    SWAP_RATES: "/swaps/rates",
  },
  FIAT_ACCOUNTS: "/fiat-accounts",
  ACCOUNT: {
    SET_PIN: "/account/set-pin",
    VERIFY_PIN_RESET: "/account/verify-pin-reset",
    RESEND_PIN_OTP: "/account/resend-pin-otp",
    FORGOT_PIN: "/account/forgot-pin",
    ENABLE_BIOMETRIC: "/account/enable-biometric",
    DISABLE_BIOMETRIC: "/account/disable-biometric",
    CHANGE_PIN: "/account/change-pin",
  },
};
