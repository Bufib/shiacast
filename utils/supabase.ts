import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import Constants from "expo-constants";

type SupabaseExtra = {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
};

const extra =
  (Constants.expoConfig?.extra as SupabaseExtra | undefined) ?? {};

const supabaseUrl = extra.supabaseUrl;
const supabasePublishableKey = extra.supabasePublishableKey;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Supabase config missing: set `extra.supabaseUrl` and `extra.supabasePublishableKey` in app.json (or per-environment EAS profile).",
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
