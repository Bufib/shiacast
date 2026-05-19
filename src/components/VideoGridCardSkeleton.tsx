import React, { useEffect, useRef } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  Animated,
  Easing,
  StyleSheet,
  View
} from "react-native";

export default function VideoGridCardSkeleton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  const cardBackgroundColor = isDark ? "#242424" : "#E8E8E8";
  const itemBackgroundColor = isDark ? "#3A3A3A" : "#F5F5F5";

  return (
    <View style={styles.container}>
      <SkeletonCard
        opacity={opacity}
        cardBackgroundColor={cardBackgroundColor}
        itemBackgroundColor={itemBackgroundColor}
      />
      <SkeletonCard
        opacity={opacity}
        cardBackgroundColor={cardBackgroundColor}
        itemBackgroundColor={itemBackgroundColor}
      />
    </View>
  );
}

type SkeletonCardProps = {
  opacity: Animated.Value;
  cardBackgroundColor: string;
  itemBackgroundColor: string;
};

function SkeletonCard({
  opacity,
  cardBackgroundColor,
  itemBackgroundColor,
}: SkeletonCardProps) {
  return (
    <View style={styles.cardShadow}>
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Animated.View
          style={[
            styles.player,
            { opacity, backgroundColor: itemBackgroundColor },
          ]}
        />

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.titleLineLarge,
              { opacity, backgroundColor: itemBackgroundColor },
            ]}
          />
          <Animated.View
            style={[
              styles.titleLineMedium,
              { opacity, backgroundColor: itemBackgroundColor },
            ]}
          />
          <Animated.View
            style={[
              styles.actionLine,
              { opacity, backgroundColor: itemBackgroundColor },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    rowGap: 16,
  },
  cardShadow: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
  },
  player: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  content: {
    padding: 14,
    rowGap: 10,
  },
  titleLineLarge: {
    width: "82%",
    height: 16,
    borderRadius: 8,
  },
  titleLineMedium: {
    width: "55%",
    height: 12,
    borderRadius: 6,
  },
  actionLine: {
    width: "100%",
    height: 38,
    borderRadius: 8,
    marginTop: 4,
  },
});
