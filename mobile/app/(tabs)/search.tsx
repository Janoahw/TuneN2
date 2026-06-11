import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { colors, fontFamilies } from '@/theme';
import { useGenres } from '@/hooks/useDiscover';
import type { Genre } from '@/services/discover.service';

const FILTER_CHIPS = ['All', 'Songs', 'Artists', 'Albums', 'Genres'];

function GenreChip({ genre, index }: { genre: Genre; index: number }) {
  const isActive = index === 0; // first chip active by default; real filter state omitted per existing pattern
  return (
    <Pressable
      style={[styles.genreChip, isActive && styles.genreChipActive]}
      onPress={() => router.push({ pathname: '/genre-browse', params: { slug: genre.slug, name: genre.name } })}
    >
      <Text style={[styles.genreChipLabel, isActive && styles.genreChipLabelActive]}>
        {genre.name}
      </Text>
    </Pressable>
  );
}

function GenreCard({ genre }: { genre: Genre }) {
  return (
    <Pressable
      style={styles.genreCard}
      onPress={() => router.push({ pathname: '/genre-browse', params: { slug: genre.slug, name: genre.name } })}
    >
      <Text style={styles.genreCardName} numberOfLines={1}>{genre.name}</Text>
      <Text style={styles.genreCardCount}>{genre._count.songs} songs</Text>
    </Pressable>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const { data: genres, isLoading: genresLoading } = useGenres();

  const handleSubmit = useCallback(() => {
    if (query.trim().length === 0) return;
    router.push({ pathname: '/search-results', params: { q: query.trim() } });
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Search</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#9B9BA7" />
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, songs, genres…"
            placeholderTextColor="#4A4A5A"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Feather name="x" size={16} color="#9B9BA7" />
            </Pressable>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_CHIPS.map((chip) => (
            <Pressable
              key={chip}
              style={[styles.filterChip, activeFilter === chip && styles.filterChipActive]}
              onPress={() => setActiveFilter(chip)}
            >
              <Text style={[styles.filterChipLabel, activeFilter === chip && styles.filterChipLabelActive]}>
                {chip}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Browse Genres */}
        <Text style={styles.sectionTitle}>Browse Genres</Text>
        {genresLoading ? (
          <ActivityIndicator color={colors.accentPrimary} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.genreGrid}>
            {(genres ?? []).map((g: Genre) => (
              <GenreCard key={g.id} genre={g} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0F' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },

  heading: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F5F7',
    paddingTop: 16,
    marginBottom: 16,
  },

  /* Search bar */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#191920',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#313142',
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: '#F5F5F7',
  },

  /* Filter chips */
  filterScroll: { marginBottom: 24 },
  filterRow: { gap: 8, paddingRight: 8 },
  filterChip: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    backgroundColor: '#191920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: 'rgba(0,204,204,0.149)',
    borderColor: colors.accentPrimary,
  },
  filterChipLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
  },
  filterChipLabelActive: {
    color: colors.accentPrimary,
  },

  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 14,
  },

  /* Genre grid */
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreCard: {
    width: '30.8%',
    minHeight: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    backgroundColor: '#15151B',
    padding: 14,
    justifyContent: 'flex-end',
  },
  genreCardName: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  genreCardCount: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 11,
    color: '#9B9BA7',
    marginTop: 3,
  },
});
