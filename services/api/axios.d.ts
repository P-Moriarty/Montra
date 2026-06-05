import 'axios';

/**
 * Extends Axios request config with custom properties used by the API client interceptor.
 */
declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * If true, the request interceptor will skip attaching the Authorization token.
     * Use for public endpoints that don't require authentication (e.g., login, forgot-password).
     */
    skipAuth?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
  }
}
