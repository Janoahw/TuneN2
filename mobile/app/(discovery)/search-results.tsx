import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { colors, fontFamilies } from '@/theme';
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
      style={styles.resultCard}
      onPress={() => router.push({ pathname: '/artist-profile', params: { id: artist.id } })}
    >
      {artist.profileImageUrl ? (
        <Image source={{ uri: artist.profileImageUrl }} style={styles.artistAvatar} />
      ) : (
        <LinearGradient colors={[colors.accentPrimary, colors.accentSecondary]} style={styles.artistAvatar}>
          <Text style={styles.artistInitial}>{artist.artistName.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{artist.artistName}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {artist._count.songs} songs · {formatFollowers(artist._count.follows)} followers
        </Text>
      </View>
      {artist.isVerified && <Feather name="check-circle" size={16} color={colors.accentPrimary} />}
    </Pressable>
  );
}

function SongRow({ song }: { song: SongDetail }) {
  return (
    <Pressable
      style={styles.resultCard}
      onPress={() => router.push({ pathname: '/song-detail', params: { id: song.id } })}
    >
      {song.coverArtUrl ? (
        <Image source={{ uri: song.coverArtUrl }} style={styles.songCover} />
      ) : (
        <LinearGradient colors={[colors.accentPrimary, colors.accentSecondary]} style={styles.songCover} />
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>{song.artist?.artistName}</Text>
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
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color="#F5F5F7" />
        </Pressable>
        <Text style={styles.queryText} numberOfLines={1}>"{q}"</Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterChipLabel, filter === f.key && styles.filterChipLabelActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.accentPrimary} style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Artists */}
          {filter !== 'songs' && data && data.artists.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Artists</Text>
              {data.artists.map((a: ArtistSummary) => (
                <ArtistRow key={a.id} artist={a} />
              ))}
            </View>
          )}

          {/* Songs */}
          {filter !== 'artists' && data && data.songs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Songs</Text>
              {data.songs.map((s: SongDetail) => (
                <SongRow key={s.id} song={s} />
              ))}
            </View>
          )}

          {/* Empty */}
          {data && data.artists.length === 0 && data.songs.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="search" size={40} color="#4A4A5A" />
              <Text style={styles.emptyText}>No results for "{q}"</Text>
              <Text style={styles.emptySub}>Try a different search term</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0F' },
  loader: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  queryText: {
    flex: 1,
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F7',
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    backgroundColor: '#191920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: 'rgba(0,204,204,0.149)',
    borderColor: colors.accentPrimary,
  },
  filterChipLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
  },
  filterChipLabelActive: {
    color: colors.accentPrimary,
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 100 },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 12,
  },

  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    height: 68,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  artistAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistInitial: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    color: '#050506',
  },
  songCover: {
    width: 46,
    height: 46,
    borderRadius: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 3,
  },
  cardSub: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
  },
  songMeta: { alignItems: 'flex-end', gap: 3 },
  songPrice: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    fontWeight: '700',
    color: '#FF9F0A',
  },
  songDuration: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: '#9B9BA7',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    color: '#F5F5F7',
  },
  emptySub: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
  },
});
