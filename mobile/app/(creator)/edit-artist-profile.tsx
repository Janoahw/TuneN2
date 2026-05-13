import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useMyArtistProfile, useUpdateArtistProfile } from '@/hooks/useArtist';
import { useGenres } from '@/hooks/useDiscover';
import { colors, fontFamilies, spacing } from '@/theme';

const editSchema = z.object({
  artistName: z.string().min(2, 'Artist name is required'),
  bio: z.string().max(500).optional(),
});

type FormData = z.infer<typeof editSchema>;

export default function EditArtistProfileScreen() {
  const { data: artist, isLoading: artistLoading } = useMyArtistProfile();
  const { data: allGenres, isLoading: genresLoading } = useGenres();
  const updateProfile = useUpdateArtistProfile();
  const [selectedGenres, setSelectedGenres] = useState<number[]>(artist?.genreIds ?? []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      artistName: artist?.artistName || '',
      bio: artist?.bio || '',
    },
  });

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId],
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      await updateProfile.mutateAsync({
        artistName: data.artistName,
        bio: data.bio,
        genreIds: selectedGenres,
      });
      Toast.show({
        type: 'success',
        text1: 'Profile updated',
        text2: 'Your changes have been saved.',
      });
      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.details?.[0]?.message ||
        err?.response?.data?.error?.message ||
        'Could not update profile. Please try again.';
      Toast.show({ type: 'error', text1: 'Update failed', text2: message });
    }
  };

  if (artistLoading || genresLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.heading}>Edit Artist Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Artist Name */}
        <ControlledInput
          control={control}
          name="artistName"
          label="Artist Name"
          placeholder="Your artist name"
          error={errors.artistName?.message}
        />

        {/* Bio */}
        <ControlledInput
          control={control}
          name="bio"
          label="Bio"
          placeholder="Tell fans about yourself..."
          multiline
          numberOfLines={4}
          style={{ height: 120, textAlignVertical: 'top' }}
          error={errors.bio?.message}
        />

        {/* Genre Picker */}
        <Text style={styles.label}>Genres</Text>
        <View style={styles.chipGrid}>
          {allGenres?.map((genre: { id: number; name: string }) => {
            const active = selectedGenres.includes(genre.id);
            return (
              <Pressable
                key={genre.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleGenre(genre.id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{genre.name}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Save */}
        <Button
          title="Save Changes"
          onPress={handleSubmit(onSubmit)}
          loading={updateProfile.isPending}
          style={{ marginTop: 32 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: 24, paddingBottom: 48 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: {
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  chipActive: {
    backgroundColor: colors.accentBgSubtle,
    borderColor: colors.accentPrimary,
  },
  chipText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.accentPrimary,
  },
});
