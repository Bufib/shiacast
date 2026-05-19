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
const USER_PICKED_KEY = "userPickedLanguage";

// TODO: Für späteres Release auf `false` setzen, damit die
// Sprachauswahl wieder angezeigt wird.
const FORCE_DEFAULT_LANGUAGE = false;

function isValidLanguage(
  value: string | null | undefined,
): value is LanguageCode {
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
        if (FORCE_DEFAULT_LANGUAGE) {
          if (i18n.language !== DEFAULT_LANG) {
            await i18n.changeLanguage(DEFAULT_LANG);
          }
          if (!mounted) return;
          setLang(DEFAULT_LANG);
          setHasStoredLanguage(true);
          return;
        }

        const entries = await AsyncStorage.multiGet([
          USER_PICKED_KEY,
          LANGUAGE_STORAGE_KEY,
        ]);

        const userPicked = entries[0][1];
        const storedLanguage = entries[1][1];

        if (userPicked === "1" && isValidLanguage(storedLanguage)) {
          if (i18n.language !== storedLanguage) {
            await i18n.changeLanguage(storedLanguage);
          }
          if (!mounted) return;
          setLang(storedLanguage);
          setHasStoredLanguage(true);
        } else {
          if (!mounted) return;
          const current = i18n.language;
          setLang(isValidLanguage(current) ? current : DEFAULT_LANG);
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
        await AsyncStorage.multiSet([
          [LANGUAGE_STORAGE_KEY, language],
          [USER_PICKED_KEY, "1"],
        ]);

        await i18n.changeLanguage(language);

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
