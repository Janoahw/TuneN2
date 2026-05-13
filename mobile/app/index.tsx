import { View, Text, StyleSheet } from 'react-native';
import { router, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { OnboardingCarousel } from '@/components/OnboardingCarousel';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { colors, fontFamilies, spacing } from '@/theme';

export default function SplashScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <LinearGradient
          colors={[colors.accentPrimary, colors.accentSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBox}
        >
          <Feather name="music" size={48} color={colors.white} />
        </LinearGradient>
        <Text style={styles.brand}>TuneN2</Text>
        <Text style={styles.tagline}>Giving art back to the Artist.</Text>
      </View>

      <OnboardingCarousel />

      {/* CTA Buttons */}
      <View style={styles.ctaSection}>
        <Button title="Get Started" onPress={() => router.push('/(auth)/signup')} />
        <Button
          title="I Already Have an Account"
          variant="outline"
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brand: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 42,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  ctaSection: {
    gap: spacing[3],
  },
});
