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
        renderItem={({ item }) => <ReportCard item={item} />}
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
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceElevated,
  },
  headerTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  list: {
    padding: spacing.md,
  },
  card: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  songTitle: {
    fontFamily: fontFamilies.uiSemibold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  artistName: {
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: fontFamilies.uiMedium,
    fontSize: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontFamily: fontFamilies.uiMedium,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  description: {
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontFamily: fontFamilies.displaySemibold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    maxWidth: '80%',
  },
});
