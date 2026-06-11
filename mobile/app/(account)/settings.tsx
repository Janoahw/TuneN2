import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamilies } from '@/theme';

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress?: () => void;
  value?: string;
  danger?: boolean;
}

function SettingsRow({ icon, label, onPress, value, danger }: SettingsRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Feather name={icon} size={18} color={danger ? colors.error : '#9B9BA7'} />
        </View>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress ? <Feather name="chevron-right" size={18} color="#4A4A5A" /> : null}
      </View>
    </Pressable>
  );
}

type Section = 'account' | 'app' | 'danger';

export default function SettingsScreen() {
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('account');
  const { logout } = useAuth();
  const email = useAuthStore((s) => s.user?.email);

  const handleLogout = () => {
    if (!logoutConfirm) {
      setLogoutConfirm(true);
      Toast.show({ type: 'info', text1: 'Log out?', text2: 'Tap Log Out again to confirm.', visibilityTime: 5000 });
      return;
    }
    logout().then(() => {
      Toast.show({ type: 'success', text1: 'Logged out', text2: 'See you next time!' });
      router.replace('/');
    });
    setLogoutConfirm(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color="#F5F5F7" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Section filter tabs */}
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, activeSection === 'account' && styles.filterChipActive]}
          onPress={() => setActiveSection('account')}
        >
          <Text style={[styles.filterChipText, activeSection === 'account' && styles.filterChipTextActive]}>
            Account
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterChip, activeSection === 'app' && styles.filterChipActive]}
          onPress={() => setActiveSection('app')}
        >
          <Text style={[styles.filterChipText, activeSection === 'app' && styles.filterChipTextActive]}>
            App
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterChip, activeSection === 'danger' && styles.filterChipDanger]}
          onPress={() => setActiveSection('danger')}
        >
          <Text style={[styles.filterChipText, activeSection === 'danger' && styles.filterChipTextDanger]}>
            Danger Zone
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeSection === 'account' && (
          <View style={styles.card}>
            <SettingsRow icon="lock" label="Change Password" onPress={() => router.push('/change-password')} />
            <View style={styles.divider} />
            <SettingsRow icon="mail" label="Email" value={email || '—'} />
            <View style={styles.divider} />
            <SettingsRow icon="shopping-bag" label="Purchase History" onPress={() => router.push('/purchase-history' as any)} />
          </View>
        )}

        {activeSection === 'app' && (
          <View style={styles.card}>
            <SettingsRow icon="bell" label="Notifications" onPress={() => router.push('/notifications' as any)} />
            <View style={styles.divider} />
            <SettingsRow icon="info" label="About" value="1.0.0" />
          </View>
        )}

        {activeSection === 'danger' && (
          <View style={{ paddingTop: 8 }}>
            <Text style={styles.dangerHint}>
              This action will end your current session and require you to log in again.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.logoutBtn, pressed && styles.rowPressed]}
              onPress={handleLogout}
            >
              <Feather name="log-out" size={18} color={colors.error} />
              <Text style={styles.logoutLabel}>{logoutConfirm ? 'Confirm Log Out' : 'Log Out'}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
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
    paddingTop: 14,
    paddingBottom: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#191920',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  filterChipActive: {
    backgroundColor: 'rgba(0,204,204,0.149)',
    borderColor: colors.accentPrimary,
  },
  filterChipDanger: {
    backgroundColor: 'rgba(255,69,58,0.12)',
    borderColor: '#FF453A',
  },
  filterChipText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
  },
  filterChipTextActive: { color: colors.accentPrimary },
  filterChipTextDanger: { color: '#FF453A' },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },

  card: {
    backgroundColor: '#15151B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowPressed: { opacity: 0.7 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#191920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#F5F5F7',
  },
  rowLabelDanger: { color: colors.error },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowValue: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: '#9B9BA7',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E1E28',
    marginLeft: 62,
  },

  dangerHint: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
    lineHeight: 20,
    marginBottom: 20,
  },
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
