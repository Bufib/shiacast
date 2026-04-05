// // // // // import React from "react";
// // // // // import { Text, TextStyle, useColorScheme } from "react-native";
// // // // // import { useFontSizeStore } from "../../stores/fontSizeStore";
// // // // // import { Colors } from "@/constants/Colors";

// // // // // const LINE_HEIGHT_MULTIPLIERS = {
// // // // //   latin: 2,
// // // // //   arabic: 2.5,
// // // // //   transliteration: 2,
// // // // // } as const;

// // // // // const FONT_SIZE_MULTIPLIERS = {
// // // // //   latin: 1,
// // // // //   arabic: 1.3,
// // // // //   transliteration: 1,
// // // // // } as const;

// // // // // type TextType = keyof typeof LINE_HEIGHT_MULTIPLIERS;

// // // // // type Props = {
// // // // //   children: string;
// // // // //   type: TextType;
// // // // //   style?: TextStyle;
// // // // // };

// // // // // export const RichText = ({ children, type = "latin", style }: Props) => {
// // // // //   const colorScheme = useColorScheme() || "light";
// // // // //   const color = Colors[colorScheme].text;
// // // // //   const fontSize = useFontSizeStore((s) => s.fontSize);

// // // // //   const baseStyle: TextStyle = {
// // // // //     color,
// // // // //     fontSize: Math.round(fontSize * FONT_SIZE_MULTIPLIERS[type]),
// // // // //     lineHeight: Math.round(fontSize * LINE_HEIGHT_MULTIPLIERS[type]),
// // // // //   };

// // // // //   return (
// // // // //     <Text style={[baseStyle, style]}>
// // // // //       {parseRichText(children, baseStyle, style)}
// // // // //     </Text>
// // // // //   );
// // // // // };

// // // // // function parseRichText(
// // // // //   text: string,
// // // // //   baseStyle: TextStyle,
// // // // //   extraStyle?: TextStyle,
// // // // // ): React.ReactNode[] {
// // // // //   const parts = text.split(/(\r?\n)/); // keeps newline tokens
// // // // //   const result: React.ReactNode[] = [];

// // // // //   parts.forEach((part, index) => {
// // // // //     if (part === "\n" || part === "\r\n") {
// // // // //       result.push(part);
// // // // //       return;
// // // // //     }

// // // // //     const bulletMatch = part.match(/^([ \t]*)[-*•](\s+)(.*)$/);

// // // // //     if (bulletMatch) {
// // // // //       const indent = bulletMatch[1];
// // // // //       const spacingAfterBullet = bulletMatch[2];
// // // // //       const content = bulletMatch[3];

// // // // //       result.push(
// // // // //         <Text key={`line-${index}`} style={[baseStyle, extraStyle]}>
// // // // //           {indent}
// // // // //           {"•"}
// // // // //           {spacingAfterBullet}
// // // // //           {parseInline(content, baseStyle, extraStyle)}
// // // // //         </Text>,
// // // // //       );
// // // // //       return;
// // // // //     }

// // // // //     result.push(
// // // // //       <Text key={`line-${index}`} style={[baseStyle, extraStyle]}>
// // // // //         {parseInline(part, baseStyle, extraStyle)}
// // // // //       </Text>,
// // // // //     );
// // // // //   });

// // // // //   return result;
// // // // // }

// // // // // function parseInline(
// // // // //   text: string,
// // // // //   baseStyle: TextStyle,
// // // // //   extraStyle?: TextStyle,
// // // // // ): React.ReactNode[] {
// // // // //   const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__)/g;
// // // // //   const parts: React.ReactNode[] = [];
// // // // //   let lastIndex = 0;
// // // // //   let match: RegExpExecArray | null;

// // // // //   while ((match = regex.exec(text)) !== null) {
// // // // //     if (match.index > lastIndex) {
// // // // //       parts.push(text.slice(lastIndex, match.index));
// // // // //     }

// // // // //     if (match[2]) {
// // // // //       parts.push(
// // // // //         <Text
// // // // //           key={`bold-${match.index}`}
// // // // //           style={[baseStyle, extraStyle, { fontWeight: "700" }]}
// // // // //         >
// // // // //           {match[2]}
// // // // //         </Text>,
// // // // //       );
// // // // //     } else if (match[3]) {
// // // // //       parts.push(
// // // // //         <Text
// // // // //           key={`italic-${match.index}`}
// // // // //           style={[baseStyle, extraStyle, { fontStyle: "italic" }]}
// // // // //         >
// // // // //           {match[3]}
// // // // //         </Text>,
// // // // //       );
// // // // //     } else if (match[4]) {
// // // // //       parts.push(
// // // // //         <Text
// // // // //           key={`underline-${match.index}`}
// // // // //           style={[baseStyle, extraStyle, { textDecorationLine: "underline" }]}
// // // // //         >
// // // // //           {match[4]}
// // // // //         </Text>,
// // // // //       );
// // // // //     }

// // // // //     lastIndex = match.index + match[0].length;
// // // // //   }

// // // // //   if (lastIndex < text.length) {
// // // // //     parts.push(text.slice(lastIndex));
// // // // //   }

// // // // //   return parts;
// // // // // }

// // // // import React from "react";
// // // // import { Text, TextStyle, useColorScheme } from "react-native";
// // // // import { useFontSizeStore } from "../../stores/fontSizeStore";
// // // // import { Colors } from "@/constants/Colors";

// // // // const LINE_HEIGHT_MULTIPLIERS = {
// // // //   latin: 2,
// // // //   arabic: 2.5,
// // // //   transliteration: 2,
// // // // } as const;

// // // // const FONT_SIZE_MULTIPLIERS = {
// // // //   latin: 1,
// // // //   arabic: 1.3,
// // // //   transliteration: 1,
// // // // } as const;

// // // // type TextType = keyof typeof LINE_HEIGHT_MULTIPLIERS;

// // // // type Props = {
// // // //   children: string;
// // // //   type: TextType;
// // // //   style?: TextStyle;
// // // // };

// // // // export const RichText = ({ children, type = "latin", style }: Props) => {
// // // //   const colorScheme = useColorScheme() || "light";
// // // //   const color = Colors[colorScheme].text;
// // // //   const fontSize = useFontSizeStore((s) => s.fontSize);

// // // //   const computedFontSize = Math.round(fontSize * FONT_SIZE_MULTIPLIERS[type]);
// // // //   const computedLineHeight = Math.round(
// // // //     computedFontSize * LINE_HEIGHT_MULTIPLIERS[type],
// // // //   );

// // // //   const baseStyle: TextStyle = {
// // // //     color,
// // // //     fontSize: computedFontSize,
// // // //     lineHeight: computedLineHeight,
// // // //   };

// // // //   return (
// // // //     <Text style={[baseStyle, style]}>
// // // //       {parseRichText(children, baseStyle, style)}
// // // //     </Text>
// // // //   );
// // // // };

// // // // function parseRichText(
// // // //   text: string,
// // // //   baseStyle: TextStyle,
// // // //   extraStyle?: TextStyle,
// // // // ): React.ReactNode[] {
// // // //   const parts = text.split(/(\r?\n)/);
// // // //   const result: React.ReactNode[] = [];

// // // //   const fontSize =
// // // //     typeof baseStyle.fontSize === "number" ? baseStyle.fontSize : 16;

// // // //   const compactEmptyLineHeight = Math.round(fontSize * 0.65);

// // // //   parts.forEach((part, index) => {
// // // //     if (part === "\n" || part === "\r\n") {
// // // //       const isEmptyLineBreak = parts[index - 1] === "";

// // // //       result.push(
// // // //         <Text
// // // //           key={`newline-${index}`}
// // // //           style={isEmptyLineBreak ? { lineHeight: compactEmptyLineHeight } : undefined}
// // // //         >
// // // //           {"\n"}
// // // //         </Text>,
// // // //       );
// // // //       return;
// // // //     }

// // // //     if (part === "") {
// // // //       return;
// // // //     }

// // // //     const bulletMatch = part.match(/^([ \t]*)[-*•](\s+)(.*)$/);

// // // //     if (bulletMatch) {
// // // //       const indent = bulletMatch[1];
// // // //       const spacingAfterBullet = bulletMatch[2];
// // // //       const content = bulletMatch[3];

// // // //       result.push(
// // // //         <Text key={`line-${index}`} style={[baseStyle, extraStyle]}>
// // // //           {indent}•{spacingAfterBullet}
// // // //           {parseInline(content, baseStyle, extraStyle)}
// // // //         </Text>,
// // // //       );
// // // //       return;
// // // //     }

// // // //     result.push(
// // // //       <Text key={`line-${index}`} style={[baseStyle, extraStyle]}>
// // // //         {parseInline(part, baseStyle, extraStyle)}
// // // //       </Text>,
// // // //     );
// // // //   });

// // // //   return result;
// // // // }

// // // // function parseInline(
// // // //   text: string,
// // // //   baseStyle: TextStyle,
// // // //   extraStyle?: TextStyle,
// // // // ): React.ReactNode[] {
// // // //   const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__)/g;
// // // //   const parts: React.ReactNode[] = [];
// // // //   let lastIndex = 0;
// // // //   let match: RegExpExecArray | null;

// // // //   while ((match = regex.exec(text)) !== null) {
// // // //     if (match.index > lastIndex) {
// // // //       parts.push(text.slice(lastIndex, match.index));
// // // //     }

// // // //     if (match[2]) {
// // // //       parts.push(
// // // //         <Text
// // // //           key={`bold-${match.index}`}
// // // //           style={[baseStyle, extraStyle, { fontWeight: "700" }]}
// // // //         >
// // // //           {match[2]}
// // // //         </Text>,
// // // //       );
// // // //     } else if (match[3]) {
// // // //       parts.push(
// // // //         <Text
// // // //           key={`italic-${match.index}`}
// // // //           style={[baseStyle, extraStyle, { fontStyle: "italic" }]}
// // // //         >
// // // //           {match[3]}
// // // //         </Text>,
// // // //       );
// // // //     } else if (match[4]) {
// // // //       parts.push(
// // // //         <Text
// // // //           key={`underline-${match.index}`}
// // // //           style={[baseStyle, extraStyle, { textDecorationLine: "underline" }]}
// // // //         >
// // // //           {match[4]}
// // // //         </Text>,
// // // //       );
// // // //     }

// // // //     lastIndex = match.index + match[0].length;
// // // //   }

// // // //   if (lastIndex < text.length) {
// // // //     parts.push(text.slice(lastIndex));
// // // //   }

// // // //   return parts;
// // // // }

// // // import React, { useMemo } from "react";
// // // import { Linking, useColorScheme } from "react-native";
// // // import {
// // //   EnrichedMarkdownText,
// // //   type MarkdownStyle,
// // // } from "react-native-enriched-markdown";
// // // import { useFontSizeStore } from "../../stores/fontSizeStore";
// // // import { Colors } from "@/constants/Colors";

// // // const LINE_HEIGHT_MULTIPLIERS = {
// // //   latin: 2,
// // //   arabic: 2.5,
// // //   transliteration: 2,
// // // } as const;

// // // const FONT_SIZE_MULTIPLIERS = {
// // //   latin: 1,
// // //   arabic: 1.3,
// // //   transliteration: 1,
// // // } as const;

// // // type TextType = keyof typeof LINE_HEIGHT_MULTIPLIERS;

// // // type Props = {
// // //   children: string;
// // //   type?: TextType;
// // //   italic?: boolean;
// // // };

// // // export const MarkdownText = ({
// // //   children,
// // //   type = "latin",
// // //   italic = false,
// // // }: Props) => {
// // //   const colorScheme = useColorScheme() || "light";
// // //   const fontSize = useFontSizeStore((s) => s.fontSize);

// // //   const computedFontSize = Math.round(fontSize * FONT_SIZE_MULTIPLIERS[type]);
// // //   const computedLineHeight = Math.round(
// // //     computedFontSize * LINE_HEIGHT_MULTIPLIERS[type],
// // //   );

// // //   const markdownStyle = useMemo<MarkdownStyle>(
// // //     () => ({
// // //       paragraph: {
// // //         fontSize: computedFontSize,
// // //         lineHeight: computedLineHeight,
// // //         color: Colors[colorScheme].text,
// // //         marginTop: 0,
// // //         marginBottom: 0,
// // //         ...(italic ? { fontStyle: "italic" } : null),
// // //       },
// // //       list: {
// // //         fontSize: computedFontSize,
// // //         lineHeight: computedLineHeight,
// // //         color: Colors[colorScheme].text,
// // //         marginTop: 0,
// // //         marginBottom: 0,
// // //         ...(italic ? { fontStyle: "italic" } : null),
// // //       },
// // //       link: {
// // //         color: Colors[colorScheme].tint,
// // //       },
// // //       strong: {
// // //         color: Colors[colorScheme].text,
// // //       },
// // //       em: {
// // //         color: Colors[colorScheme].text,
// // //       },
// // //     }),
// // //     [colorScheme, computedFontSize, computedLineHeight, italic],
// // //   );

// // //   return (
// // //     <EnrichedMarkdownText
// // //       markdown={children}
// // //       flavor="commonmark"
// // //       selectable
// // //       markdownStyle={markdownStyle}
// // //       onLinkPress={({ url }) => Linking.openURL(url)}
// // //     />
// // //   );
// // // };

// // import React, { useMemo } from "react";
// // import {
// //   Linking,
// //   Platform,
// //   TextStyle,
// //   useColorScheme,
// // } from "react-native";
// // import {
// //   EnrichedMarkdownText,
// //   type MarkdownStyle,
// // } from "react-native-enriched-markdown";
// // import { useFontSizeStore } from "../../stores/fontSizeStore";
// // import { Colors } from "@/constants/Colors";

// // const LINE_HEIGHT_MULTIPLIERS = {
// //   latin: 1.7,
// //   arabic: 2.3,
// //   transliteration: 1.85,
// // } as const;

// // const FONT_SIZE_MULTIPLIERS = {
// //   latin: 1,
// //   arabic: 1.3,
// //   transliteration: 1,
// // } as const;

// // type TextType = keyof typeof LINE_HEIGHT_MULTIPLIERS;

// // type Props = {
// //   children: string;
// //   type?: TextType;
// //   style?: TextStyle;
// // };

// // export const RichText = ({ children, type = "latin", style }: Props) => {
// //   const colorScheme = useColorScheme() || "light";
// //   const fontSize = useFontSizeStore((s) => s.fontSize);

// //   const computedFontSize = Math.round(fontSize * FONT_SIZE_MULTIPLIERS[type]);
// //   const computedLineHeight =
// //     Math.ceil(computedFontSize * LINE_HEIGHT_MULTIPLIERS[type]) +
// //     (Platform.OS === "android" ? 2 : 1);

// //   const markdownStyle = useMemo<MarkdownStyle>(() => {
// //     const textColor =
// //       typeof style?.color === "string"
// //         ? style.color
// //         : Colors[colorScheme].text;

// //     const sharedBlockStyle = {
// //       color: textColor,
// //       fontSize: computedFontSize,
// //       lineHeight: computedLineHeight,
// //       fontFamily: style?.fontFamily,
// //       fontWeight:
// //         typeof style?.fontWeight === "string" ? style.fontWeight : undefined,
// //       marginTop: typeof style?.marginTop === "number" ? style.marginTop : 0,
// //       marginBottom:
// //         typeof style?.marginBottom === "number" ? style.marginBottom : 0,
// //     };

// //     const paragraphStyle: NonNullable<MarkdownStyle["paragraph"]> = {
// //       ...sharedBlockStyle,
// //       textAlign: style?.textAlign,
// //     };

// //     return {
// //       paragraph: paragraphStyle,

// //       list: {
// //         ...sharedBlockStyle,
// //         gapWidth: 8,
// //       },

// //       blockquote: {
// //         ...sharedBlockStyle,
// //       },

// //       codeBlock: {
// //         ...sharedBlockStyle,
// //       },

// //       h1: {
// //         ...paragraphStyle,
// //         fontWeight: "700",
// //         marginBottom: 8,
// //       },
// //       h2: {
// //         ...paragraphStyle,
// //         fontWeight: "700",
// //         marginBottom: 8,
// //       },
// //       h3: {
// //         ...paragraphStyle,
// //         fontWeight: "700",
// //         marginBottom: 8,
// //       },
// //       h4: {
// //         ...paragraphStyle,
// //         fontWeight: "700",
// //         marginBottom: 8,
// //       },
// //       h5: {
// //         ...paragraphStyle,
// //         fontWeight: "700",
// //         marginBottom: 8,
// //       },
// //       h6: {
// //         ...paragraphStyle,
// //         fontWeight: "700",
// //         marginBottom: 8,
// //       },

// //       link: {
// //         color: Colors[colorScheme].tint,
// //         underline: true,
// //       },

// //       thematicBreak: {
// //         color: Colors[colorScheme].devider,
// //         marginTop: 10,
// //         marginBottom: 10,
// //         height: 1,
// //       },
// //     };
// //   }, [
// //     colorScheme,
// //     computedFontSize,
// //     computedLineHeight,
// //     style?.color,
// //     style?.fontFamily,
// //     style?.fontWeight,
// //     style?.marginTop,
// //     style?.marginBottom,
// //     style?.textAlign,
// //   ]);

// //   return (
// //     <EnrichedMarkdownText
// //       markdown={children}
// //       flavor="commonmark"
// //       selectable
// //       markdownStyle={markdownStyle}
// //       containerStyle={{ flexShrink: 1, alignSelf: "stretch" }}
// //       onLinkPress={({ url }) => {
// //         if (url) {
// //           Linking.openURL(url);
// //         }
// //       }}
// //     />
// //   );
// // };


// import React, { useMemo } from "react";
// import { Linking, Platform, TextStyle, useColorScheme } from "react-native";
// import {
//   EnrichedMarkdownText,
//   type MarkdownStyle,
// } from "react-native-enriched-markdown";
// import { useFontSizeStore } from "../../stores/fontSizeStore";
// import { Colors } from "@/constants/Colors";

// const LINE_HEIGHT_MULTIPLIERS = {
//   latin: 1.7,
//   arabic: 2.3,
//   transliteration: 1.85,
// } as const;

// const FONT_SIZE_MULTIPLIERS = {
//   latin: 1,
//   arabic: 1.3,
//   transliteration: 1,
// } as const;

// type TextType = keyof typeof LINE_HEIGHT_MULTIPLIERS;

// type Props = {
//   children: string;
//   type?: TextType;
//   style?: TextStyle;
// };

// function preserveBackticksAsText(text: string) {
//   return text.replace(/`/g, "\\`");
// }

// export const RichText = ({ children, type = "latin", style }: Props) => {
//   const colorScheme = useColorScheme() || "light";
//   const fontSize = useFontSizeStore((s) => s.fontSize);

//   const computedFontSize = Math.round(fontSize * FONT_SIZE_MULTIPLIERS[type]);
//   const computedLineHeight =
//     Math.ceil(computedFontSize * LINE_HEIGHT_MULTIPLIERS[type]) +
//     (Platform.OS === "android" ? 2 : 1);

//   const safeMarkdown = useMemo(() => preserveBackticksAsText(children), [children]);

//   const markdownStyle = useMemo<MarkdownStyle>(() => {
//     const textColor =
//       typeof style?.color === "string" ? style.color : Colors[colorScheme].text;

//     return {
//       paragraph: {
//         color: textColor,
//         fontSize: computedFontSize,
//         lineHeight: computedLineHeight,
//         marginTop: 0,
//         marginBottom: 0,
//         textAlign: style?.textAlign,
//       },
//       list: {
//         color: textColor,
//         fontSize: computedFontSize,
//         lineHeight: computedLineHeight,
//         marginTop: 0,
//         marginBottom: 0,
//         gapWidth: 8,
//       },
//       blockquote: {
//         color: textColor,
//         fontSize: computedFontSize,
//         lineHeight: computedLineHeight,
//         marginTop: 0,
//         marginBottom: 0,
//       },
//       codeBlock: {
//         color: textColor,
//         fontSize: computedFontSize,
//         lineHeight: computedLineHeight,
//         marginTop: 0,
//         marginBottom: 0,
//       },
//       h1: {
//         color: textColor,
//         fontSize: computedFontSize,
//         lineHeight: computedLineHeight,
//         marginTop: 0,
//         marginBottom: 8,
//         fontWeight: "700",
//       },
//       h2: {
//         color: textColor,
//         fontSize: computedFontSize,
//         lineHeight: computedLineHeight,
//         marginTop: 0,
//         marginBottom: 8,
//         fontWeight: "700",
//       },
//       h3: {
//         color: textColor,
//         fontSize: computedFontSize,
//         lineHeight: computedLineHeight,
//         marginTop: 0,
//         marginBottom: 8,
//         fontWeight: "700",
//       },
//       link: {
//         color: Colors[colorScheme].tint,
//         underline: true,
//       },
//     };
//   }, [colorScheme, computedFontSize, computedLineHeight, style?.color, style?.textAlign]);

//   return (
//     <EnrichedMarkdownText
//       key={`${type}-${computedFontSize}-${computedLineHeight}-${children.length}`}
//       markdown={safeMarkdown}
//       flavor="commonmark"
//       selectable
//       markdownStyle={markdownStyle}
//       containerStyle={{
//         width: "100%",
//         alignSelf: "stretch",
//       }}
//       onLinkPress={({ url }) => {
//         if (url) Linking.openURL(url);
//       }}
//     />
//   );
// };

import React, { useMemo } from "react";
import { Linking, Platform, TextStyle, useColorScheme } from "react-native";
import {
  EnrichedMarkdownText,
  type MarkdownStyle,
} from "react-native-enriched-markdown";
import { useFontSizeStore } from "../../stores/fontSizeStore";
import { Colors } from "@/constants/Colors";
import {
  getScaledFontSize,
  getScaledLineHeight,
  type TextType,
} from "@/constants/typography";

type Props = {
  children: string;
  type?: TextType;
  style?: TextStyle;
};

function preserveBackticksAsText(text: string) {
  return text.replace(/`/g, "\\`");
}

export const RichText = ({ children, type = "latin", style }: Props) => {
  const colorScheme = useColorScheme() || "light";
  const baseFontSize = useFontSizeStore((s) => s.fontSize);

  const computedFontSize = getScaledFontSize(baseFontSize, type);
  const computedLineHeight =
    getScaledLineHeight(baseFontSize, type) + (Platform.OS === "android" ? 2 : 1);

  const safeMarkdown = useMemo(() => preserveBackticksAsText(children), [children]);

  const markdownStyle = useMemo<MarkdownStyle>(() => {
    const textColor =
      typeof style?.color === "string" ? style.color : Colors[colorScheme].text;

    return {
      paragraph: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 0,
        textAlign: style?.textAlign,
      },
      list: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 0,
        gapWidth: 8,
      },
      blockquote: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 0,
      },
      codeBlock: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 0,
      },
      h1: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 8,
        fontWeight: "700",
      },
      h2: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 8,
        fontWeight: "700",
      },
      h3: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 8,
        fontWeight: "700",
      },
      link: {
        color: Colors[colorScheme].tint,
        textDecorationLine: "underline",
      },
    };
  }, [colorScheme, computedFontSize, computedLineHeight, style?.color, style?.textAlign]);

  return (
    <EnrichedMarkdownText
      key={`${type}-${computedFontSize}-${computedLineHeight}-${children.length}`}
      markdown={safeMarkdown}
      flavor="commonmark"
      selectable
      markdownStyle={markdownStyle}
      containerStyle={{
        width: "100%",
        alignSelf: "stretch",
      }}
      onLinkPress={({ url }) => {
        if (url) Linking.openURL(url);
      }}
    />
  );
};