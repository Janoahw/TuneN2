import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { userService, type UserProfile } from '@/services/user.service';

export function useUserProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<UserProfile>({
    queryKey: ['user', 'me'],
    queryFn: () => userService.getProfile(),
    enabled: isAuthenticated,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { displayName?: string; avatarUrl?: string }) =>
      userService.updateProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUri: string) => {
      const uploadData = await userService.getUploadUrl('avatar', 'image/jpeg');

      const response = await fetch(imageUri);
      const blob = await response.blob();
      await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'image/jpeg' },
      });

      return userService.updateProfile({ avatarUrl: uploadData.avatarUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
