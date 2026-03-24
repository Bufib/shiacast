// import { StyleSheet, Text, type TextProps } from "react-native";

// import { useThemeColor } from "../../hooks/useThemeColor";
// import { useFontSizeStore } from "../../stores/fontSizeStore";

// export type ThemedTextProps = TextProps & {
//   lightColor?: string;
//   darkColor?: string;
//   type?:
//     | "default"
//     | "title"
//     | "titleBiggerLessBold"
//     | "defaultSemiBold"
//     | "arabic"
//     | "transliteration"
//     | "defaultWithFontsize"
//     | "subtitle"
//     | "link"
//     | "layoutNavigationText";
// };

// export function ThemedText({
//   style,
//   lightColor,
//   darkColor,
//   type = "default",
//   ...rest
// }: ThemedTextProps) {
//   const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
//   const { fontSize } = useFontSizeStore();

//   return (
//     <Text
//       style={[
//         { color },
//         type === "default" ? styles.default : undefined,
//         type === "title" ? styles.title : undefined,
//         type === "titleBiggerLessBold" ? styles.titleBiggerLessBold : undefined,
//         type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
//         type === "arabic"
//           ? { fontSize: fontSize * 1.5, lineHeight: Math.round(fontSize * 2.8) }
//           : undefined,
//         type === "transliteration"
//           ? { fontSize: fontSize * 1.3, lineHeight: Math.round(fontSize * 2.5) }
//           : undefined,
//         type === "defaultWithFontsize"
//           ? { fontSize: fontSize * 1, lineHeight: Math.round(fontSize * 1.6) }
//           : undefined,
//         type === "subtitle" ? styles.subtitle : undefined,
//         type === "link" ? styles.link : undefined,
//         type === "layoutNavigationText"
//           ? styles.layoutNavigationText
//           : undefined,
//         style,
//       ]}
//       {...rest}
//     />
//   );
// }

// const styles = StyleSheet.create({
//   default: {
//     fontSize: 16,
//     lineHeight: 24,
//   },
//   defaultSemiBold: {
//     fontSize: 16,
//     lineHeight: 24,
//     fontWeight: "600",
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: "bold",
//     lineHeight: 32,
//   },
//   titleBiggerLessBold: {
//     fontSize: 35,
//     fontWeight: "600",
//     lineHeight: 35,
//   },
//   subtitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   link: {
//     lineHeight: 30,
//     fontSize: 16,
//     color: "#0a7ea4",
//   },
//   layoutNavigationText: {
//     fontSize: 17,
//     fontWeight: "600",
//   },
// });

import { StyleSheet, Text, type TextProps } from "react-native";
import { useThemeColor } from "../../hooks/useThemeColor";
import { useFontSizeStore } from "../../stores/fontSizeStore";

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
    | "defaultWithFontsize"
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
  const { getFontSize, getLineHeight } = useFontSizeStore();
const fontSize = useFontSizeStore((s) => s.fontSize);
  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "titleBiggerLessBold" ? styles.titleBiggerLessBold : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "arabic"
          ? {
              fontSize: getFontSize("arabic"),
              lineHeight: getLineHeight("arabic"),
            }
          : undefined,
        type === "transliteration"
          ? {
              fontSize: getFontSize("transliteration"),
              lineHeight: getLineHeight("transliteration"),
            }
          : undefined,
        type === "defaultWithFontsize"
          ? {
              fontSize: getFontSize("latin"),
              lineHeight: getLineHeight("latin"),
            }
          : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "layoutNavigationText"
          ? styles.layoutNavigationText
          : undefined,
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
