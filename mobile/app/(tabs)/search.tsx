import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { colors, fontFamilies, fontSizes, spacing, radius } from '@/theme';
import { useGenres } from '@/hooks/useDiscover';
import type { Genre } from '@/services/discover.service';

// Deterministic color palette for genre chips (cycles through)
const GENRE_COLORS = [
  '#1E3A5F',
  '#3A1A4A',
  '#1A3A2A',
  '#3A2A1A',
  '#1A2A3A',
  '#3A1A1A',
  '#1A3A3A',
  '#2A1A3A',
];

function genreColor(index: number): string {
  return GENRE_COLORS[index % GENRE_COLORS.length];
}

function GenreCard({ genre, index }: { genre: Genre; index: number }) {
  return (
    <Pressable
      style={[styles.genreCard, { backgroundColor: genreColor(index) }]}
      onPress={() =>
        router.push({
          pathname: '/genre-browse',
          params: { slug: genre.slug, name: genre.name },
        })
      }
    >
      <Text style={styles.genreCardName}>{genre.name}</Text>
      <Text style={styles.genreCardCount}>{genre._count.songs} songs</Text>
    </Pressable>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data: genres, isLoading: genresLoading } = useGenres();

  const handleSubmit = useCallback(() => {
    if (query.trim().length === 0) return;
    router.push({
      pathname: '/search-results',
      params: { q: query.trim() },
    });
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Search</Text>

        {/* Search input */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={colors.accentPrimary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, songs, genres…"
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Browse Genres */}
        <Text style={styles.sectionTitle}>Browse Genres</Text>
        {genresLoading ? (
          <ActivityIndicator color={colors.accentPrimary} />
        ) : (
          <View style={styles.genreGrid}>
            {(genres ?? []).map((g: Genre, i: number) => (
              <GenreCard key={g.id} genre={g} index={i} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },

  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    paddingTop: spacing[4],
    marginBottom: spacing[5],
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.borderDefault,
    marginBottom: spacing[8],
    gap: spacing[3],
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },

  sectionTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },

  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  genreCard: {
    width: '30.5%',
    borderRadius: radius.md,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[3],
    justifyContent: 'flex-end',
    minHeight: 80,
  },
  genreCardName: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: fontSizes.sm,
    color: colors.onPrimary,
  },
  genreCardCount: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
