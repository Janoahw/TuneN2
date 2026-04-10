import { api } from './api';
import { ENDPOINTS } from './endpoints';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  isArtist: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileParams {
  displayName?: string;
  avatarUrl?: string;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const { data } = await api.get(ENDPOINTS.users.me);
    return data.data.user;
  },

  async updateProfile(params: UpdateProfileParams): Promise<UserProfile> {
    const { data } = await api.patch(ENDPOINTS.users.me, params);
    return data.data.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post(ENDPOINTS.users.changePassword, { currentPassword, newPassword });
  },

  async getUploadUrl(
    type: 'avatar' | 'profile-banner',
    mimeType: string,
  ): Promise<{ uploadUrl: string; avatarUrl: string }> {
    const { data } = await api.post(ENDPOINTS.users.uploadUrl, { type, mimeType });
    return data.data;
  },
};
