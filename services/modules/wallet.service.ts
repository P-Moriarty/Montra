import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface Wallet {
  id: string;
  currency: string;
  balance: number;
  status: string;
}

export interface WalletResponse {
  message: string;
  wallets: Wallet[];
}

export interface SwapPayload {
  amount: number;
  auth_method: string;
  credential: string;
  from_currency: string;
  to_currency: string;
}

export interface FiatAccountPayload {
  country: string;
}

export const WalletService = {
  /**
   * Fetch Wallet Balance
   * Extremely robust handling for varied API response structures.
   */
  getWalletBalance: async (): Promise<WalletResponse> => {
    const response = await apiClient.get(ENDPOINTS.WALLET_BALANCE);
    const body = response.data;

    console.log('[WalletService] Full Balance Response:', JSON.stringify(body, null, 2));

    // 1. Check for { data: { wallets: [] } }
    if (body?.data?.wallets) return body.data;
    // 2. Check for { wallets: [] }
    if (body?.wallets) return body;
    // 3. Check for { data: [] }
    if (Array.isArray(body?.data)) return { message: 'Success', wallets: body.data };
    // 4. Check for direct array []
    if (Array.isArray(body)) return { message: 'Success', wallets: body };

    return body;
  },

  /**
   * Swap Currencies securely.
   */
  swapCurrencies: async (payload: SwapPayload) => {
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const response = await apiClient.post(ENDPOINTS.SWAPS.SWAPS, payload, {
      headers: {
        'idempotency-key': idempotencyKey,
      },
    });
    return response.data;
  },

  /**
   * Fetch live swap rates.
   * Extremely robust handling for varied API response structures.
   */
  getSwapRates: async () => {
    const response = await apiClient.get(ENDPOINTS.SWAPS.SWAP_RATES);
    const body = response.data;

    console.log('[WalletService] Full Rates Response:', JSON.stringify(body, null, 2));

    // 1. Check for { data: { rates: [] } }
    if (body?.data?.rates) return body.data;
    // 2. Check for { rates: [] }
    if (body?.rates) return body;
    // 3. Check for { data: [] }
    if (Array.isArray(body?.data)) return { message: 'Success', rates: body.data };
    // 4. Check for direct array []
    if (Array.isArray(body)) return { message: 'Success', rates: body };

    return body;
  },

  /**
   * Create a new fiat account/wallet.
   */
  createFiatAccount: async (payload: FiatAccountPayload) => {
    const response = await apiClient.post(ENDPOINTS.FIAT_ACCOUNTS, payload);
    return response.data;
  },

  /**
   * Get all fiat accounts/wallets for the user.
   */
  getFiatAccounts: async () => {
    const response = await apiClient.get(ENDPOINTS.FIAT_ACCOUNTS);
    return response.data;
  },
};