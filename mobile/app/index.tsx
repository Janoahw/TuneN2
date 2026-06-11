import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Image, ScrollView } from 'react-native';
import { Redirect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamilies } from '@/theme';

const { width, height } = Dimensions.get('window');
const PHOTO_HEIGHT = height * 0.49;

const SLIDES = [
  {
    title: 'Own the songs you love. Fund the artists directly.',
    copy: 'A studio-first marketplace for discovering previews, buying tracks, following creators, and helping independent music get paid.',
  },
  {
    title: 'Support independent music. Every purchase counts.',
    copy: 'Your money goes straight to the artist. No middlemen, no label cuts. Just music and the people who make it.',
  },
  {
    title: 'Discover, preview, and buy. Your library, your rules.',
    copy: 'Browse by genre, follow your favourite artists, and build a library you truly own — downloadable and yours forever.',
  },
];

export default function SplashScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeSlide, setActiveSlide] = useState(0);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  const slide = SLIDES[activeSlide];

  return (
    <View style={styles.container}>
      {/* Studio photo background */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80' }}
        style={styles.photo}
        resizeMode="cover"
      />

      {/* Top scrim */}
      <LinearGradient
        colors={['#0D0D0FE6', '#0D0D0F00']}
        style={styles.topScrim}
        pointerEvents="none"
      />

      {/* Bottom scrim */}
      <LinearGradient
        colors={['#0D0D0F00', '#0D0D0FFF']}
        style={styles.bottomScrim}
        pointerEvents="none"
      />

      {/* Logo mark + wordmark (top-left) */}
      <View style={styles.brandRow}>
        <Image
          source={require('../assets/logo-mark.jpg')}
          style={styles.logoSmall}
        />
        <Text style={styles.brandText}>TuneN2</Text>
      </View>

      {/* Glass content panel */}
      <View style={styles.glassPanel}>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideCopy}>{slide.copy}</Text>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => setActiveSlide(i)}>
              <View style={[styles.dot, i === activeSlide ? styles.dotActive : styles.dotIdle]} />
            </Pressable>
          ))}
        </View>

        {/* Get Started */}
        <Pressable
          style={({ pressed }) => [styles.getStartedBtn, pressed && styles.pressed]}
          onPress={() => router.push('/(auth)/signup')}
        >
          <Ionicons name="arrow-forward" size={18} color="#050506" />
          <Text style={styles.getStartedLabel}>Get Started</Text>
        </Pressable>
      </View>

      {/* Ghost login button */}
      <Pressable
        style={({ pressed }) => [styles.loginGhostBtn, pressed && styles.pressed]}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.loginGhostLabel}>I already have an account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0F',
  },
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
    top: PHOTO_HEIGHT - 190,
    left: 0,
    width,
    height: 260,
  },
  brandRow: {
    position: 'absolute',
    top: 66,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoSmall: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.125)',
  },
  brandText: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 22,
    fontWeight: '800',
    color: '#F5F5F7',
  },
  glassPanel: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#15151CEB',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.086)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 34,
    elevation: 16,
  },
  slideTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 27,
    fontWeight: '700',
    color: '#F5F5F7',
    lineHeight: 33,
    marginBottom: 16,
  },
  slideCopy: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
    lineHeight: 20,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 34,
    backgroundColor: colors.accentPrimary,
  },
  dotIdle: {
    width: 10,
    backgroundColor: 'rgba(255,255,255,0.188)',
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    borderRadius: 24,
    height: 48,
  },
  getStartedLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#050506',
  },
  loginGhostBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.063)',
    borderRadius: 24,
    height: 48,
  },
  loginGhostLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  pressed: {
    opacity: 0.82,
  },
});
