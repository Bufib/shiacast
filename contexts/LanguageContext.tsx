// import { LanguageContextType, LanguageCode } from "@/constants/Types";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, {
//   createContext,
//   ReactNode,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   useCallback,
// } from "react";
// import { useTranslation } from "react-i18next";

// const DEFAULT_LANG: LanguageCode = "de";
// const LANGUAGE_STORAGE_KEY = "language";

// function isValidLanguage(value: string | null): value is LanguageCode {
//   return value === "de" || value === "en" || value === "ar";
// }

// const LanguageContext = createContext<LanguageContextType>({
//   lang: DEFAULT_LANG,
//   setAppLanguage: async () => {},
//   ready: false,
//   rtl: false,
//   hasStoredLanguage: false,
// });

// export function LanguageProvider({ children }: { children: ReactNode }) {
//   const { i18n, ready: i18nReady } = useTranslation();

//   const [lang, setLang] = useState<LanguageCode>(DEFAULT_LANG);
//   const [checkedStorage, setCheckedStorage] = useState(false);
//   const [hasStoredLanguage, setHasStoredLanguage] = useState(false);

//   useEffect(() => {
//     let mounted = true;

//     const loadStoredLanguage = async () => {
//       try {
//         const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

//         if (isValidLanguage(storedLanguage)) {
//           await i18n.changeLanguage(storedLanguage);

//           if (!mounted) return;

//           setLang(storedLanguage);
//           setHasStoredLanguage(true);
//         } else {
//           await i18n.changeLanguage(DEFAULT_LANG);

//           if (!mounted) return;

//           setLang(DEFAULT_LANG);
//           setHasStoredLanguage(false);
//         }
//       } catch (error) {
//         if (__DEV__) {
//           console.warn("Failed to load language from storage:", error);
//         }

//         if (!mounted) return;

//         setLang(DEFAULT_LANG);
//         setHasStoredLanguage(false);
//       } finally {
//         if (mounted) {
//           setCheckedStorage(true);
//         }
//       }
//     };

//     loadStoredLanguage();

//     return () => {
//       mounted = false;
//     };
//   }, [i18n]);

//   useEffect(() => {
//     const onLanguageChange = (language: string) => {
//       if (isValidLanguage(language)) {
//         setLang(language);
//       }
//     };

//     i18n.on("languageChanged", onLanguageChange);

//     return () => {
//       i18n.off("languageChanged", onLanguageChange);
//     };
//   }, [i18n]);

//   const setAppLanguage = useCallback(
//     async (language: LanguageCode) => {
//       try {
//         await i18n.changeLanguage(language);
//         await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);

//         setLang(language);
//         setHasStoredLanguage(true);
//       } catch (error) {
//         console.warn("Failed to change language:", error);
//       }
//     },
//     [i18n]
//   );

//   const ready = i18nReady && checkedStorage;
//   const rtl = lang === "ar";

//   const value = useMemo(
//     () => ({
//       lang,
//       setAppLanguage,
//       ready,
//       rtl,
//       hasStoredLanguage,
//     }),
//     [lang, setAppLanguage, ready, rtl, hasStoredLanguage]
//   );

//   return (
//     <LanguageContext.Provider value={value}>
//       {children}
//     </LanguageContext.Provider>
//   );
// }

// export function useLanguage() {
//   return useContext(LanguageContext);
// }

import { LanguageContextType, LanguageCode } from "@/constants/Types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";

const DEFAULT_LANG: LanguageCode = "de";
const LANGUAGE_STORAGE_KEY = "language";

function isValidLanguage(value: string | null): value is LanguageCode {
  return value === "de" || value === "en" || value === "ar";
}

const LanguageContext = createContext<LanguageContextType>({
  lang: DEFAULT_LANG,
  setAppLanguage: async () => {},
  ready: false,
  rtl: false,
  hasStoredLanguage: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n, ready: i18nReady } = useTranslation();

  const [lang, setLang] = useState<LanguageCode>(DEFAULT_LANG);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [hasStoredLanguage, setHasStoredLanguage] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadStoredLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (isValidLanguage(storedLanguage)) {
          await i18n.changeLanguage(storedLanguage);

          if (!mounted) return;

          setLang(storedLanguage);
          setHasStoredLanguage(true);
        } else {
          await i18n.changeLanguage(DEFAULT_LANG);

          if (!mounted) return;

          setLang(DEFAULT_LANG);
          setHasStoredLanguage(false);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to load language from storage:", error);
        }

        if (!mounted) return;

        setLang(DEFAULT_LANG);
        setHasStoredLanguage(false);
      } finally {
        if (mounted) {
          setCheckedStorage(true);
        }
      }
    };

    loadStoredLanguage();

    return () => {
      mounted = false;
    };
  }, [i18n]);

  useEffect(() => {
    const onLanguageChange = (language: string) => {
      if (isValidLanguage(language)) {
        setLang(language);
      }
    };

    i18n.on("languageChanged", onLanguageChange);

    return () => {
      i18n.off("languageChanged", onLanguageChange);
    };
  }, [i18n]);

  const setAppLanguage = useCallback(
    async (language: LanguageCode) => {
      try {
        await i18n.changeLanguage(language);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);

        setLang(language);
        setHasStoredLanguage(true);
      } catch (error) {
        console.warn("Failed to change language:", error);
      }
    },
    [i18n],
  );

  const ready = i18nReady && checkedStorage;
  const rtl = lang === "ar";

  const value = useMemo(
    () => ({
      lang,
      setAppLanguage,
      ready,
      rtl,
      hasStoredLanguage,
    }),
    [lang, setAppLanguage, ready, rtl, hasStoredLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
