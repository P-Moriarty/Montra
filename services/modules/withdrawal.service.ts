import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface Bank {
  name: string;
  code: string;
}

export interface ResolveBankAccountPayload {
  accountnumber: string;
  bankcode: string;
}

export interface WithdrawalPayload {
  accountname: string;
  accountnumber: string;
  amount: number;
  authmethod: string;
  bankcode: string;
  bankname: string;
  credential: string;
  narration: string;
}

export const WithdrawalService = {
  listBanks: async (): Promise<Bank[]> => {
    const response = await apiClient.get(ENDPOINTS.WITHDRAWAL.LIST_BANKS);

    const rawBanks =
      response.data?.data || response.data?.banks || response.data || [];

    if (Array.isArray(rawBanks)) {
      return rawBanks.map((b: any) => {
        if (typeof b === 'string') {
          return { name: b, code: b };
        }

        return {
          name:
            b.name ||
            b.bank_name ||
            b.bankName ||
            b.bank_fullname ||
            b.fullName ||
            b.label ||
            'Unknown Bank',
          code: b.code || b.bank_code || b.bankCode || b.id || b.value || '',
        };
      });
    }

    return [];
  },

  resolveAccount: async (payload: ResolveBankAccountPayload) => {
    const cleanPayload = {
      accountnumber: payload.accountnumber.trim(),
      account_number: payload.accountnumber.trim(),
      bankcode: payload.bankcode.trim(),
      bank_code: payload.bankcode.trim(),
    };

    const response = await apiClient.post(
      ENDPOINTS.WITHDRAWAL.RESOLVE_ACCOUNT,
      cleanPayload
    );

    return response.data;
  },

  initiateWithdrawal: async (payload: WithdrawalPayload) => {
    const idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const cleanPayload = {
      accountname: payload.accountname.trim(),
      accountnumber: payload.accountnumber.trim(),
      amount: payload.amount,
      authmethod: payload.authmethod.trim(),
      bankcode: payload.bankcode.trim(),
      bankname: payload.bankname.trim(),
      credential: payload.credential.trim(),
      narration: payload.narration?.trim() || 'Withdrawal',

      account_name: payload.accountname.trim(),
      account_number: payload.accountnumber.trim(),
      auth_method: payload.authmethod.trim(),
      bank_code: payload.bankcode.trim(),
      bank_name: payload.bankname.trim(),
    };

    console.log(
      '[WithdrawalService] initiateWithdrawal payload:',
      JSON.stringify(cleanPayload, null, 2)
    );

    const response = await apiClient.post(
      ENDPOINTS.WITHDRAWAL.INITIATE,
      cleanPayload,
      {
        headers: {
          'idempotency-key': idempotencyKey,
        },
      }
    );

    return response.data;
  },
};
