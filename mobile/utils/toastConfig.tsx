import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fontFamilies } from '@/theme';

/**
 * Professional toast notification configuration
 * Implements modern design patterns with:
 * - Left accent bar for instant status recognition
 * - Sophisticated depth and shadow hierarchy
 * - Refined typography and spacing balance
 * - Color-coded status indicators
 * - Polished visual hierarchy matching TuneN2 brand
 */

const toastStyles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    marginTop: spacing[4],
    paddingHorizontal: spacing[3],
  },
  wrapper: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 14,
    // Sophisticated multi-layer shadow for premium feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  accentBar: {
    width: 4,
    flexShrink: 0,
  },
  box: {
    flex: 1,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    paddingLeft: spacing[3],
  },
  successBox: {
    backgroundColor: colors.success,
  },
  errorBox: {
    backgroundColor: colors.error,
  },
  warningBox: {
    backgroundColor: colors.warning,
  },
  infoBox: {
    backgroundColor: colors.accentTertiary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
    // Subtle backdrop effect
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing[2],
  },
  title: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.primarySemiBold,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: spacing[1],
    flexShrink: 1,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.94)',
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    lineHeight: 19,
    flexShrink: 1,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  // Accent bar colors (vibrant for contrast against status colors)
  successAccent: {
    backgroundColor: '#2DD849',
  },
  errorAccent: {
    backgroundColor: '#FF3B30',
  },
  warningAccent: {
    backgroundColor: '#FFC600',
  },
  infoAccent: {
    backgroundColor: '#00C7E0',
  },
});

const renderToast =
  (
    iconName: string,
    boxStyle: any,
    accentStyle: any,
    iconColor: string,
    accentColor: string,
  ) =>
  (props: any) =>
    (
      <View style={toastStyles.container}>
        <View style={toastStyles.wrapper}>
          <View style={[toastStyles.accentBar, accentStyle]} />
          <View style={[toastStyles.box, boxStyle]}>
            <View style={toastStyles.content}>
              <View style={toastStyles.iconContainer}>
                <Feather
                  name={iconName as any}
                  size={22}
                  color={iconColor}
                  strokeWidth={2.8}
                />
              </View>
              <View style={toastStyles.textWrapper}>
                {props.text1 && <Text style={toastStyles.title}>{props.text1}</Text>}
                {props.text2 && <Text style={toastStyles.message}>{props.text2}</Text>}
              </View>
            </View>
          </View>
        </View>
      </View>
    );

export const toastConfig = {
  success: renderToast(
    'check-circle',
    toastStyles.successBox,
    toastStyles.successAccent,
    '#FFFFFF',
    '#2DD849',
  ),
  error: renderToast('alert-circle', toastStyles.errorBox, toastStyles.errorAccent, '#FFFFFF', '#FF3B30'),
  warning: renderToast(
    'alert-triangle',
    toastStyles.warningBox,
    toastStyles.warningAccent,
    '#FFFFFF',
    '#FFC600',
  ),
  info: renderToast('info', toastStyles.infoBox, toastStyles.infoAccent, '#FFFFFF', '#00C7E0'),
};
