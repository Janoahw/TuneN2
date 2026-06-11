import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { colors, fontFamilies } from '@/theme';
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

const HERO_HEIGHT = 220;

export default function ArtistProfileScreen() {
  const insets = useSafeAreaInsets();
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accentPrimary} style={styles.loader} />
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.container}>
        <View style={[styles.headerOverlay, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <View style={styles.headerBtn}>
              <Feather name="arrow-left" size={20} color="#F5F5F7" />
            </View>
          </Pressable>
          <View />
        </View>
        <View style={styles.emptyState}>
          <Feather name="user" size={40} color="#4A4A5A" />
          <Text style={styles.emptyText}>Artist not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Absolute header overlay — sits above scroll content */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} hitSlop={12} pointerEvents="auto">
          <View style={styles.headerBtn}>
            <Feather name="arrow-left" size={20} color="#F5F5F7" />
          </View>
        </Pressable>
        <Pressable hitSlop={12} pointerEvents="auto">
          <View style={styles.headerBtn}>
            <Feather name="more-horizontal" size={20} color="#F5F5F7" />
          </View>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero banner */}
        <View style={styles.hero}>
          {artist.profileImageUrl ? (
            <Image
              source={{ uri: artist.profileImageUrl }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              blurRadius={12}
            />
          ) : (
            <LinearGradient
              colors={[colors.accentPrimary, colors.accentSecondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          {/* gradient scrim: dark top (for header legibility) → clear → dark bottom */}
          <LinearGradient
            colors={['rgba(13,13,15,0.55)', 'rgba(13,13,15,0.0)', 'rgba(13,13,15,1)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>

        {/* Avatar overlapping the hero bottom */}
        <View style={styles.avatarSection}>
          {artist.profileImageUrl ? (
            <Image source={{ uri: artist.profileImageUrl }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={[colors.accentPrimary, colors.accentSecondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarInitial}>{artist.artistName.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          )}
          <Text style={styles.artistName}>{artist.artistName}</Text>
          {artist.isVerified && (
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={14} color={colors.accentPrimary} />
              <Text style={styles.verifiedLabel}>Verified Artist</Text>
            </View>
          )}
          {artist.bio && (
            <Text style={styles.artistBio} numberOfLines={3}>{artist.bio}</Text>
          )}
        </View>

        <View style={styles.body}>
          {/* Stats */}
          <View style={styles.statsCard}>
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

          {/* Actions */}
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.followBtn, following && styles.followBtnActive]}
              onPress={() => setFollowing((v) => !v)}
            >
              <Text style={[styles.followBtnLabel, following && styles.followBtnLabelActive]}>
                {following ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
            <Pressable style={styles.subscribeBtn}>
              <Text style={styles.subscribeBtnLabel}>Subscribe $4.99/mo</Text>
            </Pressable>
          </View>

          {/* Songs */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Songs</Text>
          </View>

          {songsLoading ? (
            <ActivityIndicator color={colors.accentPrimary} style={{ marginTop: 20 }} />
          ) : (songs ?? []).length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="music" size={32} color="#4A4A5A" />
              <Text style={styles.emptyText}>No songs yet</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {(songs ?? []).map((song: any) => (
                <Pressable
                  key={song.id}
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
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={styles.songMeta} numberOfLines={1}>{artist.artistName}</Text>
                  </View>
                  <View style={styles.songRight}>
                    <Text style={styles.songPrice}>{formatPrice(song.price, song.isFree)}</Text>
                    <Text style={styles.songDuration}>{formatDuration(song.durationSeconds)}</Text>
                  </View>
                  <Feather name="play-circle" size={22} color={colors.accentPrimary} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0F' },
  loader: { flex: 1 },

  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: {
    height: HERO_HEIGHT,
    backgroundColor: '#1A0030',
    overflow: 'hidden',
  },

  avatarSection: {
    alignItems: 'center',
    marginTop: -48,
    paddingBottom: 24,
    gap: 8,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F5F5F7',
  },
  avatarInitial: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 34,
    color: '#050506',
  },
  artistName: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 26,
    fontWeight: '700',
    color: '#F5F5F7',
    textAlign: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verifiedLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: colors.accentPrimary,
  },
  artistBio: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },

  body: { paddingHorizontal: 20 },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#15151B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    paddingVertical: 20,
    marginBottom: 18,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  statLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#2C2C3A',
    alignSelf: 'center',
  },

  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  followBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accentPrimary,
  },
  followBtnLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#050506',
  },
  followBtnLabelActive: { color: colors.accentPrimary },
  subscribeBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeBtnLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentPrimary,
  },

  sectionHeader: { marginBottom: 14 },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
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
  songMeta: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
  },
  songRight: { alignItems: 'flex-end', gap: 3, marginRight: 6 },
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

  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
  },
});
