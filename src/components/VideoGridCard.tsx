import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { VideoGridCardType } from "@/constants/Types";
import YoutubeVideoPlayer from "@/components/YoutubeVideoPlayer";
import { useGradient } from "@/hooks/useGradient";
import {
  useIsVideoFinished,
  useVideoFinishedStore,
} from "@/hooks/useVideoFinishedStore";
import {
  useIsVideoWatched,
  useVideoWatchedStore,
} from "@/hooks/useVideoWatchedStore";
import { formatDate } from "../../utils/formatDate";
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
  View
} from "react-native";
import Toast from "react-native-toast-message";
import VideoFavoriteFolderModal from "@/components/VideoFavoriteFolderModal";
import { useVideoFavoriteFoldersStore } from "../../stores/videoFavoriteFoldersStore";

type Props = VideoGridCardType;

const PLAYER_ASPECT_RATIO = 9 / 16;

function firstYoutubeTime(...values: (string | number | null | undefined)[]) {
  for (const value of values) {
    const seconds = parseYoutubeTime(value);
    if (seconds !== undefined) return seconds;
  }
  return undefined;
}

export default function VideoGridCard({
  video,
  width,
  rtl,
  lang,
  gradientColors,
  isPlaying = false,
  onRequestPlay,
  onStopPlaying,
}: Props) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const formattedDate = formatDate(video.created_at);

  const videoUrl =
    video.youtube_url ??
    video.youtube_video_url ??
    video.video_url ??
    video.url;

  const videoId = useMemo(() => getYoutubeVideoId(videoUrl), [videoUrl]);

  const playerHeight = Math.round(width * PLAYER_ASPECT_RATIO);
  const hasCover = Boolean(video.image_url);

  // Deterministischer Gradient pro Video-ID. Wenn der Aufrufer einen eigenen
  // gradientColors-Prop übergibt, hat dieser Vorrang.
  const { gradientColors: deterministicGradient } = useGradient({
    seed: video.id,
  });
  const effectiveGradient = gradientColors ?? deterministicGradient;

  const { videoStartSeconds, videoEndSeconds } = useMemo(() => {
    const start = firstYoutubeTime(
      video.start,
      video.start_time,
      video.video_start,
      video.youtube_start,
      video.youtube_start_seconds,
    );
    const rawEnd = firstYoutubeTime(
      video.end,
      video.end_time,
      video.video_end,
      video.youtube_end,
      video.youtube_end_seconds,
    );
    const end =
      rawEnd !== undefined && (start === undefined || rawEnd > start)
        ? rawEnd
        : undefined;
    return { videoStartSeconds: start, videoEndSeconds: end };
  }, [
    video.start,
    video.start_time,
    video.video_start,
    video.youtube_start,
    video.youtube_start_seconds,
    video.end,
    video.end_time,
    video.video_end,
    video.youtube_end,
    video.youtube_end_seconds,
  ]);

  const initialPlayerParams = useMemo(
    () => ({
      ...(videoStartSeconds !== undefined ? { start: videoStartSeconds } : {}),
      ...(videoEndSeconds !== undefined ? { end: videoEndSeconds } : {}),
    }),
    [videoEndSeconds, videoStartSeconds],
  );

  const playerKey = `${videoId ?? "no-video"}:${videoStartSeconds ?? "start"}:${videoEndSeconds ?? "end"}`;

  const isWatched = useIsVideoWatched(video?.id, lang);
  const isFinished = useIsVideoFinished(video?.id, lang);
  const toggleWatched = useVideoWatchedStore((s) => s.toggleWatched);
  const markAsWatched = useVideoWatchedStore((s) => s.markAsWatched);
  const markAsFinished = useVideoFinishedStore((s) => s.markAsFinished);

  const isFavorite = useVideoFavoriteFoldersStore((s) =>
    s.isVideoFavorited(video.id),
  );

  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  // Lazy-Mount: Player erst nach Tap montieren – spart RAM/CPU bei langen Listen.
  const [playerMounted, setPlayerMounted] = useState(false);

  useEffect(() => {
    setHasVideoError(false);
    setPlayerMounted(false);
  }, [videoId]);

  // Wenn diese Karte das "aktive" Video ist, montieren.
  useEffect(() => {
    if (isPlaying) setPlayerMounted(true);
  }, [isPlaying]);

  const onPressToggleFavorite = useCallback(() => {
    setFolderModalVisible(true);
  }, []);

  const onPressToggleWatched = useCallback(() => {
    const willBeWatched = !isWatched;
    toggleWatched(video.id, lang);

    Toast.show({
      type: willBeWatched ? "success" : "info",
      text1: willBeWatched ? t("marked_as_watched") : t("unmarked_as_watched"),
      visibilityTime: 2000,
      position: "top",
    });
  }, [isWatched, lang, video.id, t, toggleWatched]);

  const onPressPlay = useCallback(() => {
    setPlayerMounted(true);
    onRequestPlay?.();
  }, [onRequestPlay]);

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
          markAsWatched(video.id, lang);
        }

        if (!isFinished) {
          markAsFinished(video.id, lang);
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
      video.id,
      t,
    ],
  );

  const thumbnailUrl = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (
    <>
      <VideoFavoriteFolderModal
        videoId={video.id}
        visible={folderModalVisible}
        onClose={() => setFolderModalVisible(false)}
      />

      <View style={[styles.cardShadow, { width }]}>
        <View style={[styles.card, { backgroundColor: colors.contrast }]}>
          {videoId && !hasVideoError ? (
            playerMounted ? (
              <View style={[styles.playerClip, { height: playerHeight }]}>
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
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t("playVideo")}
                activeOpacity={0.9}
                onPress={onPressPlay}
                style={[styles.playerClip, { height: playerHeight }]}
              >
                {thumbnailUrl ? (
                  <Image
                    source={{ uri: thumbnailUrl }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: "#000" },
                    ]}
                  />
                )}
                <View style={styles.thumbnailOverlay} />
                <View style={styles.playButtonWrapper}>
                  <Ionicons name="play-circle" size={70} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            )
          ) : (
            <View style={[styles.videoFallback, { height: playerHeight }]}>
              {hasCover ? (
                <>
                  <Image
                    source={{ uri: video.image_url! }}
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
                  colors={effectiveGradient as any}
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
                <View
                  style={[
                    styles.titleLine,
                    { flexDirection: rtl ? "row-reverse" : "row" },
                  ]}
                >
                  {isWatched && (
                    <View
                      style={[
                        styles.watchedBadge,
                        { backgroundColor: Colors.universal.primary },
                      ]}
                    >
                      <Ionicons name="eye" size={11} color="#fff" />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        color: colors.text,
                        textAlign: rtl ? "right" : "left",
                        writingDirection: rtl ? "rtl" : "ltr",
                        flex: 1,
                      },
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {video.title}
                  </Text>
                </View>

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
                  size={30}
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
    </>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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

  playerClip: {
    width: "100%",
    backgroundColor: "#000",
    overflow: "hidden",
  },

  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  playButtonWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
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

  titleLine: {
    alignItems: "center",
    gap: 6,
  },

  watchedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
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
