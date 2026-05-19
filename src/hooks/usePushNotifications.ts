import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { supabase } from "../../utils/supabase";
import useNotificationStore from "../../stores/notificationStore";
import { useLanguage } from "../../contexts/LanguageContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const EXPO_PUSH_TOKEN_KEY = "expo_push_token";
const GUEST_ID_KEY = "guest_id";

function getProjectId(): string | undefined {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId
  );
}

async function getOrCreateGuestId(): Promise<string> {
  const stored = await AsyncStorage.getItem(GUEST_ID_KEY);
  if (stored) return stored;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  await AsyncStorage.setItem(GUEST_ID_KEY, id);
  return id;
}

export function usePushNotifications() {
  const router = useRouter();
  const { lang } = useLanguage();

  const getNotifications = useNotificationStore((s) => s.getNotifications);
  const permissionStatus = useNotificationStore((s) => s.permissionStatus);

  const tokenRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const responseSubRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Effective state: nur wenn User Toggle aktiv UND OS-Permission granted.
  const effectiveEnabled =
    getNotifications && permissionStatus === "granted";

  const registerToken = useCallback(async () => {
    try {
      if (!Device.isDevice) return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#057958",
          sound: "default",
        });
      }

      const projectId = getProjectId();
      const tokenResponse = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );

      const token = tokenResponse.data;
      if (!token) return;

      tokenRef.current = token;
      await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);

      const guestId = await getOrCreateGuestId();

      const payload = {
        expo_push_token: token,
        app_version: Constants.expoConfig?.version,
        platform: Platform.OS,
        language_code: lang || "de",
        guest_id: guestId,
      };

      const { error } = await supabase
        .from("user_tokens")
        .upsert(payload, { onConflict: "expo_push_token" });

      if (error) {
        console.warn("Supabase upsert push token error:", error.message);
      }
    } catch (err) {
      console.warn("Failed to register push token:", err);
    }
  }, [lang]);

  const removeToken = useCallback(async () => {
    try {
      const storedToken =
        tokenRef.current ?? (await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY));

      if (!storedToken) return;

      const { error } = await supabase
        .from("user_tokens")
        .delete()
        .eq("expo_push_token", storedToken);

      if (error) {
        console.warn("Supabase delete push token error:", error.message);
        return;
      }

      tokenRef.current = null;
      await AsyncStorage.removeItem(EXPO_PUSH_TOKEN_KEY);
    } catch (err) {
      console.warn("Failed to remove push token:", err);
    }
  }, []);

  // Token registrieren/löschen je nach effectiveEnabled.
  useEffect(() => {
    if (effectiveEnabled) {
      registerToken();
    } else {
      removeToken();
    }
  }, [effectiveEnabled, registerToken, removeToken]);

  // Notification-Tap-Listener.
  useEffect(() => {
    if (!effectiveEnabled) return;

    responseSubRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as
          | { route?: string }
          | undefined;

        if (data?.route) {
          router.push(data.route as any);
        } else {
          router.push("/(tabs)/home");
        }
      });

    return () => {
      responseSubRef.current?.remove();
      responseSubRef.current = null;
    };
  }, [effectiveEnabled, router]);
}
