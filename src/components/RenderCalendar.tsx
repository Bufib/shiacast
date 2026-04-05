// // components/RenderCalendar.tsx
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
//   useRef,
// } from "react";
// import {
//   StyleSheet,
//   useColorScheme,
//   View,
//   ScrollView,
//   TouchableOpacity,
//   useWindowDimensions,
// } from "react-native";
// import { ThemedText } from "@/components/ThemedText";
// import CalendarLegend from "./CalendarLegend";
// import { useLanguage } from "../../contexts/LanguageContext";
// import { CalendarSectionType, CalendarType } from "@/constants/Types";
// import { useTranslation } from "react-i18next";
// import {
//   getAllCalendarDates,
//   getCalendarLegendColorById,
//   getCalendarLegendColors,
// } from "../../db/queries/calendar";
// import { Colors } from "@/constants/Colors";
// import { LoadingIndicator } from "./LoadingIndicator";
// import { useDataVersionStore } from "../../stores/dataVersionStore";
// import { Entypo } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { ThemedView } from "./ThemedView";
// import { useCalendarSettingsStore } from "../../stores/useCalendarSettingsStore";
// import RenderCalendarSkeleton from "./RenderCalendarSkeleton";

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// function chunkArray<T>(arr: T[], size: number): T[][] {
//   const chunks: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) {
//     chunks.push(arr.slice(i, i + size));
//   }
//   return chunks;
// }

// // ─── Day Card ─────────────────────────────────────────────────────────────────

// type DayCardProps = {
//   item: CalendarType;
//   badgeColor: string;
//   diff: number;
//   lang: string;
//   cardWidth: number;
//   colorScheme: "light" | "dark";
//   onPress: () => void;
// };

// const DayCard = React.memo(function DayCard({
//   item,
//   badgeColor,
//   diff,
//   lang,
//   cardWidth,
//   colorScheme,
//   onPress,
// }: DayCardProps) {
//   const isToday = diff === 0;
//   const isOld = diff < 0;

//   const { dayNum, monthShort, yearShort } = useMemo(() => {
//     const [y, m, d] = item.gregorian_date.split("-").map(Number);
//     const date = new Date(y, m - 1, d);
//     return {
//       dayNum: d,
//       monthShort: date
//         .toLocaleDateString(lang, { month: "short" })
//         .toUpperCase(),
//       yearShort: String(y).slice(2),
//     };
//   }, [item.gregorian_date, lang]);

//   const cardBg = useMemo(() => {
//     if (isToday)
//       return colorScheme === "dark"
//         ? "rgba(251,146,60,0.35)"
//         : "rgba(251,146,60,0.18)";
//     if (isOld) return colorScheme === "dark" ? "#3a4050" : "#F1F5F9";
//     return Colors[colorScheme].contrast;
//   }, [isToday, isOld, colorScheme]);

//   const stripColor = isOld
//     ? colorScheme === "dark"
//       ? "#505456"
//       : "#CBD5E1"
//     : badgeColor;

//   return (
//     <TouchableOpacity
//       style={[styles.card, { width: cardWidth, backgroundColor: cardBg }]}
//       onPress={onPress}
//       activeOpacity={0.75}
//     >
//       {/* Colored top strip */}
//       <View style={[styles.cardColorStrip, { backgroundColor: stripColor }]} />

//       <View style={styles.cardBody}>
//         {/* Date row */}
//         <View style={styles.cardDateRow}>
//           <ThemedText
//             style={[
//               styles.cardDay,
//               isOld && styles.cardTextOld,
//               isToday && { color: "#FB923C" },
//             ]}
//           >
//             {dayNum}
//           </ThemedText>
//           <View>
//             <ThemedText style={[styles.cardMonth, isOld && styles.cardTextOld]}>
//               {monthShort}
//             </ThemedText>
//             <ThemedText style={[styles.cardYear, isOld && styles.cardTextOld]}>
//               &apos;{yearShort}
//             </ThemedText>
//           </View>
//         </View>

//         {/* Islamic date */}
//         <ThemedText
//           style={[styles.cardIslamic, isOld && styles.cardTextOld]}
//           numberOfLines={1}
//         >
//           {item.islamic_date}
//         </ThemedText>

//         {/* Title */}
//         <ThemedText
//           style={[styles.cardTitle, isOld && styles.cardTextOld]}
//           numberOfLines={2}
//         >
//           {item.title}
//         </ThemedText>

//         {/* Status dot */}
//         {isToday && (
//           <View style={[styles.statusDot, { backgroundColor: "#FB923C" }]} />
//         )}
//       </View>
//     </TouchableOpacity>
//   );
// });

// // ─── Main Component ───────────────────────────────────────────────────────────

// const RenderCalendar: React.FC = () => {
//   const colorScheme = (useColorScheme() || "light") as "light" | "dark";
//   const { lang } = useLanguage();
//   const { t } = useTranslation();
//   const { width } = useWindowDimensions();

//   const scrollViewRef = useRef<ScrollView>(null);
//   const sectionYRefs = useRef<Record<string, number>>({});
//   const hasScrolledRef = useRef(false);

//   const [events, setEvents] = useState<CalendarType[]>([]);
//   const [legendColorMap, setLegendColorMap] = useState<Record<string, string>>(
//     {},
//   );
//   const [loading, setLoading] = useState(true);
//   const [sections, setSections] = useState<CalendarSectionType[]>([]);
//   const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
//     new Set(),
//   );

//   const calendarVersion = useDataVersionStore((s) => s.calendarVersion);
//   const arabicDateOffset = useCalendarSettingsStore((s) => s.arabicDateOffset);
//   // Card sizing — 3 per row with 16px side padding and 8px gaps
//   const PADDING = 16;
//   const GAP = 8;
//   const cardWidth = Math.floor((width - PADDING * 2 - GAP * 2) / 3);

//   // ── Data loading ───────────────────────────────────────────────────────────

//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         setLoading(true);

//         const [ev, colorMap] = await Promise.all([
//           getAllCalendarDates(lang, arabicDateOffset),
//           getCalendarLegendColors(lang),
//         ]);

//         if (!cancelled) {
//           setEvents(ev ?? []);
//           setLegendColorMap(colorMap);
//         }
//       } catch {
//         if (!cancelled) {
//           setEvents([]);
//           setLegendColorMap({});
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [calendarVersion, lang, arabicDateOffset]);
//   // ── Date helpers ───────────────────────────────────────────────────────────

//   const todayStart = useMemo(() => {
//     const d = new Date();
//     d.setHours(0, 0, 0, 0);
//     return d;
//   }, []);

//   const dayDiffFromToday = useCallback(
//     (dateStr: string) => {
//       const [y, m, d] = dateStr.split("-").map(Number);
//       const date = new Date(y, m - 1, d);
//       return Math.round((date.getTime() - todayStart.getTime()) / 86400000);
//     },
//     [todayStart],
//   );

//   // ── Group by month ─────────────────────────────────────────────────────────

//   useEffect(() => {
//     const now = new Date();
//     const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();
//     const map = new Map<string, { data: CalendarType[]; monthIndex: number }>();

//     for (const item of events) {
//       const [y, m] = item.gregorian_date.split("-").map(Number);
//       const monthIndex = y * 12 + (m - 1);
//       const key = new Date(y, m - 1, 1).toLocaleDateString(lang, {
//         month: "long",
//         year: "numeric",
//       });
//       const existing = map.get(key);
//       if (existing) {
//         existing.data.push(item);
//       } else {
//         map.set(key, { data: [item], monthIndex });
//       }
//     }

//     const initialCollapsed = new Set<string>();
//     const grouped: CalendarSectionType[] = Array.from(map.entries()).map(
//       ([title, { data, monthIndex }]) => {
//         if (monthIndex !== currentMonthIndex) initialCollapsed.add(title);
//         return {
//           title,
//           data: data.sort((a, b) =>
//             a.gregorian_date < b.gregorian_date ? -1 : 1,
//           ),
//         };
//       },
//     );

//     setSections(grouped);
//     setCollapsedSections((prev) => {
//       if (prev.size === 0) return initialCollapsed;
//       const merged = new Set(prev);
//       initialCollapsed.forEach((t) => merged.add(t));
//       return merged;
//     });
//   }, [events, lang]);

//   // ── Auto-scroll to current month ───────────────────────────────────────────

//   useEffect(() => {
//     if (loading || !sections.length || hasScrolledRef.current) return;

//     const now = new Date();
//     const currentKey = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       1,
//     ).toLocaleDateString(lang, { month: "long", year: "numeric" });

//     const timer = setTimeout(() => {
//       const y = sectionYRefs.current[currentKey];
//       if (y !== undefined) {
//         scrollViewRef.current?.scrollTo({
//           y: Math.max(0, y - 12),
//           animated: true,
//         });
//         hasScrolledRef.current = true;
//       }
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [loading, sections, lang]);

//   useEffect(() => {
//     hasScrolledRef.current = false;
//   }, [calendarVersion, lang]);

//   // ── Toggle collapse ────────────────────────────────────────────────────────

//   const toggleSection = useCallback((title: string) => {
//     setCollapsedSections((prev) => {
//       const next = new Set(prev);
//       if (next.has(title)) next.delete(title);
//       else next.add(title);
//       return next;
//     });
//   }, []);

//   // ── Navigation ─────────────────────────────────────────────────────────────

//   const openDayDetail = useCallback((item: CalendarType) => {
//     router.push({
//       pathname: "/(tabs)/knowledge/calendar/calendarDayDetail" as any,
//       params: {
//         date: item.gregorian_date,
//       },
//     });
//   }, []);

//   // ── Loading ────────────────────────────────────────────────────────────────

//   if (loading) {
//     return <RenderCalendarSkeleton />;
//   }

//   // ── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <ScrollView
//       ref={scrollViewRef}
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={styles.scrollContent}
//     >
//       {/* Legend */}
//       <View style={styles.legendWrap}>
//         <CalendarLegend />
//       </View>

//       {sections.length === 0 && !loading ? (
//         <View style={styles.emptyWrap}>
//           <ThemedText style={styles.emptyText}>{t("noData")}</ThemedText>
//         </View>
//       ) : (
//         sections.map((section) => {
//           const isCollapsed = collapsedSections.has(section.title);
//           const rows = chunkArray(section.data, 3);

//           return (
//             <View
//               key={section.title}
//               onLayout={(e) => {
//                 sectionYRefs.current[section.title] = e.nativeEvent.layout.y;
//               }}
//             >
//               {/* Month header */}
//               <TouchableOpacity
//                 onPress={() => toggleSection(section.title)}
//                 activeOpacity={0.7}
//                 style={styles.sectionHeaderRow}
//               >
//                 <View
//                   style={[
//                     styles.sectionDivider,
//                     { backgroundColor: Colors[colorScheme].devider },
//                   ]}
//                 />
//                 <ThemedText style={styles.sectionTitle}>
//                   {section.title}
//                 </ThemedText>
//                 <View
//                   style={[
//                     styles.sectionDivider,
//                     { backgroundColor: Colors[colorScheme].devider },
//                   ]}
//                 />
//                 <Entypo
//                   name={isCollapsed ? "chevron-right" : "chevron-down"}
//                   size={18}
//                   color={Colors[colorScheme].text}
//                   style={{ opacity: 0.6 }}
//                 />
//               </TouchableOpacity>

//               {/* 3-column grid */}
//               {!isCollapsed && (
//                 <View style={styles.grid}>
//                   {rows.map((row, rowIdx) => (
//                     <View key={rowIdx} style={styles.gridRow}>
//                       {row.map((item) => {
//                         const diff = dayDiffFromToday(item.gregorian_date);
//                         return (
//                           <DayCard
//                             key={item.id}
//                             item={item}
//                             badgeColor={
//                               legendColorMap[item.legend_type] ?? "#999"
//                             }
//                             diff={diff}
//                             lang={lang}
//                             cardWidth={cardWidth}
//                             colorScheme={colorScheme}
//                             onPress={() => openDayDetail(item)}
//                           />
//                         );
//                       })}
//                       {/* Spacer for incomplete rows */}
//                       {row.length < 3 &&
//                         Array.from({ length: 3 - row.length }).map((_, i) => (
//                           <View
//                             key={`spacer-${i}`}
//                             style={{ width: cardWidth }}
//                           />
//                         ))}
//                     </View>
//                   ))}
//                 </View>
//               )}
//             </View>
//           );
//         })
//       )}
//     </ScrollView>
//   );
// };

// export default RenderCalendar;

// const styles = StyleSheet.create({
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 10,
//   },
//   legendWrap: {
//     paddingTop: 16,
//     paddingBottom: 20,
//   },
//   // ── Section header ────────────────────────────────────────────────────────
//   sectionHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//     marginBottom: 12,
//     gap: 8,
//   },
//   sectionDivider: {
//     flex: 1,
//     height: 1,
//     opacity: 0.25,
//   },
//   sectionTitle: {
//     fontSize: 11,
//     fontWeight: "700",
//     letterSpacing: 1.3,
//     textTransform: "uppercase",
//     opacity: 0.6,
//   },
//   // ── Grid ──────────────────────────────────────────────────────────────────
//   grid: {
//     gap: 8,
//     marginBottom: 20,
//   },
//   gridRow: {
//     flexDirection: "row",
//     gap: 8,
//   },
//   // ── Day Card ──────────────────────────────────────────────────────────────
//   card: {
//     borderRadius: 12,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardColorStrip: {
//     height: 4,
//     width: "100%",
//   },
//   cardBody: {
//     padding: 8,
//     gap: 2,
//   },
//   cardDateRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   cardDay: {
//     fontSize: 24,
//     fontWeight: "800",
//     lineHeight: 28,
//     letterSpacing: -0.5,
//   },
//   cardMonth: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 0.4,
//     opacity: 0.7,
//     lineHeight: 13,
//   },
//   cardYear: {
//     fontSize: 9,
//     fontWeight: "400",
//     opacity: 0.45,
//     lineHeight: 12,
//   },
//   cardIslamic: {
//     fontSize: 9,
//     fontStyle: "italic",
//     opacity: 0.5,
//     lineHeight: 12,
//     marginTop: 1,
//   },
//   cardTitle: {
//     fontSize: 10,
//     fontWeight: "600",
//     lineHeight: 14,
//     marginTop: 4,
//   },
//   cardTextOld: {
//     opacity: 0.4,
//   },
//   statusDot: {
//     marginTop: 6,
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     alignSelf: "flex-start",
//   },
//   // ── States ────────────────────────────────────────────────────────────────
//   loadingWrap: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: {
//     marginTop: 16,
//     opacity: 0.6,
//     fontSize: 14,
//   },
//   emptyWrap: {
//     paddingTop: 80,
//     alignItems: "center",
//   },
//   emptyText: {
//     fontSize: 15,
//     fontStyle: "italic",
//     opacity: 0.5,
//   },
// });

// components/RenderCalendar.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  StyleSheet,
  useColorScheme,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import CalendarLegend from "./CalendarLegend";
import { useLanguage } from "../../contexts/LanguageContext";
import { CalendarSectionType, CalendarType } from "@/constants/Types";
import { useTranslation } from "react-i18next";
import {
  getAllCalendarDates,
  getCalendarLegendColorById,
  getCalendarLegendColors,
} from "../../db/queries/calendar";
import { Colors } from "@/constants/Colors";
import { LoadingIndicator } from "./LoadingIndicator";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { ThemedView } from "./ThemedView";
import { useCalendarSettingsStore } from "../../stores/useCalendarSettingsStore";
import RenderCalendarSkeleton from "./RenderCalendarSkeleton";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─── Day Card ─────────────────────────────────────────────────────────────────

type DayCardProps = {
  item: CalendarType;
  badgeColor: string;
  diff: number;
  lang: string;
  cardWidth: number;
  colorScheme: "light" | "dark";
  onPress: () => void;
};

const DayCard = React.memo(function DayCard({
  item,
  badgeColor,
  diff,
  lang,
  cardWidth,
  colorScheme,
  onPress,
}: DayCardProps) {
  const isToday = diff === 0;
  const isOld = diff < 0;

  const { dayNum, monthShort, yearShort } = useMemo(() => {
    const [y, m, d] = item.gregorian_date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return {
      dayNum: d,
      monthShort: date
        .toLocaleDateString(lang, { month: "short" })
        .toUpperCase(),
      yearShort: String(y).slice(2),
    };
  }, [item.gregorian_date, lang]);

  const cardBg = useMemo(() => {
    if (isToday)
      return colorScheme === "dark"
        ? "rgba(251,146,60,0.35)"
        : "rgba(251,146,60,0.18)";
    if (isOld) return colorScheme === "dark" ? "#3a4050" : "#F1F5F9";
    return Colors[colorScheme].contrast;
  }, [isToday, isOld, colorScheme]);

  const stripColor = isOld
    ? colorScheme === "dark"
      ? "#505456"
      : "#CBD5E1"
    : badgeColor;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth, backgroundColor: cardBg }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Colored top strip */}
      <View style={[styles.cardColorStrip, { backgroundColor: stripColor }]} />

      <View style={styles.cardBody}>
        {/* Date row */}
        <View style={styles.cardDateRow}>
          <ThemedText
            style={[
              styles.cardDay,
              isOld && styles.cardTextOld,
              isToday && { color: "#FB923C" },
            ]}
          >
            {dayNum}
          </ThemedText>
          <View>
            <ThemedText style={[styles.cardMonth, isOld && styles.cardTextOld]}>
              {monthShort}
            </ThemedText>
            <ThemedText style={[styles.cardYear, isOld && styles.cardTextOld]}>
              &apos;{yearShort}
            </ThemedText>
          </View>
        </View>

        {/* Islamic date */}
        <ThemedText
          style={[styles.cardIslamic, isOld && styles.cardTextOld]}
          numberOfLines={1}
        >
          {item.islamic_date}
        </ThemedText>

        {/* Title */}
        <ThemedText
          style={[styles.cardTitle, isOld && styles.cardTextOld]}
          numberOfLines={2}
        >
          {item.title}
        </ThemedText>

        {/* Status dot */}
        {isToday && (
          <View style={[styles.statusDot, { backgroundColor: "#FB923C" }]} />
        )}
      </View>
    </TouchableOpacity>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

const RenderCalendar: React.FC = () => {
  const colorScheme = (useColorScheme() || "light") as "light" | "dark";
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionYRefs = useRef<Record<string, number>>({});
  const hasScrolledRef = useRef(false);

  const [events, setEvents] = useState<CalendarType[]>([]);
  const [legendColorMap, setLegendColorMap] = useState<Record<string, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const calendarVersion = useDataVersionStore((s) => s.calendarVersion);
  const arabicDateOffset = useCalendarSettingsStore((s) => s.arabicDateOffset);

  // Card sizing — 3 per row with 16px side padding and 8px gaps
  const PADDING = 16;
  const GAP = 8;
  const cardWidth = Math.floor((width - PADDING * 2 - GAP * 2) / 3);

  // ── Data loading ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const [ev, colorMap] = await Promise.all([
          getAllCalendarDates(lang, arabicDateOffset),
          getCalendarLegendColors(lang),
        ]);

        if (!cancelled) {
          setEvents(ev ?? []);
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
  }, [calendarVersion, lang, arabicDateOffset]);

  // ── Date helpers ───────────────────────────────────────────────────────────

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dayDiffFromToday = useCallback(
    (dateStr: string) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return Math.round((date.getTime() - todayStart.getTime()) / 86400000);
    },
    [todayStart],
  );

  // ── Group by month (synchronous via useMemo) ───────────────────────────────

  const { sections, initialCollapsed } = useMemo(() => {
    if (events.length === 0) {
      return {
        sections: [] as CalendarSectionType[],
        initialCollapsed: new Set<string>(),
      };
    }

    const now = new Date();
    const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();
    const map = new Map<string, { data: CalendarType[]; monthIndex: number }>();

    for (const item of events) {
      const [y, m] = item.gregorian_date.split("-").map(Number);
      const monthIndex = y * 12 + (m - 1);
      const key = new Date(y, m - 1, 1).toLocaleDateString(lang, {
        month: "long",
        year: "numeric",
      });
      const existing = map.get(key);
      if (existing) {
        existing.data.push(item);
      } else {
        map.set(key, { data: [item], monthIndex });
      }
    }

    const collapsed = new Set<string>();
    const grouped: CalendarSectionType[] = Array.from(map.entries()).map(
      ([title, { data, monthIndex }]) => {
        if (monthIndex !== currentMonthIndex) collapsed.add(title);
        return {
          title,
          data: data.sort((a, b) =>
            a.gregorian_date < b.gregorian_date ? -1 : 1,
          ),
        };
      },
    );

    return { sections: grouped, initialCollapsed: collapsed };
  }, [events, lang]);

  // ── Sync initial collapsed state when data changes ─────────────────────────

  useEffect(() => {
    setCollapsedSections((prev) => {
      if (prev.size === 0) return initialCollapsed;
      const merged = new Set(prev);
      initialCollapsed.forEach((t) => merged.add(t));
      return merged;
    });
  }, [initialCollapsed]);

  // ── Auto-scroll to current month ───────────────────────────────────────────

  useEffect(() => {
    if (loading || !sections.length || hasScrolledRef.current) return;

    const now = new Date();
    const currentKey = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toLocaleDateString(lang, { month: "long", year: "numeric" });

    const timer = setTimeout(() => {
      const y = sectionYRefs.current[currentKey];
      if (y !== undefined) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, y - 12),
          animated: true,
        });
        hasScrolledRef.current = true;
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [loading, sections, lang]);

  useEffect(() => {
    hasScrolledRef.current = false;
  }, [calendarVersion, lang]);

  // ── Toggle collapse ────────────────────────────────────────────────────────

  const toggleSection = useCallback((title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const openDayDetail = useCallback((item: CalendarType) => {
    router.push({
      pathname: "/(tabs)/knowledge/calendar/calendarDayDetail" as any,
      params: {
        date: item.gregorian_date,
      },
    });
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return <RenderCalendarSkeleton />;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Legend */}
      <View style={styles.legendWrap}>
        <CalendarLegend />
      </View>

      {sections.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ThemedText style={styles.emptyText}>{t("noData")}</ThemedText>
        </View>
      ) : (
        sections.map((section) => {
          const isCollapsed = collapsedSections.has(section.title);
          const rows = chunkArray(section.data, 3);

          return (
            <View
              key={section.title}
              onLayout={(e) => {
                sectionYRefs.current[section.title] = e.nativeEvent.layout.y;
              }}
            >
              {/* Month header */}
              <TouchableOpacity
                onPress={() => toggleSection(section.title)}
                activeOpacity={0.7}
                style={styles.sectionHeaderRow}
              >
                <View
                  style={[
                    styles.sectionDivider,
                    { backgroundColor: Colors[colorScheme].devider },
                  ]}
                />
                <ThemedText style={styles.sectionTitle}>
                  {section.title}
                </ThemedText>
                <View
                  style={[
                    styles.sectionDivider,
                    { backgroundColor: Colors[colorScheme].devider },
                  ]}
                />
                <Entypo
                  name={isCollapsed ? "chevron-right" : "chevron-down"}
                  size={18}
                  color={Colors[colorScheme].text}
                  style={{ opacity: 0.6 }}
                />
              </TouchableOpacity>

              {/* 3-column grid */}
              {!isCollapsed && (
                <View style={styles.grid}>
                  {rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.gridRow}>
                      {row.map((item) => {
                        const diff = dayDiffFromToday(item.gregorian_date);
                        return (
                          <DayCard
                            key={item.id}
                            item={item}
                            badgeColor={
                              legendColorMap[item.legend_type] ?? "#999"
                            }
                            diff={diff}
                            lang={lang}
                            cardWidth={cardWidth}
                            colorScheme={colorScheme}
                            onPress={() => openDayDetail(item)}
                          />
                        );
                      })}
                      {/* Spacer for incomplete rows */}
                      {row.length < 3 &&
                        Array.from({ length: 3 - row.length }).map((_, i) => (
                          <View
                            key={`spacer-${i}`}
                            style={{ width: cardWidth }}
                          />
                        ))}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

export default RenderCalendar;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  legendWrap: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  // ── Section header ────────────────────────────────────────────────────────
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    opacity: 0.25,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    opacity: 0.6,
  },
  // ── Grid ──────────────────────────────────────────────────────────────────
  grid: {
    gap: 8,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
  },
  // ── Day Card ──────────────────────────────────────────────────────────────
  card: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardColorStrip: {
    height: 4,
    width: "100%",
  },
  cardBody: {
    padding: 8,
    gap: 2,
  },
  cardDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDay: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  cardMonth: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    opacity: 0.7,
    lineHeight: 13,
  },
  cardYear: {
    fontSize: 9,
    fontWeight: "400",
    opacity: 0.45,
    lineHeight: 12,
  },
  cardIslamic: {
    fontSize: 9,
    fontStyle: "italic",
    opacity: 0.5,
    lineHeight: 12,
    marginTop: 1,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 14,
    marginTop: 4,
  },
  cardTextOld: {
    opacity: 0.4,
  },
  statusDot: {
    marginTop: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    alignSelf: "flex-start",
  },
  // ── States ────────────────────────────────────────────────────────────────
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.6,
    fontSize: 14,
  },
  emptyWrap: {
    paddingTop: 80,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontStyle: "italic",
    opacity: 0.5,
  },
});
