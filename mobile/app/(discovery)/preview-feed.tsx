import { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  StatusBar as RNStatusBar,
} from 'react-native';
// ViewToken is not re-exported in this RN build — define locally
type ViewToken = { index: number | null; isViewable: boolean; item: PreviewSong; key: string };
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreviewFeed } from '@/hooks/useDiscover';
import { usePlayerStore } from '@/stores/playerStore';
import { colors, fontFamilies, fontSizes, spacing, radius } from '@/theme';
import type { PreviewSong } from '@/services/discover.service';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── 30s countdown ring ────────────────────────────────────────────────────────

function CountdownRing({ isActive }: { isActive: boolean }) {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (!isActive) {
      setSeconds(30);
      return;
    }
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <View style={styles.ringContainer}>
      <Text style={styles.ringSeconds}>{seconds}</Text>
      <Text style={styles.ringLabel}>s</Text>
    </View>
  );
}

// ── Individual preview card ───────────────────────────────────────────────────

interface PreviewCardProps {
  item: PreviewSong;
  isActive: boolean;
  onBuy: (song: PreviewSong) => void;
  onFollow: (artistId: string) => void;
}

function PreviewCard({ item, isActive, onBuy, onFollow }: PreviewCardProps) {
  const insets = useSafeAreaInsets();
  const price = parseFloat(item.price);
  const displayPrice = item.isFree ? 'Free' : `Buy $${price.toFixed(2)}`;
  const durationMins = item.durationSeconds
    ? `${Math.floor(item.durationSeconds / 60)}:${String(item.durationSeconds % 60).padStart(2, '0')}`
    : null;

  return (
    <View style={styles.card}>
      {/* Cover art background */}
      <ImageBackground
        source={item.coverArtUrl ? { uri: item.coverArtUrl } : undefined}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Dark gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(13,13,15,0.55)', 'rgba(13,13,15,0.92)']}
          locations={[0.3, 0.65, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing[2] }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.previewBadge}>
            <Ionicons name="play-circle" size={14} color={colors.accentPrimary} />
            <Text style={styles.previewBadgeText}>30s preview</Text>
          </View>
        </View>

        {/* Right rail — actions */}
        <View style={styles.actionRail}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="heart-outline" size={28} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-social-outline" size={26} color={colors.textPrimary} />
          </TouchableOpacity>

          <CountdownRing isActive={isActive} />
        </View>

        {/* Bottom content */}
        <View style={[styles.bottomContent, { paddingBottom: insets.bottom + spacing[6] }]}>
          {/* Artist row */}
          <View style={styles.artistRow}>
            {item.artist.profileImageUrl ? (
              <ImageBackground
                source={{ uri: item.artist.profileImageUrl }}
                style={styles.artistAvatar}
                imageStyle={styles.artistAvatarImage}
              />
            ) : (
              <View style={[styles.artistAvatar, styles.artistAvatarFallback]}>
                <Ionicons name="person" size={14} color={colors.textSecondary} />
              </View>
            )}
            <Text style={styles.artistName}>{item.artist.artistName}</Text>
            {item.artist.isVerified && (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={colors.accentPrimary}
                style={styles.verifiedIcon}
              />
            )}
          </View>

          {/* Song title */}
          <Text style={styles.songTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Meta chips */}
          <View style={styles.metaRow}>
            {item.genre && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{item.genre.name}</Text>
              </View>
            )}
            {durationMins && (
              <View style={styles.chip}>
                <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                <Text style={[styles.chipText, { marginLeft: 3 }]}>{durationMins}</Text>
              </View>
            )}
          </View>

          {/* CTA buttons */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.ctaBtn, styles.buyBtn]}
              onPress={() => onBuy(item)}
              activeOpacity={0.85}
            >
              <Ionicons
                name="cart-outline"
                size={16}
                color={colors.bgPrimary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.buyBtnText}>{displayPrice}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaBtn, styles.followBtn]}
              onPress={() => onFollow(item.artist.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function PreviewFeedScreen() {
  const [page, setPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, isLoading, isFetching } = usePreviewFeed(page, 10);
  const loadPreview = usePlayerStore((s) => s.loadPreview);
  const stopPreview = usePlayerStore((s) => s.stopPreview);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const items = data?.items ?? [];

  // Load preview audio when active card changes
  useEffect(() => {
    const song = items[activeIndex];
    if (!song) return;

    if (song.previewClipUrl) {
      loadPreview({
        id: song.id,
        title: song.title,
        artistName: song.artist.artistName,
        coverArtUrl: song.coverArtUrl ?? '',
        streamUrl: song.previewClipUrl,
        previewUrl: song.previewClipUrl,
      });
    }
    return () => {
      stopPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  });

  const handleBuy = useCallback(
    (song: PreviewSong) => {
      stopPreview();
      router.push({ pathname: '/(discovery)/song-detail', params: { id: song.id } });
    },
    [stopPreview],
  );

  const handleFollow = useCallback((_artistId: string) => {
    // TODO: call artist follow API
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: PreviewSong; index: number }) => (
      <PreviewCard
        item={item}
        isActive={index === activeIndex}
        onBuy={handleBuy}
        onFollow={handleFollow}
      />
    ),
    [activeIndex, handleBuy, handleFollow],
  );

  const keyExtractor = useCallback((item: PreviewSong) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="musical-notes-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No previews available yet</Text>
        <Text style={styles.emptySubtext}>Check back soon for new music</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNStatusBar hidden />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      /* snapToInterval + decelerationRate are valid ScrollView props inherited by FlatList */}
      <FlatList<PreviewSong>
        {...({
          data: items,
          renderItem,
          keyExtractor,
          showsVerticalScrollIndicator: false,
          snapToInterval: SCREEN_HEIGHT,
          snapToAlignment: 'start',
          decelerationRate: 'fast',
          onViewableItemsChanged,
          viewabilityConfig: viewabilityConfig.current,
          onEndReached: () => {
            if (data?.hasNext && !isFetching) setPage((p) => p + 1);
          },
          onEndReachedThreshold: 0.5,
          removeClippedSubviews: true,
          maxToRenderPerBatch: 3,
          windowSize: 5,
        } as any)}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },
  card: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  bg: {
    flex: 1,
    backgroundColor: colors.bgCard,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    zIndex: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,204,204,0.15)',
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    gap: 5,
  },
  previewBadgeText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.xs,
    color: colors.accentPrimary,
  },
  actionRail: {
    position: 'absolute',
    right: spacing[4],
    bottom: 200,
    alignItems: 'center',
    gap: spacing[6],
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 2,
    borderColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  ringSeconds: {
    fontFamily: fontFamilies.monoBold,
    color: colors.accentPrimary,
    fontSize: 15,
  },
  ringLabel: {
    fontFamily: fontFamilies.mono,
    color: colors.accentPrimary,
    fontSize: 10,
    marginTop: 3,
  },
  bottomContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing[4],
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  artistAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: spacing[1],
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistAvatarImage: {
    borderRadius: 14,
  },
  artistAvatarFallback: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  artistName: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  songTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing[2],
    lineHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing[1],
    marginBottom: spacing[4],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  ctaBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtn: {
    backgroundColor: colors.accentPrimary,
  },
  buyBtnText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: fontSizes.base,
    color: colors.bgPrimary,
  },
  followBtn: {
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    backgroundColor: 'transparent',
    flex: 0.6,
  },
  followBtnText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  emptyText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    marginTop: spacing[2],
  },
  emptySubtext: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});
