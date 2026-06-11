import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useMyReports } from '@/hooks/useReports';
import { colors, fontFamilies, spacing } from '@/theme';
import type { ContentReport } from '@/services/report.service';

function ReportCard({ item }: { item: ContentReport }) {
  const statusColor =
    item.status === 'pending'
      ? colors.warning
      : item.status === 'resolved'
        ? colors.success
        : item.status === 'dismissed'
          ? colors.textTertiary
          : colors.textSecondary;

  const statusLabel =
    item.status === 'pending'
      ? 'Under Review'
      : item.status === 'resolved'
        ? 'Content Removed'
        : item.status === 'dismissed'
          ? 'No Action Taken'
          : 'Reviewed';

  return (
    <View style={styles.card}>
      {/* Song info */}
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.song.title}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {item.song.artist.artistName}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Report reason */}
      <View style={styles.reasonRow}>
        <Feather name="flag" size={14} color={colors.textTertiary} />
        <Text style={styles.reasonText}>
          {item.reason.charAt(0).toUpperCase() + item.reason.slice(1)}
        </Text>
      </View>

      {/* Submitted time */}
      <View style={styles.timeRow}>
        <Feather name="clock" size={14} color={colors.textTertiary} />
        <Text style={styles.timeText}>
          Submitted {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Description if provided */}
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </View>
  );
}

export default function MyReportsScreen() {
  const { data, isLoading, refetch, isRefetching } = useMyReports({ page: 1, limit: 50 });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Reports list */}
      <FlatList
        data={data?.reports || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: ContentReport }) => <ReportCard item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Feather name="shield" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptySubtitle}>
                Reports you submit for content violations will appear here
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accentPrimary}
          />
        }
      />
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
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  list: { padding: 16, gap: 10 },
  card: {
    padding: 16,
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLeft: { flex: 1, marginRight: 12 },
  songTitle: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 4,
  },
  artistName: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: '#9B9BA7',
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 12,
    fontWeight: '700',
  },
  reasonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reasonText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: '#9B9BA7',
    marginLeft: 8,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#4A4A5A',
    marginLeft: 8,
  },
  description: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: '#9B9BA7',
    marginTop: 10,
    fontStyle: 'italic',
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  emptySubtitle: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
    textAlign: 'center',
    maxWidth: '80%',
  },
});
