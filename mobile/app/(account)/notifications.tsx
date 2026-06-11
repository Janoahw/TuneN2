import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';
import { colors, fontFamilies } from '@/theme';
import type { Notification } from '@/services/notification.service';

function getIcon(type: string): React.ComponentProps<typeof Feather>['name'] {
  switch (type) {
    case 'new_release': return 'music';
    case 'purchase_success': return 'shopping-bag';
    case 'payout_processed': return 'dollar-sign';
    case 'report_action': return 'shield';
    case 'collaboration_request': return 'users';
    default: return 'bell';
  }
}

function NotificationItem({ item }: { item: Notification }) {
  const markRead = useMarkNotificationRead();

  const handlePress = () => {
    if (!item.isRead) markRead.mutate(item.id);
    if (item.data?.songId) router.push(`/(discovery)/song-detail?id=${item.data.songId}` as any);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, !item.isRead && styles.cardUnread, pressed && styles.pressed]}
      onPress={handlePress}
    >
      <View style={[styles.iconWrap, !item.isRead && styles.iconWrapUnread]}>
        <Feather name={getIcon(item.type)} size={20} color={item.isRead ? '#9B9BA7' : colors.accentPrimary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.body && <Text style={styles.cardBody}>{item.body}</Text>}
        <Text style={styles.cardTime}>
          {new Date(item.createdAt).toLocaleDateString()} at{' '}
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { data, isLoading, refetch, isRefetching } = useNotifications({ page: 1, limit: 50 });
  const markAllRead = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const allNotifications = data?.notifications || [];
  const displayed = filter === 'unread'
    ? allNotifications.filter((n: Notification) => !n.isRead)
    : allNotifications;
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color="#F5F5F7" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </Pressable>

        {unreadCount > 0 && (
          <Pressable
            style={[styles.filterChip, filter === 'unread' && styles.filterChipActive]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterChipText, filter === 'unread' && styles.filterChipTextActive]}>
              {unreadCount} unread
            </Text>
          </Pressable>
        )}

        {unreadCount > 0 && (
          <Pressable style={styles.filterChipPurple} onPress={() => markAllRead.mutate()}>
            <Text style={styles.filterChipPurpleText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Notification }) => <NotificationItem item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconPlate}>
                <Feather name="bell" size={36} color="#4A4A5A" />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === 'unread' ? 'All caught up' : 'No notifications yet'}
              </Text>
              <Text style={styles.emptySub}>
                {filter === 'unread'
                  ? 'No unread notifications'
                  : "You'll be notified about new music, purchases, and more"}
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accentPrimary} />
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
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F7',
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E28',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#191920',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  filterChipActive: {
    backgroundColor: 'rgba(0,204,204,0.149)',
    borderColor: colors.accentPrimary,
  },
  filterChipText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
  },
  filterChipTextActive: { color: colors.accentPrimary },
  filterChipPurple: {
    marginLeft: 'auto' as any,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(191,90,242,0.149)',
    borderWidth: 1,
    borderColor: '#BF5AF2',
  },
  filterChipPurpleText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#BF5AF2',
  },

  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    padding: 14,
    marginBottom: 8,
  },
  cardUnread: {
    backgroundColor: 'rgba(0,204,204,0.047)',
    borderColor: 'rgba(0,204,204,0.2)',
  },
  pressed: { opacity: 0.8 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#191920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnread: { backgroundColor: 'rgba(0,204,204,0.149)' },
  cardContent: { flex: 1 },
  cardTitle: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 4,
  },
  cardBody: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: '#9B9BA7',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 11,
    color: '#4A4A5A',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentPrimary,
    marginTop: 5,
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIconPlate: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#15151B',
    borderWidth: 1,
    borderColor: '#2C2C3A',
    alignItems: 'center',
    justifyContent: 'center',
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
    maxWidth: '80%',
    lineHeight: 20,
  },
});
