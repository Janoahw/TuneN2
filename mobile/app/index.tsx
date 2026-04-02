import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function SplashScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🎵</Text>
      <Text style={styles.brand}>TuneN2</Text>
      <Text style={styles.tagline}>Where independent music gets paid.</Text>
      <Pressable style={styles.button} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0F', padding: 24 },
  logo: { fontSize: 64, marginBottom: 8 },
  brand: { fontSize: 48, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, letterSpacing: -0.5 },
  tagline: { fontSize: 16, color: '#A0A0B0', marginBottom: 48, textAlign: 'center' },
  button: { backgroundColor: '#6C5CE7', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 24 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
