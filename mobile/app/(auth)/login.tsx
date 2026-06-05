import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { ControlledInput } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { colors, fontFamilies } from '@/theme';

const { width } = Dimensions.get('window');
const PHOTO_HEIGHT = 420;

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const INPUT_STYLE = {
  inputContainerStyle: {
    backgroundColor: '#191920',
    borderRadius: 16,
    borderColor: '#313142',
    height: 52,
    paddingVertical: 0,
  } as const,
  containerStyle: { marginBottom: 16 } as const,
};

export default function LoginScreen() {
  const { loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      await loginMutation.mutateAsync(values);
      Toast.show({ type: 'success', text1: 'Welcome back!', text2: 'Logging you in...' });
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Invalid email or password';
      Toast.show({ type: 'error', text1: 'Login failed', text2: message });
    }
  };

  return (
    <View style={styles.container}>
      {/* Studio photo */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80' }}
        style={styles.photo}
        resizeMode="cover"
      />
      {/* Top scrim */}
      <LinearGradient colors={['#0D0D0FE6', '#0D0D0F00']} style={styles.topScrim} pointerEvents="none" />
      {/* Bottom scrim */}
      <LinearGradient colors={['#0D0D0F00', '#0D0D0FFF']} style={styles.bottomScrim} pointerEvents="none" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Centered logo mark */}
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/logo-mark.jpg')} style={styles.logoMark} />
          </View>

          {/* Title + copy */}
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.copy}>Sign in to keep listening, buying, and supporting independent artists.</Text>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="email"
              placeholder="Email"
              icon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              containerStyle={INPUT_STYLE.containerStyle}
              inputContainerStyle={INPUT_STYLE.inputContainerStyle}
            />

            <ControlledInput
              control={control}
              name="password"
              placeholder="Password"
              icon="lock"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowPassword((p) => !p)}
              autoComplete="password"
              textContentType="password"
              containerStyle={INPUT_STYLE.containerStyle}
              inputContainerStyle={INPUT_STYLE.inputContainerStyle}
            />

            {/* Forgot password */}
            <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {/* Primary button */}
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, loginMutation.isPending && styles.btnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loginMutation.isPending}
            >
              <Text style={styles.primaryBtnLabel}>
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.footerText}>New to TuneN2?{' '}
                <Text style={styles.footerLink}>Create account</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0F' },
  flex: { flex: 1 },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height: PHOTO_HEIGHT,
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height: 160,
  },
  bottomScrim: {
    position: 'absolute',
    top: 230,
    left: 0,
    width,
    height: 260,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 82,
    marginBottom: 0,
  },
  logoMark: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.125)',
  },
  title: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 32,
    fontWeight: '700',
    color: '#F5F5F7',
    marginTop: 72,
    marginBottom: 16,
  },
  copy: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
    lineHeight: 20,
    marginBottom: 30,
    width: 320,
  },
  form: {},
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
  },
  forgotText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  primaryBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  primaryBtnLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#050506',
  },
  btnDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.82 },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 40,
  },
  footerText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
  },
  footerLink: {
    color: '#F5F5F7',
  },
});
