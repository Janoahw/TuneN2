import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export default function LibraryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Your Library</Text>

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <Text style={styles.emptyTitle}>No songs yet</Text>
          <Text style={styles.emptySubtitle}>Start exploring and add music to your library!</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  content: { flex: 1, padding: 24 },
  heading: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginBottom: 32 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});
