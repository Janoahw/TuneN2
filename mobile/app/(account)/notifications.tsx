import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { colors, fontFamilies, spacing } from '@/theme';
import type { Notification } from '@/services/notification.service';

function NotificationItem({ item }: { item: Notification }) {
  const markRead = useMarkNotificationRead();

  const handlePress = () => {
    if (!item.isRead) {
      markRead.mutate(item.id);
    }

    // Navigate based on notification type
    if (item.data?.songId) {
      router.push(`/(discovery)/song-detail?id=${item.data.songId}` as any);
    }
  };

  const icon =
    item.type === 'new_release' ? 'music' :
    item.type === 'purchase_success' ? 'shopping-bag' :
    item.type === 'payout_processed' ? 'dollar-sign' :
    item.type === 'report_action' ? 'shield' :
    item.type === 'collaboration_request' ? 'users' :
    'bell';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.notificationCard,
        !item.isRead && styles.unread,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, !item.isRead && styles.iconUnread]}>
        <Feather name={icon} size={20} color={item.isRead ? colors.textSecondary : colors.accentPrimary} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {item.body && <Text style={styles.notificationBody}>{item.body}</Text>}
        <Text style={styles.notificationTime}>
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

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        {data && data.unreadCount > 0 ? (
          <Pressable onPress={() => markAllRead.mutate()} hitSlop={8}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Unread count */}
      {data && data.unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>{data.unreadCount} unread</Text>
        </View>
      )}

      {/* Notifications list */}
      <FlatList
        data={data?.notifications || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Feather name="bell" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                You'll be notified about new music, purchases, and more
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
  markAllRead: {
    fontFamily: fontFamilies.uiMedium,
    fontSize: 14,
    color: colors.accentPrimary,
  },
  unreadBanner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  unreadText: {
    fontFamily: fontFamilies.uiMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  unread: {
    backgroundColor: colors.surfaceElevated,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconUnread: {
    backgroundColor: `${colors.accentPrimary}20`,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: fontFamilies.uiSemibold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  notificationBody: {
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentPrimary,
    marginLeft: spacing.sm,
    marginTop: 6,
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
