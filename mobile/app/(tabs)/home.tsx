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
import { colors, fontFamilies, fontSizes } from '@/theme';
import { useDiscoverFeed } from '@/hooks/useDiscover';
import type { ArtistSummary } from '@/services/discover.service';
import type { SongDetail } from '@/services/song.service';
import { useAuthStore } from '@/stores/authStore';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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

function ArtistBubble({ artist }: { artist: ArtistSummary }) {
  return (
    <Pressable
      style={styles.bubbleItem}
      onPress={() => router.push({ pathname: '/artist-profile', params: { id: artist.id } })}
    >
      {artist.profileImageUrl ? (
        <Image source={{ uri: artist.profileImageUrl }} style={styles.bubbleImage} />
      ) : (
        <LinearGradient
          colors={[colors.accentPrimary, colors.accentSecondary]}
          style={styles.bubbleImage}
        >
          <Text style={styles.bubbleInitial}>{artist.artistName.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      )}
      <Text style={styles.bubbleName} numberOfLines={1}>{artist.artistName}</Text>
    </Pressable>
  );
}

function SongCard({ song }: { song: SongDetail & { _count?: { purchases: number } } }) {
  return (
    <Pressable
      style={styles.songCard}
      onPress={() => router.push({ pathname: '/song-detail', params: { id: song.id } })}
    >
      {song.coverArtUrl ? (
        <Image source={{ uri: song.coverArtUrl }} style={styles.songArt} />
      ) : (
        <LinearGradient
          colors={[colors.accentPrimary, colors.accentSecondary]}
          style={styles.songArt}
        />
      )}
      <View style={styles.songCardInfo}>
        <Text style={styles.songCardTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.songCardSub} numberOfLines={1}>
          {song.artist.artistName}
          {song.genres?.[0] ? ` · ${song.genres[0]}` : ''}
        </Text>
      </View>
      <Text style={styles.songCardPrice}>{formatPrice(song.price, song.isFree)}</Text>
      <Feather name="play-circle" size={22} color={colors.accentPrimary} />
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
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accentPrimary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}, {displayName}</Text>
            <Text style={styles.greetingSub}>Discover 30-second previews from rising artists</Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/search')} hitSlop={8}>
            <Feather name="search" size={22} color="#9B9BA7" />
          </Pressable>
        </View>

        {/* Preview Feed CTA */}
        <Pressable
          style={({ pressed }) => [styles.previewCta, pressed && styles.pressed]}
          onPress={() => router.push('/(discovery)/preview-feed')}
        >
          <Feather name="play" size={18} color="#050506" />
          <Text style={styles.previewCtaLabel}>Open Preview Feed</Text>
        </Pressable>

        {/* Feature Card */}
        <Pressable
          style={({ pressed }) => [styles.featureCard, pressed && styles.pressed]}
          onPress={() => router.push('/(discovery)/preview-feed')}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80' }}
            style={styles.featurePhoto}
            resizeMode="cover"
          />
          {/* dark scrim overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0.64)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.featureContent}>
            <View style={styles.featureLeft}>
              <Text style={styles.featureLabel}>DIRECT MARKETPLACE</Text>
              <Text style={styles.featureTitle}>Studio drops ready to own</Text>
              <Text style={styles.featureCopy}>Buy once, keep it, and every sale pays the creator.</Text>
            </View>
            {/* Record decoration */}
            <View style={styles.featureRecord}>
              <Feather name="play" size={22} color="#FFFFFF" />
            </View>
          </View>
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
              contentContainerStyle={styles.bubbleRow}
              renderItem={({ item }) => <ArtistBubble artist={item} />}
            />
          </View>
        )}

        {/* Top Performing */}
        {data?.topPerformingSongs && data.topPerformingSongs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Top Performing" />
            {data.topPerformingSongs.slice(0, 5).map((song) => (
              <SongCard key={song.id} song={song as any} />
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
              contentContainerStyle={styles.bubbleRow}
              renderItem={({ item }) => <ArtistBubble artist={item} />}
            />
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

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 18,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  greeting: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    fontWeight: '700',
    color: '#F5F5F7',
    lineHeight: 30,
  },
  greetingSub: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: '#9B9BA7',
    marginTop: 4,
    lineHeight: 18,
  },

  /* Preview CTA */
  previewCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    borderRadius: 24,
    height: 48,
    marginBottom: 18,
  },
  previewCtaLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#050506',
  },

  /* Feature Card */
  featureCard: {
    width: '100%',
    height: 176,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.094)',
  },
  featurePhoto: {
    ...StyleSheet.absoluteFillObject,
  },
  featureContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 22,
    paddingBottom: 20,
  },
  featureLeft: { flex: 1 },
  featureLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 11,
    fontWeight: '800',
    color: '#D8FFFF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  featureTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    fontWeight: '800',
    color: '#F5F5F7',
    lineHeight: 32,
    marginBottom: 8,
    width: 205,
  },
  featureCopy: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#E4F6F7',
    lineHeight: 18,
    width: 210,
  },
  featureRecord: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(5,5,6,0.72)',
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.333)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginBottom: 8,
  },

  /* Sections */
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  seeAll: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.sm,
    color: colors.accentPrimary,
  },

  /* Artist bubbles */
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

  /* Song cards */
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    height: 64,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  songArt: {
    width: 46,
    height: 46,
    borderRadius: 12,
  },
  songCardInfo: { flex: 1 },
  songCardTitle: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 3,
  },
  songCardSub: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
  },
  songCardPrice: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    fontWeight: '700',
    color: '#FF9F0A',
  },
  pressed: { opacity: 0.82 },
});
