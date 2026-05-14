import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface ResolveAccountPayload {
  account_number: string;
  currency: string;
  sort_code: string;
}

export interface SearchPayIDPayload {
  pay_id: string;
}

export interface InternalTransferPayload {
  pay_id: string;
  amount: number;
  currency: string;
  narration: string;
  pin: string;
}

/**
 * Industrial-Grade Transfer Service
 * Manages fund movements and account resolutions with high precision.
 */
export const TransferService = {
  /**
   * Resolve Account Details
   * Fetches account holder name for a given account number and currency.
   */
  resolveAccount: async (payload: ResolveAccountPayload) => {
    const response = await apiClient.post(ENDPOINTS.TRANSFERS.RESOLVE_ACCOUNT, payload);
    return response.data;
  },

  /**
   * Search PayID
   * Checks if a PayID exists and returns the user's full name.
   */
  searchPayID: async (pay_id: string) => {
    const response = await apiClient.post(ENDPOINTS.TRANSFERS.SEARCH_PAYID, { pay_id });
    return response.data;
  },

  /**
   * Internal Transfer (Wallet to Wallet)
   * Transfers funds using PayID with narration and security PIN.
   */
  internalTransfer: async (payload: InternalTransferPayload) => {
    // Note: Idempotency keys are recommended for financial transactions
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const hybridPayload = {
      ...payload,
      payid: payload.pay_id,
      pay_id: payload.pay_id,
    };

    const response = await apiClient.post(ENDPOINTS.TRANSFERS.INTERNAL, hybridPayload, {
      headers: {
        'idempotency-key': idempotencyKey,
      },
    });
    return response.data;
  },
};
