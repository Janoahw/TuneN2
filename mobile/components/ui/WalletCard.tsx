import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, fontFamilies } from '@/theme';

interface WalletCardProps {
  balance: number;
  monthlyEarnings?: number;
  currency?: string;
  style?: ViewStyle;
}

export function WalletCard({
  balance,
  monthlyEarnings,
  currency = '₦',
  style,
}: WalletCardProps) {
  const formattedBalance = balance.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <LinearGradient
      colors={colors.gradientBrand as unknown as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {/* Balance label */}
      <Text style={styles.label}>Available Balance</Text>

      {/* Balance amount */}
      <Text style={styles.balance}>
        {currency}{formattedBalance}
      </Text>

      {/* Monthly earnings */}
      {monthlyEarnings !== undefined && (
        <View style={styles.earningsRow}>
          <Feather name="trending-up" size={14} color={colors.success} />
          <Text style={styles.earningsText}>
            {currency}{monthlyEarnings.toLocaleString('en-NG', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} this month
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    gap: 8,
  },
  label: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  balance: {
    fontFamily: fontFamilies.monoBold,
    fontSize: 36,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  earningsText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
});
