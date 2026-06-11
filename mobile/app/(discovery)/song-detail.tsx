import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontFamilies } from '@/theme';
import { useSong } from '@/hooks/useSong';
import { useOwnership, usePurchaseSong, useDownloadUrl } from '@/hooks/usePurchase';
import { useAuthStore } from '@/stores/authStore';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { ReportModal } from '@/components/ReportModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_SIZE = Math.min(280, SCREEN_WIDTH - 60);

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: song, isLoading } = useSong(id!);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: owned } = useOwnership(id!);
  const purchaseMutation = usePurchaseSong();
  const downloadMutation = useDownloadUrl();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  if (isLoading || !song) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  const artistName = song.artist?.user?.displayName ?? song.artist?.artistName ?? 'Unknown Artist';

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      Toast.show({ type: 'info', text1: 'Sign in required', text2: 'Please sign in to purchase songs.' });
      router.push('/(auth)/login' as any);
      return;
    }
    try {
      const result = await purchaseMutation.mutateAsync(id!);
      if (result.purchased || result.clientSecret) {
        Toast.show({ type: 'success', text1: 'Purchase Successful!', text2: `"${result.songTitle}" is now in your library.` });
        router.push({
          pathname: '/purchase-confirm' as any,
          params: { songId: id, songTitle: result.songTitle, coverArtUrl: song?.coverArtUrl ?? '' },
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      Toast.show({ type: 'error', text1: 'Purchase Failed', text2: msg });
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadProgress(0);
      const { downloadUrl, songTitle } = await downloadMutation.mutateAsync(id!);
      Toast.show({ type: 'info', text1: 'Downloading…', text2: `Saving "${songTitle}" to your device.` });
      const fileUri = FileSystem.documentDirectory + `${songTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, fileUri, {}, (progress) => {
        setDownloadProgress(progress.totalBytesWritten / progress.totalBytesExpectedToWrite);
      });
      const result = await downloadResumable.downloadAsync();
      setDownloadProgress(null);
      if (result) {
        Toast.show({ type: 'success', text1: 'Download Complete', text2: `"${songTitle}" has been saved.` });
      }
    } catch (err: any) {
      setDownloadProgress(null);
      Toast.show({ type: 'error', text1: 'Download Failed', text2: err?.response?.data?.message || 'Download failed.' });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color="#F5F5F7" />
        </Pressable>
        <Text style={styles.topBarTitle}>Song</Text>
        <Pressable hitSlop={12} onPress={() => setReportModalVisible(true)}>
          <Feather name="flag" size={20} color="#9B9BA7" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cover Art */}
        <View style={styles.coverWrapper}>
          {song.coverArtUrl ? (
            <Image source={{ uri: song.coverArtUrl }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]}>
              <View style={styles.vinylRing}>
                <View style={styles.vinylCenter} />
              </View>
              <Feather name="play" size={22} color="rgba(255,255,255,0.45)" style={{ position: 'absolute' }} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          {/* Title + artist */}
          <Text style={styles.songTitle}>{song.title}</Text>
          <Pressable onPress={() => router.push({ pathname: '/artist-profile', params: { id: song.artist?.id } })}>
            <Text style={styles.artistName}>{artistName}</Text>
          </Pressable>

          {/* Meta chips */}
          <View style={styles.chips}>
            {song.genre && (
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>{song.genre.name}</Text>
              </View>
            )}
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>{formatDuration(song.durationSeconds)}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            {owned ? (
              <View style={styles.ownedBadge}>
                <Feather name="check-circle" size={18} color={colors.success} />
                <Text style={styles.ownedText}>Purchased</Text>
              </View>
            ) : song.isFree ? (
              <Text style={styles.priceFree}>Free</Text>
            ) : (
              <Text style={styles.price}>${parseFloat(song.price).toFixed(2)}</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {owned ? (
              <Pressable
                style={[styles.primaryBtn, (downloadMutation.isPending || downloadProgress !== null) && styles.btnDisabled]}
                onPress={handleDownload}
                disabled={downloadMutation.isPending || downloadProgress !== null}
              >
                {downloadProgress !== null ? (
                  <>
                    <ActivityIndicator size="small" color="#050506" />
                    <Text style={styles.primaryBtnLabel}>{Math.round(downloadProgress * 100)}%</Text>
                  </>
                ) : (
                  <>
                    <Feather name="download" size={18} color="#050506" />
                    <Text style={styles.primaryBtnLabel}>Download</Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Pressable
                style={[styles.primaryBtn, purchaseMutation.isPending && styles.btnDisabled]}
                onPress={handlePurchase}
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending ? (
                  <ActivityIndicator size="small" color="#050506" />
                ) : (
                  <Text style={styles.primaryBtnLabel}>
                    {song.isFree ? 'Get Song' : `Buy Now — $${parseFloat(song.price).toFixed(2)}`}
                  </Text>
                )}
              </Pressable>
            )}

            <Pressable style={styles.ghostBtn}>
              <Feather name="play" size={16} color="#9B9BA7" />
              <Text style={styles.ghostBtnLabel}>Preview (30s)</Text>
            </Pressable>
          </View>

          {/* Download progress */}
          {downloadProgress !== null && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.round(downloadProgress * 100)}%` }]} />
            </View>
          )}

          {/* Description */}
          {song.description ? (
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>About</Text>
              <Text style={styles.descText}>{song.description}</Text>
            </View>
          ) : null}

          {/* Artist card */}
          <Pressable
            style={styles.artistCard}
            onPress={() => router.push({ pathname: '/artist-profile', params: { id: song.artist?.id } })}
          >
            {song.artist?.user?.avatarUrl ? (
              <Image source={{ uri: song.artist.user.avatarUrl }} style={styles.artistCardAvatar} />
            ) : (
              <View style={[styles.artistCardAvatar, styles.artistCardAvatarPlaceholder]}>
                <Feather name="user" size={18} color="#4A4A5A" />
              </View>
            )}
            <View style={styles.artistCardInfo}>
              <Text style={styles.artistCardName}>{artistName}</Text>
              {song.artist?.bio ? (
                <Text style={styles.artistCardBio} numberOfLines={2}>{song.artist.bio}</Text>
              ) : null}
            </View>
            <Feather name="chevron-right" size={18} color="#4A4A5A" />
          </Pressable>
        </View>
      </ScrollView>

      {song && (
        <ReportModal
          songId={id!}
          songTitle={song.title}
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 60 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topBarTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 17,
    fontWeight: '700',
    color: '#F5F5F7',
  },

  coverWrapper: { alignItems: 'center', paddingVertical: 20 },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.094)',
  },
  coverPlaceholder: {
    backgroundColor: '#15151B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylRing: {
    width: '52%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: '#1E1E28',
    borderWidth: 10,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylCenter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0D0D0F',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  info: { paddingHorizontal: 24 },
  songTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 26,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 6,
    lineHeight: 32,
  },
  artistName: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
    marginBottom: 16,
  },

  chips: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  chip: {
    backgroundColor: '#191920',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  chipLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
  },

  priceRow: { marginBottom: 20 },
  price: {
    fontFamily: fontFamilies.mono,
    fontSize: 32,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  priceFree: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 32,
    color: colors.success,
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownedText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: colors.success,
  },

  actions: { gap: 12, marginBottom: 20 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    borderRadius: 24,
    height: 52,
  },
  primaryBtnLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#050506',
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 24,
    height: 48,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  ghostBtnLabel: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
  },
  btnDisabled: { opacity: 0.5 },

  progressBar: {
    height: 4,
    backgroundColor: '#191920',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 2,
  },

  descSection: { marginTop: 16, marginBottom: 20 },
  descLabel: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 10,
  },
  descText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 15,
    color: '#9B9BA7',
    lineHeight: 22,
  },

  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    padding: 14,
    marginTop: 8,
  },
  artistCardAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  artistCardAvatarPlaceholder: {
    backgroundColor: '#191920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistCardInfo: { flex: 1 },
  artistCardName: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  artistCardBio: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#9B9BA7',
    marginTop: 3,
  },
});
