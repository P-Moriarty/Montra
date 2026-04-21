import apiClient from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Industrial-Grade Profile Service
 * Manages all user-level profile and identity data feeds.
 */
export const ProfileService = {
  /**
   * Fetch the current user's full profile details.
   */
  getProfile: async () => {
    const response = await apiClient.get(ENDPOINTS.PROFILE);
    // Returning the user object directly from the response payload
    return response.data?.user;
  },
  /**
   * Update the current user's profile details.
   */
  updateProfile: async (data: any) => {
    const response = await apiClient.patch(ENDPOINTS.PROFILE_UPDATE, data);
    return response.data;
  },

  /**
   * Upload a new profile picture.
   */
  uploadAvatar: async (formData: FormData) => {
    const response = await apiClient.post(ENDPOINTS.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
