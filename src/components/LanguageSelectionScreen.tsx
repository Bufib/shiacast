// // src/screens/LanguageSelection.tsx
// import React, { useCallback } from "react";
// import {
//   View,
//   StyleSheet,
//   Text,
//   Pressable,
//   ActivityIndicator,
// } from "react-native";
// import { useLanguage } from "../../contexts/LanguageContext";
// import { LanguageCode } from "@/constants/Types";
// import { Colors } from "@/constants/Colors";

// const LANGUAGES: { code: LanguageCode; label: string }[] = [
//   { code: "en", label: "English" },
//   { code: "de", label: "Deutsch" },
//   { code: "ar", label: "العربية" },
// ];

// export default function LanguageSelection() {
//   const { lang, setAppLanguage, ready, rtl } = useLanguage();

//   const onPick = useCallback(
//     async (code: LanguageCode) => {
//       await setAppLanguage(code);
//     },
//     [setAppLanguage]
//   );

//   if (!ready) {
//     return (
//       <View style={styles.loading}>
//         <ActivityIndicator />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={[styles.title, rtl && { textAlign: "right" }]}>
//         Choose your language
//       </Text>

//       {LANGUAGES.map(({ code, label }) => {
//         const selected = code === lang;
//         return (
//           <Pressable
//             key={code}
//             onPress={() => onPick(code)}
//             accessibilityRole="button"
//             accessibilityState={{ selected }}
//             style={[styles.button, selected && styles.buttonSelected]}
//           >
//             <Text
//               style={[styles.buttonText, selected && styles.buttonTextSelected]}
//             >
//               {label} {selected ? "✓" : ""}
//             </Text>
//           </Pressable>
//         );
//       })}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   loading: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     padding: 24,
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   button: {
//     marginVertical: 8,
//     alignItems: "center",
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   buttonSelected: {
//     borderColor: Colors.universal.link,
//   },
//   buttonText: {
//     fontSize: 20,
//     color: Colors.universal.link,
//   },
//   buttonTextSelected: {
//     fontWeight: "700",
//   },
// });

import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import { LanguageCode } from "@/constants/Types";
import { Colors } from "@/constants/Colors";

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
];

export default function LanguageSelection() {
  const { t } = useTranslation();
  const { lang, setAppLanguage, ready, rtl } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const onPick = useCallback(
    async (code: LanguageCode) => {
      if (isChanging) return;

      try {
        setIsChanging(true);
        await setAppLanguage(code);
      } finally {
        setIsChanging(false);
      }
    },
    [isChanging, setAppLanguage],
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={[styles.title, rtl && styles.textRight]}>
          Choose your language
        </Text>

        {LANGUAGES.map(({ code, label }) => {
          const selected = code === lang;

          return (
            <TouchableOpacity
              key={code}
              onPress={() => onPick(code)}
              disabled={isChanging}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: isChanging }}
              style={[styles.button]}
            >
              <Text style={[styles.buttonText]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#111",
  },
  textRight: {
    textAlign: "right",
  },
  button: {
    marginVertical: 8,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderEndWidth: 0.5,
    backgroundColor: "#fff",
  },
  buttonSelected: {
    borderColor: Colors.universal.link,
    backgroundColor: "rgba(0, 122, 255, 0.08)",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 20,
    color: Colors.universal.link,
  },
  buttonTextSelected: {
    fontWeight: "700",
  },
});
