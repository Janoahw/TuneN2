import { api } from './api';
import { ENDPOINTS } from './endpoints';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  isArtist: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface SignupParams {
  email: string;
  password: string;
  displayName: string;
}

export interface SocialAuthParams {
  provider: 'google' | 'apple';
  idToken: string;
}

export const authService = {
  async login(params: LoginParams): Promise<AuthResponse> {
    const { data } = await api.post(ENDPOINTS.auth.login, params);
    return data.data;
  },

  async signup(params: SignupParams): Promise<AuthResponse> {
    const { data } = await api.post(ENDPOINTS.auth.signup, params);
    return data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post(ENDPOINTS.auth.logout, { refreshToken });
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await api.post(ENDPOINTS.auth.refresh, { refreshToken });
    return data.data.tokens;
  },

  async verifyEmail(token: string): Promise<{ user: AuthUser }> {
    const { data } = await api.post(ENDPOINTS.auth.verifyEmail, { token });
    return data.data;
  },

  async resendVerification(email: string): Promise<void> {
    await api.post(ENDPOINTS.auth.resendVerification, { email });
  },

  async socialAuth(params: SocialAuthParams): Promise<AuthResponse> {
    const { data } = await api.post(ENDPOINTS.auth.socialAuth, params);
    return data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post(ENDPOINTS.auth.forgotPassword, { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post(ENDPOINTS.auth.resetPassword, { token, password });
  },
};
