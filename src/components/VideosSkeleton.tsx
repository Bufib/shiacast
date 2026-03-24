import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
  colorScheme: "light" | "dark";
};

export function VideosSkeleton({ colorScheme }: Props) {
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
      ]),
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
    <View style={styles.container}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.item,
            {
              backgroundColor,
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  item: {
    height: 64,
    borderRadius: 10,
    marginBottom: 15,
  },
});
