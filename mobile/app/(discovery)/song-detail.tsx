import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontFamilies, spacing, radius } from '@/theme';
import { useSong } from '@/hooks/useSong';
import { useOwnership, usePurchaseSong, useDownloadUrl } from '@/hooks/usePurchase';
import { useAuthStore } from '@/stores/authStore';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_SIZE = 280;

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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: owned, isLoading: ownershipLoading } = useOwnership(id!);
  const purchaseMutation = usePurchaseSong();
  const downloadMutation = useDownloadUrl();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

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

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login' as any);
      return;
    }
    try {
      const result = await purchaseMutation.mutateAsync(id!);
      if (result.purchased) {
        // Navigate to success screen
        router.push({
          pathname: '/purchase-confirm' as any,
          params: {
            songId: id,
            songTitle: result.songTitle,
            coverArtUrl: song?.coverArtUrl ?? '',
          },
        });
      } else if (result.clientSecret) {
        // In production, open Stripe PaymentSheet here with clientSecret
        // On payment success, navigate to success screen
        router.push({
          pathname: '/purchase-confirm' as any,
          params: {
            songId: id,
            songTitle: result.songTitle,
            coverArtUrl: song?.coverArtUrl ?? '',
          },
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Something went wrong';
      Alert.alert('Purchase Error', msg);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadProgress(0);
      const { downloadUrl, songTitle } = await downloadMutation.mutateAsync(id!);
      const fileUri =
        FileSystem.documentDirectory + `${songTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;

      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        {},
        (progress) => {
          const pct = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
          setDownloadProgress(pct);
        },
      );

      const result = await downloadResumable.downloadAsync();
      setDownloadProgress(null);
      if (result) {
        Alert.alert('Download Complete', `"${songTitle}" saved to your device.`);
      }
    } catch (err: any) {
      setDownloadProgress(null);
      const msg = err?.response?.data?.message || 'Download failed';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Song</Text>
        <Pressable hitSlop={12}>
          <Feather name="more-horizontal" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ height: spacing[4] }} />

        {/* Cover Art */}
        <View style={styles.coverWrapper}>
          {song.coverArtUrl ? (
            <Image source={{ uri: song.coverArtUrl }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Feather name="music" size={64} color={colors.textTertiary} />
            </View>
          )}
        </View>

        <View style={{ height: spacing[6] }} />

        {/* Song Info */}
        <View style={styles.infoSection}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.artistName}>{artistName}</Text>

          <View style={{ height: spacing[2] }} />

          {/* Meta Chips */}
          <View style={styles.chips}>
            {song.genre && <MetaChip label={song.genre.name} />}
            <MetaChip label={formatDuration(song.durationSeconds)} />
            <MetaChip label="1.2K downloads" />
          </View>

          <View style={{ height: spacing[6] }} />

          {/* Price Section */}
          <View style={styles.priceSection}>
            {owned ? (
              <View style={styles.ownedBadge}>
                <Feather name="check-circle" size={18} color={colors.success} />
                <Text style={styles.ownedText}>Purchased</Text>
              </View>
            ) : song.isFree ? (
              <Text style={styles.freeLabel}>Free</Text>
            ) : (
              <Text style={styles.price}>${song.price?.toFixed(2)}</Text>
            )}
          </View>

          <View style={{ height: spacing[6] }} />

          {/* Action Buttons - Stacked Vertically */}
          <View style={styles.actions}>
            {owned ? (
              <Pressable
                style={styles.buyBtn}
                onPress={handleDownload}
                disabled={downloadMutation.isPending || downloadProgress !== null}
              >
                {downloadProgress !== null ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.buyBtnText}>{Math.round(downloadProgress * 100)}%</Text>
                  </>
                ) : (
                  <>
                    <Feather name="download" size={18} color="#fff" />
                    <Text style={styles.buyBtnText}>Download</Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Pressable
                style={styles.buyBtn}
                onPress={handlePurchase}
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buyBtnText}>
                    {song.isFree ? 'Get Song' : `Buy Now — $${song.price?.toFixed(2)}`}
                  </Text>
                )}
              </Pressable>
            )}

            <Pressable style={styles.previewBtn}>
              <Feather name="play" size={16} color={colors.textPrimary} />
              <Text style={styles.previewBtnText}>Preview (30s)</Text>
            </Pressable>
          </View>

          {/* Download Progress Bar */}
          {downloadProgress !== null && (
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { width: `${Math.round(downloadProgress * 100)}%` }]}
              />
            </View>
          )}

          {/* Description */}
          {song.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionLabel}>About</Text>
              <Text style={styles.descriptionText}>{song.description}</Text>
            </View>
          ) : null}

          {/* Artist Info */}
          <View style={styles.artistSection}>
            <Pressable style={styles.artistCard}>
              {song.artist?.user?.avatarUrl ? (
                <Image source={{ uri: song.artist.user.avatarUrl }} style={styles.artistAvatar} />
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
  scroll: { paddingBottom: spacing[10] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: spacing[2],
  },
  topBarTitle: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },

  // Cover
  coverWrapper: {
    alignItems: 'center',
  },
  coverImage: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 16,
  },
  coverPlaceholder: {
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info
  infoSection: {
    paddingHorizontal: 20,
  },
  songTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  artistName: {
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Chips
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
    alignItems: 'center',
  },
  chip: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  chipText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Price Section
  priceSection: {
    alignItems: 'flex-start',
  },
  price: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 32,
    color: colors.accentPrimary,
  },
  freeLabel: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 32,
    color: colors.success,
  },

  // Actions (stacked vertically per design)
  actions: {
    gap: spacing[3],
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.md,
    height: 52,
    gap: spacing[2],
  },
  buyBtnText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.textTertiary,
    height: 44,
    gap: spacing[2],
  },
  previewBtnText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Owned Badge
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  ownedText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: colors.success,
  },

  // Description
  descriptionSection: {
    marginTop: spacing[6],
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
    marginTop: spacing[6],
    paddingTop: spacing[5],
  },
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing[3],
    gap: spacing[3],
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

  // Download
  progressContainer: {
    height: 4,
    backgroundColor: colors.bgSecondary,
    borderRadius: 2,
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 2,
  },
});
