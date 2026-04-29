import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface Wallet {
  id: string;
  currency: string;
  balance: number;
  status:string
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
     */
    
    getWalletBalance: async (): Promise<WalletResponse> => {
        const response = await apiClient.get(ENDPOINTS.WALLET_BALANCE);
        return response.data;
    },

    /**
     * Swap Currencies securely.
     * Uses idempotency keys to prevent duplicate transactions.
     */
    swapCurrencies: async (payload: SwapPayload) => {
        // Fallback for UUID in React Native environments
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
     */
    getSwapRates: async () => {
        const response = await apiClient.get(ENDPOINTS.SWAPS.SWAP_RATES);
        return response.data;
    },

    /**
     * Create a new fiat account/wallet.
     */
    createFiatAccount: async (payload: FiatAccountPayload) => {
        const response = await apiClient.post(ENDPOINTS.FIAT_ACCOUNTS, payload);
        return response.data;
    },
}