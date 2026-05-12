import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "react-native-reanimated";

import AppReviewPrompt from "@/components/AppReviewPrompt";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import MiniPlayerBar from "@/components/MiniPlayerBar";
import { NoInternet } from "@/components/NoInternet";
import { SupabaseRealtimeProvider } from "@/components/SupabaseRealtimeProvider";
import { Colors } from "@/constants/Colors";
import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";

import { LanguageProvider, useLanguage } from "../../contexts/LanguageContext";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import { cleanupCache } from "../../hooks/usePodcasts";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { useAuthStore } from "../../stores/authStore";
import { useFontSizeStore } from "../../stores/fontSizeStore";
import useNotificationStore from "../../stores/notificationStore";
import "../../utils/i18n";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "../../node_modules/@react-navigation/native/lib/typescript/src";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "../../node_modules/expo-status-bar/build/StatusBar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Appearance,
  BackHandler,
  Platform,
  Text,
  View,
} from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync } from "expo-audio";

import GlobalVideoHost from "../../player/GlobalVideoHost";
import IntroVideo, { useIntroVideo } from "@/components/Intro";

if (typeof (BackHandler as any).removeEventListener !== "function") {
  (BackHandler as any).removeEventListener = (
    eventName: any,
    handler: () => boolean
  ) => {
    const subscription = BackHandler.addEventListener(eventName, handler);
    subscription.remove();
  };
}

void SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function AppContent() {
  const colorScheme = useColorScheme() || "light";
  const { ready: languageContextReady } = useLanguage();
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const [storesHydrated, setStoresHydrated] = useState(false);

  const hasInternet = useConnectionStatus();
  const { expoPushToken } = usePushNotifications();
  const { t } = useTranslation();

  const hasHiddenSplashRef = useRef(false);
  const hasShownOfflineToastRef = useRef(false);

  useEffect(() => {
    const setColorTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("isDarkMode");

        if (saved === "true") {
          Appearance.setColorScheme("dark");
        } else if (saved === "false") {
          Appearance.setColorScheme("light");
        }
      } catch (error) {
        console.error("Failed to set color scheme:", error);
      }
    };

    setColorTheme();
  }, []);

  useEffect(() => {
    const checkHydration = () => {
      const allHydrated =
        useFontSizeStore.persist.hasHydrated() &&
        useNotificationStore.persist.hasHydrated();

      if (allHydrated) {
        setStoresHydrated(true);
        useNotificationStore.getState().checkPermissions();
        return true;
      }

      return false;
    };

    if (checkHydration()) return;

    const intervalId = setInterval(() => {
      if (checkHydration()) {
        clearInterval(intervalId);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (storesHydrated && Platform.OS === "ios") {
      const { getNotifications, permissionStatus, toggleGetNotifications } =
        useNotificationStore.getState();

      if (!getNotifications && permissionStatus === "undetermined") {
        toggleGetNotifications();
      }
    }
  }, [storesHydrated]);

  useEffect(() => {
    const initAuth = async () => {
      if (!storesHydrated) return;

      await useAuthStore.getState().initialize();
      setIsSessionRestored(true);
    };

    initAuth();
  }, [storesHydrated]);

  useEffect(() => {
    cleanupCache().catch(console.warn);
  }, []);

  useEffect(() => {
    if (expoPushToken) {
      console.log("Push Token:", expoPushToken);
    }
  }, [expoPushToken]);

  useEffect(() => {
    const essentialsReady =
      languageContextReady && storesHydrated && isSessionRestored;

    if (!essentialsReady) return;

    if (!hasInternet && !hasShownOfflineToastRef.current) {
      hasShownOfflineToastRef.current = true;

      Toast.show({
        type: "error",
        text1: t("noInternetTitle"),
        text2: t("noInternetMessage"),
        visibilityTime: 5000,
      });
    }

    if (hasInternet) {
      hasShownOfflineToastRef.current = false;
    }
  }, [languageContextReady, storesHydrated, isSessionRestored, hasInternet, t]);

  const essentialsReady =
    languageContextReady && storesHydrated && isSessionRestored;

  const hideSplashOnFirstVisibleLayout = useCallback(() => {
    if (hasHiddenSplashRef.current) return;

    hasHiddenSplashRef.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!essentialsReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={hideSplashOnFirstVisibleLayout}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <StatusBar style="auto" />

          <MenuProvider>
            <QueryClientProvider client={queryClient}>
              <SupabaseRealtimeProvider>
                <BottomSheetModalProvider>
                  <NoInternet showUI={!hasInternet} showToast={false} />

                  <Stack
                    screenOptions={{
                      headerShown: false,
                      headerBackButtonMenuEnabled: false,
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(podcast)" />
                    <Stack.Screen
                      name="+not-found"
                      options={{ headerShown: true }}
                    />
                  </Stack>

                  <MiniPlayerBar />
                  <AppReviewPrompt />
                </BottomSheetModalProvider>
              </SupabaseRealtimeProvider>
            </QueryClientProvider>
          </MenuProvider>

          <Toast />
        </ThemeProvider>
      </GestureHandlerRootView>
    </View>
  );
}

export default function RootLayout() {
  const [audioReady, setAudioReady] = useState(Platform.OS !== "ios");

  const { hasPlayed: hasPlayedIntro, markAsPlayed: markIntroAsPlayed } =
    useIntroVideo();

  const hasHiddenSplashForRootRef = useRef(false);

  const hideRootSplashOnce = useCallback(() => {
    if (hasHiddenSplashForRootRef.current) return;

    hasHiddenSplashForRootRef.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: true,
    })
      .catch(() => {})
      .finally(() => setAudioReady(true));
  }, []);

  useEffect(() => {
    if (audioReady && hasPlayedIntro === false) {
      hideRootSplashOnce();
    }
  }, [audioReady, hasPlayedIntro, hideRootSplashOnce]);

  if (!audioReady || hasPlayedIntro === null) return null;

  if (hasPlayedIntro === false) {
    return (
      <IntroVideo
        source={require("@/assets/videos/intro.mp4")}
        onComplete={markIntroAsPlayed}
      />
    );
  }

  return (
    <GlobalVideoHost>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </GlobalVideoHost>
  );
}