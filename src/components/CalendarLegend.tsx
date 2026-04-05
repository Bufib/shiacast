

// // src/components/CalendarLegend.tsx
// import React, { useEffect, useState } from "react";
// import {
//   FlatList,
//   StyleSheet,
//   useColorScheme,
//   ViewStyle,
//   View,
// } from "react-native";
// import { ThemedView } from "./ThemedView";
// import { ThemedText } from "./ThemedText";
// import { Colors } from "@/constants/Colors";
// import { useLanguage } from "../../contexts/LanguageContext";
// import { getAllCalendarLegend } from "../../db/queries/calendar";
// import { LoadingIndicator } from "./LoadingIndicator";
// import { useTranslation } from "react-i18next";
// import { useDataVersionStore } from "../../stores/dataVersionStore";
// import { calendarLegendType } from "@/constants/Types";

// type Props = {
//   style?: ViewStyle;
// };

// const CalendarLegend: React.FC<Props> = ({ style }) => {
//   const colorScheme = useColorScheme() || "light";
//   const { lang } = useLanguage();
//   const { t } = useTranslation();
//   const calendarVersion = useDataVersionStore((s) => s.calendarVersion);

//   const [legendItems, setLegendItems] = useState<calendarLegendType[]>([]);
//   const [loading, setLoading] = useState(false);

//   const localDate = new Date().toLocaleDateString(lang, {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });

//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         setLoading(true);
//         const legends = await getAllCalendarLegend(lang);
//         if (!cancelled) {
//           setLegendItems(legends);
//         }
//       } catch (e) {
//         console.warn("Legend load failed:", e);
//         if (!cancelled) setLegendItems([]);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [lang, calendarVersion]);

//   if (loading) {
//     return (
//       <ThemedView style={styles.loadingContainer}>
//         <LoadingIndicator size="large" />
//       </ThemedView>
//     );
//   }

//   if (!legendItems.length) {
//     return (
//       <ThemedView style={[styles.container, style]}>
//         <ThemedText style={styles.emptyText}>{t("noData")}</ThemedText>
//       </ThemedView>
//     );
//   }

//   return (
//     <View
//       style={[
//         styles.container,
//         style,
//         { backgroundColor: Colors[colorScheme].contrast },
//       ]}
//     >
//       <View style={styles.headerRow}>
//         <ThemedText style={styles.title}>{t("legend")}</ThemedText>
//         <ThemedText style={styles.title}>{localDate}</ThemedText>
//       </View>

//       <FlatList
//         data={legendItems}
//         keyExtractor={(item) => `${lang}:${item.legend_type.trim().toLowerCase()}`}
//         scrollEnabled={false}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContent}
//         ItemSeparatorComponent={() => <View style={styles.separator} />}
//         renderItem={({ item }) => (
//           <View style={styles.legendItem}>
//             <View
//               style={[
//                 styles.colorIndicator,
//                 {
//                   backgroundColor: item.color || Colors.universal.primary,
//                 },
//               ]}
//             />
//             <ThemedText style={styles.legendText}>{item.legend_type}</ThemedText>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// export default CalendarLegend;

// const styles = StyleSheet.create({
//   container: {
//     marginHorizontal: 10,
//     padding: 15,
//     borderRadius: 8,
//   },
//   loadingContainer: {
//     paddingVertical: 20,
//     alignItems: "center",
//   },
//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   title: {
//     fontSize: 14,
//     fontWeight: "800",
//   },
//   listContent: {
//     paddingTop: 4,
//   },
//   separator: {
//     height: 12,
//   },
//   legendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   colorIndicator: {
//     width: 16,
//     height: 16,
//     borderRadius: 4,
//     marginRight: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   legendText: {
//     flex: 1,
//     fontSize: 14,
//     fontWeight: "500",
//     lineHeight: 21,
//   },
//   emptyText: {
//     fontSize: 13,
//     fontStyle: "italic",
//     opacity: 0.6,
//   },
// });


import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  ViewStyle,
  View,
} from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { getAllCalendarLegend } from "../../db/queries/calendar";
import { LoadingIndicator } from "./LoadingIndicator";
import { useTranslation } from "react-i18next";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { CalendarLegendType } from "@/constants/Types";

type Props = {
  style?: ViewStyle;
};

const CalendarLegend: React.FC<Props> = ({ style }) => {
  const colorScheme = (useColorScheme() || "light") as "light" | "dark";
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const calendarVersion = useDataVersionStore((s) => s.calendarVersion);

  const [legendItems, setLegendItems] = useState<CalendarLegendType[]>([]);
  const [loading, setLoading] = useState(false);

  const localDate = new Date().toLocaleDateString(lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const legends = await getAllCalendarLegend(lang);

        if (!cancelled) {
          setLegendItems(legends);
        }
      } catch (e) {
        console.warn("Legend load failed:", e);
        if (!cancelled) setLegendItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, calendarVersion]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoadingIndicator size="large" />
      </ThemedView>
    );
  }

  if (!legendItems.length) {
    return (
      <ThemedView style={[styles.container, style]}>
        <ThemedText style={styles.emptyText}>{t("noData")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        style,
        { backgroundColor: Colors[colorScheme].contrast },
      ]}
    >
      <View style={styles.headerRow}>
        <ThemedText style={styles.title}>{t("legend")}</ThemedText>
        <ThemedText style={styles.title}>{localDate}</ThemedText>
      </View>

      <FlatList
        data={legendItems}
        keyExtractor={(item) => `${lang}:${item.id}`}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.legendItem}>
            <View
              style={[
                styles.colorIndicator,
                {
                  backgroundColor: item.color || Colors.universal.primary,
                },
              ]}
            />
            <ThemedText style={styles.legendText}>
              {item.legend_type}
            </ThemedText>
          </View>
        )}
      />
    </View>
  );
};

export default CalendarLegend;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
  },
  listContent: {
    paddingTop: 4,
  },
  separator: {
    height: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: "italic",
    opacity: 0.6,
  },
});