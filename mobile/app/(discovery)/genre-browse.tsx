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
import { colors, fontFamilies } from '@/theme';
import { useGenreDetail } from '@/hooks/useDiscover';
import type { ArtistSummary } from '@/services/discover.service';
import type { SongDetail } from '@/services/song.service';

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

function ArtistBubble({ artist }: { artist: ArtistSummary }) {
  return (
    <Pressable
      style={styles.bubbleItem}
      onPress={() => router.push({ pathname: '/artist-profile', params: { id: artist.id } })}
    >
      {artist.profileImageUrl ? (
        <Image source={{ uri: artist.profileImageUrl }} style={styles.bubbleImage} />
      ) : (
        <LinearGradient colors={[colors.accentPrimary, colors.accentSecondary]} style={styles.bubbleImage}>
          <Text style={styles.bubbleInitial}>{artist.artistName.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      )}
      <Text style={styles.bubbleName} numberOfLines={1}>{artist.artistName}</Text>
    </Pressable>
  );
}

function SongCard({ song }: { song: SongDetail }) {
  return (
    <Pressable
      style={styles.songCard}
      onPress={() => router.push({ pathname: '/song-detail', params: { id: song.id } })}
    >
      {song.coverArtUrl ? (
        <Image source={{ uri: song.coverArtUrl }} style={styles.songArt} />
      ) : (
        <LinearGradient colors={[colors.accentPrimary, colors.accentSecondary]} style={styles.songArt} />
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{song.artist.artistName}</Text>
      </View>
      <View style={styles.songMeta}>
        <Text style={styles.songPrice}>{formatPrice(song.price, song.isFree)}</Text>
        <Text style={styles.songDuration}>{formatDuration(song.durationSeconds)}</Text>
      </View>
      <Feather name="play-circle" size={22} color={colors.accentPrimary} />
    </Pressable>
  );
}

export default function GenreBrowseScreen() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name: string }>();
  const { data, isLoading } = useGenreDetail(slug ?? '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.accentPrimary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color="#F5F5F7" />
        </Pressable>
        <Text style={styles.headerTitle}>{name ?? data?.name}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <LinearGradient
          colors={[colors.accentPrimary, '#004D66']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>GENRE</Text>
          <Text style={styles.heroName}>{name ?? data?.name}</Text>
          {data && (
            <Text style={styles.heroStats}>
              {data.genre._count.songs} songs · {data.genre._count.artists ?? 0} artists
            </Text>
          )}
        </LinearGradient>

        {/* Top Artists */}
        {data?.topArtists && data.topArtists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Artists</Text>
            <FlatList<ArtistSummary>
              data={data.topArtists}
              keyExtractor={(a) => a.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bubbleRow}
              renderItem={({ item }) => <ArtistBubble artist={item} />}
            />
          </View>
        )}

        {/* Popular Songs */}
        {data?.popularSongs && data.popularSongs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Songs</Text>
            {data.popularSongs.map((s: SongDetail) => (
              <SongCard key={s.id} song={s} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0F' },
  loader: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F7',
  },

  heroCard: {
    borderRadius: 28,
    padding: 28,
    marginBottom: 28,
    minHeight: 140,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.094)',
  },
  heroLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heroName: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 32,
    fontWeight: '800',
    color: '#F5F5F7',
    marginBottom: 8,
    lineHeight: 36,
  },
  heroStats: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  section: { marginBottom: 28 },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 14,
  },

  bubbleRow: { gap: 16, paddingRight: 8 },
  bubbleItem: { width: 82, alignItems: 'center', gap: 8 },
  bubbleImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.094)',
  },
  bubbleInitial: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: '#050506',
  },
  bubbleName: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#F5F5F7',
    textAlign: 'center',
  },

  songCard: {
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
  songArt: { width: 46, height: 46, borderRadius: 12 },
  songInfo: { flex: 1 },
  songTitle: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 3,
  },
  songArtist: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
  },
  songMeta: { alignItems: 'flex-end', gap: 3, marginRight: 4 },
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
});
