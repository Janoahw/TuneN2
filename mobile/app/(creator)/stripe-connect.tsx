import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { artistService } from '@/services/artist.service';
import { colors, fontFamilies } from '@/theme';

const STEPS = [
  { num: '1', text: 'Verify your identity', active: true },
  { num: '2', text: 'Add bank or debit card', active: false },
  { num: '3', text: 'Start earning', active: false },
];

export default function StripeConnectScreen() {
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const { url } = await artistService.createConnectAccount();
      await Linking.openURL(url);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to start payment setup';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding-complete');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Payment Setup</Text>
          <View style={{ width: 20 }} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>

        {/* Stripe icon */}
        <View style={styles.iconContainer}>
          <View style={styles.stripeIcon}>
            <Feather name="credit-card" size={32} color={colors.accentPrimary} />
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.title}>Set Up Payments</Text>
        <Text style={styles.subtitle}>
          Connect your bank account through Stripe to receive earnings from song sales
        </Text>

        {/* Steps */}
        <View style={styles.steps}>
          {STEPS.map((step) => (
            <View key={step.num} style={styles.stepRow}>
              <View style={[styles.stepCircle, step.active && styles.stepCircleActive]}>
                <Text style={[styles.stepNum, step.active && styles.stepNumActive]}>
                  {step.num}
                </Text>
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* CTA */}
        <Button title="Continue to Stripe" onPress={handleContinue} loading={loading} />

        {/* Skip */}
        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>

        {/* Powered by */}
        <Text style={styles.powered}>Powered by Stripe</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.bgSecondary,
    borderRadius: 2,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stripeIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  steps: {
    gap: 20,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.accentPrimary,
  },
  stepNum: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  stepNumActive: {
    color: '#FFFFFF',
  },
  stepText: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textPrimary,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  skipText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  powered: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
});
