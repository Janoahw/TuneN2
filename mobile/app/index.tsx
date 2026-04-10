import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';

const { width } = Dimensions.get('window');

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

      {/* Feature Slide */}
      <View style={styles.featureSection}>
        <View style={styles.featureCard}>
          <View style={styles.featureIconCircle}>
            <Feather name="heart" size={24} color={colors.accentPrimary} />
          </View>
          <Text style={styles.featureTitle}>Support Artists Directly</Text>
          <Text style={styles.featureDesc}>
            Every stream, every purchase goes directly to the creators you love. No middlemen.
          </Text>
        </View>

        {/* Dot Indicators */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

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
    fontSize: 42,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -1,
    fontFamily: 'SpaceGrotesk',
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  featureSection: {
    alignItems: 'center',
  },
  featureCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  featureIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,107,46,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgTertiary,
  },
  dotActive: {
    backgroundColor: colors.accentPrimary,
    width: 24,
    borderRadius: 4,
  },
  ctaSection: {
    gap: 12,
  },
});
