
import * as Localization from "expo-localization";
import i18n from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initReactI18next } from "react-i18next";
import ar from "../locales/ar";
import de from "../locales/de";
import en from "../locales/en";

const I18N_CACHE_KEY = "i18nextLng";

const canUseBrowserStorage = () => typeof window !== "undefined";

const languageDetector = {
  type: "languageDetector" as const,
  async: true as const,

  detect: (callback: (lng: string) => void): void => {
    (async () => {
      if (canUseBrowserStorage()) {
        try {
          const cached = await AsyncStorage.getItem(I18N_CACHE_KEY);
          if (cached) {
            callback(cached);
            return;
          }
        } catch (e) {
          console.warn("AsyncStorage getItem failed:", e);
        }
      }

      try {
        const locales = Localization.getLocales?.() ?? [];
        const tag = locales[0]?.languageTag ?? "de-DE";
        callback(tag.split("-")[0]);
      } catch {
        callback("de");
      }
    })();
  },

  init: (): void => {
    // no-op
  },

  cacheUserLanguage: (lng: string): void => {
    if (!canUseBrowserStorage()) return;

    AsyncStorage.setItem(I18N_CACHE_KEY, lng).catch((e) =>
      console.warn("AsyncStorage setItem failed:", e),
    );
  },
};

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: "de",
    interpolation: { escapeValue: false },
  });

export default i18n;
