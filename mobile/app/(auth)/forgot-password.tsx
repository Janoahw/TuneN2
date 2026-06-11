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
import { ControlledInput } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { colors, fontFamilies } from '@/theme';

const { width } = Dimensions.get('window');
const PHOTO_HEIGHT = 420;

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

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
      await authService.forgotPassword(values.email);
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
      <View style={styles.container}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80' }}
          style={styles.photo}
          resizeMode="cover"
        />
        <LinearGradient colors={['#0D0D0FE6', '#0D0D0F00']} style={styles.topScrim} pointerEvents="none" />
        <LinearGradient colors={['#0D0D0F00', '#0D0D0FFF']} style={styles.bottomScrim} pointerEvents="none" />

        <View style={styles.sentContent}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/logo-mark.jpg')} style={styles.logoMark} />
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.copy}>
            We sent a password reset link to{'\n'}
            <Text style={styles.emailHighlight}>{sentEmail}</Text>
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.primaryBtnLabel}>Back to Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80' }}
        style={styles.photo}
        resizeMode="cover"
      />
      <LinearGradient colors={['#0D0D0FE6', '#0D0D0F00']} style={styles.topScrim} pointerEvents="none" />
      <LinearGradient colors={['#0D0D0F00', '#0D0D0FFF']} style={styles.bottomScrim} pointerEvents="none" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/logo-mark.jpg')} style={styles.logoMark} />
          </View>

          <Text style={styles.title}>Reset access</Text>
          <Text style={styles.copy}>Enter your email and we will send a secure reset link.</Text>

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

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, loading && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Text style={styles.primaryBtnLabel}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
          </Pressable>

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
  sentContent: {
    flex: 1,
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
  emailHighlight: {
    fontFamily: fontFamilies.primarySemiBold,
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
