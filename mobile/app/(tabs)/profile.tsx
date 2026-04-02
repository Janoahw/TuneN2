import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.displayName}>Music Lover</Text>
          <Text style={styles.email}>user@example.com</Text>
        </View>

        <View style={styles.menu}>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>⚙️  Settings</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>💳  Payment Methods</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>📊  Listening History</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>❓  Help & Support</Text>
          </Pressable>
          <Pressable
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  content: { flex: 1, padding: 24 },
  heading: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 32 },
  avatarContainer: { alignItems: 'center', marginBottom: 40 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  avatarText: { fontSize: 40 },
  displayName: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  email: { fontSize: 14, color: '#A0A0B0' },
  menu: { gap: 4 },
  menuItem: {
    backgroundColor: '#1A1A2E',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  menuText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  logoutItem: { marginTop: 16, backgroundColor: 'transparent', borderColor: '#E74C3C' },
  logoutText: { color: '#E74C3C', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
