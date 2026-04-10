import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontFamilies, spacing, radius } from '@/theme';
import { useMyPurchases } from '@/hooks/usePurchase';
import type { PurchaseItem } from '@/services/purchase.service';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TransactionRow({ item }: { item: PurchaseItem }) {
  const artistLabel =
    item.song.artist?.user?.displayName ?? item.song.artist?.artistName ?? 'Unknown';
  const dateStr = formatDate(item.createdAt);

  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push({ pathname: '/song-detail' as any, params: { id: item.songId } })}
    >
      {item.song.coverArtUrl ? (
        <Image source={{ uri: item.song.coverArtUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Feather name="music" size={16} color={colors.textTertiary} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.song.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {artistLabel} · {dateStr}
        </Text>
      </View>
      <Text style={styles.price}>-${Number(item.amount).toFixed(2)}</Text>
    </Pressable>
  );
}

export default function PurchaseHistoryScreen() {
  const { data, isLoading } = useMyPurchases();
  const items = data?.items ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Purchase History</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="shopping-bag" size={56} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No purchases yet</Text>
          <Text style={styles.emptySubtitle}>Your transaction history will appear here</Text>
        </View>
      ) : (
        <FlatList<PurchaseItem>
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionRow item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: spacing[2],
  },
  headerTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  list: {
    paddingTop: spacing[4],
  },

  // Transaction Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1A1A1F',
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  coverPlaceholder: {
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  songTitle: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    color: colors.textSecondary,
  },
  price: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: colors.error,
  },

  // Empty
  emptyTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing[4],
  },
  emptySubtitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing[2],
  },
});
