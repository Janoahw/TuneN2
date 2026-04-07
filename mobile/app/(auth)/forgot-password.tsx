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
import { api } from '@/services/api';
import { colors } from '@/theme';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setError } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotForm) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: values.email });
      setSentEmail(values.email);
      setSent(true);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError('root', { message });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successContent}>
            <Text style={styles.successIcon}>📧</Text>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successSubtitle}>
              We sent a password reset link to{'\n'}
              <Text style={styles.emailHighlight}>{sentEmail}</Text>
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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

            {loading === false && (
              <View /> // placeholder so layout stays stable
            )}

            <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={loading} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable onPress={() => router.back()}>
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
  emailHighlight: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  successFooter: {
    paddingBottom: 8,
  },
});
