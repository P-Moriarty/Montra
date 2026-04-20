import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Industrial-Grade Wallet Service
 * Manages all core financial data and transaction logic for the cockpit.
 */
export const WalletService = {
  /**
   * Fetches the current user's available balance across all accounts.
   */
  getBalance: async () => {
    const response = await apiClient.get(ENDPOINTS.WALLET.BALANCE);
    return response.data;
  },

  /**
   * Retrieves a paginated list of the user's transaction history.
   */
  getTransactions: async () => {
    const response = await apiClient.get(ENDPOINTS.WALLET.TRANSACTIONS);
    return response.data;
  },

  /**
   * Executes a high-fidelity transfer of funds.
   */
  transferFunds: async (transferData: any) => {
    const response = await apiClient.post(ENDPOINTS.WALLET.TRANSFER, transferData);
    return response.data;
  },

  /**
   * Sends a high-fidelity request for funds to another user.
   */
  requestFunds: async (requestData: any) => {
    const response = await apiClient.post(ENDPOINTS.WALLET.REQUEST_FUNDS, requestData);
    return response.data;
  },

  /**
   * Retrieves active virtual card data.
   */
  getCards: async () => {
    const response = await apiClient.get(ENDPOINTS.WALLET.CARDS);
    return response.data;
  }
};
