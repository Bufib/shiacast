// import React from "react";
// import { View, StyleSheet, StyleProp, TextStyle } from "react-native";
// import { ThemedText } from "./ThemedText";
// import RenderLink from "./RenderLink";
// import { useLanguage } from "../../contexts/LanguageContext";

// interface InlineTodoTextProps {
//   text: string;
//   internalUrls?: string[];
//   style?: StyleProp<TextStyle>;
//   isDone?: boolean;
// }

// /**
//  * Usage example:
//  *   text: "Asdas {{link}} and {{link}}"
//  *   internalUrls: ["quranLink:28:3", "prayerLink:12"]
//  * Each {{...}} is replaced IN ORDER by the corresponding internalUrls entry.
//  */
// export const InlineTodoText: React.FC<InlineTodoTextProps> = ({
//   text,
//   internalUrls = [],
//   style,
//   isDone = false,
// }) => {
//   const { rtl } = useLanguage();

//   // Flatten incoming style and strip layout props that break inline composition
//   const flat = StyleSheet.flatten(style) || {};
//   const {
//     flex,
//     flexGrow,
//     flexShrink,
//     flexBasis,
//     alignSelf,
//     textAlign: baseTextAlign,
//     ...inlineTextStyle
//   } = flat;

//   const textAlign = rtl ? "right" : baseTextAlign;

//   const linkPattern = /\{\{([^}]+)\}\}/g;
//   const parts: React.ReactNode[] = [];

//   let lastIndex = 0;
//   let linkIndex = 0;
//   let match: RegExpExecArray | null;

//   while ((match = linkPattern.exec(text)) !== null) {
//     const matchStart = match.index;

//     // Plain text before the placeholder
//     if (matchStart > lastIndex) {
//       const chunk = text.substring(lastIndex, matchStart);
//       if (chunk.length) {
//         parts.push(
//           <ThemedText
//             key={`txt-${lastIndex}`}
//             style={[inlineTextStyle, { textAlign }]}
//           >
//             {chunk}
//           </ThemedText>,
//         );
//       }
//     }

//     // Render link for this placeholder
//     if (linkIndex < internalUrls.length) {
//       const url = internalUrls[linkIndex];
//       parts.push(
//         <RenderLink
//           key={`link-${linkIndex}-${url}`}
//           url={url}
//           index={linkIndex}
//           isExternal={false}
//           isDone={isDone}
//         />,
//       );
//     } else {
//       // Fallback marker if we have more {{}} than urls
//       parts.push(
//         <ThemedText
//           key={`missing-${linkIndex}`}
//           style={[inlineTextStyle, { color: "red", textAlign }]}
//         >
//           [Link]
//         </ThemedText>,
//       );
//     }

//     linkIndex++;
//     lastIndex = linkPattern.lastIndex;
//   }

//   // Trailing text after the last placeholder
//   if (lastIndex < text.length) {
//     const tail = text.substring(lastIndex);
//     if (tail.length) {
//       parts.push(
//         <ThemedText key="txt-tail" style={[inlineTextStyle, { textAlign }]}>
//           {tail}
//         </ThemedText>,
//       );
//     }
//   }

//   // No placeholders → just render plain text
//   if (parts.length === 0) {
//     return (
//       <ThemedText style={[inlineTextStyle, { textAlign }]}>{text}</ThemedText>
//     );
//   }

//   return (
//     <View
//       style={[styles.inlineContainer, rtl && { flexDirection: "row-reverse" }]}
//     >
//       {parts}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   inlineContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     alignItems: "center",
//     flex: 1, // the whole inline block fills remaining row space
//   },
// });
import React from "react";
import { StyleSheet, StyleProp, TextStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { useLanguage } from "../../contexts/LanguageContext";
import InlineRenderLink from "./InlineRenderLink";

interface InlineTodoTextProps {
  text: string;
  internalUrls?: string[];
  style?: StyleProp<TextStyle>;
  isDone?: boolean;
}

export const InlineTodoText: React.FC<InlineTodoTextProps> = ({
  text,
  internalUrls = [],
  style,
  isDone = false,
}) => {
  const { rtl } = useLanguage();

  const flat = StyleSheet.flatten(style) || {};
  const textAlign = rtl ? "right" : flat.textAlign;

  const linkPattern = /\{\{([^}]+)\}\}/g;
  const parts: React.ReactNode[] = [];

  let lastIndex = 0;
  let linkIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    const matchStart = match.index;

    if (matchStart > lastIndex) {
      const chunk = text.substring(lastIndex, matchStart);
      if (chunk.length) {
        parts.push(chunk);
      }
    }

    if (linkIndex < internalUrls.length) {
      parts.push(
        <InlineRenderLink
          key={`link-${linkIndex}-${internalUrls[linkIndex]}`}
          url={internalUrls[linkIndex]}
          index={linkIndex}
          isExternal={false}
          isDone={isDone}
        />,
      );
    }

    lastIndex = linkPattern.lastIndex;
    linkIndex++;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  if (parts.length === 0) {
    parts.push(text);
  }

  return (
    <ThemedText
      style={[styles.baseText, style, { textAlign }, isDone && styles.doneText]}
    >
      {parts}
    </ThemedText>
  );
};

const styles = StyleSheet.create({
  baseText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
  doneText: {
    opacity: 0.6,
  },
});

export default InlineTodoText;
