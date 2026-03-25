import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { ThemedView } from "./ThemedView";
import { Colors } from "@/constants/Colors";

type Props = {
  monthSections?: number;
  rowsPerSection?: number;
};

export default function RenderCalendarSkeleton({
  monthSections = 3,
  rowsPerSection = 2,
}: Props) {
  const colorScheme = (useColorScheme() || "light") as "light" | "dark";
  const { width } = useWindowDimensions();
  const anim = useRef(new Animated.Value(0)).current;

  const PADDING = 16;
  const GAP = 8;
  const cardWidth = Math.floor((width - PADDING * 2 - GAP * 2) / 3);

  useEffect(() => {
    anim.setValue(0);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [anim]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.7],
  });

  const skeletonBg =
    colorScheme === "dark"
      ? "rgba(255,255,255,0.09)"
      : "rgba(0,0,0,0.07)";

  const cardBg =
    colorScheme === "dark"
      ? Colors[colorScheme].contrast
      : Colors[colorScheme].contrast;

  const sections = useMemo(
    () => Array.from({ length: monthSections }, (_, i) => i),
    [monthSections]
  );

  const rows = useMemo(
    () => Array.from({ length: rowsPerSection }, (_, i) => i),
    [rowsPerSection]
  );

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Legend skeleton */}
        <View style={styles.legendWrap}>
          <View style={styles.legendRow}>
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={styles.legendItem}>
                <Animated.View
                  style={[
                    styles.legendDot,
                    { backgroundColor: skeletonBg, opacity },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.legendText,
                    { backgroundColor: skeletonBg, opacity },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Month sections */}
        {sections.map((section) => (
          <View key={section}>
            <View style={styles.sectionHeaderRow}>
              <View
                style={[
                  styles.sectionDivider,
                  { backgroundColor: Colors[colorScheme].devider },
                ]}
              />
              <Animated.View
                style={[
                  styles.sectionTitleSkeleton,
                  { backgroundColor: skeletonBg, opacity },
                ]}
              />
              <View
                style={[
                  styles.sectionDivider,
                  { backgroundColor: Colors[colorScheme].devider },
                ]}
              />
              <Animated.View
                style={[
                  styles.chevronSkeleton,
                  { backgroundColor: skeletonBg, opacity },
                ]}
              />
            </View>

            <View style={styles.grid}>
              {rows.map((row) => (
                <View key={row} style={styles.gridRow}>
                  {Array.from({ length: 3 }).map((_, col) => (
                    <View
                      key={col}
                      style={[
                        styles.card,
                        {
                          width: cardWidth,
                          backgroundColor: cardBg,
                        },
                      ]}
                    >
                      <Animated.View
                        style={[
                          styles.cardColorStrip,
                          { backgroundColor: skeletonBg, opacity },
                        ]}
                      />

                      <View style={styles.cardBody}>
                        <View style={styles.cardDateRow}>
                          <Animated.View
                            style={[
                              styles.daySkeleton,
                              { backgroundColor: skeletonBg, opacity },
                            ]}
                          />
                          <View style={styles.monthYearWrap}>
                            <Animated.View
                              style={[
                                styles.monthSkeleton,
                                { backgroundColor: skeletonBg, opacity },
                              ]}
                            />
                            <Animated.View
                              style={[
                                styles.yearSkeleton,
                                { backgroundColor: skeletonBg, opacity },
                              ]}
                            />
                          </View>
                        </View>

                        <Animated.View
                          style={[
                            styles.islamicSkeleton,
                            { backgroundColor: skeletonBg, opacity },
                          ]}
                        />

                        <Animated.View
                          style={[
                            styles.titleSkeletonOne,
                            { backgroundColor: skeletonBg, opacity },
                          ]}
                        />
                        <Animated.View
                          style={[
                            styles.titleSkeletonTwo,
                            { backgroundColor: skeletonBg, opacity },
                          ]}
                        />

                        <Animated.View
                          style={[
                            styles.statusDot,
                            { backgroundColor: skeletonBg, opacity },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  legendWrap: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    width: 70,
    height: 12,
    borderRadius: 6,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    opacity: 0.25,
  },
  sectionTitleSkeleton: {
    width: 120,
    height: 12,
    borderRadius: 6,
  },
  chevronSkeleton: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  grid: {
    gap: 8,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardColorStrip: {
    height: 4,
    width: "100%",
  },
  cardBody: {
    padding: 8,
    gap: 4,
  },
  cardDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  daySkeleton: {
    width: 28,
    height: 26,
    borderRadius: 6,
  },
  monthYearWrap: {
    gap: 4,
  },
  monthSkeleton: {
    width: 34,
    height: 10,
    borderRadius: 5,
  },
  yearSkeleton: {
    width: 22,
    height: 8,
    borderRadius: 4,
  },
  islamicSkeleton: {
    width: "72%",
    height: 9,
    borderRadius: 5,
    marginTop: 2,
  },
  titleSkeletonOne: {
    width: "94%",
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  titleSkeletonTwo: {
    width: "70%",
    height: 10,
    borderRadius: 5,
  },
  statusDot: {
    marginTop: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});