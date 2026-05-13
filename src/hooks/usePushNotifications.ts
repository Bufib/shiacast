import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import uuid from "react-native-uuid";

import { supabase } from "../../utils/supabase";
import useNotificationStore from "../../stores/notificationStore";
import { useLanguage } from "../../contexts/LanguageContext";

// Global notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const GUEST_ID_KEY = "guest_id";
const EXPO_PUSH_TOKEN_KEY = "expo_push_token";

async function getOrCreateGuestId(): Promise<string> {
  let id = await AsyncStorage.getItem(GUEST_ID_KEY);

  if (!id) {
    id = String(uuid.v4());
    await AsyncStorage.setItem(GUEST_ID_KEY, id);
  }

  return id;
}

async function getProjectId(): Promise<string | undefined> {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId
  );
}

/**
 * Hook that:
 * - Registers/updates push token in Supabase
 * - Handles notification tap navigation
 * - Removes token from Supabase when notifications are disabled
 *
 * No authStore.
 * No todoReminderStore.
 * No local todo reminder scheduling.
 */
export function usePushNotifications() {
  const router = useRouter();
  const { lang } = useLanguage();

  const getNotifications = useNotificationStore((s) => s.getNotifications);

  const [expoPushToken, setExpoPushToken] = useState<string>("");

  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const registerOrUpdateToken = useCallback(async () => {
    if (!getNotifications) return;

    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#057958",
          sound: "default",
        });
      }

      const projectId = await getProjectId();

      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      const token = tokenResponse.data;

      await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);

      if (isMountedRef.current) {
        setExpoPushToken(token);
      }

      const guestId = await getOrCreateGuestId();

      const payload = {
        expo_push_token: token,
        app_version: Constants.expoConfig?.extra?.appVersion,
        platform: Platform.OS,
        language_code: lang || "de",
        guest_id: guestId,
      };

      const { error } = await supabase
        .from("user_tokens")
        .upsert(payload, { onConflict: "expo_push_token" });

      if (error) {
        console.error("Supabase upsert error:", error);
        Alert.alert("Supabase Error", error.message);
      }
    } catch (err: any) {
      console.error("Error registering/updating push token:", err);
      Alert.alert("Registration Error", err?.message ?? String(err));
    }
  }, [getNotifications, lang]);

  // Register/update token whenever notification setting or language changes
  useEffect(() => {
    registerOrUpdateToken();
  }, [registerOrUpdateToken]);

  // Handle notification tap
  useEffect(() => {
    if (!getNotifications) return;

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as
          | {
              type?: string;
              screen?: string;
              route?: string;
            }
          | undefined;

        // You can later customize navigation based on data.type, data.screen, etc.
        router.push("/(tabs)/home");
      });

    return () => {
      responseListener.current?.remove();
      responseListener.current = null;
    };
  }, [getNotifications, router]);

  // If user disables notifications in-app, remove token from Supabase
  useEffect(() => {
    if (getNotifications) return;

    async function removeToken() {
      try {
        const storedToken =
          expoPushToken || (await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY));

        if (!storedToken) return;

        const { error } = await supabase
          .from("user_tokens")
          .delete()
          .eq("expo_push_token", storedToken);

        if (error) {
          console.error("Supabase delete token error:", error);
          return;
        }

        await AsyncStorage.removeItem(EXPO_PUSH_TOKEN_KEY);

        if (isMountedRef.current) {
          setExpoPushToken("");
        }
      } catch (err) {
        console.error("Error removing push token:", err);
      }
    }

    removeToken();
  }, [getNotifications, expoPushToken]);

  return { expoPushToken };
}
