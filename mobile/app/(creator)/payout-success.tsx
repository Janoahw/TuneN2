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
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.success}20`,
    borderWidth: 1,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#15151B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    padding: 20,
    gap: 16,
    marginBottom: 28,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
  },
  summaryValue: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  doneBtn: {
    width: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  doneBtnText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#050506',
  },
  historyLink: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
});
