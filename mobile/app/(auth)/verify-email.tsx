import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { colors } from '@/theme';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const { email: paramEmail } = useLocalSearchParams<{ email?: string }>();
  const storeEmail = useAuthStore((s) => s.user?.email);
  const email = paramEmail || storeEmail || 'your email';

  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const resendEmail = useCallback(async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      // silent fail — user can retry
    } finally {
      setResending(false);
    }
  }, [email]);

  const handleVerified = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Icon */}
          <Text style={styles.icon}>📧</Text>

          {/* Heading */}
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a verification link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Button title="I've verified my email" onPress={handleVerified} variant="primary" />

            <View style={{ height: 16 }} />

            {cooldown > 0 ? (
              <Text style={styles.cooldownText}>Resend available in {cooldown}s</Text>
            ) : (
              <Button
                title="Resend Email"
                onPress={resendEmail}
                variant="secondary"
                loading={resending}
              />
            )}
          </View>
        </View>

        {/* Back to login */}
        <View style={styles.footer}>
          <Button
            title="Back to Login"
            onPress={() => router.replace('/(auth)/login')}
            variant="ghost"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emailHighlight: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
  },
  cooldownText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  footer: {
    paddingBottom: 8,
  },
});
