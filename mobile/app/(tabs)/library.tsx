import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fontFamilies, spacing, radius } from '@/theme';
import { useLibrary } from '@/hooks/useLibrary';
import { useMyDownloads, useDownloadUrl } from '@/hooks/usePurchase';
import { useAuthStore } from '@/stores/authStore';
import { useState, useCallback } from 'react';
import type { LibraryItem } from '@/services/library.service';
import type { DownloadItem } from '@/services/purchase.service';

const FILTER_CHIPS = ['All', 'Songs', 'Albums', 'Artists', 'Playlists'] as const;

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function SongCard({
  song,
  price,
  onPress,
  onDownload,
}: {
  song: {
    id: string;
    title: string;
    coverArtUrl: string | null;
    durationSeconds?: number | null;
    price?: number | string | null;
    isFree?: boolean;
    artist: { artistName: string; user: { displayName: string } };
  };
  price?: number | string | null;
  onPress: () => void;
  onDownload?: () => void;
}) {
  const artistLabel = song.artist?.user?.displayName ?? song.artist?.artistName ?? 'Unknown';
  const displayPrice =
    price != null ? Number(price) : song.price != null ? Number(song.price) : null;
  return (
    <Pressable style={styles.songCard} onPress={onPress}>
      {song.coverArtUrl ? (
        <Image source={{ uri: song.coverArtUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Feather name="music" size={20} color={colors.textTertiary} />
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {artistLabel}
        </Text>
      </View>
      <View style={styles.priceCol}>
        {onDownload && (
          <Pressable onPress={onDownload} hitSlop={8} style={styles.downloadBtn}>
            <Feather name="download" size={18} color={colors.accentPrimary} />
          </Pressable>
        )}
        {displayPrice != null && displayPrice > 0 ? (
          <Text style={styles.priceText}>${displayPrice.toFixed(2)}</Text>
        ) : (
          <Text style={styles.freeText}>Free</Text>
        )}
        {song.durationSeconds != null && (
          <Text style={styles.duration}>{formatDuration(song.durationSeconds)}</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const libraryQuery = useLibrary();
  const downloadsQuery = useMyDownloads();
  const downloadUrl = useDownloadUrl();

  const handleDownload = useCallback(
    (songId: string) => {
      downloadUrl.mutate(songId);
    },
    [downloadUrl],
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.heading}>Library</Text>
            <Pressable hitSlop={12}>
              <Feather name="sliders" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.emptyState}>
            <Feather name="lock" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Sign in to see your library</Text>
            <Pressable style={styles.signInBtn} onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={styles.signInText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = libraryQuery.isLoading;
  const libraryItems = libraryQuery.data?.items ?? [];
  const downloadItems = downloadsQuery.data?.items ?? [];

  // Recently played = downloads (most recently accessed songs)
  const recentItems = downloadItems.slice(0, 5);
  const hasNoContent = libraryItems.length === 0 && recentItems.length === 0;

  const handleRefresh = () => {
    libraryQuery.refetch();
    downloadsQuery.refetch();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Library</Text>
        <Pressable hitSlop={12}>
          <Feather name="sliders" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {FILTER_CHIPS.map((chip) => (
          <Pressable
            key={chip}
            style={[styles.chip, activeFilter === chip && styles.chipActive]}
            onPress={() => setActiveFilter(chip)}
          >
            <Text style={[styles.chipText, activeFilter === chip && styles.chipTextActive]}>
              {chip}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      ) : hasNoContent ? (
        <View style={styles.emptyState}>
          <Feather name="headphones" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Your library is empty</Text>
          <Text style={styles.emptySubtitle}>Songs you purchase will appear here</Text>
          <Pressable style={styles.signInBtn} onPress={() => router.push('/(tabs)/search' as any)}>
            <Text style={styles.signInText}>Discover Music</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          refreshControl={
            <RefreshControl
              refreshing={libraryQuery.isRefetching || downloadsQuery.isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.accentPrimary}
            />
          }
          ListHeaderComponent={
            <>
              {/* Recently Played Section */}
              {recentItems.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>Recently Played</Text>
                  {recentItems.map((item: DownloadItem) => (
                    <SongCard
                      key={item.id}
                      song={item.song}
                      onDownload={() => handleDownload(item.songId)}
                      onPress={() =>
                        router.push({
                          pathname: '/song-detail' as any,
                          params: { id: item.songId },
                        })
                      }
                    />
                  ))}
                </>
              )}

              {/* Purchased Section */}
              <Text
                style={[styles.sectionHeader, recentItems.length > 0 && { paddingTop: spacing[4] }]}
              >
                My Songs
              </Text>
              {libraryItems.length === 0 ? (
                <View style={styles.emptySection}>
                  <Feather name="shopping-bag" size={40} color={colors.textTertiary} />
                  <Text style={styles.emptySectionText}>No purchases yet</Text>
                  <Text style={styles.emptySectionSub}>Songs you buy will show up here</Text>
                </View>
              ) : (
                libraryItems.map((item: LibraryItem) => (
                  <SongCard
                    key={item.id}
                    song={{
                      ...item,
                      artist: {
                        artistName: item.artist.artistName,
                        user: { displayName: item.artist.user.displayName },
                      },
                    }}
                    price={item.purchaseAmount}
                    onDownload={() => handleDownload(item.id)}
                    onPress={() =>
                      router.push({ pathname: '/song-detail' as any, params: { id: item.id } })
                    }
                  />
                ))
              )}
            </>
          }
          contentContainerStyle={{ paddingBottom: spacing[16] }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: spacing[2],
  },
  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
  },

  // Filter Chips
  chipScroll: {
    flexGrow: 0,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: 20,
    paddingVertical: spacing[3],
  },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 16,
    backgroundColor: colors.bgSecondary,
    alignSelf: 'center',
  },
  chipActive: {
    backgroundColor: colors.accentPrimary,
  },
  chipText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    fontFamily: fontFamilies.primarySemiBold,
    color: '#FFFFFF',
  },

  // Section Headers
  sectionHeader: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    paddingBottom: spacing[3],
  },

  // Song Card (matches pen: gFfP1 component)
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: spacing[2],
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
  },
  coverPlaceholder: {
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: {
    flex: 1,
    gap: 2,
  },
  songTitle: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  songArtist: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  downloadBtn: {
    padding: 4,
    marginBottom: 2,
  },
  priceText: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 13,
    color: colors.accentPrimary,
  },
  freeText: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 13,
    color: colors.success,
  },
  duration: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Empty States
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptySection: { alignItems: 'center', paddingVertical: spacing[8], paddingHorizontal: 20 },
  emptySectionText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing[3],
  },
  emptySectionSub: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  emptyTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  signInBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.md,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    marginTop: spacing[4],
  },
  signInText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
