import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useWithdrawals } from '@/hooks/useWallet';
import { colors, fontFamilies, spacing } from '@/theme';
import type { Withdrawal } from '@/services/wallet.service';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed', color: '#34C759', bg: '#34C75922' },
  pending: { label: 'Processing', color: '#FF9F0A', bg: '#FF9F0A22' },
  failed: { label: 'Failed', color: '#FF453A', bg: '#FF453A22' },
};

function WithdrawalRow({ item }: { item: Withdrawal }) {
  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
  const amount = (item.amountCents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const date = new Date(item.requestedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: `${colors.accentPrimary}22` }]}>
        <Feather name="arrow-up-right" size={16} color={colors.accentPrimary} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowAmount}>${amount}</Text>
        <Text style={styles.rowDate}>{date}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: status.bg }]}>
        <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
      </View>
    </View>
  );
}

export default function WithdrawalHistoryScreen() {
  const { data, isLoading } = useWithdrawals(1);
  const withdrawals = data?.withdrawals ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.heading}>Withdrawal History</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accentPrimary} style={{ marginTop: spacing[8] }} />
      ) : withdrawals.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="inbox" size={40} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No withdrawals yet</Text>
        </View>
      ) : (
        <FlatList<Withdrawal>
          data={withdrawals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Withdrawal }) => <WithdrawalRow item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heading: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  list: { padding: spacing[4] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1 },
  rowAmount: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  rowDate: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  emptyText: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
