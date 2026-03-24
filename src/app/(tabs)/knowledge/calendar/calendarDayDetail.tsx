//! Before verschieben von datum via settings
 // calendar/calendarDayDetail.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
// import { Stack, useLocalSearchParams } from "expo-router";
// import { ThemedText } from "@/components/ThemedText";
// import { ThemedView } from "@/components/ThemedView";
// import CalendarEventCard from "@/components/CalendarEventCard";
// import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
// import { AddRecommendedActsModal } from "@/components/AddRecommendedActsModal";
// import { LoadingIndicator } from "@/components/LoadingIndicator";
// import { useLanguage } from "../../../../../contexts/LanguageContext";
// import { useTranslation } from "react-i18next";
// import {
//   getAllCalendarDates,
//   getCalendarLegendColorById,
// } from "../../../../../db/queries/calendar";
// import { CalendarType } from "@/constants/Types";
// import { Colors } from "@/constants/Colors";
// import { Ionicons } from "@expo/vector-icons";
// import { useColorScheme } from "react-native";

// export default function CalendarDayDetail() {
//   const { date } = useLocalSearchParams<{
//     date: string;
//     islamicDate: string;
//   }>();
//   const { lang } = useLanguage();
//   const { t } = useTranslation();
//   const colorScheme = useColorScheme() || "light";

//   const [events, setEvents] = useState<CalendarType[]>([]);
//   const [legendColorMap, setLegendColorMap] = useState<Record<number, string>>(
//     {},
//   );
//   const [loading, setLoading] = useState(true);
//   const [addActsModalVisible, setAddActsModalVisible] = useState(false);

//   // Format the date for display in the header
//   const formattedDate = (() => {
//     if (!date) return "";
//     const [y, m, d] = date.split("-").map(Number);
//     const dateObj = new Date(y, m - 1, d);
//     return dateObj.toLocaleDateString(lang, {
//       weekday: "long",
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//     });
//   })();

//   useEffect(() => {
//     if (!date) return;
//     let cancelled = false;
//     (async () => {
//       try {
//         setLoading(true);
//         const [all, colorMap] = await Promise.all([
//           getAllCalendarDates(lang),
//           getCalendarLegendColorById(lang),
//         ]);
//         if (!cancelled) {
//           setEvents(all.filter((e) => e.gregorian_date === date));
//           setLegendColorMap(colorMap);
//         }
//       } catch {
//         if (!cancelled) setEvents([]);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [date, lang]);

//   const todayStart = (() => {
//     const d = new Date();
//     d.setHours(0, 0, 0, 0);
//     return d;
//   })();

//   const dayDiff = (() => {
//     if (!date) return 0;
//     const [y, m, d] = date.split("-").map(Number);
//     const dateObj = new Date(y, m - 1, d);
//     return Math.round((dateObj.getTime() - todayStart.getTime()) / 86400000);
//   })();

//   // Aggregate unique recommended acts from all events for this day
//   const recommendedActs = useMemo(() => {
//     const seen = new Set<string>();
//     const acts: string[] = [];
//     for (const event of events) {
//       for (const act of event.recommended_acts ?? []) {
//         if (act && !seen.has(act)) {
//           seen.add(act);
//           acts.push(act);
//         }
//       }
//     }
//     return acts;
//   }, [events]);

//   return (
//     <ThemedView style={styles.container}>
//       <Stack.Screen
//         options={{
//           title: formattedDate,
//           headerTitleStyle: { fontSize: 14 },
//           headerLeft: () => <HeaderLeftBackButton />,
//         }}
//       />

//       {loading ? (
//         <View style={styles.loadingWrap}>
//           <LoadingIndicator size="large" />
//         </View>
//       ) : (
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Events */}
//           {events.map((item) => (
//             <CalendarEventCard
//               key={item.id}
//               item={item}
//               badgeColor={legendColorMap[item.legend_type] ?? "#999"}
//               diff={dayDiff}
//               lang={lang}
//               t={t}
//             />
//           ))}

//           {events.length === 0 && (
//             <View style={styles.emptyWrap}>
//               <ThemedText style={styles.emptyText}>{t("noData")}</ThemedText>
//             </View>
//           )}

//           {/* Recommended Acts Section */}
//           {recommendedActs.length > 0 && (
//             <View
//               style={[
//                 styles.actsSection,
//                 {
//                   backgroundColor:
//                     colorScheme === "dark"
//                       ? Colors.dark.contrast
//                       : Colors.light.contrast,
//                   borderColor:
//                     colorScheme === "dark"
//                       ? "rgba(255,255,255,0.06)"
//                       : "rgba(0,0,0,0.06)",
//                 },
//               ]}
//             >
//               {/* Section header */}
//               <View style={styles.actsSectionHeader}>
//                 <View style={styles.actsSectionTitleRow}>
//                   <Ionicons
//                     name="star"
//                     size={15}
//                     color={Colors.universal.primary}
//                   />
//                   <ThemedText style={styles.actsSectionTitle}>
//                     {t("recommendedActs")}
//                   </ThemedText>
//                 </View>
//                 <TouchableOpacity
//                   style={[
//                     styles.addToPlanButton,
//                     { backgroundColor: Colors.universal.primary },
//                   ]}
//                   onPress={() => setAddActsModalVisible(true)}
//                   activeOpacity={0.8}
//                 >
//                   <Ionicons name="add" size={16} color="#fff" />
//                   <ThemedText style={styles.addToPlanText}>
//                     {t("addToPlan")}
//                   </ThemedText>
//                 </TouchableOpacity>
//               </View>

//               {/* Acts list */}
//               {recommendedActs.map((act, index) => (
//                 <View
//                   key={act}
//                   style={[
//                     styles.actItem,
//                     index < recommendedActs.length - 1 && {
//                       borderBottomWidth: StyleSheet.hairlineWidth,
//                       borderBottomColor:
//                         colorScheme === "dark"
//                           ? "rgba(255,255,255,0.07)"
//                           : "rgba(0,0,0,0.07)",
//                     },
//                   ]}
//                 >
//                   <View
//                     style={[
//                       styles.actBullet,
//                       { backgroundColor: Colors.universal.primary },
//                     ]}
//                   />
//                   <ThemedText style={styles.actText}>{act}</ThemedText>
//                 </View>
//               ))}
//             </View>
//           )}
//         </ScrollView>
//       )}

//       <AddRecommendedActsModal
//         visible={addActsModalVisible}
//         onClose={() => setAddActsModalVisible(false)}
//         acts={recommendedActs}
//       />
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingWrap: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 40,
//   },
//   islamicHeader: {
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   islamicHeaderText: {
//     fontSize: 15,
//     fontStyle: "italic",
//     opacity: 0.6,
//     fontWeight: "500",
//   },
//   eventCount: {
//     fontSize: 12,
//     fontWeight: "600",
//     opacity: 0.5,
//     textTransform: "uppercase",
//     letterSpacing: 0.8,
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   emptyWrap: {
//     paddingTop: 60,
//     alignItems: "center",
//   },
//   emptyText: {
//     fontSize: 15,
//     fontStyle: "italic",
//     opacity: 0.5,
//   },
//   actsSection: {
//     marginTop: 8,
//     borderRadius: 16,
//     borderWidth: 1,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 10,
//     elevation: 3,
//   },
//   actsSectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     flexWrap: "wrap",
//     gap: 8,
//   },
//   actsSectionTitleRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   actsSectionTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     textTransform: "uppercase",
//     letterSpacing: 0.6,
//     opacity: 0.75,
//   },
//   addToPlanButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 20,
//   },
//   addToPlanText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   actItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     gap: 10,
//   },
//   actBullet: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginTop: 8,
//     flexShrink: 0,
//   },
//   actText: {
//     fontSize: 14,
//     lineHeight: 22,
//     flex: 1,
//   },
// });

import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import CalendarEventCard from "@/components/CalendarEventCard";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { AddRecommendedActsModal } from "@/components/AddRecommendedActsModal";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useLanguage } from "../../../../../contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import {
  getAllCalendarDates,
  getCalendarLegendColors,
} from "../../../../../db/queries/calendar";
import { CalendarType } from "@/constants/Types";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useCalendarSettingsStore } from "../../../../../stores/useCalendarSettingsStore";
import { useDataVersionStore } from "../../../../../stores/dataVersionStore";

export default function CalendarDayDetail() {
  const { date } = useLocalSearchParams<{
    date: string;
    islamicDate: string;
  }>();

  const { lang } = useLanguage();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";

  const arabicDateOffset = useCalendarSettingsStore(
    (s) => s.arabicDateOffset
  );
  const calendarVersion = useDataVersionStore((s) => s.calendarVersion);

  const [events, setEvents] = useState<CalendarType[]>([]);
  const [legendColorMap, setLegendColorMap] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [addActsModalVisible, setAddActsModalVisible] = useState(false);

  const formattedDate = useMemo(() => {
    if (!date) return "";
    const [y, m, d] = date.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);

    return dateObj.toLocaleDateString(lang, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [date, lang]);

  useEffect(() => {
    if (!date) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const [all, colorMap] = await Promise.all([
          getAllCalendarDates(lang, arabicDateOffset),
          getCalendarLegendColors(lang),
        ]);

        if (!cancelled) {
          setEvents(all.filter((event) => event.gregorian_date === date));
          setLegendColorMap(colorMap);
        }
      } catch {
        if (!cancelled) {
          setEvents([]);
          setLegendColorMap({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [date, lang, arabicDateOffset, calendarVersion]);

  const todayStart = useMemo(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
  }, []);

  const dayDiff = useMemo(() => {
    if (!date) return 0;
    const [y, m, d] = date.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return Math.round((dateObj.getTime() - todayStart.getTime()) / 86400000);
  }, [date, todayStart]);

  const displayedIslamicDate = useMemo(() => {
    return events[0]?.islamic_date ?? "";
  }, [events]);

  const recommendedActs = useMemo(() => {
    const seen = new Set<string>();
    const acts: string[] = [];

    for (const event of events) {
      for (const act of event.recommended_acts ?? []) {
        if (act && !seen.has(act)) {
          seen.add(act);
          acts.push(act);
        }
      }
    }

    return acts;
  }, [events]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: formattedDate,
          headerTitleStyle: { fontSize: 14 },
          headerLeft: () => <HeaderLeftBackButton />,
        }}
      />

      {loading ? (
        <View style={styles.loadingWrap}>
          <LoadingIndicator size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {displayedIslamicDate ? (
            <View style={styles.islamicHeader}>
              <ThemedText style={styles.islamicHeaderText}>
                {displayedIslamicDate}
              </ThemedText>
            </View>
          ) : null}

          {events.map((item) => (
            <CalendarEventCard
              key={item.id}
              item={item}
              badgeColor={legendColorMap[item.legend_type] ?? "#999"}
              diff={dayDiff}
              lang={lang}
              t={t}
            />
          ))}

          {events.length === 0 && (
            <View style={styles.emptyWrap}>
              <ThemedText style={styles.emptyText}>{t("noData")}</ThemedText>
            </View>
          )}

          {recommendedActs.length > 0 && (
            <View
              style={[
                styles.actsSection,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? Colors.dark.contrast
                      : Colors.light.contrast,
                  borderColor:
                    colorScheme === "dark"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)",
                },
              ]}
            >
              <View style={styles.actsSectionHeader}>
                <View style={styles.actsSectionTitleRow}>
                  <Ionicons
                    name="star"
                    size={15}
                    color={Colors.universal.primary}
                  />
                  <ThemedText style={styles.actsSectionTitle}>
                    {t("recommendedActs")}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  style={[
                    styles.addToPlanButton,
                    { backgroundColor: Colors.universal.primary },
                  ]}
                  onPress={() => setAddActsModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <ThemedText style={styles.addToPlanText}>
                    {t("addToPlan")}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {recommendedActs.map((act, index) => (
                <View
                  key={act}
                  style={[
                    styles.actItem,
                    index < recommendedActs.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor:
                        colorScheme === "dark"
                          ? "rgba(255,255,255,0.07)"
                          : "rgba(0,0,0,0.07)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.actBullet,
                      { backgroundColor: Colors.universal.primary },
                    ]}
                  />
                  <ThemedText style={styles.actText}>{act}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <AddRecommendedActsModal
        visible={addActsModalVisible}
        onClose={() => setAddActsModalVisible(false)}
        acts={recommendedActs}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  islamicHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  islamicHeaderText: {
    fontSize: 15,
    fontStyle: "italic",
    opacity: 0.6,
    fontWeight: "500",
  },
  emptyWrap: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontStyle: "italic",
    opacity: 0.5,
  },
  actsSection: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  actsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexWrap: "wrap",
    gap: 8,
  },
  actsSectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actsSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    opacity: 0.75,
  },
  addToPlanButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addToPlanText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  actItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  actBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    flexShrink: 0,
  },
  actText: {
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
});