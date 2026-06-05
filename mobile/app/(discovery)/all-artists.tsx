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
import { colors, fontFamilies } from '@/theme';
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
      style={styles.artistCard}
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
        <View style={styles.nameRow}>
          <Text style={styles.artistName} numberOfLines={1}>{artist.artistName}</Text>
          {artist.isVerified && <Feather name="check-circle" size={14} color={colors.accentPrimary} />}
        </View>
        <Text style={styles.artistMeta} numberOfLines={1}>
          {formatFollowers(artist._count.follows)} followers
          {artist.genres.length > 0 ? ` · ${artist.genres[0]}` : ''}
        </Text>
      </View>
      <Pressable
        style={[styles.followBtn, following && styles.followBtnActive]}
        onPress={(e) => { e.stopPropagation(); setFollowing((v) => !v); }}
        hitSlop={8}
      >
        <Text style={[styles.followBtnLabel, following && styles.followBtnLabelActive]}>
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color="#F5F5F7" />
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
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ArtistListRow artist={item} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="users" size={40} color="#4A4A5A" />
              <Text style={styles.emptyText}>No artists yet</Text>
            </View>
          }
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E28',
  },
  headerTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F7',
  },

  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },

  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    height: 72,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  artistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.094)',
  },
  artistInitial: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    color: '#050506',
  },
  artistInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  artistName: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  artistMeta: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
    marginTop: 3,
  },

  followBtn: {
    paddingHorizontal: 14,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  followBtnLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#050506',
  },
  followBtnLabelActive: { color: colors.accentPrimary },

  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
  },
});
