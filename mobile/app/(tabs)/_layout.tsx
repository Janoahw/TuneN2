import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>📚</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>👤</Text>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgPrimary,
    borderTopColor: colors.bgSecondary,
    borderTopWidth: 1,
    paddingTop: spacing[2],
    height: 88,
  },
  tabBarLabel: { fontSize: 12, fontWeight: '600' },
  icon: { fontSize: 24 },
});
