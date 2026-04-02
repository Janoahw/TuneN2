import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';

interface LoginInput {
  email: string;
  password: string;
}

interface SignupInput {
  email: string;
  password: string;
  displayName: string;
}

interface AuthResponse {
  user: { id: string; email: string; displayName: string; isArtist: boolean };
  accessToken: string;
  refreshToken: string;
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setTokens } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async ({ email, password, displayName }: SignupInput) => {
      const { data } = await api.post<AuthResponse>('/auth/signup', {
        displayName,
        email,
        password,
      });
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });

  const login = (email: string, password: string) => loginMutation.mutateAsync({ email, password });

  const signup = (email: string, password: string, displayName: string) =>
    signupMutation.mutateAsync({ email, password, displayName });

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
    }
  };

  const refreshAuth = async () => {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return;

    const { data } = await api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    );
    setTokens(data.accessToken, data.refreshToken);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refreshAuth,
    loginMutation,
    signupMutation,
  };
}
