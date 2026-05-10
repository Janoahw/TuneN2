import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMyArtistProfile, useConnectStatus } from '@/hooks/useArtist';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamilies, spacing } from '@/theme';
import { useRouter } from 'expo-router';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ArtistDashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: artist } = useMyArtistProfile();
  const { data: connect } = useConnectStatus();
  const router = useRouter();

  const balance = artist?.wallet?.balance ?? 0;
  const initials = getInitials(user?.displayName || 'A');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Dashboard</Text>
          <Pressable onPress={() => router.push('/(creator)/edit-artist-profile')}>
            <LinearGradient
              colors={colors.gradientBrand as unknown as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerAvatar}
            >
              <Text style={styles.headerAvatarText}>{initials}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={colors.gradientBrand as unknown as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Feather name="credit-card" size={20} color="rgba(255,255,255,0.7)" />
          </View>
          <Text style={styles.balanceAmount}>
            $
            {balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          {connect?.payoutsEnabled && (
            <Pressable style={styles.withdrawButton}>
              <Feather name="chevron-right" size={14} color={colors.accentPrimary} />
              <Text style={styles.withdrawText}>Withdraw</Text>
            </Pressable>
          )}
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard value={artist?.songCount ?? 0} label="Songs" />
          <StatCard value={formatK(0)} label="Downloads" />
          <StatCard value={formatK(artist?.followerCount ?? 0)} label="Fans" />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.accentPrimary }]}
            onPress={() => router.push('/(creator)/upload-song')}
          >
            <Feather name="upload" size={20} color={colors.onPrimary} />
            <Text style={styles.actionText}>Upload Song</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.bgSecondary }]}
            onPress={() => router.push('/(creator)/my-songs')}
          >
            <Feather name="music" size={20} color={colors.textPrimary} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>My Songs</Text>
          </Pressable>
        </View>

        {/* Recent Sales */}
        <Text style={styles.sectionTitle}>Recent Sales</Text>
        <View style={styles.salesList}>
          {/* Placeholder — real data will come from analytics API */}
          <SaleItem title="No sales yet" subtitle="Upload a song to start earning" amount="" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{typeof value === 'number' ? value.toString() : value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SaleItem({
  title,
  subtitle,
  amount,
}: {
  title: string;
  subtitle: string;
  amount: string;
}) {
  return (
    <View style={styles.saleItem}>
      <View style={styles.saleIcon}>
        <Feather name="disc" size={20} color={colors.accentPrimary} />
      </View>
      <View style={styles.saleInfo}>
        <Text style={styles.saleTitle}>{title}</Text>
        <Text style={styles.saleSubtitle}>{subtitle}</Text>
      </View>
      {amount ? <Text style={styles.saleAmount}>{amount}</Text> : null}
    </View>
  );
}

function formatK(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: 24, paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    color: colors.onPrimary,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  balanceAmount: {
    fontFamily: fontFamilies.mono,
    fontSize: 36,
    color: colors.onPrimary,
    marginBottom: 16,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  withdrawText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 13,
    color: colors.onPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  statValue: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: colors.onPrimary,
  },
  salesList: { gap: 12, marginBottom: 24 },
  saleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  saleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  saleInfo: { flex: 1 },
  saleTitle: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  saleSubtitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  saleAmount: {
    fontFamily: fontFamilies.mono,
    fontSize: 15,
    color: colors.success,
  },
});
