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
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  list: { padding: 20, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    height: 68,
    paddingHorizontal: 14,
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
    fontFamily: fontFamilies.mono,
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  rowDate: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
    marginTop: 2,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 12,
    fontWeight: '700',
  },
  separator: { height: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
  },
});
