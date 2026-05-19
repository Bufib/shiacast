import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEvent } from "expo";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const INTRO_VIDEO_KEY = "hasPlayedIntroVideo";

interface IntroVideoProps {
  /** URI or require() of the intro video */
  source: string;
  /** Called when intro is finished or skipped */
  onComplete: () => void;
}

export function useIntroVideo() {
  const [hasPlayed, setHasPlayed] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    AsyncStorage.getItem(INTRO_VIDEO_KEY).then((value) => {
      setHasPlayed(value === "true");
    });
  }, []);

  const markAsPlayed = useCallback(async () => {
    await AsyncStorage.setItem(INTRO_VIDEO_KEY, "true");
    setHasPlayed(true);
  }, []);

  return { hasPlayed, markAsPlayed };
}

export default function IntroVideo({ source, onComplete }: IntroVideoProps) {
  const insets = useSafeAreaInsets();
  const [isBuffering, setIsBuffering] = useState(true);

  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.play();
  });

  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });

  useEffect(() => {
    setIsBuffering(status === "loading");
  }, [status]);

  // Auto-complete when video ends
  useEffect(() => {
    const sub = player.addListener("playToEnd", () => {
      onComplete();
    });
    return () => sub.remove();
  }, [player, onComplete]);

  const handleSkip = () => {
    player.pause();
    onComplete();
  };

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
      />

      {/* Buffering spinner */}
      {isBuffering && (
        <View style={styles.bufferingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Skip button */}
      <View style={[styles.skipContainer, { top: insets.top + 16, right: 16 }]}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Ionicons name="play-skip-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  skipContainer: {
    position: "absolute",
    zIndex: 10,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});
