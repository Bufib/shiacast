import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

export default function PodcastGridCardSkeleton() {
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
    <View style={styles.cardShadow}>
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Animated.View
          style={[
            styles.circle,
            {
              opacity,
              backgroundColor: itemBackgroundColor,
            },
          ]}
        />

        <View style={styles.content}>
          <View style={styles.titleArea}>
            <Animated.View
              style={[
                styles.titleLineLarge,
                {
                  opacity,
                  backgroundColor: itemBackgroundColor,
                },
              ]}
            />

            <Animated.View
              style={[
                styles.titleLineMedium,
                {
                  opacity,
                  backgroundColor: itemBackgroundColor,
                },
              ]}
            />

            <Animated.View
              style={[
                styles.titleLineSmall,
                {
                  opacity,
                  backgroundColor: itemBackgroundColor,
                },
              ]}
            />
          </View>

          <View style={styles.footer}>
            <View style={styles.playRow}>
              <Animated.View
                style={[
                  styles.playButton,
                  {
                    opacity,
                    backgroundColor: itemBackgroundColor,
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.playText,
                  {
                    opacity,
                    backgroundColor: itemBackgroundColor,
                  },
                ]}
              />
            </View>

            <Animated.View
              style={[
                styles.dateLine,
                {
                  opacity,
                  backgroundColor: itemBackgroundColor,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    overflow: "visible",
  },

  card: {
    width: "100%",
    height: 230,
    borderRadius: 26,
    overflow: "hidden",
    position: "relative",
  },

  circle: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  content: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },

  titleArea: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 44,
    marginBottom: 12,
  },

  titleLineLarge: {
    width: "88%",
    height: 18,
    borderRadius: 9,
    marginBottom: 10,
  },

  titleLineMedium: {
    width: "72%",
    height: 18,
    borderRadius: 9,
    marginBottom: 10,
  },

  titleLineSmall: {
    width: "54%",
    height: 18,
    borderRadius: 9,
  },

  footer: {
    gap: 10,
  },

  playRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  playText: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },

  dateLine: {
    width: 72,
    height: 11,
    borderRadius: 6,
    alignSelf: "flex-end",
  },
});