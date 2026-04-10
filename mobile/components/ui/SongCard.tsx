import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamilies } from '@/theme';

interface SongCardProps {
  title: string;
  artistName: string;
  price: string;
  duration: string;
  coverArtUrl?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function SongCard({ title, artistName, price, duration, onPress, style }: SongCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}
    >
      {/* Cover art (gradient placeholder when no image) */}
      <LinearGradient
        colors={colors.gradientBrand as unknown as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.coverArt}
      />

      {/* Song info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artistName}
        </Text>
      </View>

      {/* Price & duration */}
      <View style={styles.meta}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.duration}>{duration}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  coverArt: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  artist: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 13,
    color: colors.accentPrimary,
  },
  duration: {
    fontFamily: fontFamilies.primary,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
