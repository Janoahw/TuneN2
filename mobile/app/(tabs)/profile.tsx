import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUser';
import { colors, fontFamilies } from '@/theme';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileScreen() {
  const storeUser = useAuthStore((s) => s.user);
  const { data: profile } = useUserProfile();
  const { logout } = useAuth();

  const user = profile || storeUser;
  const displayName = user?.displayName || 'User';
  const email = (user as any)?.email || storeUser?.email || '';
  const avatarUrl = (profile as any)?.avatarUrl;
  const initials = getInitials(displayName);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Profile</Text>

        {/* Avatar + Info */}
        <View style={styles.avatarSection}>
          <Pressable onPress={() => router.push('/profile-edit')}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={colors.gradientBrand as unknown as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            )}
          </Pressable>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
          <Pressable style={styles.editButton} onPress={() => router.push('/profile-edit')}>
            <Feather name="edit-2" size={14} color={colors.accentPrimary} />
            <Text style={styles.editLabel}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Artist Section */}
        {storeUser?.isArtist ? (
          <Pressable style={styles.artistBanner} onPress={() => router.push('/artist-dashboard')}>
            <View style={styles.artistBannerLeft}>
              <Feather name="music" size={20} color={colors.accentPrimary} />
              <View>
                <Text style={styles.artistBannerTitle}>Artist Dashboard</Text>
                <Text style={styles.artistBannerSub}>Manage your music & earnings</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.accentPrimary} />
          </Pressable>
        ) : (
          <Pressable style={styles.artistBanner} onPress={() => router.push('/become-artist')}>
            <View style={styles.artistBannerLeft}>
              <Feather name="star" size={20} color={colors.accentPrimary} />
              <View>
                <Text style={styles.artistBannerTitle}>Become an Artist</Text>
                <Text style={styles.artistBannerSub}>Start sharing your music today</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.accentPrimary} />
          </Pressable>
        )}

        {/* Menu */}
        <View style={styles.menu}>
          <MenuItem icon="settings" label="Settings" onPress={() => router.push('/settings')} />
          {storeUser?.isArtist && (
            <MenuItem icon="edit-2" label="Edit Artist Profile" onPress={() => router.push('/edit-artist-profile')} />
          )}
          <MenuItem icon="credit-card" label="Payment Methods" onPress={() => {}} />
          <MenuItem icon="bar-chart-2" label="Listening History" onPress={() => {}} />
          <MenuItem icon="help-circle" label="Help & Support" onPress={() => {}} />
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Feather name={icon as any} size={20} color={colors.textSecondary} />
        <Text style={styles.menuText}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: 24, paddingBottom: 48 },
  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: 32,
  },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 32,
    color: colors.onPrimary,
  },
  displayName: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  editLabel: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 13,
    color: colors.accentPrimary,
  },
  menu: { gap: 4 },
  artistBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accentBgSubtle,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    marginBottom: 16,
  },
  artistBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  artistBannerTitle: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: colors.accentPrimary,
  },
  artistBannerSub: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSecondary,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: colors.error,
  },
});
