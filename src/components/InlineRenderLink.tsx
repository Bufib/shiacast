import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";

import handleOpenExternalUrl from "../../utils/handleOpenExternalUrl";
import handleOpenInternalUrl from "../../utils/handleOpenInternalUrl";
import { getQuestionInternalURL } from "../../db/queries/questions";
import { getPrayerInternalURL } from "../../db/queries/prayers";
import { getQuranInternalURL } from "../../db/queries/quran";
import {
  InternalLinkType,
  LanguageCode,
  QuranInternalResultType,
} from "@/constants/Types";

type InlineRenderLinkProps = {
  url: string;
  index: number;
  isExternal: boolean;
  isDone?: boolean;
};

type ParsedInternal =
  | { type: "questionLink"; identifier: number }
  | { type: "prayerLink"; identifier: number }
  | { type: "quranLink"; identifier: string }
  | null;

const parseInternalUrl = (raw: string): ParsedInternal => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const [maybeType, ...rest] = trimmed.split(":");
  const remainder = rest.join(":").trim();
  if (!remainder) return null;

  if (maybeType === "questionLink") {
    const id = Number(remainder);
    if (Number.isNaN(id)) return null;
    return { type: "questionLink", identifier: id };
  }

  if (maybeType === "prayerLink") {
    const id = Number(remainder);
    if (Number.isNaN(id)) return null;
    return { type: "prayerLink", identifier: id };
  }

  if (maybeType === "quranLink") {
    return { type: "quranLink", identifier: remainder };
  }

  return null;
};

const getExternalLabel = (url: string): string => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    return host || url;
  } catch {
    return url;
  }
};

const buildQuranLabel = (
  identifier: string,
  q: Partial<QuranInternalResultType> | null | undefined,
  lang: LanguageCode
): string => {
  const [suraStr] = identifier.split(":");
  const sura = q?.sura ?? Number(suraStr);

  let suraName: string | undefined;

  if (lang === "ar") {
    suraName = q?.sura_label_ar || q?.sura_label_en || q?.sura_label_de;
  } else {
    suraName = q?.sura_label_en || q?.sura_label_de || q?.sura_label_ar;
  }

  if (suraName && Number.isFinite(sura)) {
    return `${suraName} (${sura})`;
  }

  if (suraName) return suraName;
  if (Number.isFinite(sura)) return `Sura ${sura}`;

  return identifier;
};

// Prevent ugly internal breaking like "An-\nNisaa"
const makeLabelMoreStable = (value: string) => {
  return value
    .replace(/-/g, "\u2011")   // non-breaking hyphen
    .replace(/\s/g, "\u00A0"); // non-breaking space
};

const InlineRenderLink = ({
  url,
  index,
  isExternal,
  isDone = false,
}: InlineRenderLinkProps) => {
  const colorScheme = useColorScheme() || "light";
  const { rtl, lang } = useLanguage();

  const [label, setLabel] = useState<string>(
    isExternal ? getExternalLabel(url) : `Link ${index + 1}`
  );

  const handlePress = useCallback(() => {
    if (isExternal) {
      handleOpenExternalUrl(url);
      return;
    }

    const parsed = parseInternalUrl(url);
    if (!parsed) return;

    const { type, identifier } = parsed;
    handleOpenInternalUrl(String(identifier), lang, type as InternalLinkType);
  }, [url, isExternal, lang]);

  useEffect(() => {
    if (isExternal) {
      setLabel(getExternalLabel(url));
    }
  }, [url, isExternal]);

  useEffect(() => {
    if (isExternal) return;

    const parsed = parseInternalUrl(url);
    if (!parsed) {
      setLabel(url);
      return;
    }

    const { type, identifier } = parsed;
    let cancelled = false;

    const load = async () => {
      try {
        if (type === "questionLink") {
          const q = await getQuestionInternalURL(identifier, lang);
          if (!cancelled) {
            setLabel(q?.title || `Frage ${identifier}`);
          }
          return;
        }

        if (type === "prayerLink") {
          const p = await getPrayerInternalURL(identifier, lang);
          if (!cancelled) {
            setLabel(
              (lang === "ar" && p?.arabic_title) ||
                p?.name ||
                `Gebet ${identifier}`
            );
          }
          return;
        }

        if (type === "quranLink") {
          const q = await getQuranInternalURL(String(identifier), lang);
          if (!cancelled) {
            setLabel(
              q
                ? buildQuranLabel(String(identifier), q, lang)
                : buildQuranLabel(String(identifier), {}, lang)
            );
          }
        }
      } catch (error) {
        console.error("InlineRenderLink: failed to hydrate label", error);
        if (!cancelled) {
          setLabel(`Link ${index + 1}`);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [url, lang, isExternal, index]);

  return (
    <ThemedText
      onPress={handlePress}
      suppressHighlighting
      style={[
        styles.linkText,
        { textAlign: rtl ? "right" : "left" },
        isDone && styles.doneText,
      ]}
    >
      {makeLabelMoreStable(label)}
    </ThemedText>
  );
};

const styles = StyleSheet.create({
  linkText: {
    fontSize: 14,
    color: Colors.universal.link,
  },
  doneText: {
    opacity: 0.6,
  },
});

export default InlineRenderLink;