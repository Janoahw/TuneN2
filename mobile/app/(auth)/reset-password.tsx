import { useState, useMemo } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { ControlledInput } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { colors, fontFamilies } from '@/theme';

const { width } = Dimensions.get('window');
const PHOTO_HEIGHT = 420;

const resetSchema = z
  .object({
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

type ResetForm = z.infer<typeof resetSchema>;

function getPasswordChecks(password: string) {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number or symbol', met: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];
}

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

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, watch, setError } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');
  const checks = useMemo(() => getPasswordChecks(password || ''), [password]);

  const onSubmit = async (values: ResetForm) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, values.password);
      setSuccess(true);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError('root', { message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80' }}
          style={styles.photo}
          resizeMode="cover"
        />
        <LinearGradient colors={['#0D0D0FE6', '#0D0D0F00']} style={styles.topScrim} pointerEvents="none" />
        <LinearGradient colors={['#0D0D0F00', '#0D0D0FFF']} style={styles.bottomScrim} pointerEvents="none" />
        <View style={styles.successContent}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/logo-mark.jpg')} style={styles.logoMark} />
          </View>
          <Text style={styles.title}>Password updated</Text>
          <Text style={styles.copy}>
            Your password has been successfully reset. You can now sign in with your new password.
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
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/logo-mark.jpg')} style={styles.logoMark} />
          </View>

          <Text style={styles.title}>Create a new password</Text>
          <Text style={styles.copy}>Use at least 8 characters with a number or symbol.</Text>

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
            name="confirmPassword"
            placeholder="Confirm Password"
            icon="lock"
            secureTextEntry={!showConfirm}
            rightIcon={showConfirm ? 'eye' : 'eye-off'}
            onRightIconPress={() => setShowConfirm((p) => !p)}
            autoComplete="new-password"
            textContentType="newPassword"
            containerStyle={INPUT_STYLE.containerStyle}
            inputContainerStyle={INPUT_STYLE.inputContainerStyle}
          />

          {/* Password checklist */}
          {password && password.length > 0 && (
            <View style={styles.checklist}>
              {checks.map((check) => (
                <View key={check.label} style={styles.checkRow}>
                  {check.met ? (
                    <Feather name="check" size={14} color={colors.success} />
                  ) : (
                    <View style={styles.bulletDot} />
                  )}
                  <Text style={[styles.checkLabel, check.met && styles.checkLabelMet]}>
                    {check.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, loading && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Text style={styles.primaryBtnLabel}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
          </Pressable>
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
  successContent: {
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
  checklist: {
    marginBottom: 20,
    gap: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#48484A',
    marginLeft: 4,
    marginRight: 5,
  },
  checkLabel: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: '#48484A',
  },
  checkLabelMet: {
    color: colors.success,
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
});
