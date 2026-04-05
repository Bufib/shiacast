// // import { StyleSheet, Text, type TextProps } from "react-native";

// // import { useThemeColor } from "../../hooks/useThemeColor";
// // import { useFontSizeStore } from "../../stores/fontSizeStore";

// // export type ThemedTextProps = TextProps & {
// //   lightColor?: string;
// //   darkColor?: string;
// //   type?:
// //     | "default"
// //     | "title"
// //     | "titleBiggerLessBold"
// //     | "defaultSemiBold"
// //     | "arabic"
// //     | "transliteration"
// //     | "defaultWithFontsize"
// //     | "subtitle"
// //     | "link"
// //     | "layoutNavigationText";
// // };

// // export function ThemedText({
// //   style,
// //   lightColor,
// //   darkColor,
// //   type = "default",
// //   ...rest
// // }: ThemedTextProps) {
// //   const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
// //   const { fontSize } = useFontSizeStore();

// //   return (
// //     <Text
// //       style={[
// //         { color },
// //         type === "default" ? styles.default : undefined,
// //         type === "title" ? styles.title : undefined,
// //         type === "titleBiggerLessBold" ? styles.titleBiggerLessBold : undefined,
// //         type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
// //         type === "arabic"
// //           ? { fontSize: fontSize * 1.5, lineHeight: Math.round(fontSize * 2.8) }
// //           : undefined,
// //         type === "transliteration"
// //           ? { fontSize: fontSize * 1.3, lineHeight: Math.round(fontSize * 2.5) }
// //           : undefined,
// //         type === "defaultWithFontsize"
// //           ? { fontSize: fontSize * 1, lineHeight: Math.round(fontSize * 1.6) }
// //           : undefined,
// //         type === "subtitle" ? styles.subtitle : undefined,
// //         type === "link" ? styles.link : undefined,
// //         type === "layoutNavigationText"
// //           ? styles.layoutNavigationText
// //           : undefined,
// //         style,
// //       ]}
// //       {...rest}
// //     />
// //   );
// // }

// // const styles = StyleSheet.create({
// //   default: {
// //     fontSize: 16,
// //     lineHeight: 24,
// //   },
// //   defaultSemiBold: {
// //     fontSize: 16,
// //     lineHeight: 24,
// //     fontWeight: "600",
// //   },
// //   title: {
// //     fontSize: 32,
// //     fontWeight: "bold",
// //     lineHeight: 32,
// //   },
// //   titleBiggerLessBold: {
// //     fontSize: 35,
// //     fontWeight: "600",
// //     lineHeight: 35,
// //   },
// //   subtitle: {
// //     fontSize: 20,
// //     fontWeight: "bold",
// //   },
// //   link: {
// //     lineHeight: 30,
// //     fontSize: 16,
// //     color: "#0a7ea4",
// //   },
// //   layoutNavigationText: {
// //     fontSize: 17,
// //     fontWeight: "600",
// //   },
// // });


// import { useMemo } from "react";
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
//     | "latin"
//     | "subtitle"
//     | "link"
//     | "layoutNavigationText";
// };

// const LINE_HEIGHT_MULTIPLIERS = {
//   latin: 1.5,
//   arabic: 2.2,
//   transliteration: 1.8,
// } as const;

// const FONT_SIZE_MULTIPLIERS = {
//   latin: 1,
//   arabic: 1.3,
//   transliteration: 1,
// } as const;

// export function ThemedText({
//   style,
//   lightColor,
//   darkColor,
//   type = "default",
//   ...rest
// }: ThemedTextProps) {
//   const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
//   const fontSize = useFontSizeStore((s) => s.fontSize);

//   const dynamicStyle = useMemo(() => {
//     switch (type) {
//       case "arabic":
//         return {
//           fontSize: Math.round(fontSize * FONT_SIZE_MULTIPLIERS.arabic),
//           lineHeight: Math.round(fontSize * LINE_HEIGHT_MULTIPLIERS.arabic),
//         };
//       case "transliteration":
//         return {
//           fontSize: Math.round(
//             fontSize * FONT_SIZE_MULTIPLIERS.transliteration
//           ),
//           lineHeight: Math.round(
//             fontSize * LINE_HEIGHT_MULTIPLIERS.transliteration
//           ),
//         };
//       case "latin":
//         return {
//           fontSize: Math.round(fontSize * FONT_SIZE_MULTIPLIERS.latin),
//           lineHeight: Math.round(fontSize * LINE_HEIGHT_MULTIPLIERS.latin),
//         };
//       default:
//         return undefined;
//     }
//   }, [type, fontSize]);

//   return (
//     <Text
//       style={[
//         { color },
//         type === "default" ? styles.default : undefined,
//         type === "title" ? styles.title : undefined,
//         type === "titleBiggerLessBold" ? styles.titleBiggerLessBold : undefined,
//         type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
//         type === "subtitle" ? styles.subtitle : undefined,
//         type === "link" ? styles.link : undefined,
//         type === "layoutNavigationText"
//           ? styles.layoutNavigationText
//           : undefined,
//         dynamicStyle,
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

import { useMemo } from "react";
import { StyleSheet, Text, type TextProps } from "react-native";
import { useThemeColor } from "../../hooks/useThemeColor";
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