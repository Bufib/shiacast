// import * as Localization from "expo-localization";
// import i18n from "i18next";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { initReactI18next } from "react-i18next";

// import ar from "../locales/ar";
// import de from "../locales/de";
// import en from "../locales/en";

// const languageDetector = {
//   type: "languageDetector" as const,
//   async: true as const, // use async detector with a callback

//   // Async detect using a callback provided by i18next
//   detect: (callback: (lng: string) => void): void => {
//     (async () => {
//       try {
//         const stored = await AsyncStorage.getItem("language");
//         if (stored) {
//           callback(stored);
//           return;
//         }
//       } catch (e) {
//         console.warn("AsyncStorage getItem failed:", e);
//       }

//       // Fallback to device locale
//       try {
//         const locales = Localization.getLocales?.() ?? [];
//         const tag = locales[0]?.languageTag ?? "de-DE";
//         callback(tag.split("-")[0]);
//       } catch {
//         callback("de");
//       }
//     })();
//   },

//   init: (): void => {
//     // no-op
//   },

//   // Persist chosen language
//   cacheUserLanguage: (lng: string): void => {
//     AsyncStorage.setItem("language", lng).catch((e) =>
//       console.warn("AsyncStorage setItem failed:", e)
//     );
//   },
// };

// // eslint-disable-next-line import/no-named-as-default-member
// i18n
//   .use(languageDetector)
//   .use(initReactI18next)
//   .init({
//     resources: {
//       de: { translation: de },
//       ar: { translation: ar },
//       en: { translation: en },
//     },
//     fallbackLng: "de",
//     interpolation: { escapeValue: false },
//   });

// export default i18n;

import * as Localization from "expo-localization";
import i18n from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initReactI18next } from "react-i18next";
import ar from "../locales/ar";
import de from "../locales/de";
import en from "../locales/en";

const I18N_CACHE_KEY = "i18nextLng";

const languageDetector = {
  type: "languageDetector" as const,
  async: true as const,

  detect: (callback: (lng: string) => void): void => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(I18N_CACHE_KEY);
        if (cached) {
          callback(cached);
          return;
        }
      } catch (e) {
        console.warn("AsyncStorage getItem failed:", e);
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
