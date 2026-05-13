// /components/MiniPlayerBar.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  PanResponder,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/Colors";
import { useGlobalPlayer } from "../../player/useGlobalPlayer";
import { CircularProgressRing } from "./CircularProgressRing";
import { useLastPlayedPodcastStore } from "../../stores/useLastPlayedPodcastStore";

type Props = {
  bottomOffset?: number; // initial placement above bottom
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const COLLAPSED_SIZE = 60;
const LEFT_MARGIN = 16;
const RIGHT_MARGIN = 16;
const PADDING = 10;

const readVal = (v: any) =>
  typeof v?.__getValue === "function" ? v.__getValue() : (v?._value ?? 0);

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export default function MiniPlayerBar({ bottomOffset = 50 }: Props) {
  const colorScheme = useColorScheme() || "light";
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Global player state/actions (from your Zustand store)
  const {
    isPlaying,
    position,
    duration,
    title,
    currentKey,
    currentUri,
    podcastId,
    filename,
    stoppedByUser,
    toggle,
    artwork,
    seekBy,
    stopAndKeepSource,
  } = useGlobalPlayer();

  // ---- Hooks must be declared before any early return
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [measured, setMeasured] = React.useState({ w: SCREEN_W - 32, h: 100 });
  const undismissLastPlayed = useLastPlayedPodcastStore((s) => s.undismiss);
  const pan = React.useRef(
    new Animated.ValueXY({
      x: 0,
      y: SCREEN_H - bottomOffset - 100, // initial guess; parked/clamped after we know size/insets
    }),
  ).current;

  const onMeasure = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setMeasured({ w: width, h: height });
  };

  // Compute draggable bounds based on state & safe-area
  const bounds = React.useMemo(() => {
    const w = isCollapsed ? COLLAPSED_SIZE : measured.w;
    const h = isCollapsed ? COLLAPSED_SIZE : measured.h;

    const minX = -LEFT_MARGIN; // wrapper has left:16
    const maxX = SCREEN_W - w - LEFT_MARGIN - RIGHT_MARGIN;

    const minY = insets.top + PADDING;
    const maxY = SCREEN_H - insets.bottom - h - PADDING;

    return {
      minX,
      maxX: Math.max(minX, maxX),
      minY,
      maxY: Math.max(minY, maxY),
    };
  }, [isCollapsed, measured.w, measured.h, insets.top, insets.bottom]);

  // Park near bottom once we know sizes/insets
  const parkedRef = React.useRef(false);
  React.useEffect(() => {
    if (parkedRef.current) return;
    if (!measured.h) return;
    const targetY = clamp(
      SCREEN_H - insets.bottom - measured.h - bottomOffset,
      bounds.minY,
      bounds.maxY,
    );
    pan.setValue({ x: 0, y: targetY });
    parkedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measured.h, insets.bottom, bounds.minY, bounds.maxY, bottomOffset]);

  // Draggable in both states; small threshold so taps don't get stolen
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) + Math.abs(g.dy) > 4,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_e, g) =>
        Math.abs(g.dx) + Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        pan.setOffset({ x: readVal(pan.x), y: readVal(pan.y) });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const curX = readVal(pan.x);
        const curY = readVal(pan.y);
        const targetX = clamp(curX, bounds.minX, bounds.maxX);
        const targetY = clamp(curY, bounds.minY, bounds.maxY);

        // Optional: snap to nearest horizontal edge if close
        const thresh = 24;
        let snapX = targetX;
        if (Math.abs(targetX - bounds.minX) < thresh) snapX = bounds.minX;
        if (Math.abs(targetX - bounds.maxX) < thresh) snapX = bounds.maxX;

        Animated.spring(pan, {
          toValue: { x: snapX, y: targetY },
          useNativeDriver: false,
          friction: 7,
          tension: 80,
        }).start();
      },
    }),
  ).current;

  // Re-clamp when state/metrics change
  React.useEffect(() => {
    const curX = readVal(pan.x);
    const curY = readVal(pan.y);
    const nx = clamp(curX, bounds.minX, bounds.maxX);
    const ny = clamp(curY, bounds.minY, bounds.maxY);
    if (nx !== curX || ny !== curY) {
      Animated.spring(pan, {
        toValue: { x: nx, y: ny },
        useNativeDriver: false,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollapsed, bounds.minX, bounds.maxX, bounds.minY, bounds.maxY]);

  // ---- Visibility (AFTER hooks)
  const hidden =
    stoppedByUser ||
    (!currentUri && !currentKey) ||
    (pathname?.includes("indexPodcast") ?? false); // hide on full podcast page
  if (hidden) return null;

  const isDark = colorScheme === "dark";

  const progressPct =
    duration && duration > 0
      ? Math.max(0, Math.min(1, (position || 0) / duration))
      : 0;

  const formatTime = (sec?: number | null) => {
    const s = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${ss.toString().padStart(2, "0")}`;
  };

  const artworkSource = artwork
    ? { uri: artwork }
    : require("@/assets/images/icon.png");

  const openFull = () => {
    router.push({
      pathname: "/(podcast)/indexPodcast",
      params: {
        podcast: JSON.stringify({
          id: podcastId,
          title: title,
          filename,
          currentUri,
          artwork,
        }),
      },
    });
  };

  // ---------------- Collapsed (draggable sphere with image + ring)
  if (isCollapsed) {
    return (
      <Animated.View
        onLayout={onMeasure}
        style={[
          styles.collapsedWrap,
          { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        ]}
        {...panResponder.panHandlers}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={styles.collapsedButton}
          onPress={() => setIsCollapsed(false)}
          activeOpacity={0.9}
        >
          <BlurView
            intensity={isDark ? 60 : 70}
            tint={isDark ? "dark" : "light"}
            style={styles.collapsedBlur}
          >
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(15,20,46,0.7)", "rgba(15,20,46,0.6)"]
                  : ["rgba(255,255,255,0.8)", "rgba(255,255,255,0.7)"]
              }
              style={styles.collapsedGradient}
            />
            <View style={styles.collapsedContent}>
              <View style={styles.artworkWrap}>
                <Image
                  source={artworkSource}
                  style={styles.collapsedArtwork}
                  contentFit="cover"
                />
                {isPlaying && (
                  <View style={styles.ringOverlay}>
                    <CircularProgressRing
                      size={COLLAPSED_SIZE}
                      progress={progressPct}
                      strokeWidth={5}
                      color="#6366f1"
                      trackColor={
                        isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"
                      }
                    />
                  </View>
                )}
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ---------------- Expanded (card style with image + current time)
  return (
    <Animated.View
      onLayout={onMeasure}
      style={[
        styles.wrap,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
      {...panResponder.panHandlers}
      pointerEvents="box-none"
    >
      {/* drag handle */}
      <View style={styles.dragHandle}>
        <View style={styles.dragIndicator} />
      </View>

      <BlurView
        intensity={isDark ? 60 : 70}
        tint={isDark ? "dark" : "light"}
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={
            isDark
              ? ["rgba(15,20,46,0.6)", "rgba(15,20,46,0.5)"]
              : ["rgba(255,255,255,0.7)", "rgba(255,255,255,0.6)"]
          }
          style={styles.gradientBg}
        />

        {/* Collapse */}
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={() => setIsCollapsed(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="chevron-down"
            size={22}
            color={Colors[colorScheme].defaultIcon}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.mainRow}>
            <TouchableOpacity
              style={styles.leftSection}
              activeOpacity={0.9}
              onPress={openFull}
            >
              {/* Artwork */}
              <View style={styles.artworkContainer}>
                <Image
                  source={artworkSource}
                  style={styles.artwork}
                  contentFit="cover"
                />
                {isPlaying && (
                  <View style={styles.playingIndicator}>
                    <View style={styles.bar} />
                    <View style={[styles.bar, styles.bar2]} />
                    <View style={styles.bar} />
                  </View>
                )}
              </View>

              <View style={styles.textContainer}>
                <Text
                  numberOfLines={1}
                  style={[styles.title, { color: isDark ? "#fff" : "#1a1a2e" }]}
                >
                  {title ?? "Now Playing"}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.time,
                    {
                      color: isDark
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(0,0,0,0.5)",
                    },
                  ]}
                >
                  {formatTime(position)} / {formatTime(duration)}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() => seekBy(-15)}
                style={styles.iconBtn}
                hitSlop={10}
              >
                <View style={[styles.iconBg, isDark && styles.iconBgDark]}>
                  <Ionicons
                    name="play-skip-back"
                    size={18}
                    color={isDark ? "#fff" : "#1a1a2e"}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  // Beim Wechsel von Pause → Play: Continue-Listening-Card wieder zeigen
                  if (!isPlaying) {
                    undismissLastPlayed();
                  }
                  toggle();
                }}
                style={styles.playBtn}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    isPlaying ? ["#FF6B6B", "#EE5A6F"] : ["#667eea", "#764ba2"]
                  }
                  style={styles.playBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={24}
                    color="#fff"
                    style={!isPlaying ? { marginLeft: 2 } : undefined}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => seekBy(15)}
                style={styles.iconBtn}
                hitSlop={10}
              >
                <View style={[styles.iconBg, isDark && styles.iconBgDark]}>
                  <Ionicons
                    name="play-skip-forward"
                    size={18}
                    color={isDark ? "#fff" : "#1a1a2e"}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  void stopAndKeepSource();
                }}
                style={styles.iconBtn}
                hitSlop={10}
              >
                <View style={styles.stopBtn}>
                  <Ionicons name="close" size={18} color="#FF6B6B" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.08)",
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPct * 100}%` },
                ]}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.progressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // expanded
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: "visible",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  dragHandle: {
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.5)",
  },
  blurContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientBg: { ...StyleSheet.absoluteFillObject },
  content: { paddingHorizontal: 16, paddingVertical: 25 },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  artworkContainer: { position: "relative" },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
  },
  playingIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 4,
    borderRadius: 4,
    gap: 2,
    height: 16,
  },
  bar: { width: 2, height: 10, backgroundColor: "#fff", borderRadius: 1 },
  bar2: { height: 14 },
  textContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  time: { fontSize: 12, fontWeight: "500" },
  controls: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { padding: 2 },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBgDark: { backgroundColor: "rgba(255,255,255,0.1)" },
  playBtn: { marginHorizontal: 4 },
  playBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stopBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,107,107,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  collapseButton: {
    position: "absolute",
    top: 2,
    right: 9,
    zIndex: 10,
    padding: 4,
  },
  progressContainer: { marginTop: 10 },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2, overflow: "hidden" },
  progressGradient: { flex: 1 },

  // collapsed sphere
  collapsedWrap: {
    position: "absolute",
    width: COLLAPSED_SIZE,
    height: COLLAPSED_SIZE,
    left: 16,
    borderRadius: COLLAPSED_SIZE / 2,
    overflow: "visible",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  collapsedButton: {
    width: COLLAPSED_SIZE,
    height: COLLAPSED_SIZE,
    borderRadius: COLLAPSED_SIZE / 2,
    overflow: "hidden",
  },
  collapsedBlur: {
    flex: 1,
    borderRadius: COLLAPSED_SIZE / 2,
    overflow: "hidden",
  },
  collapsedGradient: { ...StyleSheet.absoluteFillObject },
  collapsedContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  collapsedArtwork: {
    width: "100%",
    height: "100%",
    borderRadius: COLLAPSED_SIZE / 2,
    backgroundColor: "#e0e0e0",
  },
  artworkWrap: { width: COLLAPSED_SIZE, height: COLLAPSED_SIZE },
  ringOverlay: { ...StyleSheet.absoluteFillObject },
  expandIcon: { position: "absolute", top: 4, opacity: 0.7 },
});
