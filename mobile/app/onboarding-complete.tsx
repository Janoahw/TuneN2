import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { artistService } from '@/services/artist.service';
import { colors, fontFamilies } from '@/theme';

const CHECKS = [
  'Identity verified',
  'Bank account linked',
  'Ready to receive payments',
];

export default function OnboardingCompleteScreen() {
  const [connectStatus, setConnectStatus] = useState<{
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  } | null>(null);

  useEffect(() => {
    artistService.getConnectStatus().then(setConnectStatus).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Spacer top */}
        <View style={{ flex: 1 }} />

        {/* Success icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Feather name="check" size={36} color={colors.success} />
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          Your payment account is connected.{'\n'}You can upload music and start earning.
        </Text>

        {/* Checks */}
        <View style={styles.checkList}>
          {CHECKS.map((check, i) => {
            const isComplete =
              connectStatus
                ? i === 0
                  ? connectStatus.detailsSubmitted
                  : i === 1
                    ? connectStatus.payoutsEnabled
                    : connectStatus.chargesEnabled
                : true; // Optimistic default

            return (
              <View key={check} style={styles.checkRow}>
                <Feather
                  name={isComplete ? 'check-circle' : 'circle'}
                  size={18}
                  color={isComplete ? colors.success : colors.textTertiary}
                />
                <Text style={styles.checkText}>{check}</Text>
              </View>
            );
          })}
        </View>

        {/* Spacer bottom */}
        <View style={{ flex: 1 }} />

        {/* CTAs */}
        <Button
          title="Upload Your First Song"
          onPress={() => router.replace('/(tabs)/home')}
        />

        <View style={{ height: 12 }} />

        <Button
          title="Go to Dashboard"
          variant="outline"
          onPress={() => router.replace('/(tabs)/home')}
        />
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A3A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 26,
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
    marginBottom: 28,
  },
  checkList: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkText: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
