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
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
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
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 34,
    gap: 5,
  },
  uploadBtnText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#050506',
  },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#191920',
    borderWidth: 1,
    borderColor: '#2C2C3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(0,204,204,0.149)',
    borderColor: colors.accentPrimary,
  },
  tabText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#9B9BA7',
  },
  tabTextActive: { color: colors.accentPrimary },

  list: { paddingHorizontal: 20, paddingBottom: 100 },

  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    padding: 12,
  },
  songCover: { width: 52, height: 52, borderRadius: 12 },
  songCoverPlaceholder: {
    backgroundColor: '#191920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: { flex: 1, marginLeft: 12 },
  songTitle: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 4,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  songMetaText: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    color: '#9B9BA7',
  },
  songStatText: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    color: '#4A4A5A',
  },
  revenueText: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
    marginTop: 2,
  },
  optionsBtn: { padding: 8 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 11,
    fontWeight: '700',
  },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
  },
});
