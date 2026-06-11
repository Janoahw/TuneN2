import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { colors, fontFamilies } from '@/theme';

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
  const tint = focused ? '#00CCCC' : '#5B5B68';
  return (
    <View style={[iconStyles.wrap, focused && iconStyles.wrapActive]}>
      <Feather name={name} size={20} color={tint} />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapActive: {
    backgroundColor: 'rgba(0,204,204,0.15)',
  },
});

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: '#5B5B68',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon name="search" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon name="music" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon name="user" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 58,
    backgroundColor: 'rgba(22,22,30,0.97)',
    borderRadius: 29,
    borderTopWidth: 0,
    paddingBottom: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  tabBarLabel: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 10,
    fontWeight: '700',
  },
  tabBarItem: {
    paddingTop: 8,
    paddingBottom: 4,
    height: 58,
  },
});
