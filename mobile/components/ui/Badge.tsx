import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, fontFamilies } from '@/theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'gold';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: colors.accentPrimary, text: colors.onPrimary },
  success: { bg: colors.success, text: colors.onSuccess },
  warning: { bg: colors.warning, text: colors.onWarning },
  error: { bg: colors.error, text: colors.onError },
  gold: { bg: colors.gold, text: colors.white },
};

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const colorSet = variantColors[variant];

  return (
    <View style={[styles.container, { backgroundColor: colorSet.bg }, style]}>
      <Text style={[styles.label, { color: colorSet.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
