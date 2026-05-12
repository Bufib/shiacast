import React, { useMemo } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import type { PodcastPlayerPropsType } from "@/constants/Types";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import { StatusBar } from "expo-status-bar";

const ACCENT = "#ff7648";
const PLAY_BG = "#101b35";
const SURFACE_LIGHT = "#fffaf7";
const DANGER = "#ff6b6b";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

const WAVEFORM_BARS = [
  38, 52, 31, 43, 35, 58, 40, 47, 33, 42, 55, 37, 30, 45, 36, 49,
  57, 41, 34, 44, 39, 53, 32, 46, 50, 36, 29, 42, 35, 48, 40, 33,
  45, 37, 51, 43, 31, 39, 47, 35, 44, 32, 40, 49, 36, 42,
];

export default function PodcastPlayer({ podcast }: PodcastPlayerPropsType) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const colors = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const {
    coverSource,
    isFavorite,
    playerError,
    isPlaying,
    position,
    duration,
    rate,
    cachedUri,
    lastTime,
    isLoading,
    isDownloading,
    downloadProgress,
    showPlaybackControls,
    showInitialButtons,
    showDownloadProgress,
    controlsDisabled,
    showSpeedMenu,
    loadingTranslationKey,
    fadeAnim,
    slideAnim,
    setShowSpeedMenu,
    setRate,
    handleStream,
    handleDownload,
    cancelDownload,
    handleDeleteFromCache,
    onPressToggleFavorite,
    handleLastTime,
    restoreLastTime,
    togglePlayPause,
    goBack,
    goForward,
    stopPlayback,
    onSliderStart,
    onSliderComplete,
    formatTime,
  } = usePodcastPlayer(podcast);

  const progress = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min(Math.max(position / duration, 0), 1);
  }, [position, duration]);

  const activeBars = Math.round(WAVEFORM_BARS.length * progress);
  const surfaceColor = isDark ? colors.contrast : SURFACE_LIGHT;
  const inactiveBarColor = isDark
    ? "rgba(255,255,255,0.22)"
    : "rgba(0,0,0,0.12)";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ImageBackground
        source={coverSource}
        placeholder={require("@/assets/images/icon.png")}
        style={styles.cover}
        contentFit="cover"
        transition={200}
      >
        <View style={[styles.coverHeader, { paddingTop: insets.top + 4 }]}>
          <HeaderLeftBackButton color={Colors.universal.link} size={40} />

          {!cachedUri && !showInitialButtons && !isDownloading && (
            <TouchableOpacity
              onPress={handleDownload}
              style={styles.coverPillButton}
              activeOpacity={0.75}
            >
              <Ionicons name="download" size={30} color={"#000"} />
            </TouchableOpacity>
          )}

          {cachedUri && (
            <TouchableOpacity
              onPress={handleDeleteFromCache}
              style={styles.cachedPill}
              activeOpacity={0.75}
            >
              <Ionicons name="trash-outline" size={16} color={DANGER} />
              <ThemedText style={styles.cachedPillText}>
                {t("delete_from_cache")}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <ThemedText style={styles.title} type="title" numberOfLines={2}>
          {podcast.title}
        </ThemedText>

        <View style={styles.metaRow}>
          {showPlaybackControls && (
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={15}
                color={colors.defaultIcon}
              />
              <ThemedText style={styles.metaText}>
                {formatTime(duration)}
              </ThemedText>
            </View>
          )}

          <TouchableOpacity
            onPress={onPressToggleFavorite}
            style={styles.metaIconButton}
            hitSlop={8}
            activeOpacity={0.6}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={
                isFavorite ? Colors[colorScheme].error : colors.defaultIcon
              }
            />
          </TouchableOpacity>

          {showPlaybackControls && (
            <TouchableOpacity
              onPress={handleLastTime}
              style={styles.metaIconButton}
              hitSlop={8}
              activeOpacity={0.6}
            >
              <Ionicons
                name="bookmark-outline"
                size={20}
                color={colors.defaultIcon}
              />
            </TouchableOpacity>
          )}

          {!!lastTime && showPlaybackControls && (
            <TouchableOpacity
              style={styles.restorePill}
              onPress={restoreLastTime}
              activeOpacity={0.75}
            >
              <Ionicons
                name="play-back"
                size={13}
                color={colors.defaultIcon}
              />
              <ThemedText style={styles.restorePillText}>
                {formatTime(lastTime.position)}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {!!playerError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={DANGER} />
            <Text style={styles.errorText}>{playerError}</Text>
          </View>
        )}

        {showDownloadProgress && (
          <View
            style={[
              styles.downloadBox,
              { backgroundColor: surfaceColor, borderColor: colors.border },
            ]}
          >
            <View style={styles.downloadHeader}>
              <ThemedText style={styles.downloadLabel}>
                {t("downloading")}
              </ThemedText>
              <ThemedText style={styles.downloadPercent}>
                {Math.round(downloadProgress * 100)}%
              </ThemedText>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(downloadProgress * 100)}%` },
                ]}
              />
            </View>

            <TouchableOpacity
              style={styles.cancelDownload}
              onPress={cancelDownload}
              activeOpacity={0.75}
            >
              <Ionicons name="close-circle" size={18} color={DANGER} />
              <ThemedText style={styles.cancelDownloadText}>
                {t("cancel")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {showInitialButtons && !isDownloading && (
          <View style={styles.initialActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.contrast, borderColor: colors.border },
              ]}
              onPress={handleStream}
              disabled={isLoading}
              activeOpacity={0.75}
            >
              <Ionicons name="play" size={20} color={colors.defaultIcon} />
              <ThemedText style={styles.actionButtonText}>
                {t("stream")}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.contrast, borderColor: colors.border },
              ]}
              onPress={handleDownload}
              disabled={isLoading}
              activeOpacity={0.75}
            >
              <Ionicons
                name="download"
                size={20}
                color={colors.defaultIcon}
              />
              <ThemedText style={styles.actionButtonText}>
                {t("download")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {isLoading && !playerError && (
          <View style={styles.loadingBox}>
            <LoadingIndicator size="large" />
            <ThemedText style={styles.loadingText}>
              {t(loadingTranslationKey)}
            </ThemedText>
          </View>
        )}

        {showPlaybackControls && !playerError && !isDownloading && (
          <ThemedView
            style={[
              styles.playerCard,
              { backgroundColor: surfaceColor, shadowColor: colors.border },
            ]}
          >
            <View style={styles.timeRow}>
              <ThemedText style={[styles.currentTime, { color: ACCENT }]}>
                {formatTime(position)}
              </ThemedText>
              <ThemedText style={styles.totalTime}>
                {formatTime(duration)}
              </ThemedText>
            </View>

            <View style={styles.waveformContainer}>
              <View style={styles.waveformBars}>
                {WAVEFORM_BARS.map((h, i) => (
                  <View
                    key={`${h}-${i}`}
                    style={[
                      styles.waveformBar,
                      {
                        height: h,
                        backgroundColor:
                          i < activeBars ? ACCENT : inactiveBarColor,
                      },
                    ]}
                  />
                ))}
              </View>

              <Slider
                style={styles.invisibleSlider}
                value={Math.min(position || 0, duration || 0)}
                minimumValue={0}
                maximumValue={duration || 0}
                onSlidingStart={onSliderStart}
                onSlidingComplete={onSliderComplete}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor="transparent"
                disabled={controlsDisabled}
              />
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.seekButton}
                onPress={goBack}
                activeOpacity={0.7}
                disabled={controlsDisabled}
                hitSlop={6}
              >
                <MaterialIcons
                  name="replay-10"
                  size={36}
                  color={controlsDisabled ? "#999" : colors.defaultIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.playButton,
                  {
                    backgroundColor: PLAY_BG,
                    opacity: controlsDisabled ? 0.5 : 1,
                  },
                ]}
                onPress={togglePlayPause}
                activeOpacity={0.85}
                disabled={controlsDisabled}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={32}
                  color="#fff"
                  style={!isPlaying && styles.playIconOffset}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.seekButton}
                onPress={goForward}
                activeOpacity={0.7}
                disabled={controlsDisabled}
                hitSlop={6}
              >
                <MaterialIcons
                  name="forward-10"
                  size={36}
                  color={controlsDisabled ? "#999" : colors.defaultIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.secondaryRow}>
              <TouchableOpacity
                style={[
                  styles.speedButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowSpeedMenu((v) => !v)}
                activeOpacity={0.75}
              >
                <ThemedText style={styles.speedText}>
                  {rate.toFixed(2).replace(/\.?0+$/, "")}x
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopPlayback}
                disabled={controlsDisabled}
                activeOpacity={0.75}
                hitSlop={6}
              >
                <Ionicons
                  name="stop"
                  size={25}
                  color={controlsDisabled ? "#999" : DANGER}
                />
              </TouchableOpacity>
            </View>

            {showSpeedMenu && (
              <View
                style={[
                  styles.speedMenu,
                  {
                    backgroundColor: colors.contrast,
                    borderColor: colors.border,
                  },
                ]}
              >
                {SPEED_OPTIONS.map((speed) => (
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
                    activeOpacity={0.75}
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
          </ThemedView>
        )}
      </View>
      <StatusBar style="dark"/>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Cover
  cover: {
    width: "100%",
    height: "45%",
  },
  coverHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 14,
  },
  coverPillButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccc",
  },
  cachedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,230,230,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  cachedPillText: {
    color: DANGER,
    fontSize: 12,
    fontWeight: "600",
  },

  // Content
  content: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    paddingHorizontal: 24,
    paddingTop: 18,
  },

  // Meta row (slim, compact)
  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.7,
  },
  metaIconButton: {
    padding: 4,
  },
  restorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  restorePillText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffe6e6",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: DANGER,
  },
  errorText: {
    color: "#d63031",
    fontSize: 14,
    flex: 1,
  },

  // Download progress
  downloadBox: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  downloadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  downloadLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  downloadPercent: {
    fontSize: 14,
    fontWeight: "700",
    color: ACCENT,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  cancelDownload: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 8,
  },
  cancelDownloadText: {
    color: DANGER,
    fontSize: 14,
    fontWeight: "600",
  },

  // Initial stream / download buttons
  initialActions: {
    gap: 10,
    marginHorizontal: 20,
    marginTop: 18,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Loading
  loadingBox: {
    alignItems: "center",
    marginTop: 24,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
  },

  // Player card
  playerCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  currentTime: {
    fontSize: 15,
    fontWeight: "700",
  },
  totalTime: {
    fontSize: 15,
    fontWeight: "700",
    opacity: 0.35,
  },

  // Waveform
  waveformContainer: {
    height: 64,
    justifyContent: "center",
    marginBottom: 20,
  },
  waveformBars: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  waveformBar: {
    width: 3,
    borderRadius: 99,
  },
  invisibleSlider: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.01,
  },

  // Main controls
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  seekButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  playIconOffset: {
    marginLeft: 4,
  },

  // Secondary row (speed + stop)
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  speedButton: {
    minWidth: 52,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
  },
  speedText: {
    fontSize: 12,
    fontWeight: "700",
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,107,107,0.12)",
  },

  // Speed menu
  speedMenu: {
    position: "absolute",
    bottom: 58,
    left: 22,
    borderRadius: 12,
    padding: 6,
    zIndex: 99,
    borderWidth: 1,
  },
  speedOption: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  speedOptionActive: {
    backgroundColor: ACCENT,
  },
  speedOptionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  speedOptionTextActive: {
    color: "#fff",
  },
});