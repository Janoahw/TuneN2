import {
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, fontFamilies } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
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
          color={
            variant === 'outline' || variant === 'secondary' || variant === 'ghost'
              ? colors.accentPrimary
              : variant === 'primary'
                ? '#050506'
                : colors.white
          }
          size="small"
        />
      ) : (
        <Text style={[styles.text, textVariantStyles[variant], textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = StyleSheet.create({
  primary: { backgroundColor: colors.accentPrimary },
  secondary: { backgroundColor: '#191920', borderWidth: 1, borderColor: '#2C2C3A' },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#2C2C3A' },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: '#050506' },
  secondary: { color: '#F5F5F7' },
  outline: { color: '#F5F5F7' },
  ghost: { color: colors.accentPrimary },
  danger: { color: '#FFFFFF' },
});
