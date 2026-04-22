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
import { useQuery } from '@tanstack/react-query';
import { colors, fontFamilies, fontSizes, spacing, radius } from '@/theme';
import { useArtistProfile } from '@/hooks/useArtist';
import { artistService } from '@/services/artist.service';

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

export default function ArtistProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [following, setFollowing] = useState(false);
  const { data: artist, isLoading: artistLoading } = useArtistProfile(id ?? '');

  const { data: songs, isLoading: songsLoading } = useQuery({
    queryKey: ['artist', id, 'songs'],
    queryFn: () => artistService.getArtistSongs(id!),
    enabled: !!id,
  });

  if (artistLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.accentPrimary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Artist not found</Text>
        </View>
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
        <View style={{ flex: 1 }} />
        <Pressable hitSlop={12}>
          <Feather name="more-horizontal" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {artist.profileImageUrl ? (
            <Image source={{ uri: artist.profileImageUrl }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={[colors.accentPrimary, colors.accentSecondary]}
              style={styles.avatar}
            >
              <Text style={styles.avatarInitial}>{artist.artistName.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          )}
          <Text style={styles.artistName}>{artist.artistName}</Text>
          {artist.bio && (
            <Text style={styles.artistBio} numberOfLines={2}>
              {artist.bio}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatFollowers(artist.followerCount)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{artist.songCount}</Text>
            <Text style={styles.statLabel}>Songs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{artist.releaseCount}</Text>
            <Text style={styles.statLabel}>Releases</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.followButton, following && styles.followingButton]}
            onPress={() => setFollowing((v) => !v)}
          >
            <Text style={[styles.followButtonText, following && styles.followingButtonText]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
          <Pressable style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>Subscribe $4.99/mo</Text>
          </Pressable>
        </View>

        {/* Songs */}
        <View style={styles.songsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Songs</Text>
            <Pressable>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>

          {songsLoading ? (
            <ActivityIndicator color={colors.accentPrimary} />
          ) : (
            (songs ?? []).map((song: any) => (
              <Pressable
                key={song.id}
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
                    {artist.artistName}
                  </Text>
                </View>
                <View style={styles.songMeta}>
                  <Text style={styles.songPrice}>{formatPrice(song.price, song.isFree)}</Text>
                  <Text style={styles.songDuration}>{formatDuration(song.durationSeconds)}</Text>
                </View>
              </Pressable>
            ))
          )}

          {!songsLoading && (songs ?? []).length === 0 && (
            <Text style={styles.emptyText}>No songs yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  loader: { flex: 1 },
  scroll: { paddingHorizontal: spacing[5], paddingBottom: spacing[10] },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },

  avatarContainer: { alignItems: 'center', paddingVertical: spacing[6], gap: spacing[3] },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes['2xl'],
    color: colors.onPrimary,
  },
  artistName: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  artistBio: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing[8],
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingVertical: spacing[5],
    marginBottom: spacing[5],
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderDefault,
  },

  actionRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[8],
  },
  followButton: {
    flex: 1,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.lg,
    paddingVertical: spacing[3] + 2,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  followButtonText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.base,
    color: colors.onPrimary,
  },
  followingButtonText: { color: colors.accentPrimary },
  subscribeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    borderRadius: radius.lg,
    paddingVertical: spacing[3] + 2,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.base,
    color: colors.accentPrimary,
  },

  songsSection: {},
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

  emptyState: { alignItems: 'center', paddingTop: spacing[10] },
  emptyText: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
});
