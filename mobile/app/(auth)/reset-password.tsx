import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
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

function getPasswordChecks(password: string) {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number or symbol', met: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];
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
  const checks = useMemo(() => getPasswordChecks(password || ''), [password]);

  const onSubmit = async (values: ResetForm) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, values.password);
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
            <View style={styles.iconCircle}>
              <Feather name="check" size={40} color={colors.success} />
            </View>
            <Text style={styles.title}>Password Reset!</Text>
            <Text style={styles.subtitle}>
              Your password has been successfully reset.{'\n'}You can now log in with your new
              password.
            </Text>
          </View>
          <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} />
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
          {/* Icon */}
          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <Feather name="lock" size={40} color={colors.textSecondary} />
            </View>

            {/* Header */}
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              New password must be different from previously used passwords.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="password"
              placeholder="New password"
              icon="lock"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              autoComplete="new-password"
              textContentType="newPassword"
            />

            <ControlledInput
              control={control}
              name="confirmPassword"
              placeholder="Confirm password"
              icon="lock"
              secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowConfirm((prev) => !prev)}
              autoComplete="new-password"
              textContentType="newPassword"
            />

            {/* Password checklist */}
            {password && password.length > 0 && (
              <View style={styles.checklist}>
                {checks.map((check) => (
                  <View key={check.label} style={styles.checkRow}>
                    {check.met ? (
                      <Feather name="check" size={14} color={colors.success} />
                    ) : (
                      <Text style={styles.bullet}>•</Text>
                    )}
                    <Text style={[styles.checkLabel, check.met && styles.checkLabelMet]}>
                      {check.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Button title="Reset Password" onPress={handleSubmit(onSubmit)} loading={loading} />
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
    paddingHorizontal: 20,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  checklist: {
    marginBottom: 20,
    gap: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    color: colors.textTertiary,
    width: 14,
    textAlign: 'center',
  },
  checkLabel: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  checkLabelMet: {
    color: colors.success,
  },
  // Success state
  successContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
