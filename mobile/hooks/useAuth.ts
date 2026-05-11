import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  authService,
  type LoginParams,
  type SignupParams,
  type SocialAuthParams,
} from '@/services/auth.service';
import { DeviceService } from '@/services/device.service';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setTokens } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (params: LoginParams) => authService.login(params),
    onSuccess: async (data) => {
      await setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      // Register push token in the background
      DeviceService.registerCurrentDevice().catch((err) => {
        console.warn('Failed to register push token:', err);
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: (params: SignupParams) => authService.signup(params),
    onSuccess: async (data) => {
      await setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      // Register push token in the background
      DeviceService.registerCurrentDevice().catch((err) => {
        console.warn('Failed to register push token:', err);
      });
    },
  });

  const socialAuthMutation = useMutation({
    mutationFn: (params: SocialAuthParams) => authService.socialAuth(params),
    onSuccess: async (data) => {
      await setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      // Register push token in the background
      DeviceService.registerCurrentDevice().catch((err) => {
        console.warn('Failed to register push token:', err);
      });
    },
  });

  const login = (email: string, password: string) => loginMutation.mutateAsync({ email, password });

  const signup = (email: string, password: string, displayName: string) =>
    signupMutation.mutateAsync({ email, password, displayName });

  const logout = async () => {
    try {
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Always allow local signout even if backend logout fails.
    } finally {
      await clearAuth();
    }
  };

  const refreshAuth = async () => {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return;

    const tokens = await authService.refresh(refreshToken);
    setTokens(tokens.accessToken, tokens.refreshToken);
  };

  const socialLogin = (provider: 'google' | 'apple', idToken: string) =>
    socialAuthMutation.mutateAsync({ provider, idToken });

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    socialLogin,
    logout,
    refreshAuth,
    loginMutation,
    signupMutation,
    socialAuthMutation,
  };
}
