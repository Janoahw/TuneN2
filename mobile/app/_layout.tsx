import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const toastConfig = {
  success: (props: any) => (
    <View style={toastStyles.container}>
      <View style={[toastStyles.box, toastStyles.successBox]}>
        <View style={toastStyles.content}>
          <View style={toastStyles.textContainer}>
            <View style={toastStyles.titleContainer}>
              <View style={toastStyles.iconBox}>
                <Text style={toastStyles.iconText}>✓</Text>
              </View>
              <View style={{ flex: 1 }}>
                {props.text1 && (
                  <Text style={toastStyles.title}>{props.text1}</Text>
                )}
                {props.text2 && (
                  <Text style={toastStyles.message}>{props.text2}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  ),
  error: (props: any) => (
    <View style={toastStyles.container}>
      <View style={[toastStyles.box, toastStyles.errorBox]}>
        <View style={toastStyles.content}>
          <View style={toastStyles.textContainer}>
            <View style={toastStyles.titleContainer}>
              <View style={[toastStyles.iconBox, toastStyles.errorIcon]}>
                <Text style={toastStyles.iconText}>!</Text>
              </View>
              <View style={{ flex: 1 }}>
                {props.text1 && (
                  <Text style={toastStyles.title}>{props.text1}</Text>
                )}
                {props.text2 && (
                  <Text style={toastStyles.message}>{props.text2}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  ),
};

function RootLayoutInner() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initialize = useAuthStore((s) => s.initialize);

  const [fontsLoaded] = useFonts({
    'SpaceGrotesk-Regular': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Medium': SpaceGrotesk_500Medium,
    'SpaceGrotesk-SemiBold': SpaceGrotesk_600SemiBold,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
    'JetBrainsMono-SemiBold': JetBrainsMono_600SemiBold,
    'JetBrainsMono-Bold': JetBrainsMono_700Bold,
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isInitialized) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isInitialized]);

  if (!fontsLoaded || !isInitialized) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgPrimary },
        }}
      />
      <Toast config={toastConfig} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootLayoutInner />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  splash: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const toastStyles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 16,
  },
  box: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  successBox: {
    backgroundColor: colors.success,
  },
  errorBox: {
    backgroundColor: colors.error,
  },
  content: {
    alignItems: 'center',
  },
  textContainer: {
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  iconText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  errorIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
});
