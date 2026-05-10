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
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { colors, fontFamilies } from '@/theme';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
      .regex(/[0-9]/, 'Must contain at least 1 number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

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

export default function ChangePasswordScreen() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, setError } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');
  const strength = useMemo(() => getPasswordStrength(newPassword || ''), [newPassword]);

  const onSubmit = async (values: ChangePasswordForm) => {
    setLoading(true);
    try {
      await api.post('/users/me/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Password updated successfully' });
      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.details?.[0]?.message ||
        err?.response?.data?.error?.message ||
        'Something went wrong. Please try again.';
      if (
        message.toLowerCase().includes('current password') ||
        err?.response?.data?.error?.details?.[0]?.path === 'currentPassword'
      ) {
        setError('currentPassword', { message });
      } else {
        setError('root', { message });
      }
    } finally {
      setLoading(false);
    }
  };

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
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={styles.backButton} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="currentPassword"
              placeholder="Current password"
              icon="lock"
              secureTextEntry={!showCurrent}
              rightIcon={showCurrent ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowCurrent((prev) => !prev)}
              autoComplete="password"
              textContentType="password"
            />

            <View style={styles.divider} />

            <ControlledInput
              control={control}
              name="newPassword"
              placeholder="New password"
              icon="lock"
              secureTextEntry={!showNew}
              rightIcon={showNew ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowNew((prev) => !prev)}
              autoComplete="new-password"
              textContentType="newPassword"
            />

            {/* Password strength indicator */}
            {newPassword && newPassword.length > 0 && (
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
              icon="lock"
              secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowConfirm((prev) => !prev)}
              autoComplete="new-password"
              textContentType="newPassword"
            />

            <View style={{ height: 8 }} />

            <Button title="Update Password" onPress={handleSubmit(onSubmit)} loading={loading} />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    color: colors.textPrimary,
  },
  form: {
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.bgTertiary,
    marginVertical: 8,
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
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 12,
    width: 52,
  },
});
