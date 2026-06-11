import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { colors, fontFamilies } from '@/theme';

const FEATURES = [
  {
    icon: 'upload-cloud' as const,
    title: 'Upload Unlimited Songs',
    desc: 'Share your music in AAC format',
  },
  {
    icon: 'trending-up' as const,
    title: 'Earn 80% Revenue',
    desc: 'Keep most of your song sales',
  },
  {
    icon: 'bar-chart-2' as const,
    title: 'Analytics & Insights',
    desc: 'Track plays, sales, and followers',
  },
];

export default function BecomeArtistScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.accentPrimary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Hero icon */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={[colors.accentPrimary, colors.accentSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Feather name="music" size={36} color="#FFFFFF" />
          </LinearGradient>
        </View>

        {/* Heading */}
        <Text style={styles.title}>Share Your Music{'\n'}With the World</Text>
        <Text style={styles.subtitle}>
          Join TuneN2 as an artist and start earning from your music today
        </Text>

        {/* Feature cards */}
        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Feather name={feature.icon} size={20} color={colors.accentPrimary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricing}>
          <Text style={styles.price}>
            $9.99<Text style={styles.priceUnit}> /month</Text>
          </Text>
          <Text style={styles.priceSub}>Cancel anytime • 30-day free trial</Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* CTA */}
        <Button title="Get Started" onPress={() => router.push('/artist-onboarding')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    marginBottom: 8,
  },
  backText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  heroContainer: { alignItems: 'center', marginBottom: 24 },
  heroGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F5F7',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  features: { gap: 10, marginBottom: 28 },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15151B',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,204,204,0.149)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, gap: 3 },
  featureTitle: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  featureDesc: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: '#9B9BA7',
  },
  pricing: { alignItems: 'center', marginBottom: 28 },
  price: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 36,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  priceUnit: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 16,
    color: '#9B9BA7',
  },
  priceSub: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: '#9B9BA7',
    marginTop: 6,
  },
});
