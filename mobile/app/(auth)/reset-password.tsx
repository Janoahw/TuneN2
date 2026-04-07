import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { colors } from '@/theme';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
      .regex(/[0-9]/, 'Must contain at least 1 number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof resetSchema>;

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: colors.error, width: '33%' };
  if (score <= 3) return { label: 'Medium', color: colors.warning, width: '66%' };
  return { label: 'Strong', color: colors.success, width: '100%' };
}

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, watch, setError } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');
  const strength = useMemo(() => getPasswordStrength(password || ''), [password]);

  const onSubmit = async (values: ResetForm) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: values.password });
      setSuccess(true);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError('root', { message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successContent}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Password Reset!</Text>
            <Text style={styles.successSubtitle}>
              Your password has been successfully reset.{'\n'}You can now log in with your new
              password.
            </Text>
          </View>
          <View style={styles.successFooter}>
            <Button
              title="Back to Login"
              onPress={() => router.replace('/(auth)/login')}
              variant="primary"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Back button */}
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>Choose a strong password for your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="password"
              placeholder="New password"
              icon="🔒"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? '👁️' : '👁️‍🗨️'}
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              autoComplete="new-password"
              textContentType="newPassword"
            />

            {/* Password strength indicator */}
            {password && password.length > 0 && (
              <View style={styles.strengthWrapper}>
                <View style={styles.strengthTrack}>
                  <View
                    style={[
                      styles.strengthFill,
                      { width: strength.width as any, backgroundColor: strength.color },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}

            <ControlledInput
              control={control}
              name="confirmPassword"
              placeholder="Confirm new password"
              icon="🔒"
              secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? '👁️' : '👁️‍🗨️'}
              onRightIconPress={() => setShowConfirm((prev) => !prev)}
              autoComplete="new-password"
              textContentType="newPassword"
            />

            <View style={{ height: 8 }} />

            <Button title="Reset Password" onPress={handleSubmit(onSubmit)} loading={loading} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Back to Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 4,
  },
  backArrow: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  header: {
    marginBottom: 32,
    marginTop: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  strengthWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: -8,
    marginBottom: 16,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.bgTertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 52,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerLink: {
    color: colors.accentPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Success state
  successContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  successFooter: {
    paddingBottom: 8,
  },
});
