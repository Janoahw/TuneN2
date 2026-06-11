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
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    padding: 12,
    gap: 12,
  },
  pressed: { opacity: 0.85 },
  coverArt: { width: 52, height: 52, borderRadius: 12 },
  info: { flex: 1, gap: 2 },
  title: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  artist: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 13,
    color: '#9B9BA7',
  },
  meta: { alignItems: 'flex-end', gap: 2 },
  price: {
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9F0A',
  },
  duration: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 11,
    color: '#9B9BA7',
  },
});
