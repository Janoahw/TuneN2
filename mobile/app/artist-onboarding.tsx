import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { artistService } from '@/services/artist.service';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamilies } from '@/theme';

const onboardingSchema = z.object({
  artistName: z.string().min(1, 'Artist name is required').max(100),
  bio: z.string().max(500).optional(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const GENRES = [
  { id: 1, name: 'Afrobeats' },
  { id: 2, name: 'Hip Hop' },
  { id: 3, name: 'R&B' },
  { id: 4, name: 'Pop' },
  { id: 5, name: 'Amapiano' },
  { id: 6, name: 'Gospel' },
  { id: 7, name: 'Highlife' },
  { id: 8, name: 'Reggae' },
  { id: 9, name: 'Electronic' },
  { id: 10, name: 'Jazz' },
];

export default function ArtistOnboardingScreen() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setError } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { artistName: '', bio: '' },
  });

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id].slice(0, 5),
    );
  };

  const onSubmit = async (values: OnboardingForm) => {
    if (selectedGenres.length === 0) {
      Alert.alert('Select a genre', 'Please select at least one genre');
      return;
    }

    setLoading(true);
    try {
      const result = await artistService.upgrade({
        artistName: values.artistName,
        bio: values.bio,
        genreIds: selectedGenres,
      });

      // Update auth store with artist status
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.setAuth(
          { ...authStore.user, isArtist: true },
          authStore.accessToken!,
          authStore.refreshToken!,
        );
      }

      router.push('/stripe-connect');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong';
      setError('root', { message });
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Feather name="arrow-left" size={20} color={colors.accentPrimary} />
            </Pressable>
            <Text style={styles.stepText}>Step 1 of 2</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Set Up Your{'\n'}Artist Profile</Text>
          <Text style={styles.subtitle}>
            Tell fans about yourself and your music.
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="artistName"
              label="Artist / Stage Name"
              placeholder="Search..."
              icon="search"
            />

            <ControlledInput
              control={control}
              name="bio"
              label="Bio"
              placeholder="Tell fans about your music journey..."
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />

            {/* Genre picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Primary Genre</Text>
              <View style={styles.genreGrid}>
                {GENRES.map((genre) => (
                  <Pressable
                    key={genre.id}
                    style={[
                      styles.genreChip,
                      selectedGenres.includes(genre.id) && styles.genreChipActive,
                    ]}
                    onPress={() => toggleGenre(genre.id)}
                  >
                    <Text
                      style={[
                        styles.genreChipText,
                        selectedGenres.includes(genre.id) && styles.genreChipTextActive,
                      ]}
                    >
                      {genre.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Profile photo placeholder */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Profile Photo</Text>
              <Pressable style={styles.photoUpload}>
                <Feather name="camera" size={20} color={colors.textTertiary} />
                <Text style={styles.photoUploadText}>Tap to upload</Text>
              </Pressable>
            </View>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* CTA */}
          <Button
            title="Next"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  stepText: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.bgSecondary,
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 2,
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  form: {
    gap: 18,
    marginBottom: 24,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.bgSecondary,
  },
  genreChipActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  genreChipText: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
  },
  genreChipTextActive: {
    color: '#FFFFFF',
  },
  photoUpload: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  photoUploadText: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textTertiary,
  },
});
