import { Text, Pressable, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import { colors } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.accentPrimary : colors.white}
          size="small"
        />
      ) : (
        <Text style={[styles.text, textVariantStyles[variant]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = StyleSheet.create({
  primary: {
    backgroundColor: colors.accentPrimary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accentPrimary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

const textVariantStyles = StyleSheet.create({
  primary: {
    color: colors.white,
  },
  secondary: {
    color: colors.accentPrimary,
  },
  ghost: {
    color: colors.accentPrimary,
  },
});
