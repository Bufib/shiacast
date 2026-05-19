import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import { supabase } from "../../utils/supabase";

const STORE_URLS = {
  ios: "https://apps.apple.com/app/idYOUR_APP_ID",
  android: "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME",
};

const REQUIRED_VERSION_CACHE_KEY = "required_app_version";
const VERSION_CHECK_TIMEOUT_MS = 5000;

function getInstalledVersion(): string {
  const fromExpo = Constants.expoConfig?.version;
  const fromNative = Application.nativeApplicationVersion;
  return (fromExpo ?? fromNative ?? "0.0.0").trim();
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Version check timed out"));
    }, ms);

    Promise.resolve(promise)
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}

export default function ForceUpdateGate() {
  if (Platform.OS === "web") {
    return null;
  }

  return <NativeForceUpdateGate />;
}

function NativeForceUpdateGate() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"checking" | "ok" | "needsUpdate">(
    "checking",
  );

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (__DEV__) {
        if (!cancelled) setStatus("ok");
        return;
      }

      const installedVersion = getInstalledVersion();

      try {
        const { data, error } = await withTimeout(
          supabase.from("versions").select("app_version").single(),
          VERSION_CHECK_TIMEOUT_MS,
        );

        if (cancelled) return;

        if (error || !data?.app_version) {
          const cached = await AsyncStorage.getItem(REQUIRED_VERSION_CACHE_KEY);
          if (cancelled) return;

          const cachedTrimmed = cached?.trim() ?? "";

          if (cachedTrimmed && cachedTrimmed !== installedVersion) {
            setStatus("needsUpdate");
          } else {
            setStatus("ok");
          }

          return;
        }

        const requiredVersion = String(data.app_version).trim();

        await AsyncStorage.setItem(REQUIRED_VERSION_CACHE_KEY, requiredVersion);

        if (cancelled) return;

        setStatus(installedVersion === requiredVersion ? "ok" : "needsUpdate");
      } catch (e) {
        console.warn("Version check failed:", e);
        if (!cancelled) setStatus("ok");
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "ok") {
    return null;
  }

  if (status === "checking") {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator />
      </View>
    );
  }

  const openStore = () => {
    const url = Platform.OS === "ios" ? STORE_URLS.ios : STORE_URLS.android;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>{t("updateRequiredTitle")}</Text>

      <Text style={styles.message}>{t("updateRequiredMessage")}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={openStore}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{t("updateNow")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
