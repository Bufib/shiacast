import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import { LanguageCode } from "@/constants/Types";
import { Colors } from "@/constants/Colors";

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
];

export default function LanguageSelection() {
  const { t } = useTranslation();
  const { lang, setAppLanguage, ready, rtl } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const onPick = useCallback(
    async (code: LanguageCode) => {
      if (isChanging) return;

      try {
        setIsChanging(true);
        await setAppLanguage(code);
      } finally {
        setIsChanging(false);
      }
    },
    [isChanging, setAppLanguage],
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={[styles.title, rtl && styles.textRight]}>
          {t("chooseLanguage")}
        </Text>

        {LANGUAGES.map(({ code, label }) => {
          const selected = code === lang;

          return (
            <TouchableOpacity
              key={code}
              onPress={() => onPick(code)}
              disabled={isChanging}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: isChanging }}
              style={[styles.button, selected && styles.buttonSelected]}
            >
              <Text
                style={[
                  styles.buttonText,
                  selected && styles.buttonTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#111",
  },
  textRight: {
    textAlign: "right",
  },
  button: {
    marginVertical: 8,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  buttonSelected: {
    borderColor: Colors.universal.link,
    backgroundColor: "rgba(0, 122, 255, 0.08)",
  },
  buttonText: {
    fontSize: 20,
    color: Colors.universal.link,
  },
  buttonTextSelected: {
    fontWeight: "700",
  },
});
