// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import "react-native-reanimated";
// import AppReviewPrompt from "@/components/AppReviewPrompt";
// import LanguageSelection from "@/components/LanguageSelectionScreen";
// import { NoInternet } from "@/components/NoInternet";
// import ReMountManager from "@/components/ReMountManager";
// import { SupabaseRealtimeProvider } from "@/components/SupabaseRealtimeProvider";
// import { Colors } from "@/constants/Colors";
// import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
// import { useColorScheme } from "@/hooks/useColorScheme";
// import { useConnectionStatus } from "@/hooks/useConnectionStatus";
// import { useDatabaseSync } from "@/hooks/useDatabaseSync";
// import { cleanupCache } from "@/hooks/usePodcasts";
// import { usePushNotifications } from "@/hooks/usePushNotifications";
// import { useAuthStore } from "@/stores/authStore";
// import { useFontSizeStore } from "@/stores/fontSizeStore";
// import useNotificationStore from "@/stores/notificationStore";
// import "@/utils/i18n";
// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Stack } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
// import { SQLiteProvider } from "expo-sqlite";
// import * as SQLite from "expo-sqlite";
// import { StatusBar } from "expo-status-bar";
// import React, { useCallback, useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   Appearance,
//   BackHandler,
//   Platform,
//   Text,
//   View,
//   TouchableOpacity,
// } from "react-native";
// import { MenuProvider } from "react-native-popup-menu";
// import Toast from "react-native-toast-message";
// import MiniPlayerBar from "@/components/MiniPlayerBar";
// import GlobalVideoHost from "@/player/GlobalVideoHost";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { setDatabase } from "../db";
// import { migrateDbIfNeeded, DB_NAME } from "@/db/migrates";
// import { LoadingIndicator } from "@/components/LoadingIndicator";
// import { ThemedText } from "@/components/ThemedText";
// import { setAudioModeAsync } from "expo-audio";
// // If removeEventListener doesn’t exist, patch it on-the-fly:
// if (typeof (BackHandler as any).removeEventListener !== "function") {
//   (BackHandler as any).removeEventListener = (
//     eventName: any,
//     handler: () => boolean
//   ) => {
//     const subscription = BackHandler.addEventListener(eventName, handler);
//     subscription.remove();
//   };
// }

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// // Query client
// const queryClient = new QueryClient();

// function RetryMigrationScreen({
//   message,
//   onRetry,
//   isRetrying,
//   colorScheme,
// }: {
//   message: string;
//   onRetry: () => void;
//   isRetrying: boolean;
//   colorScheme: "light" | "dark";
// }) {
//   const fg = colorScheme === "dark" ? Colors.dark.text : Colors.light.text;
//   const bg =
//     colorScheme === "dark" ? Colors.dark.background : Colors.light.background;
//   const { t } = useTranslation();

//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: bg,
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 24,
//         gap: 18,
//       }}
//     >
//       <Text
//         style={{
//           fontSize: 26,
//           fontWeight: "700",
//           color: fg,
//           textAlign: "center",
//         }}
//       >
//         {t("initAppWentWrong")}
//       </Text>
//       <Text
//         style={{ fontSize: 14, color: fg, opacity: 0.8, textAlign: "center" }}
//       >
//         {message}
//       </Text>
//       <TouchableOpacity
//         disabled={isRetrying}
//         onPress={onRetry}
//         style={{
//           paddingHorizontal: 18,
//           paddingVertical: 12,
//           borderRadius: 12,
//           backgroundColor:
//             colorScheme === "dark" ? Colors.dark.tint : Colors.light.tint,
//           opacity: isRetrying ? 0.6 : 1,
//         }}
//       >
//         <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
//           {isRetrying ? "Retrying…" : "Retry"}
//         </Text>
//       </TouchableOpacity>
//       {isRetrying && <LoadingIndicator size={"large"} />}
//     </View>
//   );
// }

// function AppContent() {
//   const colorScheme = useColorScheme() || "light";
//   const { ready: languageContextReady, hasStoredLanguage } = useLanguage();
//   const [isSessionRestored, setIsSessionRestored] = useState(false);
//   const hasInternet = useConnectionStatus();
//   const { expoPushToken } = usePushNotifications();
//   const [storesHydrated, setStoresHydrated] = useState(false);
//   const [showLoadingScreen, setShowLoadingScreen] = useState(false);
//   const { t } = useTranslation();
//   const isDbReady = useDatabaseSync();

//   useEffect(() => {
//     const setColorTheme = async () => {
//       try {
//         const saved = await AsyncStorage.getItem("isDarkMode");
//         if (saved === "true") Appearance.setColorScheme("dark");
//         else if (saved === "false") Appearance.setColorScheme("light");
//       } catch (e) {
//         console.error("Failed to set color scheme:", e);
//       }
//     };
//     setColorTheme();
//   }, []);

//   //! Old hydration logic
//   // useEffect(() => {
//   //   const hydrateStores = async () => {
//   //     try {
//   //       await Promise.all([
//   //         useAuthStore.persist.rehydrate(),
//   //         useFontSizeStore.persist.rehydrate(),
//   //         useNotificationStore.persist.rehydrate(),
//   //       ]);
//   //       await useNotificationStore.getState().checkPermissions();
//   //       setStoresHydrated(true);
//   //     } catch (e) {
//   //       console.error("Failed to hydrate stores:", e);
//   //       setStoresHydrated(true);
//   //     }
//   //   };
//   //   hydrateStores();
//   // }, []);

//   //! Here
//   // useEffect(() => {
//   //   const checkHydration = () => {
//   //     const allHydrated =
//   //       useFontSizeStore.persist.hasHydrated() &&
//   //       useNotificationStore.persist.hasHydrated();

//   //     if (allHydrated) {
//   //       setStoresHydrated(true);
//   //       useNotificationStore.getState().checkPermissions();
//   //     }
//   //   };

//   //   checkHydration();
//   //   const interval = setInterval(checkHydration, 50);

//   //   return () => clearInterval(interval);
//   // }, []);

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       const allHydrated =
//         useFontSizeStore.persist.hasHydrated() &&
//         useNotificationStore.persist.hasHydrated();

//       if (allHydrated) {
//         setStoresHydrated(true);
//         useNotificationStore.getState().checkPermissions();
//         clearInterval(intervalId);
//       }
//     }, 50);

//     // Optional: immediate check so you don't always wait 50ms
//     const allHydratedNow =
//       useFontSizeStore.persist.hasHydrated() &&
//       useNotificationStore.persist.hasHydrated();
//     if (allHydratedNow) {
//       setStoresHydrated(true);
//       useNotificationStore.getState().checkPermissions();
//       clearInterval(intervalId);
//     }

//     return () => clearInterval(intervalId);
//   }, []);

//   useEffect(() => {
//     if (storesHydrated && Platform.OS === "ios") {
//       const { getNotifications, permissionStatus, toggleGetNotifications } =
//         useNotificationStore.getState();
//       if (!getNotifications && permissionStatus === "undetermined") {
//         toggleGetNotifications();
//       }
//     }
//   }, [storesHydrated]);

//   useEffect(() => {
//     const initAuth = async () => {
//       if (storesHydrated) {
//         await useAuthStore.getState().initialize();
//         setIsSessionRestored(true);
//       }
//     };

//     if (storesHydrated) {
//       initAuth();
//     }
//   }, [storesHydrated]);

//   useEffect(() => {
//     let timer: any;
//     if (
//       languageContextReady &&
//       storesHydrated &&
//       isSessionRestored &&
//       !isDbReady &&
//       hasInternet
//     ) {
//       timer = setTimeout(() => setShowLoadingScreen(true), 2000);
//     } else {
//       setShowLoadingScreen(false);
//     }
//     return () => clearTimeout(timer);
//   }, [
//     languageContextReady,
//     storesHydrated,
//     isSessionRestored,
//     isDbReady,
//     hasInternet,
//   ]);

//   useEffect(() => {
//     const essentialsReady =
//       languageContextReady && storesHydrated && isSessionRestored;

//     if (!hasInternet && languageContextReady && storesHydrated) {
//       SplashScreen.hideAsync();
//       Toast.show({
//         type: "error",
//         text1: t("noInternetTitle"),
//         text2: t("noInternetMessage"),
//         visibilityTime: 5000,
//       });
//       return;
//     }

//     if (essentialsReady || showLoadingScreen) {
//       SplashScreen.hideAsync();
//     }
//   }, [
//     languageContextReady,
//     storesHydrated,
//     isSessionRestored,
//     hasInternet,
//     showLoadingScreen,
//     t,
//   ]);

//   useEffect(() => {
//     cleanupCache().catch(console.warn);
//   }, []);

//   useEffect(() => {
//     if (expoPushToken) {
//       console.log("Push Token:", expoPushToken);
//     }
//   }, [expoPushToken]);

//   if (!languageContextReady || !storesHydrated || !isSessionRestored)
//     return null;

//   //! Language Context
//   // if (languageContextReady && !hasStoredLanguage) return <LanguageSelection />;

//   if (!isDbReady && showLoadingScreen && hasInternet) {
//     const fg = colorScheme === "dark" ? Colors.dark.text : Colors.light.text;
//     const bg =
//       colorScheme === "dark" ? Colors.dark.background : Colors.light.background;

//     return (
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: bg,
//           justifyContent: "center",
//           alignItems: "center",
//           padding: 20,
//           gap: 30,
//         }}
//       >
//         <Text
//           style={{
//             fontSize: 28,
//             color: fg,
//             fontWeight: "700",
//             textAlign: "center",
//           }}
//         >
//           {t("loading")}
//         </Text>
//         <LoadingIndicator size={"large"} />
//         <Text style={{ fontSize: 16, textAlign: "center", color: fg }}>
//           {t("dataIsBeingLoadedTitle")}
//         </Text>
//         <ThemedText style={{ fontSize: 16, textAlign: "center", color: fg }}>
//           {t("dataIsBeingLoadedMessage")}
//         </ThemedText>
//         <Toast />
//       </View>
//     );
//   }

//   if (!isDbReady && hasInternet) return null;

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
//         <StatusBar style="auto" />
//         <ReMountManager>
//           <MenuProvider>
//             <NoInternet showUI={!hasInternet} showToast={true} />
//             <QueryClientProvider client={queryClient}>
//               <SupabaseRealtimeProvider>
//                 <Stack
//                   screenOptions={{
//                     headerShown: false,
//                     headerBackButtonMenuEnabled: false,
//                   }}
//                 >
//                   <Stack.Screen name="index" />
//                   <Stack.Screen name="(tabs)" />
//                   <Stack.Screen name="(addNews)" />
//                   <Stack.Screen name="(auth)" />
//                   <Stack.Screen name="(displayQuestion)" />
//                   <Stack.Screen name="(newsArticle)" />
//                   <Stack.Screen name="(displayPrayer)" />
//                   <Stack.Screen name="(askQuestion)" />
//                   <Stack.Screen name="(podcast)" />
//                   <Stack.Screen name="(pdfs)" />
//                   <Stack.Screen
//                     name="+not-found"
//                     options={{ headerShown: true }}
//                   />
//                 </Stack>
//                 <MiniPlayerBar />
//                 <AppReviewPrompt />
//               </SupabaseRealtimeProvider>
//             </QueryClientProvider>
//           </MenuProvider>
//           <Toast />
//         </ReMountManager>
//       </ThemeProvider>
//     </GestureHandlerRootView>
//   );
// }

// export default function RootLayout() {
//   const colorScheme = (useColorScheme() || "light") as "light" | "dark";
//   const [migrationError, setMigrationError] = useState<string | null>(null);
//   const [retrying, setRetrying] = useState(false);
//   const [audioReady, setAudioReady] = useState(Platform.OS !== "ios");

//   // Memoize the onInit callback to prevent SQLiteProvider from reinitializing
//   const onInit = useCallback(async (db: SQLite.SQLiteDatabase) => {
//     try {
//       await migrateDbIfNeeded(db); // atomic; bumps user_version on success
//       setDatabase(db); // only after successful COMMIT
//     } catch (e: any) {
//       console.error("DB migration failed:", e);
//       setMigrationError(e?.message ?? String(e));
//       // Do NOT rethrow; we want to render a Retry UI instead of a red screen
//     }
//   }, []); // Empty deps - this only needs to run once

//   const handleRetry = useCallback(async () => {
//     try {
//       setRetrying(true);
//       setMigrationError(null);
//       const db = await SQLite.openDatabaseAsync(DB_NAME);
//       await migrateDbIfNeeded(db); // atomic
//       setDatabase(db); // mark db ready for the app
//     } catch (e: any) {
//       console.error("DB migration retry failed:", e);
//       setMigrationError(e?.message ?? String(e));
//     } finally {
//       setRetrying(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (Platform.OS !== "ios") return;

//     setAudioModeAsync({
//       playsInSilentMode: true,
//       allowsRecording: false,
//       shouldPlayInBackground: true,
//     })
//       .catch(() => {})
//       .finally(() => setAudioReady(true));
//   }, []);

//   if (!audioReady) return null;

//   return (
//     <GlobalVideoHost>
//       <SQLiteProvider
//         databaseName={DB_NAME}
//         useSuspense={false}
//         onInit={onInit}
//       >
//         {migrationError ? (
//           <RetryMigrationScreen
//             message={migrationError}
//             onRetry={handleRetry}
//             isRetrying={retrying}
//             colorScheme={colorScheme}
//           />
//         ) : (
//           <LanguageProvider>
//             <AppContent />
//           </LanguageProvider>
//         )}
//       </SQLiteProvider>
//     </GlobalVideoHost>
//   );
// }

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "react-native-reanimated";
import AppReviewPrompt from "@/components/AppReviewPrompt";
import LanguageSelection from "@/components/LanguageSelectionScreen";
import { NoInternet } from "@/components/NoInternet";
import ReMountManager from "@/components/ReMountManager";
import { SupabaseRealtimeProvider } from "@/components/SupabaseRealtimeProvider";
import { Colors } from "@/constants/Colors";
import { LanguageProvider, useLanguage } from "../../contexts/LanguageContext";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import { useDatabaseSync } from "../../hooks/useDatabaseSync";
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
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import * as SQLite from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Appearance,
  BackHandler,
  Platform,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import MiniPlayerBar from "@/components/MiniPlayerBar";
import GlobalVideoHost from "../../player/GlobalVideoHost";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setDatabase } from "../../db";
import { migrateDbIfNeeded, DB_NAME } from "../../db/migrates";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ThemedText } from "@/components/ThemedText";
import { setAudioModeAsync } from "expo-audio";
import IntroVideo, { useIntroVideo } from "@/components/Intro";
// If removeEventListener doesn’t exist, patch it on-the-fly:
if (typeof (BackHandler as any).removeEventListener !== "function") {
  (BackHandler as any).removeEventListener = (
    eventName: any,
    handler: () => boolean,
  ) => {
    const subscription = BackHandler.addEventListener(eventName, handler);
    subscription.remove();
  };
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Query client
const queryClient = new QueryClient();

function RetryMigrationScreen({
  message,
  onRetry,
  isRetrying,
  colorScheme,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
  colorScheme: "light" | "dark";
}) {
  const fg = colorScheme === "dark" ? Colors.dark.text : Colors.light.text;
  const bg =
    colorScheme === "dark" ? Colors.dark.background : Colors.light.background;
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        gap: 18,
      }}
    >
      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          color: fg,
          textAlign: "center",
        }}
      >
        {t("initAppWentWrong")}
      </Text>
      <Text
        style={{ fontSize: 14, color: fg, opacity: 0.8, textAlign: "center" }}
      >
        {message}
      </Text>
      <TouchableOpacity
        disabled={isRetrying}
        onPress={onRetry}
        style={{
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor:
            colorScheme === "dark" ? Colors.dark.tint : Colors.light.tint,
          opacity: isRetrying ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {isRetrying ? "Retrying…" : "Retry"}
        </Text>
      </TouchableOpacity>
      {isRetrying && <LoadingIndicator size={"large"} />}
    </View>
  );
}

function AppContent() {
  const colorScheme = useColorScheme() || "light";
  const { ready: languageContextReady, hasStoredLanguage } = useLanguage();
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const hasInternet = useConnectionStatus();
  const { expoPushToken } = usePushNotifications();
  const [storesHydrated, setStoresHydrated] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const { t } = useTranslation();
  const isDbReady = useDatabaseSync();

  useEffect(() => {
    const setColorTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("isDarkMode");
        if (saved === "true") Appearance.setColorScheme("dark");
        else if (saved === "false") Appearance.setColorScheme("light");
      } catch (e) {
        console.error("Failed to set color scheme:", e);
      }
    };
    setColorTheme();
  }, []);

  //! Old hydration logic
  // useEffect(() => {
  //   const hydrateStores = async () => {
  //     try {
  //       await Promise.all([
  //         useAuthStore.persist.rehydrate(),
  //         useFontSizeStore.persist.rehydrate(),
  //         useNotificationStore.persist.rehydrate(),
  //       ]);
  //       await useNotificationStore.getState().checkPermissions();
  //       setStoresHydrated(true);
  //     } catch (e) {
  //       console.error("Failed to hydrate stores:", e);
  //       setStoresHydrated(true);
  //     }
  //   };
  //   hydrateStores();
  // }, []);

  //! Here
  // useEffect(() => {
  //   const checkHydration = () => {
  //     const allHydrated =
  //       useFontSizeStore.persist.hasHydrated() &&
  //       useNotificationStore.persist.hasHydrated();

  //     if (allHydrated) {
  //       setStoresHydrated(true);
  //       useNotificationStore.getState().checkPermissions();
  //     }
  //   };

  //   checkHydration();
  //   const interval = setInterval(checkHydration, 50);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const allHydrated =
        useFontSizeStore.persist.hasHydrated() &&
        useNotificationStore.persist.hasHydrated();

      if (allHydrated) {
        setStoresHydrated(true);
        useNotificationStore.getState().checkPermissions();
        clearInterval(intervalId);
      }
    }, 50);

    // Optional: immediate check so you don't always wait 50ms
    const allHydratedNow =
      useFontSizeStore.persist.hasHydrated() &&
      useNotificationStore.persist.hasHydrated();
    if (allHydratedNow) {
      setStoresHydrated(true);
      useNotificationStore.getState().checkPermissions();
      clearInterval(intervalId);
    }

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
      if (storesHydrated) {
        await useAuthStore.getState().initialize();
        setIsSessionRestored(true);
      }
    };

    if (storesHydrated) {
      initAuth();
    }
  }, [storesHydrated]);

  useEffect(() => {
    let timer: any;
    if (
      languageContextReady &&
      storesHydrated &&
      isSessionRestored &&
      !isDbReady &&
      hasInternet
    ) {
      timer = setTimeout(() => setShowLoadingScreen(true), 2000);
    } else {
      setShowLoadingScreen(false);
    }
    return () => clearTimeout(timer);
  }, [
    languageContextReady,
    storesHydrated,
    isSessionRestored,
    isDbReady,
    hasInternet,
  ]);

  useEffect(() => {
    const essentialsReady =
      languageContextReady && storesHydrated && isSessionRestored;

    if (!hasInternet && languageContextReady && storesHydrated) {
      SplashScreen.hideAsync();
      Toast.show({
        type: "error",
        text1: t("noInternetTitle"),
        text2: t("noInternetMessage"),
        visibilityTime: 5000,
      });
      return;
    }

    if (essentialsReady || showLoadingScreen) {
      SplashScreen.hideAsync();
    }
  }, [
    languageContextReady,
    storesHydrated,
    isSessionRestored,
    hasInternet,
    showLoadingScreen,
    t,
  ]);

  useEffect(() => {
    cleanupCache().catch(console.warn);
  }, []);

  useEffect(() => {
    if (expoPushToken) {
      console.log("Push Token:", expoPushToken);
    }
  }, [expoPushToken]);

  if (!languageContextReady || !storesHydrated || !isSessionRestored)
    return null;

  //! Language Context
  // if (languageContextReady && !hasStoredLanguage) return <LanguageSelection />;

  if (!isDbReady && showLoadingScreen && hasInternet) {
    const fg = colorScheme === "dark" ? Colors.dark.text : Colors.light.text;
    const bg =
      colorScheme === "dark" ? Colors.dark.background : Colors.light.background;

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: bg,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          gap: 30,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            color: fg,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          {t("loading")}
        </Text>
        <LoadingIndicator size={"large"} />
        <Text style={{ fontSize: 16, textAlign: "center", color: fg }}>
          {t("dataIsBeingLoadedMessage")}
        </Text>
        <Toast />
      </View>
    );
  }

  if (!isDbReady && hasInternet) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <ReMountManager>
          <MenuProvider>
            <NoInternet showUI={!hasInternet} showToast={true} />
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
                  <Stack.Screen name="(addNews)" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(displayQuestion)" />
                  <Stack.Screen name="(newsArticle)" />
                  <Stack.Screen name="(displayPrayer)" />
                  <Stack.Screen name="(askQuestion)" />
                  <Stack.Screen name="(podcast)" />
                  <Stack.Screen name="(pdfs)" />
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
        </ReMountManager>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const colorScheme = (useColorScheme() || "light") as "light" | "dark";
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [audioReady, setAudioReady] = useState(Platform.OS !== "ios");
  const { hasPlayed: hasPlayedIntro, markAsPlayed: markIntroAsPlayed } =
    useIntroVideo();

  // Memoize the onInit callback to prevent SQLiteProvider from reinitializing
  const onInit = useCallback(async (db: SQLite.SQLiteDatabase) => {
    try {
      await migrateDbIfNeeded(db); // atomic; bumps user_version on success
      setDatabase(db); // only after successful COMMIT
    } catch (e: any) {
      console.error("DB migration failed:", e);
      setMigrationError(e?.message ?? String(e));
      // Do NOT rethrow; we want to render a Retry UI instead of a red screen
    }
  }, []); // Empty deps - this only needs to run once

  const handleRetry = useCallback(async () => {
    try {
      setRetrying(true);
      setMigrationError(null);
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await migrateDbIfNeeded(db); // atomic
      setDatabase(db); // mark db ready for the app
    } catch (e: any) {
      console.error("DB migration retry failed:", e);
      setMigrationError(e?.message ?? String(e));
    } finally {
      setRetrying(false);
    }
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

  if (!audioReady || hasPlayedIntro === null) return null;

  if (hasPlayedIntro === false) {
    SplashScreen.hideAsync();
    return (
      <IntroVideo
        source={require("@/assets/videos/intro.mp4")}
        onComplete={markIntroAsPlayed}
      />
    );
  }

  return (
    <GlobalVideoHost>
      <SQLiteProvider
        databaseName={DB_NAME}
        useSuspense={false}
        onInit={onInit}
      >
        {migrationError ? (
          <RetryMigrationScreen
            message={migrationError}
            onRetry={handleRetry}
            isRetrying={retrying}
            colorScheme={colorScheme}
          />
        ) : (
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        )}
      </SQLiteProvider>
    </GlobalVideoHost>
  );
}
