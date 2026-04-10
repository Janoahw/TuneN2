import { useState } from 'react';
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
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme';

const signupSchema = z
  .object({
    displayName: z.string().min(1, 'Full name is required').max(100, 'Max 100 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
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

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const { signupMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<'fan' | 'artist'>('fan');

  const { control, handleSubmit, setError } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: SignupForm) => {
    try {
      await signupMutation.mutateAsync({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: values.email },
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong. Try again.';
      setError('root', { message });
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
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Feather name="arrow-left" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.topBarTitle}>Create Account</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join TuneN2</Text>
            <Text style={styles.subtitle}>
              Create your account to discover and support independent artists
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="displayName"
              placeholder="Full Name"
              icon="user"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />

            <ControlledInput
              control={control}
              name="email"
              placeholder="Email Address"
              icon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <ControlledInput
              control={control}
              name="password"
              placeholder="Password"
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
              placeholder="Confirm Password"
              icon="lock"
              secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowConfirm((prev) => !prev)}
              autoComplete="new-password"
              textContentType="newPassword"
            />
          </View>

          {/* Role selector */}
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>I am a...</Text>
            <View style={styles.roleRow}>
              <Pressable
                style={[styles.roleButton, role === 'fan' && styles.roleButtonActive]}
                onPress={() => setRole('fan')}
              >
                <Feather
                  name="headphones"
                  size={16}
                  color={role === 'fan' ? '#FFFFFF' : colors.textSecondary}
                />
                <Text style={[styles.roleText, role === 'fan' && styles.roleTextActive]}>Fan</Text>
              </Pressable>
              <Pressable
                style={[styles.roleButton, role === 'artist' && styles.roleButtonActive]}
                onPress={() => setRole('artist')}
              >
                <Feather
                  name="music"
                  size={16}
                  color={role === 'artist' ? '#FFFFFF' : colors.textSecondary}
                />
                <Text style={[styles.roleText, role === 'artist' && styles.roleTextActive]}>
                  Artist
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Error */}
          {signupMutation.error && (
            <Text style={styles.formError}>
              {(signupMutation.error as any)?.response?.data?.message ||
                'Something went wrong. Try again.'}
            </Text>
          )}

          {/* Terms */}
          <Text style={styles.terms}>
            By signing up, you agree to our <Text style={styles.termsLink}>Terms</Text>
          </Text>

          {/* CTA */}
          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={signupMutation.isPending}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Log In</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: 16,
  },
  roleSection: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.bgTertiary,
    backgroundColor: 'transparent',
  },
  roleButtonActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  formError: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: colors.errorBgSubtle,
    padding: 12,
    borderRadius: 12,
  },
  terms: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  termsLink: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.accentPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
