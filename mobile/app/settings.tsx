import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

interface SettingsRowProps {
  icon: string;
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
        <Text style={styles.rowIcon}>{icon}</Text>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {onPress && <Text style={styles.chevron}>›</Text>}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { logout } = useAuth();
  const email = useAuthStore((s) => s.user?.email);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.backButton} />
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="🔑"
            label="Change Password"
            onPress={() => router.push('/change-password')}
          />
          <View style={styles.separator} />
          <SettingsRow icon="✉️" label="Email" value={email || '—'} />
        </View>

        {/* App Section */}
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.card}>
          <SettingsRow icon="🔔" label="Notifications" onPress={() => {}} />
          <View style={styles.separator} />
          <SettingsRow icon="ℹ️" label="About" value="1.0.0" />
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.logoutRow, pressed && styles.rowPressed]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutLabel}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgTertiary,
    marginBottom: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowIcon: {
    fontSize: 20,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  rowLabelDanger: {
    color: colors.error,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  chevron: {
    fontSize: 22,
    color: colors.textTertiary,
    fontWeight: '300',
  },
  separator: {
    height: 1,
    backgroundColor: colors.bgTertiary,
    marginLeft: 48,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
