import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { verifySupabaseConnection } from '@/lib/supabase-health';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications } from '@/lib/notifications';
import { router } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="mobile-number" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: false }} />
      <Stack.Screen name="name" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="masjid/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="work/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="donation" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="raised" options={{ headerShown: false }} />
      <Stack.Screen name="auto-pay" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="profile-edit" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="document" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="profile-section" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    void registerForPushNotifications();
    const received = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/notifications');
    });
    return () => received.remove();
  }, []);

  useEffect(() => {
    verifySupabaseConnection()
      .then((result) => {
        if (__DEV__) {
          console.info(`[Supabase] Connected (HTTP ${result.status})`);
        }
      })
      .catch(() => undefined);
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
