import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';

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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
    padding: spacing[6],
  },
  logo: { fontSize: 64, marginBottom: spacing[2] },
  brand: {
    fontSize: 48,
    fontWeight: fontWeights.extrabold,
    color: colors.white,
    marginBottom: spacing[2],
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginBottom: 48,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing[4],
    paddingHorizontal: 48,
    borderRadius: radius['2xl'],
  },
  buttonText: { color: colors.white, fontSize: fontSizes.md, fontWeight: fontWeights.bold },
});
