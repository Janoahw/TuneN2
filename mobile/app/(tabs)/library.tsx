import { View, Text, StyleSheet, Pressable, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fontFamilies, spacing, radius } from '@/theme';
import { useMyPurchases, useMyDownloads } from '@/hooks/usePurchase';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import type { PurchaseItem, DownloadItem } from '@/services/purchase.service';

type Tab = 'purchases' | 'downloads';

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function SongRow({ song, onPress }: { song: { id: string; title: string; coverArtUrl: string | null; durationSeconds?: number | null; artist: { artistName: string; user: { displayName: string } } }; onPress: () => void }) {
  const artistLabel = song.artist?.user?.displayName ?? song.artist?.artistName ?? 'Unknown';
  return (
    <Pressable style={styles.songRow} onPress={onPress}>
      {song.coverArtUrl ? (
        <Image source={{ uri: song.coverArtUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Feather name="music" size={18} color={colors.textTertiary} />
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{artistLabel}</Text>
      </View>
      {song.durationSeconds != null && (
        <Text style={styles.duration}>{formatDuration(song.durationSeconds)}</Text>
      )}
    </Pressable>
  );
}

export default function LibraryScreen() {
  const [tab, setTab] = useState<Tab>('purchases');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const purchasesQuery = useMyPurchases();
  const downloadsQuery = useMyDownloads();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.heading}>Your Library</Text>
          <View style={styles.emptyState}>
            <Feather name="lock" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Sign in to see your library</Text>
            <Pressable style={styles.signInBtn} onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={styles.signInText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = tab === 'purchases' ? purchasesQuery.isLoading : downloadsQuery.isLoading;
  const purchaseItems = purchasesQuery.data?.items ?? [];
  const downloadItems = downloadsQuery.data?.items ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Your Library</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, tab === 'purchases' && styles.tabActive]}
            onPress={() => setTab('purchases')}
          >
            <Text style={[styles.tabText, tab === 'purchases' && styles.tabTextActive]}>
              Purchased
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'downloads' && styles.tabActive]}
            onPress={() => setTab('downloads')}
          >
            <Text style={[styles.tabText, tab === 'downloads' && styles.tabTextActive]}>
              Downloads
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.accentPrimary} />
          </View>
        ) : tab === 'purchases' ? (
          purchaseItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="shopping-bag" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No purchases yet</Text>
              <Text style={styles.emptySubtitle}>
                Songs you buy will show up here
              </Text>
            </View>
          ) : (
            <FlatList<PurchaseItem>
              data={purchaseItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SongRow
                  song={item.song}
                  onPress={() => router.push({ pathname: '/song-detail' as any, params: { id: item.songId } })}
                />
              )}
              contentContainerStyle={{ paddingBottom: spacing[8] }}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          downloadItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="download" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No downloads yet</Text>
              <Text style={styles.emptySubtitle}>
                Downloaded songs will appear here
              </Text>
            </View>
          ) : (
            <FlatList<DownloadItem>
              data={downloadItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SongRow
                  song={item.song}
                  onPress={() => router.push({ pathname: '/song-detail' as any, params: { id: item.songId } })}
                />
              )}
              contentContainerStyle={{ paddingBottom: spacing[8] }}
              showsVerticalScrollIndicator={false}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  content: { flex: 1, padding: 24 },
  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.bgSecondary,
  },
  tabActive: {
    backgroundColor: colors.accentPrimary,
  },
  tabText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Song Row
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  coverPlaceholder: {
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  songTitle: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  songArtist: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  duration: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: spacing[2],
  },

  // Empty
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  signInBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.md,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    marginTop: spacing[4],
  },
  signInText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
