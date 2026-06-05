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
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
  scroll: { padding: 20, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  availableCard: {
    backgroundColor: '#15151B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  availableLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  availableAmount: {
    fontFamily: fontFamilies.mono,
    fontSize: 32,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  inputLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191920',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#313142',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  inputWrapperFocused: { borderColor: colors.accentPrimary },
  currencySymbol: {
    fontFamily: fontFamilies.mono,
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.mono,
    fontSize: 26,
    fontWeight: '700',
    color: '#F5F5F7',
    paddingVertical: 14,
  },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    backgroundColor: '#191920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: 'rgba(0,204,204,0.149)',
  },
  chipText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
  },
  chipTextSelected: { color: colors.accentPrimary },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  bankLabel: {
    flex: 1,
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  feeCard: {
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  feeRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#1E1E28',
    paddingTop: 12,
    marginTop: 4,
  },
  feeLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
  },
  feeValue: {
    fontFamily: fontFamilies.mono,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  feeLabelTotal: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  feeValueTotal: {
    fontFamily: fontFamilies.mono,
    fontSize: 15,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  ctaContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E1E28',
    backgroundColor: '#0D0D0F',
  },
  ctaBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#050506',
  },
});
