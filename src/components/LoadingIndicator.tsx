import React from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleProp,
  ViewStyle
} from "react-native";
import { Colors } from "@/constants/Colors";

interface LoadingIndicatorProps {
  size?: ActivityIndicatorProps["size"]; // 'small' | 'large' or number
  style?: StyleProp<ViewStyle>;
}

export const LoadingIndicator = ({
  size = "large",
  style,
}: LoadingIndicatorProps) => {
  const colorScheme = useColorScheme();

  return (
    <ActivityIndicator
      color={Colors[colorScheme].loadingIndicator}
      size={size}
      style={style}
    />
  );
};
