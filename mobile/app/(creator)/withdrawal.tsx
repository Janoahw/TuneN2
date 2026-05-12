import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useWallet, useRequestWithdrawal } from '@/hooks/useWallet';
import { useConnectStatus } from '@/hooks/useArtist';
import { colors, fontFamilies, spacing } from '@/theme';

const FEE_PERCENT = 0.0023;
const QUICK_AMOUNTS = [25, 50, 100];

export default function WithdrawalScreen() {
  const [amount, setAmount] = useState('');
  const { data: wallet } = useWallet();
  const { data: connect } = useConnectStatus();
  const { mutate: requestWithdrawal, isPending } = useRequestWithdrawal();

  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const amountNum = parseFloat(amount) || 0;
  const fee = amountNum * FEE_PERCENT;
  const youReceive = amountNum - fee;

  const bankLabel = connect?.chargesEnabled
    ? 'Bank Account (via Stripe)'
    : 'No bank account connected';

  function setQuick(val: number) {
    setAmount(val.toString());
  }

  function setMax() {
    setAmount(balance.toFixed(2));
  }

  function handleConfirm() {
    if (amountNum < 10) {
      Alert.alert('Minimum withdrawal is $10');
      return;
    }
    if (amountNum > balance) {
      Alert.alert('Insufficient balance');
      return;
    }
    if (!connect?.chargesEnabled) {
      Alert.alert('Payout account not set up', 'Please complete Stripe Connect onboarding first.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set Up', onPress: () => router.push('/stripe-connect') },
      ]);
      return;
    }

    requestWithdrawal(amountNum, {
      onSuccess: (data: { netAmountDollars: number }) => {
        router.replace({
          pathname: '/payout-success',
          params: {
            amount: data.netAmountDollars.toFixed(2),
            bankLabel,
          },
        });
      },
      onError: (err: any) => {
        Alert.alert('Withdrawal failed', err?.response?.data?.error ?? err.message);
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.heading}>Withdraw</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Available balance */}
        <View style={styles.availableCard}>
          <Text style={styles.availableLabel}>Available Balance</Text>
          <Text style={styles.availableAmount}>
            $
            {balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        {/* Amount input */}
        <Text style={styles.inputLabel}>Amount to withdraw</Text>
        <View style={[styles.inputWrapper, amountNum > 0 && styles.inputWrapperFocused]}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Quick amounts */}
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map((q) => (
            <Pressable
              key={q}
              style={[styles.chip, amountNum === q && styles.chipSelected]}
              onPress={() => setQuick(q)}
            >
              <Text style={[styles.chipText, amountNum === q && styles.chipTextSelected]}>
                ${q}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.chip, amountNum === balance && styles.chipSelected]}
            onPress={setMax}
          >
            <Text style={[styles.chipText, amountNum === balance && styles.chipTextSelected]}>
              Max
            </Text>
          </Pressable>
        </View>

        {/* Withdraw to */}
        <Text style={styles.inputLabel}>Withdraw to</Text>
        <View style={styles.bankRow}>
          <Feather name="credit-card" size={18} color={colors.textSecondary} />
          <Text style={styles.bankLabel}>{bankLabel}</Text>
          {connect?.chargesEnabled && (
            <Feather name="check-circle" size={18} color={colors.success} />
          )}
        </View>

        {/* Fee breakdown */}
        {amountNum > 0 && (
          <View style={styles.feeCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Withdrawal amount</Text>
              <Text style={styles.feeValue}>${amountNum.toFixed(2)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Processing fee (0.23%)</Text>
              <Text style={styles.feeValue}>-${fee.toFixed(2)}</Text>
            </View>
            <View style={[styles.feeRow, styles.feeRowTotal]}>
              <Text style={styles.feeLabelTotal}>You'll receive</Text>
              <Text style={styles.feeValueTotal}>${youReceive.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <Pressable
          style={[styles.ctaBtn, (isPending || amountNum < 10) && styles.ctaBtnDisabled]}
          onPress={handleConfirm}
          disabled={isPending || amountNum < 10}
        >
          {isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.ctaText}>Confirm Withdrawal</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: spacing[4], paddingBottom: spacing[4] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heading: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  availableCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  availableLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  availableAmount: {
    fontFamily: fontFamilies.monoBold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  inputLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  inputWrapperFocused: {
    borderColor: colors.accentPrimary,
  },
  currencySymbol: {
    fontFamily: fontFamilies.mono,
    fontSize: 18,
    color: colors.textPrimary,
    marginRight: spacing[1],
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.mono,
    fontSize: 24,
    color: colors.textPrimary,
    paddingVertical: spacing[3],
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.bgCard,
  },
  chipSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: `${colors.accentPrimary}22`,
  },
  chipText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.accentPrimary,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  bankLabel: {
    flex: 1,
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  feeCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeRowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    paddingTop: spacing[3],
    marginTop: spacing[1],
  },
  feeLabel: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textSecondary,
  },
  feeValue: {
    fontFamily: fontFamilies.mono,
    fontSize: 14,
    color: colors.textPrimary,
  },
  feeLabelTotal: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  feeValueTotal: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 15,
    color: colors.accentPrimary,
  },
  ctaContainer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    backgroundColor: colors.bgPrimary,
  },
  ctaBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: '#000',
  },
});
