import { Animated, StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import { useEffect, useRef } from "react";

type Props = {
  colorScheme: "light" | "dark";
};

export function SuraListSkeleton({ colorScheme }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

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

  const backgroundColor =
    colorScheme === "dark" ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)";

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.headerCard,
          { backgroundColor, opacity },
        ]}
      />
      <Animated.View
        style={[
          styles.searchBar,
          { backgroundColor, opacity },
        ]}
      />
      {Array.from({ length: 9 }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.listItem,
            { backgroundColor, opacity },
          ]}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerCard: {
    height: 140,
    borderRadius: 24,
    marginBottom: 16,
  },
  searchBar: {
    height: 44,
    borderRadius: 22,
    marginBottom: 16,
  },
  listItem: {
    height: 68,
    borderRadius: 14,
    marginBottom: 10,
  },
});