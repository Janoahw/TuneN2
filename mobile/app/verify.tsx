import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { colors, fontFamilies } from '@/theme';

export default function VerifyScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid verification link');
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err?.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color={colors.accentPrimary} />
            <Text style={styles.message}>Verifying your email...</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(52,199,89,0.15)' }]}>
              <Feather name="check-circle" size={48} color={colors.success} />
            </View>
            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.message}>Your account has been verified successfully.</Text>
            <Button
              title="Continue to Login"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.button}
            />
          </>
        )}

        {status === 'error' && (
          <>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,59,48,0.15)' }]}>
              <Feather name="x-circle" size={48} color={colors.error} />
            </View>
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.message}>{errorMessage}</Text>
            <Button
              title="Back to Login"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.button}
            />
          </>
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  button: {
    marginTop: 32,
    width: '100%',
  },
});
