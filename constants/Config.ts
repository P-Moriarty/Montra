/**
 * Engineering Cockpit Configuration Hub
 * Central repository for all industrial-grade constants and networking primitives.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.montra.com/v1'; // Staging Default

export const Config = {
  api: {
    baseUrl: API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  auth: {
    tokenKey: 'montra_session_token',
    refreshTokenKey: 'montra_refresh_token',
  },
  app: {
    name: 'Montra Cockpit',
    version: '1.0.0',
  }
};
