import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Asset } from "expo-asset";
import type { VideoSource } from "expo-video";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import type { PodcastPlayerPropsType, SavedProgress } from "@/constants/Types";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useGlobalPlayer } from "../../player/useGlobalPlayer";
import {
  remoteUrlFor,
  usePodcasts,
  cancelCurrentDownload,
  deleteFromCache,
} from "../../hooks/usePodcasts";
import { isPodcastFavorited, togglePodcastFavorite } from "../../utils/favorites";
import { ThemedText } from "./ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../../contexts/LanguageContext";
import { usePodcastDownloadStore } from "../../stores/usePodcastDownloadStore";
import { useDataVersionStore } from "../../stores/dataVersionStore";

export default function PodcastPlayer({ podcast }: PodcastPlayerPropsType) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const isDark = colorScheme === "dark";
  const lastTimeKey = (id: string | number) => `podcast:lastTime:${id}`;
  // Artwork (local app logo)
  const logoAsset = Asset.fromModule(require("@/assets/images/logo.png"));
  const artworkUri: string | undefined = logoAsset?.uri || undefined;

  // Global player state & actions
  const {
    isPlaying,
    position,
    duration,
    status,
    rate,
    podcastId,
    currentUri,
    currentKey,
    load,
    play,
    pause,
    toggle,
    seekBy,
    setPosition,
    setRate,
    stopAndKeepSource,
    stopAndUnload,
  } = useGlobalPlayer();

  // Cache/download helpers
  const { download, getCachedUri } = usePodcasts(
    podcast?.language_code ?? "de"
  );

  // UI state
  const [isFavorite, setIsFavorite] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [isStream, setIsStream] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [lastTime, setLastTime] = useState<SavedProgress | null>(null);
  const downloadKey = String(podcast?.id ?? podcast?.filename ?? "");
  const justLoadedRef = useRef(false);
  const isDownloading = usePodcastDownloadStore((s) =>
    s.isDownloading(downloadKey)
  );
  const downloadProgress = usePodcastDownloadStore((s) =>
    s.getProgress(downloadKey)
  );

  const setDownloading = usePodcastDownloadStore((s) => s.setDownloading);
  const setProgress = usePodcastDownloadStore((s) => s.setProgress);
  const resetDownloadState = usePodcastDownloadStore((s) => s.reset);

  const { lang } = useLanguage();
  // Animations
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const loadedPodcastIdRef = useRef<string | number | null>(null);
  const manuallyLoadedRef = useRef(false);

  // Cached file, if available
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!podcast?.filename) {
        if (alive) setCachedUri(null);
        return;
      }
      try {
        const uri = await getCachedUri(podcast.filename);
        if (alive) setCachedUri(uri ?? null);
      } catch {
        if (alive) setCachedUri(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [podcast?.id, podcast?.filename, getCachedUri]);

  // Favorite
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!podcast?.id) return;
      try {
        const result = await isPodcastFavorited(podcast.id, lang);
        if (mounted) setIsFavorite(result);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [podcast?.id, lang]);

  const incrementPodcastFavoritesVersion = useDataVersionStore(
    (s) => s.incrementPodcastFavoritesVersion
  );
  const onPressToggleFavorite = async () => {
    if (!podcast?.id) return;
    try {
      const next = await togglePodcastFavorite(podcast.id, lang);
      setIsFavorite(next);
      incrementPodcastFavoritesVersion();
    } catch {}
  };

  // Loaded/visibility flags
  const isThisEpisodeLoaded =
    podcastId === podcast?.id &&
    !!(currentUri || currentKey) &&
    status !== "stopped" &&
    status !== "idle";

  // Let controls show as soon as it's loaded (even if duration isn't known yet)
  const showPlaybackControls = isThisEpisodeLoaded && !playerError;

  // Only consider as "loading" when streaming or actively downloading
  const isLoading = download.isPending || isStreamLoading || isDownloading;

  //! Here
  // const controlsDisabled = isLoading || !!playerError || isSeeking;
  const controlsDisabled = isLoading || !!playerError;

  // If nothing for this episode is loaded yet, we show initial area.
  const shouldShowInitial = !isThisEpisodeLoaded && !isLoading && !playerError;

  // When initial area is shown, always unload any previous episode to avoid autoplay behind UI
  useEffect(() => {
    if (shouldShowInitial && !justLoadedRef.current) {
      stopAndUnload();
    }
    // Reset when episode actually loads
    if (isThisEpisodeLoaded) {
      justLoadedRef.current = false;
    }
  }, [shouldShowInitial, isThisEpisodeLoaded, podcast?.id, stopAndUnload]);
  // Preload effect - skip if manually loaded to prevent flickering
  useEffect(() => {
    // Skip if we just manually loaded (from handleDownload)
    if (manuallyLoadedRef.current) {
      manuallyLoadedRef.current = false;
      return;
    }

    // Only load if: initial state, has cache, and haven't loaded this episode yet
    if (
      shouldShowInitial &&
      cachedUri &&
      loadedPodcastIdRef.current !== podcast.id
    ) {
      const src: VideoSource = {
        uri: cachedUri,
        metadata: {
          title: podcast.title ?? "Podcast",
          artist: "Podcast",
          ...(artworkUri ? { artwork: artworkUri } : {}),
        },
      };

      loadedPodcastIdRef.current = podcast.id; // Mark as loaded

      load(src, {
        autoplay: false,
        title: podcast.title,
        artwork: artworkUri,
        podcastId: podcast.id,
        filename: podcast.filename,
        rate,
      }).catch((e) => setPlayerError(e?.message ?? "Player error"));
    }

    // Reset tracking when switching episodes
    if (!shouldShowInitial) {
      loadedPodcastIdRef.current = null;
    }
  }, [
    shouldShowInitial,
    cachedUri,
    podcast.id,
    podcast.filename,
    podcast.title,
    rate,
    artworkUri,
    load,
  ]);

  // Entrance animation
  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    anim.start();

    return () => {
      anim.stop();
    };
  }, [fadeAnim, slideAnim]);

  // Actions
  const toSource = (uri: string): VideoSource => ({
    uri,
    metadata: {
      title: podcast.title ?? "Podcast",
      artist: "Podcast",
      ...(artworkUri ? { artwork: artworkUri } : {}),
    },
  });

 const handleStream = async () => {
  setPlayerError(null);

  if (!podcast?.filename) {
    setPlayerError("Audio path missing.");
    return;
  }

  try {
    setIsStreamLoading(true);
    setIsStream(true);

    const remote = await remoteUrlFor(podcast.filename);

    if (!remote) {
      setPlayerError("Cannot create stream URL.");
      return;
    }

    await load(toSource(remote), {
      autoplay: true,
      title: podcast.title,
      artwork: artworkUri,
      podcastId: podcast.id,
      filename: podcast.filename,
      rate,
    });
  } catch (e: any) {
    console.log("[stream error]", e);
    setPlayerError(e?.message ?? "Player error");
    setIsStream(false);
  } finally {
    setIsStreamLoading(false);
  }
};

  const handleDownload = async () => {
    pause();
    setPlayerError(null);

    if (!podcast?.filename || !downloadKey) {
      setPlayerError("Audio path missing.");
      return;
    }

    try {
      setIsStream(false);

      setDownloading(downloadKey, true);
      setProgress(downloadKey, 0);

      const localUri = await download.mutateAsync({
        filename: podcast.filename,
        onProgress: (p) => setProgress(downloadKey, p),
      });

      setCachedUri(localUri);

      manuallyLoadedRef.current = true;
      justLoadedRef.current = true; // Set BEFORE load, not in .then()

      load(toSource(localUri), {
        autoplay: false,
        title: podcast.title,
        artwork: artworkUri,
        podcastId: podcast.id,
        filename: podcast.filename,
        rate,
      }).catch((e) => {
        justLoadedRef.current = false; // Reset on error
        setPlayerError(e?.message ?? "Player error");
      });

      setHasDownloaded(true);
    } catch (err: any) {
      if (
        err?.name !== "CancelledError" &&
        err?.message !== "Download cancelled"
      ) {
        setPlayerError(err?.message ?? "Download failed");
      }
      setHasDownloaded(false);
      setProgress(downloadKey, 0);
      justLoadedRef.current = false; // Reset on error
    } finally {
      setDownloading(downloadKey, false);
      resetDownloadState(downloadKey);
    }
  };

  const togglePlayPause = () => {
    if (playerError || !isThisEpisodeLoaded) return;
    toggle();
  };

  const goBack = () => {
    if (!isThisEpisodeLoaded) return;
    seekBy(-15);
  };
  const goForward = () => {
    if (!isThisEpisodeLoaded) return;
    seekBy(15);
  };

  // Scrub: pause → seek (seekBy for tiny nudges) → resume if needed
  const wasPlayingRef = useRef(false);
  const startPosRef = useRef(0);

  const stopPlayback = async () => {
    if (!isThisEpisodeLoaded) return;
    await stopAndKeepSource(); // keep UI controls; Mini hides globally
  };

  const formatTime = (secs?: number | null): string => {
    if (!secs || secs < 0 || isNaN(secs)) return "0:00";
    const total = Math.floor(secs);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // UI render
  const showDownloadProgress = isDownloading;

  // Only show the Stream/Download choices when NOT cached and nothing is loaded
  const showInitialButtons = shouldShowInitial && !cachedUri;

  // Get last time
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!podcast?.id) {
        if (mounted) setLastTime(null);
        return;
      }
      try {
        const json = await AsyncStorage.getItem(lastTimeKey(podcast.id));
        if (json) {
          const {
            position = 0,
            duration = 0,
            savedAt = Date.now(),
          } = JSON.parse(json) || {};
          if (mounted) setLastTime({ position, duration, savedAt });
        } else {
          if (mounted) setLastTime(null);
        }
      } catch {
        // ignore read errors; keep UI stable
      }
    })();
    return () => {
      mounted = false;
    };
  }, [podcast?.id]);

  const handleLastTime = async () => {
    if (!podcast?.id) return;
    try {
      const payload = {
        podcastId: podcast.id,
        title: podcast.title ?? null,
        filename: podcast.filename ?? null,
        uri: currentUri ?? null,
        key: currentKey ?? null,
        position: typeof position === "number" ? position : 0,
        duration: typeof duration === "number" ? duration : 0,
        rate: typeof rate === "number" ? rate : 1,
        savedAt: Date.now(),
      };
      await AsyncStorage.setItem(
        lastTimeKey(podcast.id),
        JSON.stringify(payload)
      );
      // reflect immediately in UI
      setLastTime({
        position: payload.position,
        duration: payload.duration,
        savedAt: payload.savedAt,
      });
    } catch {
      setPlayerError("Could not save last time.");
    }
  };

  const resetDownloadUI = () => {
    // Zustand: remove all download state for that episode
    resetDownloadState(downloadKey);

    // React Query mutation / hook state
    download.reset();

    // Local UI flags that can cause flicker
    setIsStreamLoading(false);
    setIsStream(false);
    setHasDownloaded(false);
    setPlayerError(null);

    // Prevent preload logic / double-loading from old refs
    manuallyLoadedRef.current = false;
    loadedPodcastIdRef.current = null;
    justLoadedRef.current = false; // Add this line
  };

  //! Here
  // const cancelDownload = async () => {
  //   await cancelCurrentDownload();

  //   setDownloading(downloadKey, false);
  //   setProgress(downloadKey, 0);

  //   download.reset();

  //   if (isThisEpisodeLoaded && !cachedUri) {
  //     setIsStream(true);
  //   }
  // };

  const cancelDownload = async () => {
    // 1) stop the actual download
    await cancelCurrentDownload();

    // 2) fully reset state so next actions don't "inherit" old state
    resetDownloadUI();

    //! here
    // // 3) optional: unload player if you want a clean slate after cancel
    // // (this prevents flickering + weird state if player was loading something)
    // await stopAndUnload();

    // 4) If you want: directly go back to stream mode UI after cancel
    // but ONLY if you want it automatically
    // setIsStream(true);
  };

  const handleDeleteFromCache = async () => {
    if (!podcast?.filename) return;

    const deleted = await deleteFromCache(
      podcast.filename,
      podcast.language_code
    );
    if (deleted) {
      setCachedUri(null);
      stopAndUnload();
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
      edges={["top", "left"]}
    >
      <View style={{ marginLeft: 20 }}>
        <HeaderLeftBackButton
          color={Colors[colorScheme].defaultIcon}
          size={35}
        />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Header / Artwork / Info */}
          <View style={styles.headerContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.coverArt}
              contentFit="cover"
            />
            {!cachedUri && !showInitialButtons && !isDownloading && (
              <Ionicons
                name="download"
                size={35}
                color={Colors[colorScheme].defaultIcon}
                onPress={handleDownload}
              />
            )}
            {cachedUri && (
              <TouchableOpacity
                onPress={handleDeleteFromCache}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                <ThemedText style={styles.deleteButtonText}>
                  {t("delete_from_cache")}
                </ThemedText>
              </TouchableOpacity>
            )}
            <View style={styles.podcastInfo}>
              <ThemedText
                style={styles.podcastTitle}
                type="title"
                numberOfLines={2}
              >
                {podcast.title}
              </ThemedText>
            </View>
            <ThemedText style={styles.podcastDescription} numberOfLines={3}>
              {podcast.description}
            </ThemedText>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              {showPlaybackControls && (
                <View style={styles.durationContainer}>
                  <Ionicons
                    name="time-outline"
                    size={25}
                    color={Colors[colorScheme].defaultIcon}
                  />
                  <ThemedText style={styles.durationText}>
                    {formatTime(duration)}
                  </ThemedText>
                </View>
              )}
              <TouchableOpacity
                onPress={onPressToggleFavorite}
                style={styles.favoriteButton}
              >
                <Ionicons
                  name={isFavorite ? "star" : "star-outline"}
                  size={showPlaybackControls ? 25 : 35}
                  color={
                    isFavorite
                      ? Colors.universal.favorite
                      : Colors[colorScheme].defaultIcon
                  }
                />
              </TouchableOpacity>
              {showPlaybackControls && (
                <Ionicons
                  name="time-outline"
                  size={27}
                  color={Colors[colorScheme].defaultIcon}
                  style={{
                    alignSelf: "center",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: 12,
                    borderRadius: 25,
                  }}
                  onPress={() => handleLastTime()}
                />
              )}
              {!!lastTime && showPlaybackControls && (
                <TouchableOpacity
                  style={styles.lastTimePill}
                  onPress={() => {
                    setPosition(lastTime.position);
                  }}
                >
                  <Ionicons
                    name="bookmark-outline"
                    size={25}
                    color={Colors[colorScheme].defaultIcon}
                  />
                  <ThemedText style={styles.lastTimePillText}>
                    {formatTime(lastTime.position)} /{" "}
                    {formatTime(lastTime.duration)}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Error */}
          {!!playerError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#ff6b6b" />
              <Text style={styles.errorText}>{playerError}</Text>
            </View>
          )}

          {/* Download Progress */}
          {showDownloadProgress && (
            <View style={styles.downloadContainer}>
              <ThemedText style={styles.downloadText}>
                {t("downloading")} {Math.round(downloadProgress * 100)}%
              </ThemedText>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.round(downloadProgress * 100)}%` },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDownload}
              >
                <Ionicons name="close-circle" size={20} color="#ff6b6b" />
                <ThemedText style={styles.cancelButtonText}>
                  {t("cancel")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Initial Actions (only when NOT cached) */}
          {showInitialButtons && !isDownloading && (
            <View style={{ gap: 10, marginHorizontal: 10 }}>
              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  { borderColor: Colors[colorScheme].border },
                ]}
                onPress={handleStream}
                disabled={isLoading}
              >
                <View style={[styles.streamDownloadButton, {backgroundColor: Colors[colorScheme].contrast}]}>
                  <Ionicons
                    name="play"
                    size={24}
                    color={Colors[colorScheme].defaultIcon}
                  />
                  <ThemedText style={styles.downloadButtonText}>
                    {t("stream")}
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  { borderColor: Colors[colorScheme].border },
                ]}
                onPress={handleDownload}
                disabled={isLoading}
              >
                <View style={[styles.streamDownloadButton, {backgroundColor: Colors[colorScheme].contrast}]}>
                  <Ionicons
                    name="download"
                    size={24}
                    color={Colors[colorScheme].defaultIcon}
                  />
                  <ThemedText style={styles.downloadButtonText}>
                    {t("download")}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading */}
          {isLoading && !playerError && (
            <View style={styles.loadingContainer}>
              <LoadingIndicator size="large" />
              <ThemedText style={styles.loadingText}>
                {download.isPending
                  ? t("preparing")
                  : isStreamLoading
                  ? t("loading_stream")
                  : t("downloading")}
              </ThemedText>
            </View>
          )}

          {/* Player Controls (visible as soon as source is loaded; paused until user hits play) */}
          {showPlaybackControls && !playerError && !isDownloading && (
            <View
              style={[
                styles.playerContainer,
                {
                  backgroundColor: Colors[colorScheme].contrast,
                  shadowColor: Colors[colorScheme].border,
                },
              ]}
            >
              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.timeLabels}>
                  <ThemedText style={styles.timeText}>
                    {formatTime(position)}
                  </ThemedText>
                  <ThemedText style={styles.timeText}>
                    {formatTime(duration)}
                  </ThemedText>
                </View>

                <Slider
                  style={styles.progressSlider}
                  value={Math.min(position || 0, duration || 0)}
                  minimumValue={0}
                  maximumValue={duration || 0}
                  onSlidingStart={() => {
                    wasPlayingRef.current = isPlaying;
                    pause();
                    setIsSeeking(true);
                    startPosRef.current = position || 0;
                  }}
                  onSlidingComplete={(value) => {
                    setIsSeeking(false);
                    const delta = value - startPosRef.current;
                    if (Math.abs(delta) < 1) seekBy(delta);
                    else setPosition(value);
                    if (wasPlayingRef.current) play();
                  }}
                  minimumTrackTintColor="#667eea"
                  maximumTrackTintColor={isDark ? "#333" : "#ddd"}
                  thumbTintColor="#667eea"
                  disabled={controlsDisabled}
                />
              </View>

              {/* Main Controls */}
              <View style={styles.mainControls}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={goBack}
                  disabled={controlsDisabled}
                >
                  <Ionicons
                    name="play-skip-back"
                    size={32}
                    color={controlsDisabled ? "#999" : isDark ? "#fff" : "#333"}
                  />
                  <ThemedText style={styles.skipText}>15s</ThemedText>
                </TouchableOpacity>

                <View>
                  <TouchableOpacity
                    style={[
                      styles.playButton,
                      { opacity: controlsDisabled ? 0.5 : 1 },
                    ]}
                    onPress={togglePlayPause}
                    disabled={controlsDisabled}
                  >
                    <LinearGradient
                      colors={["#667eea", "#764ba2"]}
                      style={styles.playButtonGradient}
                    >
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={36}
                        color="#fff"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={goForward}
                  disabled={controlsDisabled}
                >
                  <Ionicons
                    name="play-skip-forward"
                    size={32}
                    color={controlsDisabled ? "#999" : isDark ? "#fff" : "#333"}
                  />
                  <ThemedText style={styles.skipText}>15s</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Secondary Controls */}
              <View style={styles.secondaryControls}>
                <TouchableOpacity
                  style={[
                    styles.speedButton,
                    { backgroundColor: Colors[colorScheme].background },
                  ]}
                  onPress={() => setShowSpeedMenu((v) => !v)}
                >
                  <ThemedText style={styles.speedText}>
                    {rate.toFixed(2).replace(/\.00$/, "")}x
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopPlayback}
                  disabled={controlsDisabled}
                >
                  <Ionicons
                    name="stop"
                    size={24}
                    color={controlsDisabled ? "#999" : "#ff6b6b"}
                  />
                </TouchableOpacity>
              </View>

              {/* Speed Menu */}
              {showSpeedMenu && (
                <View
                  style={[
                    styles.speedMenu,
                    {
                      backgroundColor: Colors[colorScheme].contrast,
                      borderColor: Colors[colorScheme].border,
                    },
                  ]}
                >
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      style={[
                        styles.speedOption,
                        rate === speed && styles.speedOptionActive,
                      ]}
                      onPress={() => {
                        setRate(speed);
                        setShowSpeedMenu(false);
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.speedOptionText,
                          rate === speed && styles.speedOptionTextActive,
                        ]}
                      >
                        {speed}x
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    paddingBottom: 30,
  },
  heroSection: {
    flex: 1,
  },
  headerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
    gap: 20,
  },
  coverArtContainer: {
    position: "relative",
    marginBottom: 20,
  },
  coverArt: { width: 200, height: 200, borderRadius: 20 },
  coverArtShadow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    zIndex: -1,
  },
  podcastInfo: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  podcastTitle: {
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: 40,
  },
  podcastDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  favoriteButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 25,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe6e6",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff6b6b",
  },
  errorText: { color: "#d63031", fontSize: 16, marginLeft: 12, flex: 1 },
  downloadContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffe6e6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: "#ff6b6b",
    fontSize: 12,
    fontWeight: "600",
  },
  downloadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: { height: "100%", backgroundColor: "#667eea", borderRadius: 4 },
  downloadButton: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  streamDownloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  downloadButtonText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ffe6e6",
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: { alignItems: "center" },
  loadingText: { fontSize: 16, marginTop: 12 },
  playerContainer: { margin: 20, borderRadius: 20, padding: 24 },
  progressSection: { marginBottom: 24 },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timeText: { fontSize: 14, fontWeight: "500" },
  progressSlider: { width: "100%", height: 40 },
  mainControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  skipButton: {
    alignItems: "center",
    padding: 12,
  },
  skipText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  playButton: {},
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  speedText: { fontSize: 14, fontWeight: "600" },
  stopButton: {
    backgroundColor: "#fecaca",
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
  },
  speedMenu: {
    position: "absolute",
    bottom: 80,
    left: 24,
    borderRadius: 12,
    padding: 8,
    zIndex: 99,
    borderWidth: 1,
  },
  speedOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  speedOptionActive: { backgroundColor: "#667eea" },
  speedOptionText: { fontSize: 14, fontWeight: "500" },
  speedOptionTextActive: {},
  lastTimePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "center",
  },
  lastTimePillText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
