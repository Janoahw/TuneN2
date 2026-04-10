import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  authService,
  type LoginParams,
  type SignupParams,
  type SocialAuthParams,
} from '@/services/auth.service';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setTokens } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (params: LoginParams) => authService.login(params),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
    },
  });

  const signupMutation = useMutation({
    mutationFn: (params: SignupParams) => authService.signup(params),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
    },
  });

  const socialAuthMutation = useMutation({
    mutationFn: (params: SocialAuthParams) => authService.socialAuth(params),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
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
    } finally {
      clearAuth();
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
