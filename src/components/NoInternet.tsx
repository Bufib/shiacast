import { StyleSheet, useColorScheme } from "react-native";
import React, { useEffect, useRef } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";

interface NoInternetProps {
  showUI?: boolean;
  showToast?: boolean;
}

export const NoInternet = ({
  showUI = false,
  showToast = false,
}: NoInternetProps) => {
  const hasInternet = useConnectionStatus();
  const prevConnected = useRef(true);
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  const { lang } = useLanguage();

  useEffect(() => {
    // Only react when the connectivity value actually changes
    if (prevConnected.current !== hasInternet) {
      // If we're supposed to show toasts, do it
      if (showToast) {
        Toast.show({
          type: hasInternet ? "success" : "error",
          text1: hasInternet ? t("internetBackTitle") : t("noInternetTitle"),
          text2: hasInternet ? "" : t("noInternetMessage"),
        });
      }

      // Always update the previous state, regardless of showToast
      prevConnected.current = hasInternet;
    }
  }, [hasInternet, showToast, lang, t]);

  if (!showUI || hasInternet) return null;

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.noInternet,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <ThemedText style={styles.noInternetText}>
        {t("noInternetTitle")}
        {"\n"}
        {t("noInternetMessage")}
      </ThemedText>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  noInternet: {
    padding: 15,
  },
  noInternetText: {
    textAlign: "center",
    color: Colors.universal.error,
    fontSize: 16,
    fontWeight: "700",
  },
});
