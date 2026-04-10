import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontFamilies, spacing, radius } from '@/theme';
import { useState } from 'react';

/**
 * Purchase confirmation screen.
 * In production this uses Stripe PaymentSheet with the clientSecret.
 * For now, it displays confirmation UI and simulates the flow.
 */
export default function PurchaseConfirmScreen() {
  const { songId, clientSecret, amount, songTitle } = useLocalSearchParams<{
    songId: string;
    clientSecret: string;
    amount: string;
    songTitle: string;
  }>();

  const [processing, setProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    if (!clientSecret) {
      Alert.alert('Error', 'Missing payment information');
      return;
    }

    setProcessing(true);

    try {
      // In production, integrate with @stripe/stripe-react-native:
      // const { error } = await confirmPayment(clientSecret, { paymentMethodType: 'Card' });
      // For now, simulate success after webhook processes

      // Navigate back to song detail after payment sheet completes
      Alert.alert(
        'Payment Submitted',
        `Your payment of $${Number(amount).toFixed(2)} for "${songTitle}" is being processed. You'll be able to download once confirmed.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace({ pathname: '/song-detail' as any, params: { id: songId } }),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="x" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Purchase</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Order Summary Card */}
        <View style={styles.orderCard}>
          <Feather name="music" size={40} color={colors.accentPrimary} />
          <Text style={styles.songTitle} numberOfLines={2}>
            {songTitle}
          </Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>${Number(amount).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Currency</Text>
            <Text style={styles.value}>USD</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <Feather name="shield" size={16} color={colors.textTertiary} />
          <Text style={styles.infoText}>
            Payments are securely processed by Stripe. Your card details are never stored on our servers.
          </Text>
        </View>

        {/* Confirm Button */}
        <Pressable
          style={[styles.confirmBtn, processing && styles.confirmBtnDisabled]}
          onPress={handleConfirmPayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="credit-card" size={18} color="#fff" />
              <Text style={styles.confirmBtnText}>
                Pay ${Number(amount).toFixed(2)}
              </Text>
            </>
          )}
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingTop: spacing[8],
  },
  orderCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing[6],
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  songTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: spacing[4],
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.borderDefault,
    marginVertical: spacing[4],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing[2],
  },
  label: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textSecondary,
  },
  value: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginBottom: spacing[8],
    paddingHorizontal: spacing[2],
  },
  infoText: {
    flex: 1,
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  cancelBtnText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: colors.textSecondary,
  },
});
