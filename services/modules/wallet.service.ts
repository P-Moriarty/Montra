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

export const WalletService = {
    /**
     * Fetch Wallet Balance
     */
    
    getWalletBalance: async (): Promise<WalletResponse> => {
        const response = await apiClient.get(ENDPOINTS.WALLET_BALANCE);
        return response.data;
    },
}