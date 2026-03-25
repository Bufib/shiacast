// // components/CalendarEventCard.tsx
// import React, { memo, useMemo } from "react";
// import { View, StyleSheet, useColorScheme } from "react-native";
// import { ThemedText } from "@/components/ThemedText";
// import { CalendarType } from "@/constants/Types";
// import { Colors } from "@/constants/Colors";

// type Props = {
//   item: CalendarType;
//   badgeColor: string;
//   diff: number;
//   lang: string;
//   t: (key: string) => string;
// };

// const CalendarEventCard = memo(
//   function CalendarEventCard({ item, badgeColor, diff, lang, t }: Props) {
//     const colorScheme = useColorScheme() || "light";

//     const isToday = diff === 0;
//     const isOld = diff < 0;

//     const statusLabel = isToday ? t("legendToday") : "";

//     // Memoize parsed date values
//     const { dayNumber, monthText, yearText } = useMemo(() => {
//       const d = new Date(item.gregorian_date);
//       return {
//         dayNumber: d.getDate(),
//         monthText: d.toLocaleDateString(lang, { month: "short" }).toUpperCase(),
//         yearText: d.getFullYear(),
//       };
//     }, [item.gregorian_date, lang]);

//     // Memoize highlight styles
//     const highlightStyles = useMemo(() => {
//       if (isToday) {
//         return {
//           backgroundColor:
//             colorScheme === "dark"
//               ? "rgba(251, 146, 60, 0.6)"
//               : "rgba(251, 146, 60, 0.2)",
//           borderLeftWidth: 4,
//           borderLeftColor: badgeColor,
//         };
//       }
//       if (isOld) {
//         return {
//           backgroundColor: colorScheme === "dark" ? "#6f767aff" : "#F1F5F9",
//           borderWidth: 1,
//           borderColor: colorScheme === "dark" ? "#6f767aff" : "#bcc3cbff",
//           borderLeftWidth: 4,
//           borderLeftColor: colorScheme === "dark" ? "#505456ff" : "#9CA3AF",
//         };
//       }
//       return {
//         borderLeftWidth: 4,
//         borderLeftColor: badgeColor,
//       };
//     }, [isToday, isOld, badgeColor, colorScheme]);

//     return (
//       <View
//         style={[
//           styles.card,
//           { backgroundColor: Colors[colorScheme].contrast },
//           highlightStyles,
//         ]}
//       >
//         {/* Accent dot indicator */}
//         <View style={[styles.accentDot, { backgroundColor: badgeColor }]} />

//         {/* Header: dates side by side */}
//         <View style={styles.cardHeader}>
//           <View style={styles.dateContainer}>
//             {/* Gregorian date */}
//             <View style={styles.gregorianContainer}>
//               <ThemedText style={styles.dayNumber}>{dayNumber}</ThemedText>
//               <View style={styles.monthYearContainer}>
//                 <ThemedText style={styles.monthText}>{monthText}</ThemedText>
//                 <ThemedText style={styles.yearText}>{yearText}</ThemedText>
//               </View>
//             </View>

//             {/* Islamic date */}
//             <View style={styles.islamicContainer}>
//               <ThemedText style={styles.islamicDate}>
//                 {item.islamic_date}
//               </ThemedText>
//             </View>
//           </View>
//         </View>

//         {/* Title */}
//         <ThemedText style={styles.title}>{item.title}</ThemedText>

//         {/* Description */}
//         {!!item.description && (
//           <ThemedText style={styles.desc}>{item.description}</ThemedText>
//         )}

//         {/* Status badge */}
//         {!!statusLabel && (
//           <View style={styles.statusBadgeContainer}>
//             <View
//               style={[styles.statusBadge, { backgroundColor: "#FB923C" }]}
//             >
//               <ThemedText style={styles.statusBadgeText}>
//                 {statusLabel}
//               </ThemedText>
//             </View>
//           </View>
//         )}
//       </View>
//     );
//   },
//   // Custom comparison - only re-render if these props change
//   (prevProps, nextProps) => {
//     return (
//       prevProps.item.id === nextProps.item.id &&
//       prevProps.item.gregorian_date === nextProps.item.gregorian_date &&
//       prevProps.item.title === nextProps.item.title &&
//       prevProps.item.description === nextProps.item.description &&
//       prevProps.badgeColor === nextProps.badgeColor &&
//       prevProps.diff === nextProps.diff &&
//       prevProps.lang === nextProps.lang
//     );
//   }
// );

// export default CalendarEventCard;

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 4,
//     overflow: "hidden",
//     position: "relative",
//   },
//   accentDot: {
//     position: "absolute",
//     top: 16,
//     right: 16,
//     width: 16,
//     height: 16,
//     borderRadius: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 4,
//     zIndex: 99,
//   },
//   cardHeader: {
//     marginBottom: 16,
//     marginTop: 10,
//   },
//   dateContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 16,
//   },
//   gregorianContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   dayNumber: {
//     fontSize: 36,
//     fontWeight: "800",
//     lineHeight: 40,
//     letterSpacing: -0.5,
//   },
//   monthYearContainer: {
//     flexDirection: "column",
//   },
//   monthText: {
//     fontSize: 12,
//     fontWeight: "700",
//     letterSpacing: 0.8,
//     opacity: 0.7,
//   },
//   yearText: {
//     fontSize: 12,
//     fontWeight: "500",
//     opacity: 0.5,
//   },
//   islamicContainer: {
//     flex: 1,
//     alignItems: "flex-end",
//   },
//   islamicDate: {
//     fontSize: 14,
//     fontWeight: "600",
//     fontStyle: "italic",
//     opacity: 0.6,
//   },
//   statusBadgeContainer: {
//     marginTop: 16,
//     alignItems: "flex-start",
//   },
//   statusBadge: {
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   statusBadgeText: {
//     fontSize: 11,
//     fontWeight: "800",
//     letterSpacing: 0.8,
//     textTransform: "uppercase",
//     color: "#ffffff",
//   },
//   title: {
//     fontSize: 17,
//     fontWeight: "700",
//     lineHeight: 24,
//     letterSpacing: -0.2,
//     marginBottom: 8,
//   },
//   desc: {
//     fontSize: 14,
//     lineHeight: 22,
//     opacity: 0.7,
//     letterSpacing: 0.1,
//   },
// });

// components/CalendarEventCard.tsx
import React, { memo, useMemo } from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { CalendarType } from "@/constants/Types";
import { Colors } from "@/constants/Colors";

type Props = {
  item: CalendarType;
  badgeColor: string;
  diff: number;
  lang: string;
  t: (key: string) => string;
};

const CalendarEventCard = memo(
  function CalendarEventCard({ item, badgeColor, diff, lang, t }: Props) {
    const colorScheme = useColorScheme() || "light";
    const isDark = colorScheme === "dark";

    const isToday = diff === 0;
    const isOld = diff < 0;

    const statusLabel = isToday ? t("legendToday") : "";

    const { dayNumber, monthShort, weekday, year } = useMemo(() => {
      const d = new Date(item.gregorian_date);
      return {
        dayNumber: d.getDate().toString(),
        monthShort: d
          .toLocaleDateString(lang, { month: "short" })
          .toUpperCase(),
        weekday: d.toLocaleDateString(lang, { weekday: "short" }),
        year: d.getFullYear(),
      };
    }, [item.gregorian_date, lang]);

    const accent = isOld
      ? isDark
        ? "rgba(255,255,255,0.12)"
        : "#D1D5DB"
      : badgeColor;

 
    const cardBg = useMemo(() => {
      if (isOld) return isDark ? "rgba(80,85,90,0.18)" : "#F5F6F8";
      return Colors[colorScheme].contrast;
    }, [isOld, isDark, colorScheme]);

    return (
      <View
        style={[
          styles.outer,
          {
            opacity: isOld ? 0.6 : 1,
            borderColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.05)",
          },
        ]}
      >
        {/* ── Side accent strip ── */}
        <View style={[styles.sideStrip, { backgroundColor: accent }]} />

        {/* ── Card body ── */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
      

          {/* ── Top: date line + today chip ── */}
          <View style={styles.header}>
            <View style={styles.dateLine}>
              <ThemedText style={styles.dateDay}>{dayNumber}</ThemedText>
              <View style={styles.dateSep} />
              <ThemedText style={styles.dateMonth}>{monthShort}</ThemedText>
              <ThemedText style={styles.dateExtra}>
                {weekday}, {year}
              </ThemedText>
            </View>

            {!!statusLabel && (
              <View style={styles.todayChip}>
                <View style={styles.todayDot} />
                <ThemedText style={styles.todayText}>
                  {statusLabel}
                </ThemedText>
              </View>
            )}
          </View>

          {/* ── Islamic date ── */}
          {item.islamic_date ? (
            <ThemedText style={styles.islamicDate}>
              {item.islamic_date}
            </ThemedText>
          ) : null}

          {/* ── Title ── */}
          <ThemedText style={styles.title} numberOfLines={3}>
            {item.title}
          </ThemedText>

          {/* ── Description ── */}
          {!!item.description && (
            <ThemedText style={styles.desc} numberOfLines={4}>
              {item.description}
            </ThemedText>
          )}

          {/* ── Footer: legend ── */}
          {item.legend_type ? (
            <View style={styles.footer}>
              <View
                style={[
                  styles.legendChip,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.035)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.legendSquare,
                    { backgroundColor: badgeColor },
                  ]}
                />
                <ThemedText style={styles.legendText}>
                  {item.legend_type}
                </ThemedText>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.gregorian_date === nextProps.item.gregorian_date &&
      prevProps.item.title === nextProps.item.title &&
      prevProps.item.description === nextProps.item.description &&
      prevProps.item.islamic_date === nextProps.item.islamic_date &&
      prevProps.badgeColor === nextProps.badgeColor &&
      prevProps.diff === nextProps.diff &&
      prevProps.lang === nextProps.lang
    );
  }
);

export default CalendarEventCard;

const styles = StyleSheet.create({
  /* ── Outer shell (holds side strip + card) ── */
  outer: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },

  /* ── Side accent ── */
  sideStrip: {
    width: 5,
  },

  /* ── Card body ── */
  card: {
    flex: 1,
    padding: 18,
    paddingLeft: 16,
    overflow: "hidden",
    position: "relative",
  },


  /* ── Header row ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    zIndex: 1,
  },
  dateLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  dateSep: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.35)",
  },
  dateMonth: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    opacity: 0.6,
  },
  dateExtra: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.35,
  },

  /* ── Today chip ── */
  todayChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(251,146,60,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FB923C",
  },
  todayText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#FB923C",
  },

  /* ── Islamic date ── */
  islamicDate: {
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
    opacity: 0.4,
    marginBottom: 10,
    zIndex: 1,
  },

  /* ── Title + desc ── */
  title: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
    letterSpacing: -0.15,
    marginBottom: 4,
    zIndex: 1,
  },
  desc: {
    fontSize: 13.5,
    lineHeight: 21,
    opacity: 0.5,
    letterSpacing: 0.1,
    zIndex: 1,
  },

  /* ── Footer ── */
  footer: {
    flexDirection: "row",
    marginTop: 14,
    zIndex: 1,
  },
  legendChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  legendSquare: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.45,
    letterSpacing: 0.3,
    textTransform: "capitalize",
  },
});