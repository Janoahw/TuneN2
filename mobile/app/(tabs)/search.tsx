import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@/theme';

const GENRES = [
  'Afrobeats',
  'Hip-Hop',
  'R&B',
  'Amapiano',
  'Gospel',
  'Highlife',
  'Pop',
  'Jazz',
  'Electronic',
];

export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Search</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Artists, songs, genres..."
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.sectionTitle}>Browse by Genre</Text>
        <View style={styles.genreGrid}>
          {GENRES.map((genre) => (
            <Pressable key={genre} style={styles.genreChip}>
              <Text style={styles.genreText}>{genre}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: spacing[6] },
  heading: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing[6] },
  searchInput: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
    padding: spacing[4],
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing[8],
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  genreChip: {
    backgroundColor: colors.bgSecondary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  genreText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
});
