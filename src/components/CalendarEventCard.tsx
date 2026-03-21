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

    const isToday = diff === 0;
    const isOld = diff < 0;

    const statusLabel = isToday ? t("legendToday") : "";

    // Memoize parsed date values
    const { dayNumber, monthText, yearText } = useMemo(() => {
      const d = new Date(item.gregorian_date);
      return {
        dayNumber: d.getDate(),
        monthText: d.toLocaleDateString(lang, { month: "short" }).toUpperCase(),
        yearText: d.getFullYear(),
      };
    }, [item.gregorian_date, lang]);

    // Memoize highlight styles
    const highlightStyles = useMemo(() => {
      if (isToday) {
        return {
          backgroundColor:
            colorScheme === "dark"
              ? "rgba(251, 146, 60, 0.6)"
              : "rgba(251, 146, 60, 0.2)",
          borderLeftWidth: 4,
          borderLeftColor: badgeColor,
        };
      }
      if (isOld) {
        return {
          backgroundColor: colorScheme === "dark" ? "#6f767aff" : "#F1F5F9",
          borderWidth: 1,
          borderColor: colorScheme === "dark" ? "#6f767aff" : "#bcc3cbff",
          borderLeftWidth: 4,
          borderLeftColor: colorScheme === "dark" ? "#505456ff" : "#9CA3AF",
        };
      }
      return {
        borderLeftWidth: 4,
        borderLeftColor: badgeColor,
      };
    }, [isToday, isOld, badgeColor, colorScheme]);

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: Colors[colorScheme].contrast },
          highlightStyles,
        ]}
      >
        {/* Accent dot indicator */}
        <View style={[styles.accentDot, { backgroundColor: badgeColor }]} />

        {/* Header: dates side by side */}
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            {/* Gregorian date */}
            <View style={styles.gregorianContainer}>
              <ThemedText style={styles.dayNumber}>{dayNumber}</ThemedText>
              <View style={styles.monthYearContainer}>
                <ThemedText style={styles.monthText}>{monthText}</ThemedText>
                <ThemedText style={styles.yearText}>{yearText}</ThemedText>
              </View>
            </View>

            {/* Islamic date */}
            <View style={styles.islamicContainer}>
              <ThemedText style={styles.islamicDate}>
                {item.islamic_date}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Title */}
        <ThemedText style={styles.title}>{item.title}</ThemedText>

        {/* Description */}
        {!!item.description && (
          <ThemedText style={styles.desc}>{item.description}</ThemedText>
        )}

        {/* Status badge */}
        {!!statusLabel && (
          <View style={styles.statusBadgeContainer}>
            <View
              style={[styles.statusBadge, { backgroundColor: "#FB923C" }]}
            >
              <ThemedText style={styles.statusBadgeText}>
                {statusLabel}
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    );
  },
  // Custom comparison - only re-render if these props change
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.gregorian_date === nextProps.item.gregorian_date &&
      prevProps.item.title === nextProps.item.title &&
      prevProps.item.description === nextProps.item.description &&
      prevProps.badgeColor === nextProps.badgeColor &&
      prevProps.diff === nextProps.diff &&
      prevProps.lang === nextProps.lang
    );
  }
);

export default CalendarEventCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
    position: "relative",
  },
  accentDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 16,
    height: 16,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 99,
  },
  cardHeader: {
    marginBottom: 16,
    marginTop: 10,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  gregorianContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dayNumber: {
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  monthYearContainer: {
    flexDirection: "column",
  },
  monthText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    opacity: 0.7,
  },
  yearText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.5,
  },
  islamicContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  islamicDate: {
    fontSize: 14,
    fontWeight: "600",
    fontStyle: "italic",
    opacity: 0.6,
  },
  statusBadgeContainer: {
    marginTop: 16,
    alignItems: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#ffffff",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.7,
    letterSpacing: 0.1,
  },
});