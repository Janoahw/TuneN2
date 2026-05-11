import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { colors, fontFamilies, fontSizes, spacing, radius } from '@/theme';
import { useArtists } from '@/hooks/useDiscover';
import type { ArtistSummary } from '@/services/discover.service';

function formatFollowers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

function ArtistListRow({ artist }: { artist: ArtistSummary }) {
  const [following, setFollowing] = useState(false);

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
      <View style={styles.artistInfo}>
        <Text style={styles.artistName}>{artist.artistName}</Text>
        <Text style={styles.artistMeta}>
          {formatFollowers(artist._count.follows)} followers
          {artist.genres.length > 0 ? ` • ${artist.genres[0]}` : ''}
        </Text>
      </View>
      <Pressable
        style={[styles.followButton, following && styles.followingButton]}
        onPress={(e) => {
          e.stopPropagation();
          setFollowing((v) => !v);
        }}
      >
        <Text style={[styles.followButtonText, following && styles.followingButtonText]}>
          {following ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

export default function AllArtistsScreen() {
  const { data, isLoading } = useArtists();

  const artists: ArtistSummary[] = data?.items ?? [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Top Artists</Text>
        <View style={{ width: 22 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.accentPrimary} style={styles.loader} />
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list as any}
          renderItem={({ item }: { item: ArtistSummary }) => <ArtistListRow artist={item} />}
          ListFooterComponent={null}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="users" size={40} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No artists yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  loader: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },

  list: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },

  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  artistAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistInitial: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes.lg,
    color: colors.onPrimary,
  },
  artistInfo: { flex: 1 },
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

  followButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.accentPrimary,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  followButtonText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.sm,
    color: colors.onPrimary,
  },
  followingButtonText: { color: colors.accentPrimary },

  emptyState: {
    alignItems: 'center',
    paddingTop: spacing[16],
    gap: spacing[3],
  },
  emptyText: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
});
