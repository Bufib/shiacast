// // import React from "react";
// // import {
// //   Text,
// //   View,
// //   StyleSheet,
// //   TextStyle,
// //   useColorScheme,
// // } from "react-native";
// // import { useFontSizeStore } from "../../stores/fontSizeStore";
// // import { Colors } from "@/constants/Colors";

// // const LINE_HEIGHT_MULTIPLIERS = {
// //   latin: 1.5,
// //   arabic: 2.2,
// //   transliteration: 1.8,
// // } as const;

// // const FONT_SIZE_MULTIPLIERS = {
// //   latin: 1,
// //   arabic: 1.3,
// //   transliteration: 1,
// // } as const;

// // type TextType = keyof typeof LINE_HEIGHT_MULTIPLIERS;

// // type Props = {
// //   children: string;
// //   type: TextType;
// //   style?: TextStyle;
// // };

// // export const RichText = ({ children, type = "latin", style }: Props) => {
// //   const colorScheme = useColorScheme() || "light";
// //   const color = Colors[colorScheme].text;
// //   const fontSize = useFontSizeStore((s) => s.fontSize);

// //   const baseStyle: TextStyle = {
// //     color,
// //     fontSize: Math.round(fontSize * FONT_SIZE_MULTIPLIERS[type]),
// //     lineHeight: Math.round(fontSize * LINE_HEIGHT_MULTIPLIERS[type]),
// //   };

// //   const lines = children.split("\n");

// //   return (
// //     <View>
// //       {lines.map((line, index) => {
// //         const bulletMatch = line.match(/^(\s*)[-*•]\s+(.*)$/);

// //         if (bulletMatch) {
// //           const content = bulletMatch[2];

// //           return (
// //             <View key={index} style={styles.bulletRow}>
// //               <Text style={[baseStyle, style]}>{`\u2022`}</Text>
// //               <Text style={[baseStyle, style, styles.bulletText]}>
// //                 {parseInline(content, baseStyle, style)}
// //               </Text>
// //             </View>
// //           );
// //         }

// //         if (line.trim() === "") {
// //           return <View key={index} style={styles.spacer} />;
// //         }

// //         return (
// //           <Text key={index} style={[baseStyle, style, styles.paragraph]}>
// //             {parseInline(line, baseStyle, style)}
// //           </Text>
// //         );
// //       })}
// //     </View>
// //   );
// // };

// // function parseInline(
// //   text: string,
// //   baseStyle: TextStyle,
// //   extraStyle?: TextStyle,
// // ): React.ReactNode[] {
// //   const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__)/g;
// //   const parts: React.ReactNode[] = [];
// //   let lastIndex = 0;
// //   let match: RegExpExecArray | null;

// //   while ((match = regex.exec(text)) !== null) {
// //     if (match.index > lastIndex) {
// //       parts.push(text.slice(lastIndex, match.index));
// //     }

// //     if (match[2]) {
// //       parts.push(
// //         <Text
// //           key={match.index}
// //           style={[baseStyle, extraStyle, { fontWeight: "700" }]}
// //         >
// //           {match[2]}
// //         </Text>,
// //       );
// //     } else if (match[3]) {
// //       parts.push(
// //         <Text
// //           key={match.index}
// //           style={[baseStyle, extraStyle, { fontStyle: "italic" }]}
// //         >
// //           {match[3]}
// //         </Text>,
// //       );
// //     } else if (match[4]) {
// //       parts.push(
// //         <Text
// //           key={match.index}
// //           style={[baseStyle, extraStyle, { textDecorationLine: "underline" }]}
// //         >
// //           {match[4]}
// //         </Text>,
// //       );
// //     }

// //     lastIndex = match.index + match[0].length;
// //   }

// //   if (lastIndex < text.length) {
// //     parts.push(text.slice(lastIndex));
// //   }

// //   return parts;
// // }

// // const styles = StyleSheet.create({
// //   paragraph: {
// //     marginBottom: 6,
// //   },
// //   bulletRow: {
// //     flexDirection: "row",
// //     alignItems: "flex-start",
// //     marginBottom: 6,
// //     paddingLeft: 4,
// //   },
// //   bulletText: {
// //     flex: 1,
// //     marginLeft: 8,
// //   },
// //   spacer: {
// //     height: 6,
// //   },
// // });

// import React from "react";
// import {
//   Text,
//   View,
//   StyleSheet,
//   TextStyle,
//   useColorScheme,
// } from "react-native";
// import { useFontSizeStore } from "../../stores/fontSizeStore";
// import { Colors } from "@/constants/Colors";

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

// type TextType = keyof typeof LINE_HEIGHT_MULTIPLIERS;

// type Props = {
//   children: string;
//   type: TextType;
//   style?: TextStyle;
// };

// export const RichText = ({ children, type = "latin", style }: Props) => {
//   const colorScheme = useColorScheme() || "light";
//   const color = Colors[colorScheme].text;
//   const fontSize = useFontSizeStore((s) => s.fontSize);

//   const baseStyle: TextStyle = {
//     color,
//     fontSize: Math.round(fontSize * FONT_SIZE_MULTIPLIERS[type]),
//     lineHeight: Math.round(fontSize * LINE_HEIGHT_MULTIPLIERS[type]),
//   };

//   const lines = children.split(/\r?\n/);

//   return (
//     <>
//       {lines.map((line, index) => {
//         const bulletMatch = line.match(/^(\s*)[-*•]\s+(.*)$/);

//         if (bulletMatch) {
//           const content = bulletMatch[2];

//           return (
//             <View key={`bullet-${index}`} style={styles.bulletRow}>
//               <Text style={[baseStyle, style, styles.bulletMarker]}>•</Text>
//               <Text style={[baseStyle, style, styles.bulletText]}>
//                 {parseInline(content, baseStyle, style)}
//               </Text>
//             </View>
//           );
//         }

//         if (line.trim() === "") {
//           return <View key={`spacer-${index}`} style={styles.spacer} />;
//         }

//         return (
//           <Text key={`paragraph-${index}`} style={[baseStyle, style, styles.paragraph]}>
//             {parseInline(line, baseStyle, style)}
//           </Text>
//         );
//       })}
//     </>
//   );
// };

// function parseInline(
//   text: string,
//   baseStyle: TextStyle,
//   extraStyle?: TextStyle,
// ): React.ReactNode[] {
//   const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__)/g;
//   const parts: React.ReactNode[] = [];
//   let lastIndex = 0;
//   let match: RegExpExecArray | null;

//   while ((match = regex.exec(text)) !== null) {
//     if (match.index > lastIndex) {
//       parts.push(text.slice(lastIndex, match.index));
//     }

//     if (match[2]) {
//       parts.push(
//         <Text
//           key={match.index}
//           style={[baseStyle, extraStyle, { fontWeight: "700" }]}
//         >
//           {match[2]}
//         </Text>,
//       );
//     } else if (match[3]) {
//       parts.push(
//         <Text
//           key={match.index}
//           style={[baseStyle, extraStyle, { fontStyle: "italic" }]}
//         >
//           {match[3]}
//         </Text>,
//       );
//     } else if (match[4]) {
//       parts.push(
//         <Text
//           key={match.index}
//           style={[baseStyle, extraStyle, { textDecorationLine: "underline" }]}
//         >
//           {match[4]}
//         </Text>,
//       );
//     }

//     lastIndex = match.index + match[0].length;
//   }

//   if (lastIndex < text.length) {
//     parts.push(text.slice(lastIndex));
//   }

//   return parts;
// }

// const styles = StyleSheet.create({
//   paragraph: {
//     marginBottom: 6,
//     flexShrink: 1,
//     minWidth: 0,
//   },
//   bulletRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 6,
//     width: "100%",
//     flexShrink: 1,
//     minWidth: 0,
//   },
//   bulletMarker: {
//     marginTop: 1,
//   },
//   bulletText: {
//     flex: 1,
//     flexShrink: 1,
//     minWidth: 0,
//     marginLeft: 8,
//   },
//   spacer: {
//     height: 6,
//   },
// });

import React from "react";
import { Text, TextStyle, useColorScheme } from "react-native";
import { useFontSizeStore } from "../../stores/fontSizeStore";
import { Colors } from "@/constants/Colors";

const LINE_HEIGHT_MULTIPLIERS = {
  latin: 1.5,
  arabic: 2.2,
  transliteration: 1.8,
} as const;

const FONT_SIZE_MULTIPLIERS = {
  latin: 1,
  arabic: 1.3,
  transliteration: 1,
} as const;

type TextType = keyof typeof LINE_HEIGHT_MULTIPLIERS;

type Props = {
  children: string;
  type: TextType;
  style?: TextStyle;
};

export const RichText = ({ children, type = "latin", style }: Props) => {
  const colorScheme = useColorScheme() || "light";
  const color = Colors[colorScheme].text;
  const fontSize = useFontSizeStore((s) => s.fontSize);

  const baseStyle: TextStyle = {
    color,
    fontSize: Math.round(fontSize * FONT_SIZE_MULTIPLIERS[type]),
    lineHeight: Math.round(fontSize * LINE_HEIGHT_MULTIPLIERS[type]),
  };

  return (
    <Text style={[baseStyle, style]}>
      {parseRichText(children, baseStyle, style)}
    </Text>
  );
};

function parseRichText(
  text: string,
  baseStyle: TextStyle,
  extraStyle?: TextStyle,
): React.ReactNode[] {
  const parts = text.split(/(\r?\n)/); // keeps newline tokens
  const result: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part === "\n" || part === "\r\n") {
      result.push(part);
      return;
    }

    const bulletMatch = part.match(/^([ \t]*)[-*•](\s+)(.*)$/);

    if (bulletMatch) {
      const indent = bulletMatch[1];
      const spacingAfterBullet = bulletMatch[2];
      const content = bulletMatch[3];

      result.push(
        <Text key={`line-${index}`} style={[baseStyle, extraStyle]}>
          {indent}
          {"•"}
          {spacingAfterBullet}
          {parseInline(content, baseStyle, extraStyle)}
        </Text>,
      );
      return;
    }

    result.push(
      <Text key={`line-${index}`} style={[baseStyle, extraStyle]}>
        {parseInline(part, baseStyle, extraStyle)}
      </Text>,
    );
  });

  return result;
}

function parseInline(
  text: string,
  baseStyle: TextStyle,
  extraStyle?: TextStyle,
): React.ReactNode[] {
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(
        <Text
          key={`bold-${match.index}`}
          style={[baseStyle, extraStyle, { fontWeight: "700" }]}
        >
          {match[2]}
        </Text>,
      );
    } else if (match[3]) {
      parts.push(
        <Text
          key={`italic-${match.index}`}
          style={[baseStyle, extraStyle, { fontStyle: "italic" }]}
        >
          {match[3]}
        </Text>,
      );
    } else if (match[4]) {
      parts.push(
        <Text
          key={`underline-${match.index}`}
          style={[baseStyle, extraStyle, { textDecorationLine: "underline" }]}
        >
          {match[4]}
        </Text>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
