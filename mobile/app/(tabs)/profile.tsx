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
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

function MenuItem({ icon, label, onPress, danger }: { icon: string; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrap}>
          <Feather name={icon as any} size={18} color={danger ? colors.error : '#9B9BA7'} />
        </View>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#4A4A5A" />
    </Pressable>
  );
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
          <Pressable onPress={() => router.push('/profile-edit')} style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={[colors.accentPrimary, colors.accentSecondary]}
                style={styles.avatar}
              >
                <Text style={styles.avatarInitial}>{initials}</Text>
              </LinearGradient>
            )}
            <View style={styles.avatarEditBadge}>
              <Feather name="edit-2" size={12} color="#F5F5F7" />
            </View>
          </Pressable>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
          <Pressable style={styles.editBtn} onPress={() => router.push('/profile-edit')}>
            <Feather name="edit-2" size={13} color={colors.accentPrimary} />
            <Text style={styles.editBtnLabel}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Artist Banner */}
        {storeUser?.isArtist ? (
          <Pressable style={styles.artistBanner} onPress={() => router.push('/artist-dashboard')}>
            <View style={styles.bannerLeft}>
              <View style={styles.bannerIcon}>
                <Feather name="music" size={20} color={colors.accentPrimary} />
              </View>
              <View>
                <Text style={styles.bannerTitle}>Artist Dashboard</Text>
                <Text style={styles.bannerSub}>Manage your music & earnings</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.accentPrimary} />
          </Pressable>
        ) : (
          <Pressable style={styles.artistBanner} onPress={() => router.push('/become-artist')}>
            <View style={styles.bannerLeft}>
              <View style={styles.bannerIcon}>
                <Feather name="star" size={20} color={colors.accentPrimary} />
              </View>
              <View>
                <Text style={styles.bannerTitle}>Become an Artist</Text>
                <Text style={styles.bannerSub}>Start sharing your music today</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.accentPrimary} />
          </Pressable>
        )}

        {/* Menu */}
        <View style={styles.menuSection}>
          <MenuItem icon="settings" label="Settings" onPress={() => router.push('/settings')} />
          {storeUser?.isArtist && (
            <MenuItem icon="edit-2" label="Edit Artist Profile" onPress={() => router.push('/edit-artist-profile')} />
          )}
          <MenuItem icon="credit-card" label="Payment Methods" onPress={() => {}} />
          <MenuItem icon="shopping-bag" label="Purchase History" onPress={() => router.push('/purchase-history')} />
          <MenuItem icon="bell" label="Notifications" onPress={() => router.push('/notifications')} />
          <MenuItem icon="help-circle" label="Help & Support" onPress={() => {}} />
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={colors.error} />
          <Text style={styles.logoutLabel}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },

  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F5F7',
    paddingTop: 16,
    marginBottom: 28,
  },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.094)',
  },
  avatarInitial: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 34,
    color: '#050506',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#191920',
    borderWidth: 1,
    borderColor: '#2C2C3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 4,
  },
  email: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
    marginBottom: 14,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  editBtnLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentPrimary,
  },

  artistBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,204,204,0.094)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    marginBottom: 20,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,204,204,0.149)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  bannerSub: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
    marginTop: 2,
  },

  menuSection: { gap: 8, marginBottom: 28 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    height: 60,
    paddingHorizontal: 16,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#191920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  menuLabelDanger: { color: colors.error },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: 'rgba(255,59,48,0.063)',
  },
  logoutLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
  },
});
