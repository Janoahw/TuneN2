import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, fontFamilies } from '@/theme';

export default function LibraryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Your Library</Text>

        <View style={styles.emptyState}>
          <Feather name="music" size={64} color={colors.textTertiary} />
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
  heading: { fontFamily: fontFamilies.displayBold, fontSize: 28, color: colors.textPrimary, marginBottom: 32 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyTitle: { fontFamily: fontFamilies.displaySemiBold, fontSize: 20, color: colors.textPrimary, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontFamily: fontFamilies.primary, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});
