import "react-native-reanimated";
import "../../utils/i18n";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Appearance,
  BackHandler,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

import AppReviewPrompt from "@/components/AppReviewPrompt";
import ForceUpdateGate from "@/components/ForceUpdateGate";
import IntroVideo, { useIntroVideo } from "@/components/Intro";
import LanguageSelection from "@/components/LanguageSelectionScreen";
import { SupabaseRealtimeProvider } from "@/components/SupabaseRealtimeProvider";
import { usePodcastFinishedStore } from "@/hooks/usePodcastFinishedStore";
import { usePodcastListenedStore } from "@/hooks/usePodcastListenedStore";
import { LanguageProvider, useLanguage } from "../../contexts/LanguageContext";
import useNotificationStore from "../../stores/notificationStore";
import { useColorScheme } from "../hooks/useColorScheme";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { useFontSizeStore } from "../../stores/fontSizeStore";

if (typeof (BackHandler as any).removeEventListener !== "function") {
  (BackHandler as any).removeEventListener = (
    eventName: any,
    handler: () => boolean,
  ) => {
    const subscription = BackHandler.addEventListener(eventName, handler);
    subscription.remove();
  };
}

void SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function AppContent() {
  const colorScheme = useColorScheme() || "light";

  const { ready: languageContextReady, hasStoredLanguage } = useLanguage();

  const { hasPlayed: hasPlayedIntro, markAsPlayed: markIntroAsPlayed } =
    useIntroVideo();

  const [storesHydrated, setStoresHydrated] = useState(false);

  const hasInternet = useConnectionStatus();

  const hasHiddenSplashRef = useRef(false);
  const hasShownOfflineToastRef = useRef(false);

  const { t } = useTranslation();

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
        useNotificationStore.persist.hasHydrated() &&
        usePodcastFinishedStore.persist.hasHydrated() &&
        usePodcastListenedStore.persist.hasHydrated();

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

  const essentialsReady = languageContextReady && storesHydrated;

  useEffect(() => {
    if (!essentialsReady) return;

    if (!hasInternet && !hasShownOfflineToastRef.current) {
      hasShownOfflineToastRef.current = true;

      Toast.show({
        type: "error",
        text1: t("noInternetConnectionTitle"),
        text2: t("noInternetConnectionMessage"),
        visibilityTime: 5000,
      });
    }

    if (hasInternet) {
      hasShownOfflineToastRef.current = false;
    }
  }, [essentialsReady, hasInternet, t]);

  const hideSplashIfReady = useCallback(() => {
    if (hasHiddenSplashRef.current) return;
    if (!essentialsReady) return;
    if (hasPlayedIntro === null) return;

    hasHiddenSplashRef.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }, [essentialsReady, hasPlayedIntro]);

  useEffect(() => {
    hideSplashIfReady();
  }, [hideSplashIfReady]);

  const gateMode: "language" | "intro" | null =
    !essentialsReady || hasPlayedIntro === null
      ? null
      : !hasStoredLanguage
        ? "language"
        : hasPlayedIntro === false
          ? "intro"
          : null;

  const showAppGate = gateMode !== null;

  return (
    <View style={styles.root} onLayout={hideSplashIfReady}>
      <GestureHandlerRootView style={styles.root}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <StatusBar style="auto" />

          <MenuProvider>
            <QueryClientProvider client={queryClient}>
              <SupabaseRealtimeProvider>
                <BottomSheetModalProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      headerBackButtonMenuEnabled: false,
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(podcast)" />
                    <Stack.Screen
                      name="+not-found"
                      options={{ headerShown: true }}
                    />
                  </Stack>

                  <AppReviewPrompt />

                  {showAppGate && (
                    <View style={styles.gateOverlay} pointerEvents="auto">
                      {gateMode === "language" && <LanguageSelection />}

                      {gateMode === "intro" && (
                        <IntroVideo
                          source={require("@/assets/videos/intro.mp4")}
                          onComplete={markIntroAsPlayed}
                        />
                      )}
                    </View>
                  )}

                  <ForceUpdateGate />
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

function RootLayoutContent() {
  return <AppContent />;
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <RootLayoutContent />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gateOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
    elevation: 9998,
    backgroundColor: "#fff",
  },
});
