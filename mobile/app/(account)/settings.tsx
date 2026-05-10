import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
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
        <Feather name={icon} size={20} color={danger ? colors.error : colors.textSecondary} />
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress ? <Feather name="chevron-right" size={18} color={colors.textTertiary} /> : null}
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
          Toast.show({
            type: 'success',
            text1: 'Logged out',
            text2: 'See you next time!',
          });
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
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.backButton} />
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="lock"
            label="Change Password"
            onPress={() => router.push('/change-password')}
          />
          <View style={styles.separator} />
          <SettingsRow icon="mail" label="Email" value={email || '—'} />
          <View style={styles.separator} />
          <SettingsRow
            icon="shopping-bag"
            label="Purchase History"
            onPress={() => router.push('/purchase-history' as any)}
          />
        </View>

        {/* App Section */}
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.card}>
          <SettingsRow icon="bell" label="Notifications" onPress={() => {}} />
          <View style={styles.separator} />
          <SettingsRow icon="info" label="About" value="1.0.0" />
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.logoutRow, pressed && styles.rowPressed]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color={colors.error} />
            <Text style={styles.logoutLabel}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: 24, paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 12,
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
    borderColor: colors.borderDefault,
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
  rowPressed: { opacity: 0.7 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  rowLabelDanger: { color: colors.error },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowValue: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textTertiary,
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
  logoutLabel: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: colors.error,
  },
});
