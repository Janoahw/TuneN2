import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamilies } from '@/theme';

interface ArtistCardProps {
  name: string;
  genre: string;
  avatarUrl?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ArtistCard({ name, genre, onPress, style }: ArtistCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}
    >
      {/* Avatar circle (gradient placeholder) */}
      <LinearGradient
        colors={colors.gradientBrand as unknown as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.genre} numberOfLines={1}>
          {genre}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: 140, alignItems: 'center', gap: 10 },
  pressed: { opacity: 0.85 },
  avatar: { width: 78, height: 78, borderRadius: 39 },
  info: { alignItems: 'center', gap: 2, width: '100%' },
  name: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F5F7',
    textAlign: 'center',
    width: 120,
  },
  genre: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 11,
    color: '#9B9BA7',
    textAlign: 'center',
  },
});
