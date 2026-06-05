import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontFamilies } from '@/theme';

export default function PurchaseConfirmScreen() {
  const { songId, songTitle, coverArtUrl } = useLocalSearchParams<{
    songId: string;
    songTitle: string;
    coverArtUrl?: string;
  }>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Success icon plate */}
        <View style={styles.iconPlate}>
          <Feather name="check" size={36} color={colors.success} />
        </View>

        <Text style={styles.title}>Purchase Complete!</Text>
        <Text style={styles.subtitle}>
          {songTitle ? `"${songTitle}" has been added to your library` : 'Song added to your library'}
        </Text>

        {/* Cover preview */}
        {coverArtUrl ? (
          <Image source={{ uri: coverArtUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Feather name="music" size={48} color="#4A4A5A" />
          </View>
        )}

        {/* Actions */}
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => router.replace({ pathname: '/song-detail' as any, params: { id: songId } })}
        >
          <Feather name="play" size={18} color="#050506" />
          <Text style={styles.primaryBtnLabel}>Play Now</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
          onPress={() => router.replace('/(tabs)/library' as any)}
        >
          <Text style={styles.ghostBtnLabel}>Go to Library</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 0,
  },
  iconPlate: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.success}20`,
    borderWidth: 1,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 26,
    fontWeight: '700',
    color: '#F5F5F7',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  cover: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.094)',
  },
  coverPlaceholder: {
    backgroundColor: '#15151B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: 280,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentPrimary,
    marginBottom: 12,
  },
  primaryBtnLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#050506',
  },
  ghostBtn: {
    width: 280,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 16,
    color: '#9B9BA7',
  },
  pressed: { opacity: 0.82 },
});
