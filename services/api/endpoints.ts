/**
 * Engineering Cockpit Endpoint Registry
 * Central registry for all industrial-grade API paths.
 */

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_PIN: '/auth/verify-pin',
    SETUP_PIN: '/auth/setup-pin',
    ME: '/auth/me',
  },
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    TRANSFER: '/wallet/transfer',
    REQUEST_FUNDS: '/wallet/request-funds',
    CARDS: '/wallet/cards',
  },
  SAVINGS: {
    GOALS: '/savings/goals',
    GOAL_DETAILS: (id: string) => `/savings/goals/${id}`,
    FUND_GOAL: '/savings/fund',
  },
  UTILITIES: {
    PROVIDERS: (category: string) => `/utilities/providers/${category}`,
    PAY: '/utilities/pay',
    RECENT: '/utilities/recent',
  },
  SWAP: {
    RATES: '/swap/rates',
    EXECUTE: '/swap/execute',
  }
};
