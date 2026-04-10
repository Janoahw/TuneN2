import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { artistService, type ArtistProfile, type UpgradeToArtistParams } from '@/services/artist.service';

export function useMyArtistProfile() {
  const isArtist = useAuthStore((s) => s.user?.isArtist);

  return useQuery<ArtistProfile>({
    queryKey: ['artist', 'me'],
    queryFn: () => artistService.getMyProfile(),
    enabled: !!isArtist,
  });
}

export function useArtistProfile(artistId: string) {
  return useQuery<ArtistProfile>({
    queryKey: ['artist', artistId],
    queryFn: () => artistService.getArtistProfile(artistId),
    enabled: !!artistId,
  });
}

export function useUpdateArtistProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Parameters<typeof artistService.updateProfile>[0]) =>
      artistService.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'me'] });
    },
  });
}

export function useSubscriptionStatus() {
  const isArtist = useAuthStore((s) => s.user?.isArtist);

  return useQuery({
    queryKey: ['artist', 'subscription'],
    queryFn: () => artistService.getSubscriptionStatus(),
    enabled: !!isArtist,
  });
}

export function useConnectStatus() {
  const isArtist = useAuthStore((s) => s.user?.isArtist);

  return useQuery({
    queryKey: ['artist', 'connect'],
    queryFn: () => artistService.getConnectStatus(),
    enabled: !!isArtist,
  });
}
