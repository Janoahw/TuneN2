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
const SONG_FILTER_OPTIONS = ['All Songs', 'Downloaded', 'Free', 'Paid'] as const;

type LibraryFilterChip = (typeof FILTER_CHIPS)[number];
type SongFilterOption = (typeof SONG_FILTER_OPTIONS)[number];

type ArtistListItem = {
  id: string;
  artistName: string;
  profileImageUrl: string | null;
  displayName: string;
  songCount: number;
};

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

function ArtistCard({ artist }: { artist: ArtistListItem }) {
  return (
    <Pressable
      style={styles.artistCard}
      onPress={() => router.push({ pathname: '/artist-profile' as any, params: { id: artist.id } })}
    >
      {artist.profileImageUrl ? (
        <Image source={{ uri: artist.profileImageUrl }} style={styles.artistAvatar} />
      ) : (
        <View style={[styles.artistAvatar, styles.artistAvatarPlaceholder]}>
          <Text style={styles.artistInitial}>{artist.artistName.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.artistInfoBlock}>
        <Text style={styles.artistCardName} numberOfLines={1}>
          {artist.artistName}
        </Text>
        <Text style={styles.artistCardMeta} numberOfLines={1}>
          {artist.displayName} · {artist.songCount} song{artist.songCount === 1 ? '' : 's'}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState<LibraryFilterChip>('All');
  const [songFilter, setSongFilter] = useState<SongFilterOption>('All Songs');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
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
            <Pressable
              style={styles.signInBtn}
              onPress={() => router.replace('/(auth)/login' as any)}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = libraryQuery.isLoading;
  const libraryItems: LibraryItem[] = libraryQuery.data?.items ?? [];
  const downloadItems: DownloadItem[] = downloadsQuery.data?.items ?? [];
  const downloadedSongIds = new Set(downloadItems.map((item: DownloadItem) => item.songId));

  const filteredLibraryItems = libraryItems.filter((item: LibraryItem) => {
    if (songFilter === 'Downloaded') return downloadedSongIds.has(item.id);
    if (songFilter === 'Free') return item.isFree;
    if (songFilter === 'Paid') return !item.isFree;
    return true;
  });

  const filteredRecentItems = downloadItems.filter((item: DownloadItem) => {
    if (songFilter === 'Free' || songFilter === 'Paid') return false;
    return true;
  });

  const recentItems = filteredRecentItems.slice(0, 5);

  const artistMap = new Map<string, ArtistListItem>();
  filteredLibraryItems.forEach((item: LibraryItem) => {
    const existingArtist = artistMap.get(item.artist.id);
    if (existingArtist) {
      existingArtist.songCount += 1;
      return;
    }

    artistMap.set(item.artist.id, {
      id: item.artist.id,
      artistName: item.artist.artistName,
      profileImageUrl: item.artist.profileImageUrl,
      displayName: item.artist.user.displayName,
      songCount: 1,
    });
  });
  const artistItems = Array.from(artistMap.values()).sort((left, right) =>
    left.artistName.localeCompare(right.artistName),
  );

  const hasAllContent = filteredLibraryItems.length === 0 && recentItems.length === 0;
  const hasSongsContent = filteredLibraryItems.length > 0;
  const hasArtistsContent = artistItems.length > 0;
  const supportsSongFiltering = activeFilter === 'All' || activeFilter === 'Songs';

  const handleRefresh = () => {
    libraryQuery.refetch();
    downloadsQuery.refetch();
  };

  const handleChipPress = (chip: LibraryFilterChip) => {
    setActiveFilter(chip);
    setShowFilterMenu(false);
  };

  const renderUnsupportedState = (title: string, subtitle: string) => (
    <View style={styles.emptyState}>
      <Feather name="sliders" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Library</Text>
        <View style={styles.headerActions}>
          <Pressable
            hitSlop={12}
            style={[
              styles.headerIconButton,
              supportsSongFiltering && showFilterMenu && styles.headerIconButtonActive,
            ]}
            onPress={() =>
              supportsSongFiltering && setShowFilterMenu((currentValue) => !currentValue)
            }
            disabled={!supportsSongFiltering}
          >
            <Feather
              name="sliders"
              size={22}
              color={supportsSongFiltering ? colors.textSecondary : colors.textTertiary}
            />
          </Pressable>
          {showFilterMenu && supportsSongFiltering ? (
            <View style={styles.filterMenu}>
              {SONG_FILTER_OPTIONS.map((option) => {
                const active = songFilter === option;
                return (
                  <Pressable
                    key={option}
                    style={[styles.filterMenuItem, active && styles.filterMenuItemActive]}
                    onPress={() => {
                      setSongFilter(option);
                      setShowFilterMenu(false);
                    }}
                  >
                    <Text style={[styles.filterMenuText, active && styles.filterMenuTextActive]}>
                      {option}
                    </Text>
                    {active ? (
                      <Feather name="check" size={14} color={colors.accentPrimary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
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
            onPress={() => handleChipPress(chip)}
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
      ) : activeFilter === 'Albums' ? (
        renderUnsupportedState(
          'No albums saved yet',
          'Album grouping is not connected to library data yet.',
        )
      ) : activeFilter === 'Playlists' ? (
        renderUnsupportedState(
          'No playlists yet',
          'Playlists are not connected in this library view yet.',
        )
      ) : activeFilter === 'Artists' ? (
        hasArtistsContent ? (
          <FlatList
            data={artistItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: ArtistListItem }) => <ArtistCard artist={item} />}
            contentContainerStyle={styles.artistList}
            refreshControl={
              <RefreshControl
                refreshing={libraryQuery.isRefetching || downloadsQuery.isRefetching}
                onRefresh={handleRefresh}
                tintColor={colors.accentPrimary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderUnsupportedState(
            'No artists yet',
            'Artists from your purchased songs will appear here.',
          )
        )
      ) : activeFilter === 'Songs' && !hasSongsContent ? (
        <View style={styles.emptyState}>
          <Feather name="music" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No songs match this filter</Text>
          <Text style={styles.emptySubtitle}>
            Try a different slider filter or browse more music.
          </Text>
        </View>
      ) : hasAllContent ? (
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
              {activeFilter === 'All' && recentItems.length > 0 && (
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
                style={[
                  styles.sectionHeader,
                  activeFilter === 'All' && recentItems.length > 0 && { paddingTop: spacing[4] },
                ]}
              >
                {activeFilter === 'Songs' ? 'Songs' : 'My Songs'}
              </Text>
              {filteredLibraryItems.length === 0 ? (
                <View style={styles.emptySection}>
                  <Feather name="shopping-bag" size={40} color={colors.textTertiary} />
                  <Text style={styles.emptySectionText}>No songs match this filter</Text>
                  <Text style={styles.emptySectionSub}>Try a different slider filter.</Text>
                </View>
              ) : (
                filteredLibraryItems.map((item: LibraryItem) => (
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
    zIndex: 5,
  },
  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerActions: {
    position: 'relative',
  },
  headerIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  headerIconButtonActive: {
    backgroundColor: colors.bgSecondary,
  },
  filterMenu: {
    position: 'absolute',
    right: 0,
    top: 42,
    minWidth: 160,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingVertical: spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
  },
  filterMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  filterMenuItemActive: {
    backgroundColor: colors.accentBgSubtle,
  },
  filterMenuText: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterMenuTextActive: {
    fontFamily: fontFamilies.primarySemiBold,
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
  artistList: {
    paddingHorizontal: 20,
    paddingBottom: spacing[16],
    gap: spacing[2],
  },
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    marginBottom: spacing[2],
  },
  artistAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  artistAvatarPlaceholder: {
    backgroundColor: colors.accentBgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistInitial: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    color: colors.accentPrimary,
  },
  artistInfoBlock: {
    flex: 1,
    gap: 2,
  },
  artistCardName: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  artistCardMeta: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
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
