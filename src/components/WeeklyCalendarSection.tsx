import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  useWindowDimensions,
  Alert,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { DaySelector } from "./DaySelector";
import { TodoList } from "./ToDoList";
import { WeeklyTodosType } from "@/constants/Types";
import { getFullDayName } from "../../utils/dayNames";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import type { WeeklyCalendarSectionType } from "@/constants/Types";
import AntDesign from "@expo/vector-icons/AntDesign";
import { returnSize } from "../../utils/sizes";
import useNotificationStore from "../../stores/notificationStore";
import {
  scheduleTodoReminderNotification,
  cancelTodoReminderNotification,
} from "../../hooks/usePushNotifications";
import Toast from "react-native-toast-message";

export const WeeklyCalendarSection: React.FC<
  WeeklyCalendarSectionType & {
    todosByDay: WeeklyTodosType;
    loading: boolean;
    onToggleTodo: (day: number, id: number) => void;
    onNavigateToFullCalendar?: () => void;
  }
> = ({
  selectedDay,
  currentDayIndex,
  onSelectDay,
  onShowAddModal,
  onShowDeleteModal,
  onUndoAll,
  todosByDay,
  loading,
  onToggleTodo,
  onNavigateToFullCalendar,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const { width, height } = useWindowDimensions();
  const { isLarge, isMedium } = returnSize(width, height);

  const { getNotifications, permissionStatus, checkPermissions } =
    useNotificationStore();

  const handleUndo = () => {
    if (selectedDay === null) return;

    Alert.alert(t("undo"), t("undoProgressText"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("yes"),
        style: "destructive",
        onPress: () => {
          onUndoAll(selectedDay);
        },
      },
    ]);
  };

  // const handleSetReminder = async (
  //   dayIndex: number,
  //   todoId: string | number,
  //   time: Date | null,
  //   repeatWeekly: boolean
  // ) => {
  //   try {
  //     const todoIdString = String(todoId);

  //     if (time === null) {
  //       await cancelTodoReminderNotification(todoIdString);
  //       return;
  //     }

  //     if (!getNotifications) {
  //       Alert.alert(
  //         t("pushNotificationsDisabledTitle"),
  //         t("pushNotificationsDisabledMessage")
  //       );
  //       return;
  //     }

  //     if (permissionStatus !== "granted") {
  //       await checkPermissions();
  //       const latestStatus = useNotificationStore.getState().permissionStatus;
  //       if (latestStatus !== "granted") {
  //         return;
  //       }
  //     }

  //     const todosForDay = todosByDay[dayIndex] ?? [];
  //     const todo = todosForDay.find((t) => String(t.id) === todoIdString);
  //     const todoText = todo?.text.replace(/\{\{|\}\}/g, "") ?? "";
  //     console.log(todoText)

  //     await scheduleTodoReminderNotification(
  //       todoIdString,
  //       todoText,
  //       dayIndex,
  //       time,
  //       repeatWeekly
  //     );
  //   } catch (error) {
  //     console.error("Failed to set/delete reminder:", error);
  //   }
  // };

  const handleSetReminder = async (
    dayIndex: number,
    todoId: string | number,
    time: Date | null,
    repeatWeekly: boolean,
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
          t("pushNotificationsDisabledMessage"),
        );
        return;
      }

      if (permissionStatus !== "granted") {
        await checkPermissions();
        const latestStatus = useNotificationStore.getState().permissionStatus;
        if (latestStatus !== "granted") {
          return;
        }
      }

      const todosForDay = todosByDay[dayIndex] ?? [];
      const todo = todosForDay.find((t) => String(t.id) === todoIdString);
      const todoText = todo?.text.replace(/\{\{|\}\}/g, "") ?? "";

      await scheduleTodoReminderNotification(
        todoIdString,
        todoText,
        dayIndex,
        time,
        repeatWeekly,
      );

      // Only show toast after successful scheduling
      Toast.show({
        type: "success",
        text1: t("timerSet"),
      });
    } catch (error) {
      console.error("Failed to set/delete reminder:", error);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <View style={styles.calendarHeaderContainer}>
          <AntDesign
            name="calendar"
            size={isLarge ? 45 : isMedium ? 40 : 35}
            color="#f5f6fa"
            style={{
              backgroundColor: Colors.universal.primary,
              borderRadius: 10,
              padding: 5,
              paddingBottom: 7,
            }}
          />
          <View style={styles.calendarTextContainer}>
            <ThemedText style={[styles.calendarTextTitle, { fontSize: 20 }]}>
              {t("weeklyToDoTitle")}
            </ThemedText>
            {/* <ThemedText
              style={[
                styles.calendarTextSubtitle,
                { fontSize: isLarge ? 16 : isMedium ? 14 : 12 },
              ]}
            >
              {t("weeklyToDoSubtitle")}
            </ThemedText> */}
            <TouchableOpacity
              onPress={onNavigateToFullCalendar}
              disabled={!onNavigateToFullCalendar}
              activeOpacity={onNavigateToFullCalendar ? 0.7 : 1}
            >
              <ThemedText
                style={{ fontSize: 14, color: Colors.universal.link }}
              >
                {t("showAll")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, selectedDay === null && { opacity: 0.5 }]}
          onPress={onShowAddModal}
          disabled={selectedDay === null}
        >
          <AntDesign
            name="plus-circle"
            size={isLarge ? 35 : isMedium ? 30 : 25}
            color={Colors[colorScheme].defaultIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 0, marginBottom: 5 }}>
        <DaySelector
          selectedDay={selectedDay}
          currentDayIndex={currentDayIndex}
          onSelectDay={onSelectDay}
        />
      </View>

      {loading || selectedDay === null ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
        </View>
      ) : (
        <>
          <ThemedView style={styles.fulldayNameContainer}>
            <ThemedText style={styles.selectedDayTitle}>
              {getFullDayName(selectedDay)}
            </ThemedText>
            {(todosByDay[selectedDay] ?? []).length > 0 ? (
              <TouchableOpacity onPress={handleUndo}>
                <View style={{ flexDirection: "row", gap: 5 }}>
                  <ThemedText
                    style={{ fontSize: 14, color: Colors.universal.primary }}
                  >
                    {t("undo")}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ) : null}
          </ThemedView>

          <View style={{ flex: 1 }}>
            <TodoList
              todos={todosByDay[selectedDay] ?? []}
              dayIndex={selectedDay}
              onToggleTodo={onToggleTodo}
              onShowDeleteModal={onShowDeleteModal}
              onShowAddModal={onShowAddModal}
              onSetReminder={handleSetReminder}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginHorizontal: 2,
  },
  calendarHeaderContainer: {
    flexDirection: "row",
    gap: 15,
    marginLeft: 13,
  },
  calendarTextContainer: {
    flexDirection: "column",
    gap: 1,
    justifyContent: "center",
  },
  calendarTextTitle: {
    fontWeight: "600",
  },
  calendarTextSubtitle: {},
  addButton: {
    paddingRight: 15,
  },
  fulldayNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 18,
    marginTop: 5,
    marginBottom: 10,
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
});
