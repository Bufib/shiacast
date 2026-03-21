// calendar/calendarDayDetail.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, useColorScheme } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import CalendarEventCard from "@/components/CalendarEventCard";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useLanguage } from "../../../../../contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import {
  getAllCalendarDates,
  getCalendarLegendColorById,
} from "../../../../../db/queries/calendar";
import { CalendarType } from "@/constants/Types";

export default function CalendarDayDetail() {
  const { date, islamicDate } = useLocalSearchParams<{
    date: string;
    islamicDate: string;
  }>();
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";

  const [events, setEvents] = useState<CalendarType[]>([]);
  const [legendColorMap, setLegendColorMap] = useState<Record<number, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  // Format the date for display in the header
  const formattedDate = (() => {
    if (!date) return "";
    const [y, m, d] = date.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString(lang, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [all, colorMap] = await Promise.all([
          getAllCalendarDates(lang),
          getCalendarLegendColorById(lang),
        ]);
        if (!cancelled) {
          setEvents(all.filter((e) => e.gregorian_date === date));
          setLegendColorMap(colorMap);
        }
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date, lang]);

  const todayStart = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const dayDiff = (() => {
    if (!date) return 0;
    const [y, m, d] = date.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return Math.round((dateObj.getTime() - todayStart.getTime()) / 86400000);
  })();

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
          {/* Events */}
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
        </ScrollView>
      )}
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
  eventCount: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 16,
    textAlign: "center",
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
});
