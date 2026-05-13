import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamilies, fontSizes, spacing, radius } from '@/theme';
import { useDiscoverFeed } from '@/hooks/useDiscover';
import type { ArtistSummary } from '@/services/discover.service';
import type { SongDetail } from '@/services/song.service';
import { useAuthStore } from '@/stores/authStore';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatPrice(price: string, isFree: boolean): string {
  if (isFree) return 'Free';
  return `$${parseFloat(price).toFixed(2)}`;
}

function formatFollowers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
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
      {artist.genres.length > 0 && (
        <Text style={styles.artistCircleGenre} numberOfLines={1}>
          {artist.genres[0]}
        </Text>
      )}
    </Pressable>
  );
}

function SongRow({ song }: { song: SongDetail & { _count?: { purchases: number } } }) {
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
        <Text style={styles.songRowTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songRowArtist} numberOfLines={1}>
          {song.artist.artistName}
        </Text>
      </View>
      <View style={styles.songRowMeta}>
        <Text style={styles.songPrice}>{formatPrice(song.price, song.isFree)}</Text>
        <Text style={styles.songDuration}>{formatDuration(song.durationSeconds)}</Text>
      </View>
    </Pressable>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, refetch, isRefetching } = useDiscoverFeed(10);

  const greeting = getGreeting();
  const displayName = user?.displayName?.split(' ')[0] ?? 'there';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.accentPrimary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accentPrimary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.displayName}>{displayName} 👋</Text>
          </View>
        </View>

        {/* Search bar shortcut */}
        <Pressable style={styles.searchBar} onPress={() => router.push('/(tabs)/search')}>
          <Feather name="search" size={18} color={colors.accentPrimary} />
          <Text style={styles.searchPlaceholder}>Artists, songs, genres…</Text>
        </Pressable>

        {/* New Artists */}
        {data?.newArtists && data.newArtists.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="New Artists" onSeeAll={() => router.push('/all-artists')} />
            <FlatList<ArtistSummary>
              data={data.newArtists}
              keyExtractor={(a) => a.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistRow}
              renderItem={({ item }: { item: ArtistSummary }) => <ArtistCircle artist={item} />}
            />
          </View>
        )}

        {/* Top Performing */}
        {data?.topPerformingSongs && data.topPerformingSongs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Top Performing" />
            {data.topPerformingSongs
              .slice(0, 5)
              .map((song: SongDetail & { _count?: { purchases: number } }) => (
                <SongRow key={song.id} song={song} />
              ))}
          </View>
        )}

        {/* Fastest Growing */}
        {data?.fastestGrowingArtists && data.fastestGrowingArtists.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Fastest Growing" onSeeAll={() => router.push('/all-artists')} />
            <FlatList<ArtistSummary>
              data={data.fastestGrowingArtists}
              keyExtractor={(a) => a.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistRow}
              renderItem={({ item }: { item: ArtistSummary }) => <ArtistCircle artist={item} />}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
  },
  greeting: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  displayName: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.borderDefault,
    marginBottom: spacing[6],
  },
  searchPlaceholder: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.base,
    color: colors.textTertiary,
  },

  section: { marginBottom: spacing[8] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.sm,
    color: colors.accentPrimary,
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
  artistCircleGenre: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
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
  songCover: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  songRowInfo: { flex: 1 },
  songRowTitle: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  songRowArtist: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  songRowMeta: { alignItems: 'flex-end' },
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
