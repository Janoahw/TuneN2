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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
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

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input - only allow 6 digits
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
      // On success, auth store updates trigger redirect
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Invalid OTP. Try again.';
      setError(message);
      setOtp('');
      inputRef.current?.focus();
    } finally {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconCircle}>
                <Feather name="lock" size={40} color={colors.accentPrimary} />
              </View>

              {/* Heading */}
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>

              {/* OTP Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Enter Code</Text>
                <TextInput
                  ref={inputRef}
                  style={[styles.otpInput, error && styles.otpInputError]}
                  placeholder="000000"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={6}
                  keyboardType="numeric"
                  value={otp}
                  onChangeText={handleOtpChange}
                  editable={!loading && timeRemaining > 0}
                  selectTextOnFocus
                />
              </View>

              {/* Error Message */}
              {error && (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Timer */}
              <Text style={styles.timer}>Code expires in {formatTime(timeRemaining)}</Text>

              {/* Submit Button */}
              <View style={styles.buttonSection}>
                <Button
                  title={loading ? 'Verifying...' : 'Verify'}
                  onPress={handleSubmit}
                  disabled={loading || otp.length !== 6 || timeRemaining <= 0}
                />
              </View>

              {/* Resend Section */}
              <View style={styles.resendSection}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                {resendCooldown > 0 ? (
                  <Text style={styles.resendCooldown}>Resend in {resendCooldown}s</Text>
                ) : (
                  <Pressable onPress={handleResend} disabled={resending}>
                    <Text style={styles.resendLink}>{resending ? 'Sending...' : 'Resend'}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: fontFamilies.displayBold,
  } as any,
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    fontFamily: fontFamilies.primary,
  } as any,
  emailHighlight: {
    color: colors.accentPrimary,
    fontWeight: '600',
    fontFamily: fontFamilies.primarySemiBold,
  } as any,
  inputSection: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
    fontFamily: fontFamilies.primarySemiBold,
  } as any,
  otpInput: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
    borderWidth: 2,
    borderColor: colors.borderDefault,
    borderRadius: 12,
    color: colors.textPrimary,
    backgroundColor: colors.bgSecondary,
    fontFamily: fontFamilies.monoSemiBold,
    textAlign: 'center',
  } as any,
  otpInputError: {
    borderColor: colors.error,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '15',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    fontFamily: fontFamilies.primary,
  } as any,
  timer: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: fontFamilies.primary,
  } as any,
  buttonSection: {
    width: '100%',
    marginBottom: 32,
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  resendText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fontFamilies.primary,
  } as any,
  resendLink: {
    fontSize: 13,
    color: colors.accentPrimary,
    fontWeight: '600',
    fontFamily: fontFamilies.primarySemiBold,
  } as any,
  resendCooldown: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fontFamilies.primary,
  } as any,
});
