import i18n from "./i18n";

const NATIVE_LABELS: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  ar: "العربية",
};

export function getLanguageLabel(language: string | null): string {
  if (language === null) return i18n.t("allLanguages");
  return NATIVE_LABELS[language] ?? language.toUpperCase();
}
