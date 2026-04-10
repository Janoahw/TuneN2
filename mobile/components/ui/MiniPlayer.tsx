import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamilies } from '@/theme';

interface MiniPlayerProps {
  songTitle: string;
  artistName: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
}

export function MiniPlayer({
  songTitle,
  artistName,
  isPlaying = false,
  onPlayPause,
  onPrevious,
  onNext,
  onPress,
  style,
}: MiniPlayerProps) {
  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      {/* Cover art */}
      <LinearGradient
        colors={colors.gradientBrand as unknown as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.art}
      />

      {/* Song info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {songTitle}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artistName}
        </Text>
      </View>

      {/* Controls */}
      <Pressable onPress={onPrevious} hitSlop={8}>
        <Feather name="skip-back" size={20} color={colors.textPrimary} />
      </Pressable>

      <Pressable onPress={onPlayPause} style={styles.playButton} hitSlop={8}>
        <Feather name={isPlaying ? 'pause' : 'play'} size={16} color={colors.onPrimary} />
      </Pressable>

      <Pressable onPress={onNext} hitSlop={8}>
        <Feather name="skip-forward" size={20} color={colors.textPrimary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPlayer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  artist: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    color: colors.textSecondary,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
