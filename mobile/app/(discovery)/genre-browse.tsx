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
import { colors, fontFamilies, fontSizes, spacing, radius } from '@/theme';
import { useGenreDetail } from '@/hooks/useDiscover';
import type { ArtistSummary } from '@/services/discover.service';
import type { Song } from '@/services/song.service';

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

function ArtistCircle({ artist }: { artist: ArtistSummary }) {
  return (
    <Pressable
      style={styles.artistCircleItem}
      onPress={() => router.push({ pathname: '/artist-profile', params: { id: artist.id } })}
    >
      {artist.profileImageUrl ? (
        <Image source={{ uri: artist.profileImageUrl }} style={styles.artistCircleImage} />
      ) : (
        <LinearGradient
          colors={[colors.accentPrimary, colors.accentSecondary]}
          style={styles.artistCircleImage}
        >
          <Text style={styles.artistCircleInitial}>
            {artist.artistName.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
      )}
      <Text style={styles.artistCircleName} numberOfLines={1}>
        {artist.artistName}
      </Text>
    </Pressable>
  );
}

function SongRow({ song }: { song: Song }) {
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
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{name ?? data?.name}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero card */}
        <LinearGradient
          colors={[colors.accentPrimary, '#008080']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroGenreName}>{name ?? data?.name}</Text>
          {data && (
            <Text style={styles.heroStats}>
              {data.genre._count.songs} songs • {data.genre._count.artists ?? 0} artists
            </Text>
          )}
        </LinearGradient>

        {/* Top Artists */}
        {data?.topArtists && data.topArtists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Artists</Text>
            <FlatList
              data={data.topArtists}
              keyExtractor={(a) => a.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistRow}
              renderItem={({ item }) => <ArtistCircle artist={item} />}
            />
          </View>
        )}

        {/* Popular Songs */}
        {data?.popularSongs && data.popularSongs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Songs</Text>
            {data.popularSongs.map((s) => (
              <SongRow key={s.id} song={s as unknown as Song} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  loader: { flex: 1 },
  scroll: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  headerTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },

  heroCard: {
    borderRadius: radius.xl,
    padding: spacing[8],
    marginBottom: spacing[8],
    justifyContent: 'flex-end',
    minHeight: 140,
  },
  heroGenreName: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes['3xl'] ?? 30,
    color: colors.onPrimary,
    marginBottom: spacing[2],
  },
  heroStats: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.85)',
  },

  section: { marginBottom: spacing[8] },
  sectionTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },

  artistRow: { gap: spacing[4], paddingRight: spacing[4] },
  artistCircleItem: { width: 80, alignItems: 'center', gap: spacing[2] },
  artistCircleImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistCircleInitial: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes.xl,
    color: colors.onPrimary,
  },
  artistCircleName: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.xs,
    color: colors.textPrimary,
    textAlign: 'center',
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
});
