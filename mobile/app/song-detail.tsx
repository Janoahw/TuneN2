import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamilies, spacing, radius } from '@/theme';
import { useSong } from '@/hooks/useSong';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_SIZE = SCREEN_WIDTH - spacing[4] * 2;

function MetaChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: song, isLoading } = useSong(id!);

  if (isLoading || !song) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  const artistName = song.artist?.user?.displayName ?? song.artist?.artistName ?? 'Unknown Artist';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back Button (absolute over cover) */}
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>

        {/* Cover Art */}
        <View style={styles.coverContainer}>
          {song.coverArtUrl ? (
            <Image source={{ uri: song.coverArtUrl }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Feather name="music" size={64} color={colors.textTertiary} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', colors.bgPrimary]}
            style={styles.coverGradient}
          />
        </View>

        {/* Song Info */}
        <View style={styles.infoSection}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.artistName}>{artistName}</Text>

          {/* Meta Chips */}
          <View style={styles.chips}>
            {song.genre && <MetaChip label={song.genre.name} />}
            <MetaChip label={formatDuration(song.durationSeconds)} />
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            {song.isFree ? (
              <Text style={styles.freeLabel}>Free</Text>
            ) : (
              <Text style={styles.price}>${song.price?.toFixed(2)}</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.buyBtn}>
              <Feather name="shopping-cart" size={18} color="#fff" />
              <Text style={styles.buyBtnText}>
                {song.isFree ? 'Get Song' : 'Buy Now'}
              </Text>
            </Pressable>
            <Pressable style={styles.previewBtn}>
              <Feather name="play" size={18} color={colors.accentPrimary} />
              <Text style={styles.previewBtnText}>Preview (30s)</Text>
            </Pressable>
          </View>

          {/* Description */}
          {song.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionLabel}>About</Text>
              <Text style={styles.descriptionText}>{song.description}</Text>
            </View>
          ) : null}

          {/* Artist Info */}
          <View style={styles.artistSection}>
            <Text style={styles.sectionLabel}>Artist</Text>
            <Pressable style={styles.artistCard}>
              {song.artist?.user?.avatarUrl ? (
                <Image
                  source={{ uri: song.artist.user.avatarUrl }}
                  style={styles.artistAvatar}
                />
              ) : (
                <View style={[styles.artistAvatar, styles.artistAvatarPlaceholder]}>
                  <Feather name="user" size={18} color={colors.textTertiary} />
                </View>
              )}
              <View style={styles.artistCardInfo}>
                <Text style={styles.artistCardName}>{artistName}</Text>
                {song.artist?.bio ? (
                  <Text style={styles.artistCardBio} numberOfLines={2}>
                    {song.artist.bio}
                  </Text>
                ) : null}
              </View>
              <Feather name="chevron-right" size={18} color={colors.textTertiary} />
            </Pressable>
          </View>
        </View>

        <View style={{ height: spacing[10] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { paddingBottom: spacing[8] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Back
  backBtn: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[4],
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: radius.full,
    padding: spacing[2],
  },

  // Cover
  coverContainer: {
    width: SCREEN_WIDTH,
    height: COVER_SIZE,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },

  // Info
  infoSection: {
    paddingHorizontal: spacing[4],
    marginTop: -spacing[6],
  },
  songTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  artistName: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },

  // Chips
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  chip: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  chipText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Price
  priceRow: {
    marginBottom: spacing[4],
  },
  price: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  freeLabel: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 20,
    color: colors.success,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  buyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  buyBtnText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.accentPrimary,
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  previewBtnText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: colors.accentPrimary,
  },

  // Description
  descriptionSection: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
  descriptionText: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Artist Section
  artistSection: {
    marginBottom: spacing[4],
  },
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  artistAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  artistAvatarPlaceholder: {
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistCardInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  artistCardName: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  artistCardBio: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
