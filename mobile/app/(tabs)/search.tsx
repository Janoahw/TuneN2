import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GENRES = ['Afrobeats', 'Hip-Hop', 'R&B', 'Amapiano', 'Gospel', 'Highlife', 'Pop', 'Jazz', 'Electronic'];

export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Search</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Artists, songs, genres..."
          placeholderTextColor="#666"
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
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 24 },
  heading: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 24 },
  searchInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  genreChip: {
    backgroundColor: '#1A1A2E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  genreText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
