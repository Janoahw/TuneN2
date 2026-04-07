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
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      await loginMutation.mutateAsync(values);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid email or password';
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
          {/* Logo */}
          <View style={styles.header}>
            <Text style={styles.logo}>🎵</Text>
            <Text style={styles.brand}>TuneN2</Text>
            <Text style={styles.tagline}>Where independent music gets paid.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <ControlledInput
              control={control}
              name="email"
              placeholder="Email address"
              icon="✉️"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <ControlledInput
              control={control}
              name="password"
              placeholder="Password"
              icon="🔒"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? '👁️' : '👁️‍🗨️'}
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              autoComplete="password"
              textContentType="password"
            />

            {loginMutation.error && (
              <Text style={styles.formError}>
                {(loginMutation.error as any)?.response?.data?.message ||
                  'Invalid email or password'}
              </Text>
            )}

            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotRow}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <Button
              title="Log In"
              onPress={handleSubmit(onSubmit)}
              loading={loginMutation.isPending}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialLabel}>Google</Text>
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Text style={styles.socialIcon}></Text>
              <Text style={styles.socialLabel}>Apple</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    marginBottom: 4,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  form: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 24,
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
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotText: {
    color: colors.accentPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.bgTertiary,
  },
  dividerText: {
    color: colors.textTertiary,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.bgSecondary,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgTertiary,
  },
  socialIcon: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  socialLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
