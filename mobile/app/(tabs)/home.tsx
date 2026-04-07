import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@/theme';

function Section({ title }: { title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Coming soon</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Discover Music</Text>
        <Text style={styles.subtitle}>Support independent artists directly</Text>

        <Section title="🔥 New Artists" />
        <Section title="📈 Top Performing" />
        <Section title="🚀 Fastest Growing" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { padding: spacing[6] },
  heading: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing[1] },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing[8] },
  section: { marginBottom: spacing[8] },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  placeholder: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
    padding: spacing[8],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  placeholderText: { color: colors.textTertiary, fontSize: 14 },
});
