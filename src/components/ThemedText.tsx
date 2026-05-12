
import { useMemo } from "react";
import { StyleSheet, Text, type TextProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFontSizeStore } from "../../stores/fontSizeStore";
import {
  getScaledFontSize,
  getScaledLineHeight,
} from "@/constants/typography";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "titleBiggerLessBold"
    | "defaultSemiBold"
    | "arabic"
    | "transliteration"
    | "latin"
    | "subtitle"
    | "link"
    | "layoutNavigationText";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const baseFontSize = useFontSizeStore((s) => s.fontSize);

  const dynamicStyle = useMemo(() => {
    if (
      type === "arabic" ||
      type === "latin" ||
      type === "transliteration"
    ) {
      return {
        fontSize: getScaledFontSize(baseFontSize, type),
        lineHeight: getScaledLineHeight(baseFontSize, type),
      };
    }

    return undefined;
  }, [type, baseFontSize]);

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "titleBiggerLessBold" ? styles.titleBiggerLessBold : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "layoutNavigationText"
          ? styles.layoutNavigationText
          : undefined,
        dynamicStyle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  titleBiggerLessBold: {
    fontSize: 35,
    fontWeight: "600",
    lineHeight: 35,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
  layoutNavigationText: {
    fontSize: 17,
    fontWeight: "600",
  },
});