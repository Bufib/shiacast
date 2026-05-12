import { useRef, useCallback, useEffect } from "react";
import { Animated, Easing, LayoutChangeEvent } from "react-native";

export function useScreenFadeIn(duration = 800) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const startedRef = useRef(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (startedRef.current) return;
      startedRef.current = true;

      const animation = Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

      animationRef.current = animation;
      animation.start(() => {
        animationRef.current = null;
      });
    },
    [fadeAnim, duration]
  );

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, []);

  return { fadeAnim, onLayout };
}
