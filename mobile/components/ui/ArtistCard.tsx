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

export function ArtistCard({
  name,
  genre,
  onPress,
  style,
}: ArtistCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* Avatar circle (gradient placeholder) */}
      <LinearGradient
        colors={colors.gradientBrand as unknown as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.genre} numberOfLines={1}>{genre}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  info: {
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  name: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    width: 140,
  },
  genre: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
