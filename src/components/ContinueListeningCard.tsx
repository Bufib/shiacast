import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { useLanguage } from "../../contexts/LanguageContext";
import { useLastPlayedPodcast, useLastPlayedPodcastStore } from "../../stores/useLastPlayedPodcastStore";
import { useIsPodcastListened } from "@/hooks/usePodcastListenedStore";
import { getImageUrl } from "../../utils/podcastStorage";


const LOCAL_PODCAST_ARTWORK = require("@/assets/images/icon.png");
const CARD_HEIGHT = 110;

export default function ContinueListeningCard() {
  const { t } = useTranslation();
  const { lang, rtl } = useLanguage();

  const entry = useLastPlayedPodcast();
  const dismiss = useLastPlayedPodcastStore((s) => s.dismiss);

  const isListened = useIsPodcastListened(entry?.podcast?.id, lang);

  // Cover frisch signieren — gespeicherte signed URLs können abgelaufen sein
  const { data: coverUrl } = useQuery({
    queryKey: ["podcast_cover", entry?.podcast?.image_filename],
    queryFn: () =>
      getImageUrl(entry!.podcast.image_filename as string),
    enabled: Boolean(entry?.podcast?.image_filename),
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  if (!entry || entry.dismissed || isListened) return null;

  const { podcast } = entry;
  const coverSource = coverUrl ? { uri: coverUrl } : LOCAL_PODCAST_ARTWORK;

  const onPress = () => {
    router.push({
      pathname: "/indexPodcast",
      params: { id: String(podcast.id) },
    });
  };

  return (
    <View style={styles.shadowWrap}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[
          styles.card,
          { flexDirection: rtl ? "row-reverse" : "row" },
        ]}
      >
        <Image
          source={coverSource}
          style={styles.cover}
          contentFit="cover"
        />

        <View
          style={[
            styles.content,
            { alignItems: rtl ? "flex-end" : "flex-start" },
          ]}
        >
          <Text style={styles.label}>{t("continue_listening")}</Text>

          <Text
            style={[
              styles.title,
              {
                textAlign: rtl ? "right" : "left",
                writingDirection: rtl ? "rtl" : "ltr",
              },
            ]}
            numberOfLines={2}
          >
            {podcast.title}
          </Text>

          <View
            style={[
              styles.playRow,
              { flexDirection: rtl ? "row-reverse" : "row" },
            ]}
          >
            <View style={styles.playCircle}>
              <Feather name="play" size={12} color="#fff" />
            </View>
            <Text
              style={[
                styles.playLabel,
                rtl ? { marginRight: 8 } : { marginLeft: 8 },
              ]}
            >
              {t("resume")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={dismiss}
          hitSlop={10}
          style={[
            styles.dismiss,
            rtl ? { left: 10 } : { right: 10 },
          ]}
        >
          <Ionicons name="close" size={16} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  cover: {
    width: CARD_HEIGHT,
    height: CARD_HEIGHT,
  },
  content: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 15,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  playRow: {
    alignItems: "center",
  },
  playCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.28)",
    justifyContent: "center",
    alignItems: "center",
  },
  playLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  dismiss: {
    position: "absolute",
    top: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
});