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

export interface ActionRequestPayload {
  auth_method: string;
  credential: string;
  request_id: string;
  status: string;
}

export interface CreateTransferRequestPayload {
  amount: number;
  auth_method: string;
  credential: string;
  currency: string;
  narration: string;
  pay_id: string;
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

  /**
   * Action Request
   * Accept or reject a pending payment request.
   */
  actionRequest: async (payload: ActionRequestPayload) => {
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const apiPayload = {
      authmethod: payload.auth_method,
      auth_method: payload.auth_method,
      credential: payload.credential,
      requestid: payload.request_id,
      request_id: payload.request_id,
      status: payload.status,
      request: payload,
    };

    const response = await apiClient.post(ENDPOINTS.TRANSFERS.ACTION_REQUEST, apiPayload, {
      headers: {
        'idempotency-key': idempotencyKey,
      },
    });
    return response.data;
  },

  /**
   * Create Transfer Request
   * Create a P2P payment request for another user to approve.
   */
  createRequest: async (payload: CreateTransferRequestPayload) => {
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const apiPayload = {
      amount: payload.amount,
      authmethod: payload.auth_method,
      auth_method: payload.auth_method,
      credential: payload.credential,
      currency: payload.currency,
      narration: payload.narration,
      payid: payload.pay_id,
      pay_id: payload.pay_id,
      request: payload, // keeping for backwards compatibility if the doc was right but validation is weird
    };

    const response = await apiClient.post(ENDPOINTS.TRANSFERS.CREATE_REQUEST, apiPayload, {
      headers: {
        'idempotency-key': idempotencyKey,
      },
    });
    return response.data;
  },

  /**
   * Get Transfer Requests
   * Get a history of all P2P payment requests (as requester or payer).
   */
  getRequests: async () => {
    const response = await apiClient.get(ENDPOINTS.TRANSFERS.REQUESTS);
    return response.data;
  },
};
