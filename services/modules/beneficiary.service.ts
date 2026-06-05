import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface CreateBeneficiaryPayload {
  account_name: string;
  bank_code: string;
  bank_name: string;
  currency: string;
  number: string;
  pay_id: string;
  type: "payid" | "bank";
}

/**
 * Beneficiary Service
 * Manages saved contacts for P2P and bank transfers.
 */
export const BeneficiaryService = {
  /**
   * Fetch all saved beneficiaries for the authenticated user.
   */
  getBeneficiaries: async () => {
    const response = await apiClient.get(ENDPOINTS.BENEFICIARIES.GET_ALL);
    return response.data;
  },

  /**
   * Create a new beneficiary for future transfers.
   */
  createBeneficiary: async (payload: CreateBeneficiaryPayload) => {
    const response = await apiClient.post(ENDPOINTS.BENEFICIARIES.CREATE, payload);
    return response.data;
  },

  /**
   * Remove a saved beneficiary by ID.
   */
  deleteBeneficiary: async (id: string) => {
    const response = await apiClient.delete(ENDPOINTS.BENEFICIARIES.DELETE(id));
    return response.data;
  },
};
