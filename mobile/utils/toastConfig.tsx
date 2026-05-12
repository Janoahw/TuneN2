import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontFamilies } from '@/theme';

type ToastTone = 'success' | 'error' | 'warning' | 'info';

const withAlpha = (hex: string, alpha: number) => {
  const normalizedHex = hex.replace('#', '');
  const value =
    normalizedHex.length === 3
      ? normalizedHex
          .split('')
          .map((char) => char + char)
          .join('')
      : normalizedHex;

  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const toneConfig: Record<ToastTone, { icon: keyof typeof Feather.glyphMap; accent: string }> = {
  success: { icon: 'check', accent: colors.success },
  warning: { icon: 'alert-circle', accent: colors.warning },
  error: { icon: 'x', accent: colors.error },
  info: { icon: 'info', accent: colors.accentPrimary },
};

const toastStyles = StyleSheet.create({
  container: {
    width: '87%',
    alignSelf: 'center',
    marginTop: spacing[4],
  },
  wrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: colors.bgPlayer,
    borderWidth: 1,
    borderColor: withAlpha(colors.white, 0.035),
    minHeight: 112,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.34,
    shadowRadius: 24,
    elevation: 16,
  },
  leftGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 146,
  },
  ambientGlow: {
    position: 'absolute',
    left: 14,
    top: 14,
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textWrapper: {
    flex: 1,
    paddingRight: spacing[2],
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.primarySemiBold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 19,
    marginBottom: spacing[1],
    flexShrink: 1,
    letterSpacing: -0.15,
  },
  message: {
    color: withAlpha(colors.white, 0.74),
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    lineHeight: 17,
    flexShrink: 1,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
});

const renderToast = (tone: ToastTone) => (props: any) => {
  const { icon, accent } = toneConfig[tone];

  return (
    <View style={toastStyles.container}>
      <View style={toastStyles.wrapper}>
        <LinearGradient
          colors={[withAlpha(accent, 0.2), withAlpha(accent, 0.08), colors.transparent]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={toastStyles.leftGlow}
        />
        <View
          style={[
            toastStyles.ambientGlow,
            {
              backgroundColor: withAlpha(accent, 0.12),
            },
          ]}
        />
        <View style={toastStyles.content}>
          <View
            style={[
              toastStyles.iconContainer,
              {
                backgroundColor: accent,
                shadowColor: accent,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.24,
                shadowRadius: 10,
                elevation: 6,
              },
            ]}
          >
            <Feather name={icon} size={18} color={colors.bgPrimary} strokeWidth={3} />
          </View>
          <View style={toastStyles.textWrapper}>
            {props.text1 ? (
              <Text style={toastStyles.title} numberOfLines={2}>
                {props.text1}
              </Text>
            ) : null}
            {props.text2 ? (
              <Text style={toastStyles.message} numberOfLines={3}>
                {props.text2}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

export const toastConfig = {
  success: renderToast('success'),
  error: renderToast('error'),
  warning: renderToast('warning'),
  info: renderToast('info'),
};
