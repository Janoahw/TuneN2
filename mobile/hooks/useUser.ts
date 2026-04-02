import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  isArtist: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export function useUserProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<UserProfile>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data } = await api.get<UserProfile>('/users/me');
      return data;
    },
    enabled: isAuthenticated,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { displayName?: string; avatarUrl?: string }) => {
      const { data } = await api.patch<UserProfile>('/users/me', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUri: string) => {
      // Step 1: Get presigned upload URL
      const { data: uploadData } = await api.post<{ uploadUrl: string; avatarUrl: string }>(
        '/users/me/upload-url',
      );

      // Step 2: Upload image to presigned URL
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'image/jpeg' },
      });

      // Step 3: Update user profile with new avatar URL
      const { data: user } = await api.patch<UserProfile>('/users/me', {
        avatarUrl: uploadData.avatarUrl,
      });

      return user;
    },
    onSuccess: () => {
      // Step 4: Invalidate user profile query
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
