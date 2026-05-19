import React from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { Colors } from "@/constants/Colors";
import { returnSize } from "../../utils/sizes";
import { ThemedText } from "./ThemedText";
import { useTranslation } from "react-i18next";
import type { LanguageCode } from "@/constants/Types";

type Lang = { code: LanguageCode; labelKey: "deutsch" | "english" | "arabic" };

const LANGS: Lang[] = [
  { code: "de", labelKey: "deutsch" },
  { code: "en", labelKey: "english" },
  { code: "ar", labelKey: "arabic" },
];

export function LanguageSwitcher({ disabled = false }: { disabled?: boolean }) {
  const { lang, rtl, setAppLanguage, ready: langReady } = useLanguage();
  const { width, height } = useWindowDimensions();
  const { isLarge } = returnSize(width, height);
  const { t } = useTranslation();

  const handlePick = (code: LanguageCode) => {
    if (disabled) return;
    if (!langReady) return;
    if (lang === code) return;
    setAppLanguage(code);
  };

  return (
    <View
      style={[
        styles.container,
        rtl && styles.rtlContainer,
        disabled && styles.containerDisabled,
      ]}
    >
      <View>
        <ThemedText style={[styles.title, rtl && styles.rtlText]}>
          {t("language")}
        </ThemedText>
        <ThemedText style={[styles.subtitle, rtl && styles.rtlText]}>
          {t("selectAppLanguage")}
        </ThemedText>
      </View>

      <View style={[styles.buttons, rtl && styles.rtlButtons]}>
        {LANGS.map(({ code, labelKey }) => {
          const isActive = lang === code;
          return (
            <Pressable
              key={code}
              disabled={disabled}
              onPress={() => handlePick(code)}
              style={({ pressed }) => [
                styles.button,
                isActive && styles.buttonActive,
                {
                  opacity: pressed ? 0.8 : 1,
                  paddingHorizontal: isLarge ? 12 : 7,
                },
                rtl && { marginLeft: 0, marginRight: 8 },
                disabled && styles.buttonDisabled,
              ]}
            >
              <Text
                style={[styles.buttonText, isActive && styles.buttonTextActive]}
              >
                {t(labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  buttons: {
    flexDirection: "row",
  },
  button: {
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.universal.link,
    marginLeft: 8,
  },
  buttonActive: {
    backgroundColor: Colors.universal.link,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    borderColor: "#ccc",
  },
  buttonText: {
    fontSize: 14,
    color: Colors.universal.link,
  },
  buttonTextActive: {
    color: "#fff",
  },
  rtlContainer: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "right",
  },
  rtlButtons: {
    flexDirection: "row-reverse",
  },
});
