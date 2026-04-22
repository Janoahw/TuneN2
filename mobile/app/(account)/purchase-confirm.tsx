import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fontFamilies, spacing, radius } from '@/theme';

/**
 * Post-purchase success screen.
 * Shown after a successful payment/free download to confirm the purchase
 * and let the user play the song or go to their library.
 */
export default function PurchaseConfirmScreen() {
  const { songId, songTitle, coverArtUrl } = useLocalSearchParams<{
    songId: string;
    songTitle: string;
    coverArtUrl?: string;
  }>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <View style={{ height: spacing[6] }} />

        {/* Title */}
        <Text style={styles.title}>Purchase Complete!</Text>

        <View style={{ height: spacing[3] }} />

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {songTitle
            ? `"${songTitle}" has been added to your library`
            : 'Song has been added to your library'}
        </Text>

        <View style={{ height: spacing[6] }} />

        {/* Song Cover Preview */}
        {coverArtUrl ? (
          <Image source={{ uri: coverArtUrl }} style={styles.coverPreview} />
        ) : (
          <View style={[styles.coverPreview, styles.coverPlaceholder]}>
            <Text style={styles.coverIcon}>🎵</Text>
          </View>
        )}

        <View style={{ height: spacing[8] }} />

        {/* Play Now Button */}
        <Pressable
          style={styles.playBtn}
          onPress={() =>
            router.replace({ pathname: '/song-detail' as any, params: { id: songId } })
          }
        >
          <Text style={styles.playBtnText}>Play Now</Text>
        </Pressable>

        <View style={{ height: spacing[3] }} />

        {/* Go to Library Button */}
        <Pressable
          style={styles.libraryBtn}
          onPress={() => router.replace('/(tabs)/library' as any)}
        >
          <Text style={styles.libraryBtnText}>Go to Library</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // Success Icon
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Text
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Cover Preview
  coverPreview: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  coverPlaceholder: {
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverIcon: {
    fontSize: 48,
  },

  // Buttons
  playBtn: {
    width: 280,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  libraryBtn: {
    width: 280,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryBtnText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
