import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontFamilies, spacing } from '@/theme';

export default function PayoutSuccessScreen() {
  const { amount, bankLabel } = useLocalSearchParams<{ amount: string; bankLabel: string }>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Feather name="check" size={40} color="#34C759" />
        </View>

        {/* Title & subtitle */}
        <Text style={styles.title}>Payout Initiated!</Text>
        <Text style={styles.subtitle}>
          Your withdrawal is on its way to your bank account. Expect it within 2–3 business days.
        </Text>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={styles.summaryValue}>${amount}</Text>
          </View>
          {!!bankLabel && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>To</Text>
              <Text style={styles.summaryValue}>{bankLabel}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ETA</Text>
            <Text style={styles.summaryValue}>2–3 business days</Text>
          </View>
        </View>

        {/* Done button */}
        <Pressable
          style={styles.doneBtn}
          onPress={() => router.replace('/(creator)/artist-dashboard')}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/withdrawal-history')}>
          <Text style={styles.historyLink}>View withdrawal history</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#34C75922',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[6],
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: spacing[5],
    gap: spacing[4],
    marginBottom: spacing[8],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  doneBtnText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: '#000',
  },
  historyLink: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: colors.accentPrimary,
  },
});
