import { Colors } from "@/constants/Colors";
import { PodcastGridCardType } from "@/constants/Types";
import YoutubeVideoPlayer from "@/components/YoutubeVideoPlayer";
import {
  useIsPodcastFinished,
  usePodcastFinishedStore,
} from "@/hooks/usePodcastFinishedStore";
import {
  useIsPodcastListened,
  usePodcastListenedStore,
} from "@/hooks/usePodcastListenedStore";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { formatDate } from "../../utils/formatDate";
import {
  isPodcastFavorited,
  togglePodcastFavorite,
} from "../../utils/favorites";
import { getYoutubeVideoId, parseYoutubeTime } from "../../utils/youtube";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = PodcastGridCardType & { height?: number };

const PLAYER_ASPECT_RATIO = 9 / 16;

function firstYoutubeTime(...values: (string | number | null | undefined)[]) {
  for (const value of values) {
    const seconds = parseYoutubeTime(value);
    if (seconds !== undefined) return seconds;
  }

  return undefined;
}

export default function PodcastGridCard({
  podcast,
  width,
  rtl,
  lang,
  gradientColors,
  isPlaying = false,
  onRequestPlay,
  onStopPlaying,
}: Props) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const colors = Colors[colorScheme];
  const formattedDate = formatDate(podcast.created_at);
  const videoUrl =
    podcast.youtube_url ??
    podcast.youtube_video_url ??
    podcast.video_url ??
    podcast.url;
  const videoId = useMemo(() => getYoutubeVideoId(videoUrl), [videoUrl]);
  const playerHeight = Math.round(width * PLAYER_ASPECT_RATIO);
  const hasCover = Boolean(podcast.image_url);
  const videoStartSeconds = firstYoutubeTime(
    podcast.start,
    podcast.start_time,
    podcast.video_start,
    podcast.youtube_start,
    podcast.youtube_start_seconds,
  );
  const rawVideoEndSeconds = firstYoutubeTime(
    podcast.end,
    podcast.end_time,
    podcast.video_end,
    podcast.youtube_end,
    podcast.youtube_end_seconds,
  );
  const videoEndSeconds =
    rawVideoEndSeconds !== undefined &&
    (videoStartSeconds === undefined || rawVideoEndSeconds > videoStartSeconds)
      ? rawVideoEndSeconds
      : undefined;
  const initialPlayerParams = useMemo(
    () => ({
      ...(videoStartSeconds !== undefined ? { start: videoStartSeconds } : {}),
      ...(videoEndSeconds !== undefined ? { end: videoEndSeconds } : {}),
    }),
    [videoEndSeconds, videoStartSeconds],
  );
  const playerKey = `${videoId ?? "no-video"}:${videoStartSeconds ?? "start"}:${videoEndSeconds ?? "end"}`;

  const isWatched = useIsPodcastListened(podcast?.id, lang);
  const isFinished = useIsPodcastFinished(podcast?.id, lang);
  const toggleWatched = usePodcastListenedStore((s) => s.toggleListened);
  const markAsWatched = usePodcastListenedStore((s) => s.markAsListened);
  const markAsFinished = usePodcastFinishedStore((s) => s.markAsFinished);
  const incrementPodcastFavoritesVersion = useDataVersionStore(
    (state) => state.incrementPodcastFavoritesVersion,
  );

  const [isFavorite, setIsFavorite] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    let mounted = true;

    isPodcastFavorited(podcast.id, lang)
      .then((favorite) => {
        if (mounted) setIsFavorite(favorite);
      })
      .catch(() => {
        if (mounted) setIsFavorite(false);
      });

    return () => {
      mounted = false;
    };
  }, [podcast.id, lang]);

  useEffect(() => {
    setHasVideoError(false);
  }, [videoId]);

  const onPressToggleFavorite = useCallback(async () => {
    try {
      const nextFavoriteState = await togglePodcastFavorite(podcast.id, lang);
      setIsFavorite(nextFavoriteState);
      incrementPodcastFavoritesVersion();
    } catch {
      Toast.show({
        type: "error",
        text1: t("syncFailedTryAgain"),
        visibilityTime: 2000,
        position: "top",
      });
    }
  }, [incrementPodcastFavoritesVersion, lang, podcast.id, t]);

  const onPressToggleWatched = useCallback(() => {
    const willBeWatched = !isWatched;
    toggleWatched(podcast.id, lang);

    Toast.show({
      type: willBeWatched ? "success" : "info",
      text1: willBeWatched ? t("marked_as_watched") : t("unmarked_as_watched"),
      visibilityTime: 2000,
      position: "top",
    });
  }, [isWatched, lang, podcast.id, t, toggleWatched]);

  const onStateChange = useCallback(
    (state: string) => {
      if (state === "playing") {
        onRequestPlay?.();
        return;
      }

      if (state === "paused" || state === "unstarted") {
        onStopPlaying?.();
        return;
      }

      if (state === "ended") {
        onStopPlaying?.();

        if (!isWatched) {
          markAsWatched(podcast.id, lang);
        }

        if (!isFinished) {
          markAsFinished(podcast.id, lang);
          Toast.show({
            type: "success",
            text1: t("marked_as_finished"),
            visibilityTime: 2000,
            position: "top",
          });
        }
      }
    },
    [
      isFinished,
      isWatched,
      lang,
      markAsFinished,
      markAsWatched,
      onRequestPlay,
      onStopPlaying,
      podcast.id,
      t,
    ],
  );

  return (
    <View style={[styles.cardShadow, { width }]}>
      <View style={[styles.card, { backgroundColor: colors.contrast }]}>
        {videoId && !hasVideoError ? (
          <View
            style={[
              styles.playerClip,
              { height: playerHeight },
              isWatched && styles.cardIsWatched,
            ]}
          >
            <YoutubeVideoPlayer
              key={playerKey}
              height={playerHeight}
              width={width}
              play={isPlaying}
              videoId={videoId}
              initialPlayerParams={initialPlayerParams}
              onChangeState={onStateChange}
              onError={() => setHasVideoError(true)}
            />
          </View>
        ) : (
          <View style={[styles.videoFallback, { height: playerHeight }]}>
            {hasCover ? (
              <>
                <Image
                  source={{ uri: podcast.image_url! }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={[
                    "rgba(0,0,0,0.15)",
                    "rgba(0,0,0,0.45)",
                    "rgba(0,0,0,0.85)",
                  ]}
                  locations={[0, 0.55, 1]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </>
            ) : (
              <LinearGradient
                style={StyleSheet.absoluteFill}
                colors={gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}

            <View style={styles.fallbackContent}>
              <Ionicons name="logo-youtube" size={34} color="#FFFFFF" />
              <Text style={styles.fallbackText}>{t("videoUnavailable")}</Text>
            </View>
          </View>
        )}

        <View style={styles.content}>
          <View
            style={[
              styles.titleRow,
              { flexDirection: rtl ? "row-reverse" : "row" },
            ]}
          >
            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                    textAlign: rtl ? "right" : "left",
                    writingDirection: rtl ? "rtl" : "ltr",
                  },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {podcast.title}
              </Text>

              <Text
                style={[
                  styles.createdAt,
                  {
                    color: colors.tabIconDefault,
                    textAlign: rtl ? "right" : "left",
                    writingDirection: rtl ? "rtl" : "ltr",
                  },
                ]}
                numberOfLines={1}
              >
                {formattedDate}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onPressToggleFavorite}
              style={styles.iconButton}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? Colors[colorScheme].error : colors.text}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.actionsRow,
              { flexDirection: rtl ? "row-reverse" : "row" },
            ]}
          >
            <TouchableOpacity
              onPress={onPressToggleWatched}
              style={[
                styles.statusButton,
                {
                  backgroundColor: isWatched
                    ? Colors.universal.primary
                    : colors.background,
                },
              ]}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isWatched ? "eye" : "eye-outline"}
                size={18}
                color={isWatched ? "#FFFFFF" : colors.text}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.statusButtonText,
                  { color: isWatched ? "#FFFFFF" : colors.text },
                ]}
              >
                {t("watched")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 3,
    overflow: "visible",
  },

  card: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 0.6,
  },

  cardIsWatched: {
    opacity: 0.5,
  },

  playerClip: {
    width: "100%",
    backgroundColor: "#000",
  },

  videoFallback: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    overflow: "hidden",
  },

  fallbackContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },

  fallbackText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },

  content: {
    padding: 14,
    gap: 12,
  },

  titleRow: {
    alignItems: "flex-start",
    gap: 10,
  },

  titleContainer: {
    flex: 1,
    gap: 5,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },

  createdAt: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  actionsRow: {
    gap: 10,
  },

  statusButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  statusButtonText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "800",
  },
});
