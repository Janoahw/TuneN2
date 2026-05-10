import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontFamilies, spacing, radius } from '@/theme';
import { useDeleteSong } from '@/hooks/useSong';
import { useMySongsWithStats } from '@/hooks/useLibrary';
import type { SongWithStats } from '@/services/library.service';

const STATUS_TABS = [
  { key: undefined, label: 'All' },
  { key: 'active', label: 'Published' },
  { key: 'processing', label: 'Processing' },
  { key: 'rejected', label: 'Rejected' },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]['key'];

function StatusBadge({ status }: { status: string }) {
  const badgeColor =
    status === 'active'
      ? colors.success
      : status === 'processing'
        ? colors.gold
        : status === 'rejected'
          ? colors.error
          : colors.textTertiary;
  return (
    <View style={[styles.badge, { backgroundColor: `${badgeColor}20` }]}>
      <View style={[styles.badgeDot, { backgroundColor: badgeColor }]} />
      <Text style={[styles.badgeText, { color: badgeColor }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

function SongCard({
  song,
  onOptions,
}: {
  song: SongWithStats;
  onOptions: (song: SongWithStats) => void;
}) {
  return (
    <Pressable style={styles.songCard} onPress={() => router.push(`/song-detail?id=${song.id}`)}>
      {song.coverArtUrl ? (
        <Image source={{ uri: song.coverArtUrl }} style={styles.songCover} />
      ) : (
        <View style={[styles.songCover, styles.songCoverPlaceholder]}>
          <Feather name="music" size={20} color={colors.textTertiary} />
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <StatusBadge status={song.status} />
        <View style={styles.songMeta}>
          {song.isFree ? (
            <Text style={styles.songMetaText}>Free</Text>
          ) : (
            <Text style={styles.songMetaText}>${Number(song.price).toFixed(2)}</Text>
          )}
          <Text style={styles.songStatText}>
            <Feather name="download" size={10} color={colors.textTertiary} /> {song.totalDownloads}
          </Text>
          <Text style={styles.songStatText}>
            <Feather name="shopping-cart" size={10} color={colors.textTertiary} />{' '}
            {song.totalPurchases}
          </Text>
        </View>
        {song.totalRevenue > 0 && (
          <Text style={styles.revenueText}>${song.totalRevenue.toFixed(2)} earned</Text>
        )}
      </View>
      <Pressable style={styles.optionsBtn} onPress={() => onOptions(song)} hitSlop={12}>
        <Feather name="more-vertical" size={20} color={colors.textSecondary} />
      </Pressable>
    </Pressable>
  );
}

export default function SongManagementScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusTab>(undefined);
  const { data, isLoading, refetch, isRefetching } = useMySongsWithStats(statusFilter);
  const deleteSong = useDeleteSong();

  const songs = data?.items ?? [];

  const handleOptions = useCallback(
    (song: SongWithStats) => {
      Alert.alert(song.title, undefined, [
        {
          text: 'Edit',
          onPress: () => router.push(`/edit-song?id=${song.id}`),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete Song', `Are you sure you want to delete "${song.title}"?`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteSong.mutate(song.id),
              },
            ]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [deleteSong],
  );

  const renderSong = useCallback(
    ({ item }: { item: SongWithStats }) => <SongCard song={item} onOptions={handleOptions} />,
    [handleOptions],
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Songs</Text>
        <Pressable style={styles.uploadBtn} onPress={() => router.push('/upload-song')}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.uploadBtnText}>Upload</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <Pressable
              key={tab.label}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setStatusFilter(tab.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Song List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      ) : songs.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="music" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No songs yet</Text>
          <Pressable
            style={[styles.uploadBtn, { marginTop: spacing[4] }]}
            onPress={() => router.push('/upload-song')}
          >
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.uploadBtnText}>Upload Song</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSong}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing[2] }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  headerTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    gap: spacing[1],
  },
  uploadBtnText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  tab: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.bgSecondary,
  },
  tabActive: {
    backgroundColor: colors.accentPrimary,
  },
  tabText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // List
  list: { paddingHorizontal: spacing[4], paddingBottom: spacing[8] },

  // Song Card
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  songCover: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
  },
  songCoverPlaceholder: {
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
    marginBottom: 4,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: spacing[3],
  },
  songMetaText: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    color: colors.textSecondary,
  },
  songStatText: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: colors.textTertiary,
  },
  revenueText: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  optionsBtn: {
    padding: spacing[2],
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    gap: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 11,
  },

  // Empty / Loading
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing[3],
  },
});
