import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";

import handleOpenExternalUrl from "../../utils/handleOpenExternalUrl";
import handleOpenInternalUrl from "../../utils/handleOpenInternalUrl";
import { InternalLinkType } from "@/constants/Types";

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

// Prevent ugly internal breaking like "An-\nNisaa"
const makeLabelMoreStable = (value: string) => {
  return value
    .replace(/-/g, "\u2011")
    .replace(/\s/g, "\u00A0"); // non-breaking space
};

const InlineRenderLink = ({
  url,
  index,
  isExternal,
  isDone = false,
}: InlineRenderLinkProps) => {
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

    if (type === "questionLink") {
      setLabel(`Frage ${identifier}`);
      return;
    }

    if (type === "prayerLink") {
      setLabel(`Gebet ${identifier}`);
      return;
    }

    setLabel(`Sura ${String(identifier).split(":")[0]}`);
  }, [url, isExternal, index]);

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
