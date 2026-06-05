import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import { colors, fontFamilies } from '@/theme';

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_MINUTES = 10;

export default function VerifyOtpScreen() {
  const user = useAuthStore((s) => s.user);
  const email = user?.email || 'your email';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(OTP_EXPIRY_MINUTES * 60);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string) => {
    const numericOnly = value.replace(/[^0-9]/g, '');
    if (numericOnly.length <= 6) {
      setOtp(numericOnly);
      setError(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp(otp);
      Toast.show({
        type: 'success',
        text1: 'Email Verified',
        text2: 'Your email has been verified successfully.',
        visibilityTime: 2000,
        onPress: () => { Toast.hide(); router.replace('/(tabs)/home'); },
      });
      setTimeout(() => router.replace('/(tabs)/home'), 2500);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Invalid OTP. Try again.';
      setError(message);
      setOtp('');
      inputRef.current?.focus();
      Toast.show({ type: 'error', text1: 'Verification Failed', text2: message, visibilityTime: 3000 });
      setLoading(false);
    }
  }, [otp]);

  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await authService.resendOtp();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setTimeRemaining(OTP_EXPIRY_MINUTES * 60);
      setError(null);
      setOtp('');
      inputRef.current?.focus();
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Failed to resend OTP';
      setError(message);
    } finally {
      setResending(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo mark */}
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/logo-mark.jpg')} style={styles.logoMark} />
          </View>

          {/* State icon plate */}
          <View style={styles.iconPlate}>
            <Feather name="lock" size={42} color={colors.accentPrimary} />
          </View>

          {/* Title + copy */}
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.copy}>
            Enter the 6-digit code we sent to your email address.
          </Text>

          {/* Hidden real TextInput + 6 visual boxes */}
          <View style={styles.otpWrap}>
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={handleOtpChange}
              maxLength={6}
              keyboardType="numeric"
              editable={!loading && timeRemaining > 0}
              caretHidden
              autoFocus
            />
            <View style={styles.otpRow}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Pressable key={i} onPress={() => inputRef.current?.focus()}>
                  <View style={[
                    styles.otpBox,
                    i === otp.length - 1 && styles.otpBoxActive,
                    i === otp.length && styles.otpBoxCursor,
                    error && styles.otpBoxError,
                  ]}>
                    <Text style={styles.otpDigit}>{otp[i] ?? ''}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Timer */}
          <Text style={styles.timer}>Code expires in {formatTime(timeRemaining)}</Text>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Verify button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.pressed,
              (loading || otp.length !== 6 || timeRemaining <= 0) && styles.btnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || otp.length !== 6 || timeRemaining <= 0}
          >
            <Text style={styles.primaryBtnLabel}>{loading ? 'Verifying...' : 'Verify'}</Text>
          </Pressable>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLead}>Didn't receive it?</Text>
            {resendCooldown > 0 ? (
              <Text style={styles.resendCooldown}> Resend in {resendCooldown}s</Text>
            ) : (
              <Pressable onPress={handleResend} disabled={resending}>
                <Text style={styles.resendLink}> Resend code</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 96,
    marginBottom: 32,
  },
  logoMark: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.125)',
  },
  iconPlate: {
    width: 128,
    height: 128,
    borderRadius: 36,
    backgroundColor: 'rgba(0,204,204,0.149)',
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 30,
    fontWeight: '700',
    color: '#F5F5F7',
    textAlign: 'center',
    marginBottom: 12,
  },
  copy: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 9,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#191920',
    borderWidth: 1,
    borderColor: '#2C2C3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: colors.accentPrimary,
  },
  otpBoxCursor: {
    borderColor: colors.accentPrimary,
  },
  otpBoxError: {
    borderColor: colors.error,
  },
  otpDigit: {
    fontFamily: fontFamilies.mono,
    fontSize: 20,
    fontWeight: '500',
    color: '#F5F5F7',
  },
  timer: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '15',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
    alignSelf: 'stretch',
  },
  errorText: {
    flex: 1,
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.error,
  },
  primaryBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  primaryBtnLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#050506',
  },
  btnDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.82 },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendLead: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
  },
  resendLink: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  resendCooldown: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: '#9B9BA7',
  },
});
