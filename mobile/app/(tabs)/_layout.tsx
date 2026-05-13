import { Redirect, Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamilies, spacing } from '@/theme';

type TabIconProps = {
  color: string;
  size: number;
};

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="music" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgPrimary,
    borderTopColor: colors.borderDefault,
    borderTopWidth: 1,
    paddingTop: spacing[2],
    height: 88,
  },
  tabBarLabel: { fontFamily: fontFamilies.primaryMedium, fontSize: 11 },
});
