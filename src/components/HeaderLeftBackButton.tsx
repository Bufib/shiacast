import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import React from "react";
import {
  TouchableOpacity,
  type StyleProp,
  type ViewStyle
} from "react-native";

type Props = {
  color?: string | null;
  size?: number | null;
  style?: StyleProp<ViewStyle>;
  route?: string;
  dismiss?: boolean;
};

const HeaderLeftBackButton = ({
  color,
  size,
  style,
  route,
  dismiss = false,
}: Props) => {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      onPress={() => {
        if (route) {
          if (dismiss) {
            router.dismissTo(route as any);
          } else {
            router.replace(route as any);
          }
        } else {
          router.back();
        }
      }}
      hitSlop={10}
      style={style}
    >
      <Ionicons
        name="chevron-back-outline"
        size={size ? size : 35}
        color={color ? color : colorScheme === "dark" ? "#fff" : "#000"}
      />
    </TouchableOpacity>
  );
};

export default HeaderLeftBackButton;
