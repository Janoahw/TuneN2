import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fontFamilies } from '@/theme';

/**
 * Toast configuration for react-native-toast-message
 * Provides success, error, warning, and info toast renderers with TuneN2 styling
 */

const toastStyles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    marginTop: spacing[4],
    paddingHorizontal: spacing[3],
  },
  box: {
    borderRadius: 12,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
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
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.primarySemiBold,
    fontWeight: '600',
    fontSize: 15,
    marginBottom: spacing[1],
    flexShrink: 1,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
});

const renderToast = (iconName: string, boxStyle: any) => (props: any) => (
  <View style={toastStyles.container}>
    <View style={[toastStyles.box, boxStyle]}>
      <View style={toastStyles.content}>
        <View style={toastStyles.titleContainer}>
          <View style={toastStyles.iconBox}>
            <Feather name={iconName as any} size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            {props.text1 && <Text style={toastStyles.title}>{props.text1}</Text>}
            {props.text2 && <Text style={toastStyles.message}>{props.text2}</Text>}
          </View>
        </View>
      </View>
    </View>
  </View>
);

export const toastConfig = {
  success: renderToast('check-circle', toastStyles.successBox),
  error: renderToast('alert-circle', toastStyles.errorBox),
  warning: renderToast('alert-triangle', toastStyles.warningBox),
  info: renderToast('info', toastStyles.infoBox),
};
