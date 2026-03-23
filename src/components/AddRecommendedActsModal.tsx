import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useWeeklyTodos } from "../../hooks/useWeeklyTodos";
import { getFullDayName } from "../../utils/dayNames";

const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];

function getCurrentDayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  acts: string[];
};

export function AddRecommendedActsModal({ visible, onClose, acts }: Props) {
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  const { todosByDay, addTodo } = useWeeklyTodos();

  const [selectedActs, setSelectedActs] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<number>(getCurrentDayIndex());

  useEffect(() => {
    if (visible) {
      setSelectedActs(new Set());
      setSelectedDay(getCurrentDayIndex());
    }
  }, [visible]);

  const toggleAct = useCallback((act: string) => {
    setSelectedActs((prev) => {
      const next = new Set(prev);
      if (next.has(act)) {
        next.delete(act);
      } else {
        next.add(act);
      }
      return next;
    });
  }, []);

  const isAllSelected = acts.length > 0 && selectedActs.size === acts.length;

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedActs(new Set());
    } else {
      setSelectedActs(new Set(acts));
    }
  }, [acts, isAllSelected]);

  const handleAdd = useCallback(() => {
    const existingTexts = new Set(
      (todosByDay[selectedDay] ?? []).map((item) =>
        item.text.trim().toLowerCase(),
      ),
    );
    for (const act of selectedActs) {
      if (!existingTexts.has(act.trim().toLowerCase())) {
        addTodo(selectedDay, act);
      }
    }
    onClose();
  }, [selectedActs, selectedDay, todosByDay, addTodo, onClose]);

  const bgColor = colorScheme === "dark" ? "#222" : "#fff";
  const dayBgInactive = colorScheme === "dark" ? "#333" : "#f0f0f0";
  const dividerColor =
    colorScheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const iconInactive = colorScheme === "dark" ? "#555" : "#ccc";
  const closeIconColor = colorScheme === "dark" ? "#aaa" : "#666";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: bgColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>
              {t("selectActsTitle")}
            </ThemedText>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={closeIconColor} />
            </TouchableOpacity>
          </View>

          {/* Select All / Deselect All */}
          <TouchableOpacity
            style={[styles.selectAllRow, { borderBottomColor: dividerColor }]}
            onPress={toggleAll}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isAllSelected ? "checkmark-circle" : "ellipse-outline"}
              size={20}
              color={
                isAllSelected ? Colors.universal.primary : closeIconColor
              }
            />
            <ThemedText
              style={[
                styles.selectAllText,
                { color: Colors.universal.primary },
              ]}
            >
              {isAllSelected ? t("deselectAll") : t("selectAll")}
            </ThemedText>
          </TouchableOpacity>

          {/* Acts list */}
          <ScrollView
            style={styles.actsList}
            showsVerticalScrollIndicator={false}
          >
            {acts.map((act) => {
              const isSelected = selectedActs.has(act);
              return (
                <TouchableOpacity
                  key={act}
                  style={[
                    styles.actRow,
                    { borderBottomColor: dividerColor },
                    isSelected && {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(46,168,83,0.12)"
                          : "rgba(46,168,83,0.06)",
                    },
                  ]}
                  onPress={() => toggleAct(act)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={isSelected ? Colors.universal.primary : iconInactive}
                  />
                  <ThemedText style={styles.actText}>{act}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Day selector */}
          <View
            style={[
              styles.daySelectorSection,
              { borderTopColor: dividerColor },
            ]}
          >
            <ThemedText style={styles.daySelectorLabel}>
              {t("selectDay")}
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayScrollContent}
            >
              {DAY_INDICES.map((dayIndex) => {
                const isActive = selectedDay === dayIndex;
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: isActive
                          ? Colors.universal.primary
                          : dayBgInactive,
                      },
                    ]}
                    onPress={() => setSelectedDay(dayIndex)}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.dayChipText,
                        isActive && styles.dayChipTextActive,
                      ]}
                    >
                      {getFullDayName(dayIndex)}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: dayBgInactive },
              ]}
              onPress={onClose}
            >
              <ThemedText style={styles.buttonText}>{t("cancel")}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.addButton,
                {
                  backgroundColor: Colors.universal.primary,
                  opacity: selectedActs.size === 0 ? 0.4 : 1,
                },
              ]}
              onPress={handleAdd}
              disabled={selectedActs.size === 0}
            >
              <ThemedText style={styles.addButtonText}>
                {t("addSelected")} ({selectedActs.size})
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "82%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actsList: {
    maxHeight: 260,
  },
  actRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  daySelectorSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  daySelectorLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.55,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  dayScrollContent: {
    gap: 8,
    paddingRight: 4,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  dayChipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  buttons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {},
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
