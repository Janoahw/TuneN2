import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, {
  Easing,
  Extrapolation,
  type SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontFamilies, spacing } from '@/theme';

const AUTO_ADVANCE_MS = 2800;
const INDICATOR_SLOT_WIDTH = 28;

type Slide = {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  eyebrow: string;
  title: string;
  description: string;
  accent: [string, string];
};

const slides: Slide[] = [
  {
    id: 'direct-support',
    icon: 'heart',
    eyebrow: 'Fair support',
    title: 'Support Artists Directly',
    description:
      'Every stream, every purchase, and every fan action pushes more value back to the creators behind the music.',
    accent: ['rgba(0,204,204,0.24)', 'rgba(191,90,242,0.08)'],
  },
  {
    id: 'discover-talent',
    icon: 'compass',
    eyebrow: 'Discover faster',
    title: 'Find New Voices Worth Replaying',
    description:
      'Browse rising artists, explore by genre, and move from discovery to full song detail without losing momentum.',
    accent: ['rgba(191,90,242,0.2)', 'rgba(0,204,204,0.1)'],
  },
  {
    id: 'own-music',
    icon: 'download-cloud',
    eyebrow: 'Keep your favorites',
    title: 'Buy Tracks And Build Your Library',
    description:
      'Unlock songs you love, keep them in your collection, and come back to your downloads and saved artists anytime.',
    accent: ['rgba(0,204,204,0.22)', 'rgba(0,204,204,0.05)'],
  },
];

function CarouselSlide({
  item,
  index,
  cardWidth,
  scrollX,
}: {
  item: Slide;
  index: number;
  cardWidth: number;
  scrollX: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(index - 1) * cardWidth, index * cardWidth, (index + 1) * cardWidth],
      [0.82, 1, 0.82],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          [(index - 1) * cardWidth, index * cardWidth, (index + 1) * cardWidth],
          [cardWidth * 0.022, 0, -cardWidth * 0.022],
          Extrapolation.CLAMP,
        ),
      },
      {
        translateY: interpolate(
          scrollX.value,
          [(index - 1) * cardWidth, index * cardWidth, (index + 1) * cardWidth],
          [4, 0, 4],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollX.value,
          [(index - 1) * cardWidth, index * cardWidth, (index + 1) * cardWidth],
          [0.985, 1, 0.985],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <View style={{ width: cardWidth }}>
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={item.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGlow}
        >
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.featureIconCircle}>
                <Feather name={item.icon} size={22} color={colors.accentPrimary} />
              </View>
              <Text style={styles.eyebrow}>{item.eyebrow}</Text>
            </View>
            <Text style={styles.featureTitle}>{item.title}</Text>
            <Text style={styles.featureDesc}>{item.description}</Text>
            {/* <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                0{((index - 1 + slides.length) % slides.length) + 1}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${((((index - 1 + slides.length) % slides.length) + 1) / slides.length) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>0{slides.length}</Text>
            </View> */}
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function CarouselIndicator({ activeIndex }: { activeIndex: number }) {
  const indicatorProgress = useSharedValue(activeIndex);

  useEffect(() => {
    indicatorProgress.value = withTiming(activeIndex, {
      duration: 520,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [activeIndex, indicatorProgress]);

  const activeIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: indicatorProgress.value * (INDICATOR_SLOT_WIDTH + spacing[2]),
      },
    ],
  }));

  return (
    <View style={styles.indicatorShell}>
      <View style={styles.indicatorRail}>
        {slides.map((slide) => (
          <View key={slide.id} style={styles.indicatorSlot}>
            <View style={styles.indicatorDot} />
          </View>
        ))}
        <Animated.View style={[styles.activeIndicator, activeIndicatorStyle]} />
      </View>
    </View>
  );
}

export function OnboardingCarousel() {
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<Animated.ScrollView | null>(null);
  const isUserInteractingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const loopedSlides = useMemo(() => [slides[slides.length - 1], ...slides, slides[0]], []);
  const currentPageRef = useRef(1);

  const cardWidth = useMemo(() => Math.max(width - spacing[5] * 2, 280), [width]);

  useEffect(() => {
    scrollX.value = cardWidth;
    const frame = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ x: cardWidth, y: 0, animated: false });
    });

    return () => cancelAnimationFrame(frame);
  }, [cardWidth, scrollX]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isUserInteractingRef.current) {
        return;
      }

      const nextPage = currentPageRef.current + 1;
      scrollViewRef.current?.scrollTo({ x: nextPage * cardWidth, y: 0, animated: true });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [cardWidth]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / cardWidth);

    if (nextPage === 0) {
      isUserInteractingRef.current = false;
      currentPageRef.current = slides.length;
      setActiveIndex(slides.length - 1);
      scrollX.value = slides.length * cardWidth;
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ x: slides.length * cardWidth, y: 0, animated: false });
      });
      return;
    }

    if (nextPage === loopedSlides.length - 1) {
      isUserInteractingRef.current = false;
      currentPageRef.current = 1;
      setActiveIndex(0);
      scrollX.value = cardWidth;
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ x: cardWidth, y: 0, animated: false });
      });
      return;
    }

    currentPageRef.current = nextPage;
    const nextIndex = nextPage - 1;
    isUserInteractingRef.current = false;

    if (!Number.isNaN(nextIndex) && nextIndex >= 0 && nextIndex < slides.length) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <View style={styles.section}>
      <View style={[styles.viewport, { width: cardWidth }]}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          decelerationRate="normal"
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            isUserInteractingRef.current = true;
          }}
          onScroll={onScroll}
          onMomentumScrollEnd={handleMomentumEnd}
          contentContainerStyle={styles.listContent}
          style={{ width: cardWidth, flexGrow: 0 }}
        >
          {loopedSlides.map((slide, index) => (
            <View key={`${slide.id}-${index}`} style={{ width: cardWidth }}>
              <CarouselSlide item={slide} index={index} cardWidth={cardWidth} scrollX={scrollX} />
            </View>
          ))}
        </Animated.ScrollView>
      </View>

      <CarouselIndicator activeIndex={activeIndex} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    alignItems: 'center',
  },
  viewport: {
    overflow: 'hidden',
  },
  listContent: {
    alignItems: 'stretch',
  },
  cardGlow: {
    width: '100%',
    borderRadius: 24,
    padding: 1,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[6],
    minHeight: 240,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  featureIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,204,204,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,204,204,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.accentPrimary,
  },
  featureTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
  featureDesc: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[6],
  },
  progressText: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.bgTertiary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.accentPrimary,
  },
  indicatorShell: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  indicatorRail: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
    position: 'relative',
  },
  indicatorSlot: {
    width: INDICATOR_SLOT_WIDTH,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(245,245,247,0.18)',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 28,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,204,204,0.88)',
    shadowColor: colors.accentPrimary,
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
});
