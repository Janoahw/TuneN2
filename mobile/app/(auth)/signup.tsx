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
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const signupSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100, 'Max 100 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Must contain at least 1 number'),
});

type SignupForm = z.infer<typeof signupSchema>;

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: '#FF4757', width: '33%' };
  if (score <= 3) return { label: 'Medium', color: '#FFA502', width: '66%' };
  return { label: 'Strong', color: '#00D68F', width: '100%' };
}

export default function SignupScreen() {
  const { signupMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, watch, setError } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  const password = watch('password');
  const strength = useMemo(() => getPasswordStrength(password || ''), [password]);

  const onSubmit = async (values: SignupForm) => {
    try {
      await signupMutation.mutateAsync(values);
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the music marketplace</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="displayName"
              placeholder="Display name"
              icon="👤"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />

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

            {signupMutation.error && (
              <Text style={styles.formError}>
                {(signupMutation.error as any)?.response?.data?.message ||
                  'Something went wrong. Try again.'}
              </Text>
            )}

            <View style={{ height: 8 }} />

            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={signupMutation.isPending}
            />
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.footerLink}>Log In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0F' },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0B0',
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
    backgroundColor: '#1E1E2E',
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
  formError: {
    color: '#FF4757',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,71,87,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  terms: {
    fontSize: 12,
    color: '#666680',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  termsLink: {
    color: '#6C5CE7',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#A0A0B0',
    fontSize: 14,
  },
  footerLink: {
    color: '#6C5CE7',
    fontSize: 14,
    fontWeight: '600',
  },
});
