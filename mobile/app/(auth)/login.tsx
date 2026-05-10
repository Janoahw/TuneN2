import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { ControlledInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { colors, fontFamilies } from '@/theme';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { loginMutation, socialAuthMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      await loginMutation.mutateAsync(values);
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'Logging you in...',
      });
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Invalid email or password';
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: message,
      });
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    // TODO: Replace with real OAuth flow once client IDs are configured
    // Apple: use expo-apple-authentication
    // Google: use @react-native-google-signin/google-signin or expo-auth-session
    Alert.alert(
      `${provider === 'apple' ? 'Apple' : 'Google'} Sign In`,
      'Social sign-in will be available once OAuth credentials are configured.',
    );
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
            <LinearGradient
              colors={[colors.accentPrimary, colors.accentSecondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <Feather name="music" size={28} color={colors.white} />
            </LinearGradient>
            <Text style={styles.brand}>TuneN2</Text>
            <Text style={styles.tagline}>Music. Direct. Fair.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="email"
              placeholder="Email address"
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
              autoComplete="password"
              textContentType="password"
            />

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
            <Pressable
              style={styles.socialButton}
              onPress={() => handleSocialAuth('apple')}
              disabled={socialAuthMutation.isPending}
            >
              <Feather name="smartphone" size={20} color={colors.textPrimary} />
              <Text style={styles.socialLabel}>Apple</Text>
            </Pressable>
            <Pressable
              style={styles.socialButton}
              onPress={() => handleSocialAuth('google')}
              disabled={socialAuthMutation.isPending}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.socialLabel}>Google</Text>
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
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brand: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  form: {
    marginBottom: 24,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
  },
  forgotText: {
    fontFamily: fontFamilies.primaryMedium,
    color: colors.accentPrimary,
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  dividerText: {
    fontFamily: fontFamilies.primary,
    color: colors.textSecondary,
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  googleIcon: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  socialLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fontFamilies.primary,
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    fontFamily: fontFamilies.primarySemiBold,
    color: colors.accentPrimary,
    fontSize: 14,
  },
});
