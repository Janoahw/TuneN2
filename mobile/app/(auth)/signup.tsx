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

const INPUT_STYLE = {
  inputContainerStyle: {
    backgroundColor: '#191920',
    borderRadius: 16,
    borderColor: '#313142',
    height: 52,
    paddingVertical: 0,
  } as const,
  containerStyle: { marginBottom: 14 } as const,
};

export default function SignupScreen() {
  const { signupMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<'fan' | 'artist'>('fan');

  const { control, handleSubmit } = useForm<SignupForm>({
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
      Toast.show({ type: 'success', text1: 'Account Created', text2: 'Verify your email to complete signup' });
      router.push({ pathname: '/(auth)/verify-otp' });
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Something went wrong. Try again.';
      Toast.show({ type: 'error', text1: 'Signup Failed', text2: message });
    }
  };

  return (
    <View style={styles.container}>
      {/* Studio photo */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80' }}
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
          {/* Centered logo mark */}
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/logo-mark.jpg')} style={styles.logoMark} />
          </View>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.copy}>
            Choose fan or artist mode at signup and start with the same trusted wallet-ready identity.
          </Text>

          {/* Form */}
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
            autoComplete="new-password"
            textContentType="newPassword"
            containerStyle={INPUT_STYLE.containerStyle}
            inputContainerStyle={INPUT_STYLE.inputContainerStyle}
          />

          <ControlledInput
            control={control}
            name="displayName"
            placeholder="Display name"
            icon="user"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            containerStyle={INPUT_STYLE.containerStyle}
            inputContainerStyle={INPUT_STYLE.inputContainerStyle}
          />

          {/* Role selector */}
          <View style={styles.roleRow}>
            <Pressable
              style={[styles.roleBtn, role === 'fan' && styles.roleBtnActive]}
              onPress={() => setRole('fan')}
            >
              <Text style={[styles.roleLabel, role === 'fan' && styles.roleLabelActive]}>Fan</Text>
            </Pressable>
            <Pressable
              style={[styles.roleBtn, role === 'artist' && styles.roleBtnActive]}
              onPress={() => setRole('artist')}
            >
              <Text style={[styles.roleLabel, role === 'artist' && styles.roleLabelActive]}>Artist</Text>
            </Pressable>
          </View>

          {/* Primary button */}
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, signupMutation.isPending && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={signupMutation.isPending}
          >
            <Text style={styles.primaryBtnLabel}>
              {signupMutation.isPending ? 'Creating...' : 'Create Account'}
            </Text>
          </Pressable>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerText}>
                Already selling music here?{' '}
                <Text style={styles.footerLink}>Sign in</Text>
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
  roleRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 22,
  },
  roleBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    backgroundColor: '#1F1F27',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBtnActive: {
    backgroundColor: 'rgba(0,204,204,0.149)',
    borderColor: colors.accentPrimary,
  },
  roleLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
  },
  roleLabelActive: {
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
    paddingTop: 32,
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
