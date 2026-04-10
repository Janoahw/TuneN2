import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import { colors, fontFamilies } from '@/theme';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const { email: paramEmail } = useLocalSearchParams<{ email?: string }>();
  const storeEmail = useAuthStore((s) => s.user?.email);
  const email = paramEmail || storeEmail || 'your email';

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const resendEmail = useCallback(async () => {
    setResending(true);
    try {
      await authService.resendVerification(email);
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      // silent fail — user can retry
    } finally {
      setResending(false);
    }
  }, [email]);

  const openEmailApp = () => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconCircle}>
            <Feather name="mail" size={40} color={colors.textSecondary} />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* CTA */}
          <View style={styles.actions}>
            <Button title="Open Email App" onPress={openEmailApp} />
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive it? </Text>
            {cooldown > 0 ? (
              <Text style={styles.resendCooldown}>Resend in {cooldown}s</Text>
            ) : (
              <Pressable onPress={resendEmail} disabled={resending}>
                <Text style={styles.resendLink}>{resending ? 'Sending...' : 'Resend'}</Text>
              </Pressable>
            )}
          </View>
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
    marginBottom: 32,
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  emailHighlight: {
    fontFamily: fontFamilies.primarySemiBold,
    color: colors.textPrimary,
  },
  actions: {
    width: '100%',
    marginBottom: 20,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textSecondary,
  },
  resendLink: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 14,
    color: colors.accentPrimary,
  },
  resendCooldown: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textTertiary,
  },
});
