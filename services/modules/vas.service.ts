import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * VAS Service Interface Definitions
 */
export interface AirtimePayload {
  amount: number;
  auth_method: string;
  credential: string;
  network: string;
  phone: string;
}

export interface CablePayload {
  auth_method: string;
  cable_type: string;
  code: string;
  credential: string;
  number: string;
}

export interface DataPayload {
  auth_method: string;
  code: string;
  credential: string;
  network: string;
  phone: string;
  serviceID: string;
}

export interface ElectricityPayload {
  amount: number;
  auth_method: string;
  credential: string;
  disco: string;
  meter_number: string;
  meter_type: string;
}

export interface VerifyCablePayload {
  cable_type: string;
  number: string;
}

export interface VerifyDiscoPayload {
  disco: string;
  number: string;
  type: string;
}

/**
 * Value Added Services (VAS) Management
 */
export const VasService = {
  /**
   * Utility for generating unique idempotency keys
   */
  generateIdempotencyKey: () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  },

  /**
   * Handle Airtime Purchase
   */
  purchaseAirtime: async (payload: AirtimePayload) => {
    const response = await apiClient.post(ENDPOINTS.VAS.AIRTIME_PURCHASE, payload, {
      headers: { 'idempotency-key': VasService.generateIdempotencyKey() }
    });
    return response.data;
  },

  /**
   * Handle Cable TV Subscription
   */
  purchaseCable: async (payload: CablePayload) => {
    const response = await apiClient.post(ENDPOINTS.VAS.CABLE_PURCHASE, payload, {
      headers: { 'idempotency-key': VasService.generateIdempotencyKey() }
    });
    return response.data;
  },

  /**
   * Handle Data Bundle Purchase
   */
  purchaseData: async (payload: DataPayload) => {
    const response = await apiClient.post(ENDPOINTS.VAS.DATA_PURCHASE, payload, {
      headers: { 'idempotency-key': VasService.generateIdempotencyKey() }
    });
    return response.data;
  },

  /**
   * Handle Electricity Payment
   */
  purchaseElectricity: async (payload: ElectricityPayload) => {
    const response = await apiClient.post(ENDPOINTS.VAS.ELECTRICITY_PURCHASE, payload, {
      headers: { 'idempotency-key': VasService.generateIdempotencyKey() }
    });
    return response.data;
  },

  /**
   * Verify Cable TV SmartCard/IUC Number
   */
  verifyCableNumber: async (payload: VerifyCablePayload) => {
    const response = await apiClient.post(ENDPOINTS.VAS.VERIFY_CABLE, payload);
    return response.data;
  },

  /**
   * Verify Electricity Meter Number
   */
  verifyDiscoNumber: async (payload: VerifyDiscoPayload) => {
    const response = await apiClient.post(ENDPOINTS.VAS.VERIFY_DISCO, payload);
    return response.data;
  },

  /**
   * Fetch Cable TV Plan Variations
   */
  getCableVariations: async (cable_type: string) => {
    const response = await apiClient.get(ENDPOINTS.VAS.CABLE_VARIATIONS, {
      params: { cable_type, serviceID: cable_type }
    });
    return response.data;
  },

  /**
   * Fetch Data Bundle Variations
   */
  getDataVariations: async (network: string, serviceID?: string) => {
    const response = await apiClient.get(ENDPOINTS.VAS.DATA_VARIATIONS, {
      params: { network, serviceID: serviceID || network }
    });
    return response.data;
  }
};
