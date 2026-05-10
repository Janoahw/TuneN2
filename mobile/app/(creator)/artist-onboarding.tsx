import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { artistService } from '@/services/artist.service';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { discoverService, type Genre } from '@/services/discover.service';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamilies } from '@/theme';

const onboardingSchema = z.object({
  artistName: z.string().min(1, 'Artist name is required').max(100),
  bio: z.string().max(500).optional(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function ArtistOnboardingScreen() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const genresQuery = useQuery({
    queryKey: ['genres'],
    queryFn: () => discoverService.getGenres(),
    staleTime: 10 * 60 * 1000,
  });

  const { control, handleSubmit, setError } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { artistName: '', bio: '' },
  });

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id].slice(0, 5),
    );
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({
        type: 'error',
        text1: 'Permission required',
        text2: 'Allow photo access to upload a profile picture.',
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    setProfileImageUri(result.assets[0].uri);
  };

  const onSubmit = async (values: OnboardingForm) => {
    if (selectedGenres.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Genre required',
        text2: 'Please select at least one genre.',
      });
      return;
    }

    setLoading(true);
    try {
      let profileImageUrl: string | undefined;

      // Upload profile image if one was picked
      if (profileImageUri) {
        setUploadingImage(true);
        const uploadData = await userService.getUploadUrl('avatar', 'image/jpeg');
        const response = await fetch(profileImageUri);
        const blob = await response.blob();
        await fetch(uploadData.uploadUrl, {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': 'image/jpeg' },
        });
        profileImageUrl = uploadData.avatarUrl;
        setUploadingImage(false);
      }

      await artistService.upgrade({
        artistName: values.artistName,
        bio: values.bio,
        genreIds: selectedGenres,
        profileImageUrl,
      });

      // Refresh tokens so the new access token carries isArtist=true.
      // The backend re-reads the DB on refresh, so the new pair will reflect
      // the artist role we just granted.
      const authStore = useAuthStore.getState();
      const newTokens = await authService.refresh(authStore.refreshToken!);
      await authStore.setAuth(
        { ...authStore.user!, isArtist: true },
        newTokens.accessToken,
        newTokens.refreshToken,
      );

      Toast.show({
        type: 'success',
        text1: 'Profile created!',
        text2: 'Now connect your payout account.',
      });
      router.push('/stripe-connect');
    } catch (err: any) {
      setUploadingImage(false);
      const message = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError('root', { message });
      Toast.show({ type: 'error', text1: 'Setup failed', text2: message });
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
          <Text style={styles.subtitle}>Tell fans about yourself and your music.</Text>

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
              <Text style={styles.label}>
                Primary Genre <Text style={styles.labelHint}>(up to 5)</Text>
              </Text>
              {genresQuery.isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.accentPrimary}
                  style={{ marginTop: 8 }}
                />
              ) : (
                <View style={styles.genreGrid}>
                  {(genresQuery.data ?? []).map((genre: Genre) => (
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
              )}
            </View>

            {/* Profile photo */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Profile Photo</Text>
              <Pressable
                style={styles.photoUpload}
                onPress={handlePickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={colors.accentPrimary} />
                ) : profileImageUri ? (
                  <Image source={{ uri: profileImageUri }} style={styles.photoPreview} />
                ) : (
                  <>
                    <Feather name="camera" size={20} color={colors.textTertiary} />
                    <Text style={styles.photoUploadText}>Tap to upload</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* CTA */}
          <Button title="Next" onPress={handleSubmit(onSubmit)} loading={loading} />
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
  labelHint: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    color: colors.textTertiary,
  },
  photoUpload: {
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  photoUploadText: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textTertiary,
  },
});
