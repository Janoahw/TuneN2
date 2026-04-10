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
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfile, useUploadAvatar, useUserProfile } from '@/hooks/useUser';
import { colors, fontFamilies } from '@/theme';

const editProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100, 'Max 100 characters'),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileEditScreen() {
  const storeUser = useAuthStore((s) => s.user);
  const { data: profile } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const user = profile || storeUser;
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { displayName: user?.displayName || '' },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setLocalAvatarUri(uri);
      try {
        await uploadAvatar.mutateAsync(uri);
      } catch {
        Alert.alert('Error', 'Failed to upload avatar. Please try again.');
        setLocalAvatarUri(null);
      }
    }
  };

  const onSubmit = async (values: EditProfileForm) => {
    try {
      await updateProfile.mutateAsync({ displayName: values.displayName });
      // Update local auth store
      if (storeUser) {
        const { setAuth, accessToken, refreshToken } = useAuthStore.getState();
        if (accessToken && refreshToken) {
          setAuth({ ...storeUser, displayName: values.displayName }, accessToken, refreshToken);
        }
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const avatarUrl = localAvatarUri || (profile as any)?.avatarUrl;
  const initials = user?.displayName ? getInitials(user.displayName) : '?';

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
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.backButton} />
          </View>

          {/* Avatar */}
          <Pressable style={styles.avatarSection} onPress={pickImage}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={colors.gradientBrand as unknown as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
            <View style={styles.changePhotoOverlay}>
              <Feather name="camera" size={16} color={colors.onPrimary} />
            </View>
            <Text style={styles.changePhotoLabel}>Change Photo</Text>
          </Pressable>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="displayName"
              placeholder="Display name"
              icon="👤"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />

            <View style={{ height: 8 }} />

            <Button
              title="Save"
              onPress={handleSubmit(onSubmit)}
              loading={updateProfile.isPending}
            />
          </View>
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
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    color: colors.textPrimary,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.accentPrimary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 40,
    color: colors.onPrimary,
  },
  changePhotoOverlay: {
    position: 'absolute',
    top: 80,
    right: '50%',
    marginRight: -56,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.bgPrimary,
  },
  changePhotoLabel: {
    marginTop: 12,
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 14,
    color: colors.accentPrimary,
  },
  form: {
    marginBottom: 24,
  },
});
