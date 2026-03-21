import React, { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TodoList } from "@/components/ToDoList";
import { AddTodoModal } from "@/components/AddTodoModal";
import { DeleteTodoModal } from "@/components/DeleteTodoModal";
import { useWeeklyTodos } from "../../../../../hooks/useWeeklyTodos";
import { getFullDayName } from "../../../../../utils/dayNames";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { TodoToDeleteType } from "@/constants/Types";
import {
  cancelTodoReminderNotification,
  scheduleTodoReminderNotification,
} from "../../../../../hooks/usePushNotifications";
import useNotificationStore from "../../../../../stores/notificationStore";
import Toast from "react-native-toast-message";

const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];

const getCurrentDayIndex = (): number => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
};

export default function WeeklyCalendarScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const { todosByDay, loading, toggleTodo, addTodo, deleteTodo, undoAllForDay } =
    useWeeklyTodos();

  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(
    () => Object.fromEntries(DAY_INDICES.map((d) => [d, true]))
  );

  const toggleDay = useCallback((dayIndex: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
  }, []);

  const todayIndex = getCurrentDayIndex();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<TodoToDeleteType>({
    dayIndex: null,
    todoId: null,
  });

  const insets = useSafeAreaInsets();

  const { getNotifications, permissionStatus, checkPermissions } =
    useNotificationStore();

  const openAddModal = useCallback((dayIndex: number) => {
    setSelectedDay(dayIndex);
    setAddModalVisible(true);
  }, []);

  const handleAddTodoConfirmed = useCallback(
    (text: string, internalUrls: string[]) => {
      if (selectedDay !== null) {
        addTodo(selectedDay, text, internalUrls);
      }
      setAddModalVisible(false);
    },
    [addTodo, selectedDay]
  );

  const showDeleteConfirmation = useCallback((dayIndex: number, todoId: number) => {
    setTodoToDelete({ dayIndex, todoId });
    setDeleteModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const { dayIndex, todoId } = todoToDelete;
    if (dayIndex !== null && todoId !== null) {
      await cancelTodoReminderNotification(todoId);
      deleteTodo(dayIndex, todoId);
    }
    setDeleteModalVisible(false);
    setTodoToDelete({ dayIndex: null, todoId: null });
  }, [deleteTodo, todoToDelete]);

  const cancelDelete = useCallback(() => {
    setDeleteModalVisible(false);
    setTodoToDelete({ dayIndex: null, todoId: null });
  }, []);

  const handleUndo = useCallback(
    (dayIndex: number) => {
      Alert.alert(t("undo"), t("undoProgressText"), [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("yes"),
          style: "destructive",
          onPress: () => undoAllForDay(dayIndex),
        },
      ]);
    },
    [t, undoAllForDay]
  );

  const handleSetReminder = useCallback(
    async (
      dayIndex: number,
      todoId: string | number,
      time: Date | null,
      repeatWeekly: boolean
    ) => {
      try {
        const todoIdString = String(todoId);
        if (time === null) {
          await cancelTodoReminderNotification(todoIdString);
          return;
        }
        if (!getNotifications) {
          Alert.alert(
            t("pushNotificationsDisabledTitle"),
            t("pushNotificationsDisabledMessage")
          );
          return;
        }
        if (permissionStatus !== "granted") {
          await checkPermissions();
          const latestStatus = useNotificationStore.getState().permissionStatus;
          if (latestStatus !== "granted") return;
        }
        const todosForDay = todosByDay[dayIndex] ?? [];
        const todo = todosForDay.find((item) => String(item.id) === todoIdString);
        const todoText = todo?.text.replace(/\{\{|\}\}/g, "") ?? "";
        await scheduleTodoReminderNotification(
          todoIdString,
          todoText,
          dayIndex,
          time,
          repeatWeekly
        );
        Toast.show({ type: "success", text1: t("timerSet") });
      } catch (error) {
        console.error("Failed to set/delete reminder:", error);
      }
    },
    [getNotifications, permissionStatus, checkPermissions, todosByDay, t]
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t("weeklyToDoTitle") }} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
      >
        {DAY_INDICES.map((dayIndex) => {
          const todos = todosByDay[dayIndex] ?? [];
          const isExpanded = expandedDays[dayIndex];
          const isToday = dayIndex === todayIndex;
          return (
            <View key={dayIndex} style={styles.daySection}>
              {/* Day header: left half toggles expand, right half has action buttons */}
              <View style={styles.dayHeader}>
                <TouchableOpacity
                  style={styles.dayTitleRow}
                  onPress={() => toggleDay(dayIndex)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[styles.dayTitle, isToday && styles.todayTitle]}>
                    {getFullDayName(dayIndex)}
                  </ThemedText>
                  {isToday && (
                    <View style={styles.todayBadge}>
                      <ThemedText style={styles.todayBadgeText}>
                        {t("today") ?? "Today"}
                      </ThemedText>
                    </View>
                  )}
                  {todos.length > 0 && (
                    <ThemedText style={styles.todoBadge}>
                      {todos.length}
                    </ThemedText>
                  )}
                  <AntDesign
                    name={isExpanded ? "up" : "down"}
                    size={14}
                    color={colorScheme === "dark" ? "#aaa" : "#888"}
                  />
                </TouchableOpacity>

                <View style={styles.dayHeaderActions}>
                  {isExpanded && todos.length > 0 && (
                    <TouchableOpacity onPress={() => handleUndo(dayIndex)} hitSlop={8}>
                      <ThemedText style={styles.undoText}>{t("undo")}</ThemedText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => openAddModal(dayIndex)} hitSlop={8}>
                    <AntDesign
                      name="plus-circle"
                      size={22}
                      color={Colors.universal.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {isExpanded && (
                <TodoList
                  todos={todos}
                  dayIndex={dayIndex}
                  onToggleTodo={toggleTodo}
                  onShowDeleteModal={showDeleteConfirmation}
                  onShowAddModal={() => openAddModal(dayIndex)}
                  onSetReminder={handleSetReminder}
                  scrollEnabled={false}
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      {selectedDay !== null && (
        <AddTodoModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onAdd={handleAddTodoConfirmed}
          selectedDayName={getFullDayName(selectedDay)}
        />
      )}
      <DeleteTodoModal
        visible={deleteModalVisible}
        onClose={cancelDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  daySection: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  todayTitle: {
    color: Colors.universal.primary,
  },
  todayBadge: {
    backgroundColor: Colors.universal.primary,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  todoBadge: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.5,
  },
  dayHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  undoText: {
    fontSize: 14,
    color: Colors.universal.primary,
  },
});
