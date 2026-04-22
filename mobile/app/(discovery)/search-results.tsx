import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { colors, fontFamilies, fontSizes, spacing, radius } from '@/theme';
import { useSearch } from '@/hooks/useSearch';
import type { ArtistSummary } from '@/services/discover.service';
import type { SongDetail } from '@/services/song.service';

type FilterType = 'all' | 'artists' | 'songs';

function formatFollowers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

function formatPrice(price: string, isFree: boolean): string {
  if (isFree) return 'Free';
  return `$${parseFloat(price).toFixed(2)}`;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ArtistRow({ artist }: { artist: ArtistSummary }) {
  return (
    <Pressable
      style={styles.artistRow}
      onPress={() => router.push({ pathname: '/artist-profile', params: { id: artist.id } })}
    >
      {artist.profileImageUrl ? (
        <Image source={{ uri: artist.profileImageUrl }} style={styles.artistAvatar} />
      ) : (
        <LinearGradient
          colors={[colors.accentPrimary, colors.accentSecondary]}
          style={styles.artistAvatar}
        >
          <Text style={styles.artistInitial}>{artist.artistName.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      )}
      <View style={styles.artistRowInfo}>
        <Text style={styles.artistName}>{artist.artistName}</Text>
        <Text style={styles.artistMeta}>
          {artist._count.songs} songs • {formatFollowers(artist._count.follows)} followers
        </Text>
      </View>
      {artist.isVerified && <Feather name="check-circle" size={16} color={colors.accentPrimary} />}
    </Pressable>
  );
}

function SongRow({ song }: { song: SongDetail }) {
  return (
    <Pressable
      style={styles.songRow}
      onPress={() => router.push({ pathname: '/song-detail', params: { id: song.id } })}
    >
      {song.coverArtUrl ? (
        <Image source={{ uri: song.coverArtUrl }} style={styles.songCover} />
      ) : (
        <LinearGradient
          colors={[colors.accentPrimary, colors.accentSecondary]}
          style={styles.songCover}
        />
      )}
      <View style={styles.songRowInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {song.artist?.artistName}
        </Text>
      </View>
      <View style={styles.songMeta}>
        <Text style={styles.songPrice}>{formatPrice(song.price, song.isFree)}</Text>
        <Text style={styles.songDuration}>{formatDuration(song.durationSeconds)}</Text>
      </View>
    </Pressable>
  );
}

export default function SearchResultsScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data, isLoading } = useSearch(q ?? '', filter);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'artists', label: 'Artists' },
    { key: 'songs', label: 'Songs' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.queryText} numberOfLines={1}>
          "{q}"
        </Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.accentPrimary}
          style={{ marginTop: spacing[10] }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Artists section */}
          {filter !== 'songs' && data && data.artists.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Artists</Text>
              {data.artists.map((a) => (
                <ArtistRow key={a.id} artist={a} />
              ))}
            </View>
          )}

          {/* Songs section */}
          {filter !== 'artists' && data && data.songs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Songs</Text>
              {data.songs.map((s) => (
                <SongRow key={s.id} song={s as SongDetail} />
              ))}
            </View>
          )}

          {/* Empty state */}
          {!isLoading && data && data.artists.length === 0 && data.songs.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="search" size={40} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No results for "{q}"</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  backButton: {},
  queryText: {
    flex: 1,
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  filterTab: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  filterTabActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  filterLabel: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  filterLabelActive: { color: colors.onPrimary },

  section: { marginBottom: spacing[6] },
  sectionTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },

  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  artistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistInitial: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes.md,
    color: colors.onPrimary,
  },
  artistRowInfo: { flex: 1 },
  artistName: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  artistMeta: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  songCover: { width: 48, height: 48, borderRadius: radius.sm },
  songRowInfo: { flex: 1 },
  songTitle: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  songArtist: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  songMeta: { alignItems: 'flex-end' },
  songPrice: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: fontSizes.sm,
    color: colors.accentPrimary,
  },
  songDuration: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: spacing[16],
    gap: spacing[3],
  },
  emptyText: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
});
