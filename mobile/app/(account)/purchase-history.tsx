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
import { colors, fontFamilies } from '@/theme';
import { useMyPurchases } from '@/hooks/usePurchase';
import type { PurchaseItem } from '@/services/purchase.service';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TransactionRow({ item }: { item: PurchaseItem }) {
  const artistLabel = item.song.artist?.user?.displayName ?? item.song.artist?.artistName ?? 'Unknown';
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/song-detail' as any, params: { id: item.songId } })}
    >
      {item.song.coverArtUrl ? (
        <Image source={{ uri: item.song.coverArtUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Feather name="music" size={16} color="#4A4A5A" />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.song.title}</Text>
        <Text style={styles.songMeta} numberOfLines={1}>{artistLabel} · {formatDate(item.createdAt)}</Text>
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color="#F5F5F7" />
        </Pressable>
        <Text style={styles.headerTitle}>Purchase History</Text>
        <View style={{ width: 22 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="shopping-bag" size={48} color="#4A4A5A" />
          <Text style={styles.emptyTitle}>No purchases yet</Text>
          <Text style={styles.emptySub}>Your transaction history will appear here</Text>
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
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingBottom: 80 },
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    height: 68,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  cover: { width: 46, height: 46, borderRadius: 12 },
  coverPlaceholder: {
    backgroundColor: '#191920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  songTitle: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 3,
  },
  songMeta: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
  },
  price: {
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
  },
  emptyTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    color: '#F5F5F7',
  },
  emptySub: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
    textAlign: 'center',
  },
});
