import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { WalletCard } from '@/components/ui/WalletCard';
import { useWallet, useWalletTransactions } from '@/hooks/useWallet';
import { colors, fontFamilies, spacing } from '@/theme';
import type { WalletTransaction } from '@/services/wallet.service';

function TransactionRow({ item }: { item: WalletTransaction }) {
  const isCredit = item.type !== 'withdrawal';
  const amount = parseFloat(item.netAmount);
  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const iconName = isCredit ? 'arrow-down-left' : 'arrow-up-right';
  const iconColor = isCredit ? colors.success : colors.error;
  const amountColor = isCredit ? colors.success : colors.error;
  const amountLabel = `${isCredit ? '+' : '-'}$${Math.abs(amount).toFixed(2)}`;

  const typeLabels: Record<string, string> = {
    song_sale: 'Song Sale',
    subscription_earning: 'Subscription',
    collaboration: 'Collaboration',
    withdrawal: 'Withdrawal',
  };

  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: `${iconColor}22` }]}>
        <Feather name={iconName as any} size={16} color={iconColor} />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{typeLabels[item.type] ?? item.type}</Text>
        <Text style={styles.txDate}>{date}</Text>
      </View>
      <Text style={[styles.txAmount, { color: amountColor }]}>{amountLabel}</Text>
    </View>
  );
}

export default function WalletScreen() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: txData, isLoading: txLoading } = useWalletTransactions(1);

  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const recentTx = txData?.transactions?.slice(0, 5) ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Wallet</Text>
          <Pressable style={styles.withdrawBtn} onPress={() => router.push('/withdrawal')}>
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </Pressable>
        </View>

        {/* Balance card */}
        {walletLoading ? (
          <ActivityIndicator color={colors.accentPrimary} style={{ marginVertical: spacing[6] }} />
        ) : (
          <WalletCard balance={balance} currency="$" style={styles.card} />
        )}

        {/* Pending balance */}
        <View style={styles.pendingCard}>
          <Feather name="clock" size={16} color={colors.textSecondary} />
          <View style={styles.pendingInfo}>
            <Text style={styles.pendingLabel}>Pending Balance</Text>
            <Text style={styles.pendingNote}>Clears in 7 days</Text>
          </View>
          <Text style={styles.pendingAmount}>$0.00</Text>
        </View>

        {/* Transactions section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <Pressable onPress={() => router.push('/withdrawal-history')}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        {txLoading ? (
          <ActivityIndicator color={colors.accentPrimary} style={{ marginTop: spacing[4] }} />
        ) : recentTx.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          <View style={styles.txList}>
            {recentTx.map((tx: WalletTransaction) => (
              <TransactionRow key={tx.id} item={tx} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginBottom: 20,
  },
  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  withdrawBtn: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 18,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawBtnText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#050506',
  },
  card: { marginBottom: 16 },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  pendingInfo: { flex: 1 },
  pendingLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  pendingNote: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
    marginTop: 2,
  },
  pendingAmount: {
    fontFamily: fontFamilies.mono,
    fontSize: 16,
    fontWeight: '700',
    color: '#9B9BA7',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  seeAll: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  txList: { gap: 8 },
  txRow: {
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
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txTitle: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  txDate: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
    marginTop: 2,
  },
  txAmount: {
    fontFamily: fontFamilies.mono,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
    textAlign: 'center',
    marginTop: 32,
  },
});
