import React, { useRef, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { getDayNames } from "../../utils/dayNames";
import { returnSize } from "../../utils/sizes";

interface DaySelectorProps {
  selectedDay: number | null;
  currentDayIndex: number;
  onSelectDay: (dayIndex: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDay,
  currentDayIndex,
  onSelectDay,
}) => {
  const dayNames = getDayNames();
  const { width, height } = useWindowDimensions();
  const { isLarge, isMedium } = returnSize(width, height);
  const colorScheme = useColorScheme() || "light";
  const scrollViewRef = useRef<ScrollView>(null);

  const GAP = 10;
  const PADDING = 10;
  const buttonWidth = isLarge ? 80 : isMedium ? 70 : 60;

  useEffect(() => {
    if (selectedDay === null) return;

    const itemTotalWidth = buttonWidth + GAP;
    // Center the selected day in the visible area
    const offset = selectedDay * itemTotalWidth + PADDING - (width / 2 - buttonWidth / 2);

    scrollViewRef.current?.scrollTo({
      x: Math.max(0, offset),
      animated: true,
    });
  }, [selectedDay, buttonWidth, width]);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollStyle}
    >
      {dayNames.map((day, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dayButton,
            { width: buttonWidth, height: 45 },
            { backgroundColor: colorScheme === "dark" ? "#333" : "#ccc" },
            selectedDay === index && styles.selectedDayButton,
            selectedDay === index && {
              backgroundColor: colorScheme === "dark" ? "#555" : "#e0e0e0",
            },
          ]}
          onPress={() => onSelectDay(index)}
        >
          <ThemedText
            style={[
              styles.dayButtonText,
              { fontSize: isLarge ? 18 : isMedium ? 16 : 14 },
              selectedDay === index && styles.selectedDayText,
              currentDayIndex === index && styles.currentDayText,
            ]}
          >
            {day}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
  },
  scrollStyle: {
    flexGrow: 0,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  selectedDayButton: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  dayButtonText: {
    fontWeight: "500",
  },
  selectedDayText: {
    fontWeight: "700",
  },
  currentDayText: {
    color: "#4CAF50",
  },
});