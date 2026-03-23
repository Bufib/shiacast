// //! Last worked

// // src/components/TodoList.tsx
// import React, { useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   StyleSheet,
//   useColorScheme,
//   ScrollView,
//   useWindowDimensions,
// } from "react-native";
// import { ThemedText } from "./ThemedText";
// import { Ionicons } from "@expo/vector-icons";
// import { TodoListType } from "@/constants/Types";
// import { useTranslation } from "react-i18next";
// import { Colors } from "@/constants/Colors";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { returnSize } from "@/utils/sizes";
// import { InlineTodoText } from "./InlineTodoText";
// import { TimePickerModal } from "./TimePickerModal";
// import Toast from "react-native-toast-message";

// export const TodoList = ({
//   todos,
//   dayIndex,
//   onToggleTodo,
//   onShowDeleteModal,
//   onShowAddModal,
//   onSetReminder,
// }: TodoListType) => {
//   const { t } = useTranslation();
//   const colorScheme = useColorScheme() || "light";
//   const { rtl } = useLanguage();
//   const { width, height } = useWindowDimensions();
//   const { emptyIconSize, emptyTextSize, emptyGap } = returnSize(width, height);

//   const [timePickerVisible, setTimePickerVisible] = useState(false);
//   const [selectedTodo, setSelectedTodo] = useState<{
//     id: string;
//     text: string;
//     reminderTime?: Date;
//     repeatWeekly?: boolean;
//   } | null>(null);

//   const handleAlarmPress = (todo: any) => {
//     setSelectedTodo({
//       id: todo.id,
//       text: todo.text,
//       reminderTime: todo.reminder_time
//         ? new Date(todo.reminder_time)
//         : undefined,
//       repeatWeekly: todo.repeat_weekly ?? false, // if you add this field later
//     });
//       console.log(todo.reminder_time)

//     setTimePickerVisible(true);
//   };

//   const handleConfirmTime = (date: Date, repeatWeekly: boolean) => {
//     if (selectedTodo) {
//       onSetReminder(dayIndex, selectedTodo.id, date, repeatWeekly);
//     }

//   };

//   const handleCloseModal = () => {
//     setTimePickerVisible(false);
//     setSelectedTodo(null);
//   };

//   if (!todos || todos.length === 0) {
//     return (
//       <View
//         style={[
//           styles.emptyPrayerForDay,
//           rtl ? { flexDirection: "row-reverse" } : { flexDirection: "row" },
//         ]}
//       >
//         <Ionicons
//           name="calendar-outline"
//           size={emptyIconSize}
//           color={colorScheme === "dark" ? "#666" : "#999"}
//           style={styles.emptyDayIcon}
//         />

//         <ThemedText
//           style={[
//             styles.emptyDayText,
//             { fontSize: emptyTextSize, marginBottom: emptyGap },
//           ]}
//         >
//           {t("noPlansForToday")}{" "}
//           <ThemedText
//             onPress={onShowAddModal}
//             style={[
//               styles.addButton,
//               { color: Colors.universal.primary, fontWeight: 700 },
//             ]}
//           >
//             {t("addWeekly")}
//           </ThemedText>
//         </ThemedText>
//       </View>
//     );
//   }

//   return (
//     <>
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         style={styles.scrollStyle}
//       >
//         {todos.map((todo) => (
//           <View
//             key={todo.id}
//             style={[
//               styles.todoItem,
//               { backgroundColor: Colors[colorScheme].contrast },
//             ]}
//           >
//             <View
//               style={[
//                 styles.todoMainRow,
//                 rtl
//                   ? { flexDirection: "row-reverse" }
//                   : { flexDirection: "row" },
//               ]}
//             >
//               <TouchableOpacity
//                 style={[
//                   styles.checkboxContainer,
//                   rtl ? { marginLeft: 12 } : { marginRight: 10 },
//                 ]}
//                 onPress={() => onToggleTodo(dayIndex, todo.id)}
//               >
//                 <View
//                   style={[
//                     styles.checkbox,
//                     todo.completed && styles.checkboxCompleted,
//                     { borderColor: colorScheme === "dark" ? "#666" : "#999" },
//                     todo.completed && {
//                       backgroundColor: colorScheme === "dark" ? "#666" : "#999",
//                       borderColor: colorScheme === "dark" ? "#666" : "#999",
//                     },
//                   ]}
//                 >
//                   {todo.completed && (
//                     <Ionicons name="checkmark" size={16} color="#fff" />
//                   )}
//                 </View>
//               </TouchableOpacity>

//               <InlineTodoText
//                 text={todo.text}
//                 internalUrls={todo.internal_urls}
//                 isDone={todo.completed}
//                 style={[
//                   styles.todoText,
//                   rtl ? { textAlign: "right" } : { textAlign: "left" },
//                   todo.completed && styles.todoTextCompleted,
//                 ]}
//               />

//               <TouchableOpacity
//                 style={styles.alarmButton}
//                 onPress={() => handleAlarmPress(todo)}
//               >
//                 {/*!  */}
//                 <Ionicons
//                   name={"alarm-outline" }
//                   size={23}
//                   color={
//                     todo.reminder_time
//                       ? Colors.universal.primary
//                       : Colors[colorScheme].defaultIcon
//                   }
//                 />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.deleteButton}
//                 onPress={() => onShowDeleteModal(dayIndex, todo.id)}
//               >
//                 <Ionicons
//                   name="close-circle-outline"
//                   size={23}
//                   color={Colors[colorScheme].defaultIcon}
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))}
//       </ScrollView>

//       <TimePickerModal
//         visible={timePickerVisible}
//         onClose={handleCloseModal}
//         onConfirm={handleConfirmTime}
//         todoText={selectedTodo?.text || ""}
//         initialTime={selectedTodo?.reminderTime}
//         initialRepeatWeekly={selectedTodo?.repeatWeekly ?? false}
//       />
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   scrollStyle: {
//     flex: 1,
//     marginHorizontal: 10,
//   },
//   scrollContent: {
//     gap: 5,
//   },
//   todoItem: {
//     padding: 14,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   todoMainRow: {
//     alignItems: "center",
//   },
//   checkboxContainer: {},
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 2,
//   },
//   checkboxCompleted: {},
//   todoText: {
//     flex: 1,
//     fontSize: 15,
//   },
//   todoTextCompleted: {
//     opacity: 0.6,
//   },
//   alarmButton: {
//     padding: 4,
//     marginRight: 3,
//   },
//   deleteButton: {
//     padding: 4,
//   },
//   emptyPrayerForDay: {
//     flex: 1,
//     justifyContent: "flex-start",
//     alignItems: "flex-start",
//     gap: 10,
//     marginTop: 10,
//     paddingHorizontal: 15,
//   },
//   emptyDayText: {
//     opacity: 0.8,
//     flexWrap: "wrap",
//     lineHeight: 25,
//   },
//   addButton: {
//     fontSize: 18,
//   },
//   emptyDayIcon: {},
// });

import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  useWindowDimensions,
  Alert,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { TodoListType } from "@/constants/Types";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { returnSize } from "../../utils/sizes";
import { InlineTodoText } from "./InlineTodoText";
import { TimePickerModal } from "./TimePickerModal";
import Toast from "react-native-toast-message";
import useTodoReminderStore from "../../stores/todoReminderStore";

export const TodoList = ({
  todos,
  dayIndex,
  onToggleTodo,
  onShowDeleteModal,
  onShowAddModal,
  onSetReminder,
  scrollEnabled = true,
}: TodoListType) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const { rtl } = useLanguage();
  const { width, height } = useWindowDimensions();
  const { emptyIconSize } = returnSize(width, height);

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<{
    id: string;
    text: string;
    reminderTime?: Date;
    repeatWeekly?: boolean;
  } | null>(null);

  const reminders = useTodoReminderStore((s) => s.reminders);

  const handleAlarmPress = (todo: any) => {
    const reminder = reminders[String(todo.id)];

    if (reminder) {
      const reminderDate = new Date(reminder.timeISO);
      const timeString = reminderDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      Alert.alert(
        t("reminderSet") || "Reminder Set",
        `${timeString}${
          reminder.repeatWeekly
            ? "\n" + (t("repeatsWeekly") || "Repeats weekly")
            : ""
        }`,
        [
          {
            text: t("delete") || "Delete",
            style: "destructive",
            onPress: () => {
              onSetReminder(dayIndex, todo.id, null, false);
              Toast.show({
                type: "success",
                text1: t("reminderDeleted") || "Reminder deleted",
              });
            },
          },
          {
            text: t("edit") || "Edit",
            onPress: () => {
              setSelectedTodo({
                id: String(todo.id),
                text: todo.text,
                reminderTime: reminderDate,
                repeatWeekly: reminder.repeatWeekly,
              });
              setTimePickerVisible(true);
            },
          },
          {
            text: t("cancel"),
            style: "cancel",
          },
        ],
      );
    } else {
      setSelectedTodo({
        id: String(todo.id),
        text: todo.text,
        reminderTime: undefined,
        repeatWeekly: false,
      });
      setTimePickerVisible(true);
    }
  };

  const handleConfirmTime = (date: Date, repeatWeekly: boolean) => {
    if (selectedTodo) {
      onSetReminder(dayIndex, selectedTodo.id, date, repeatWeekly);
    }
  };

  const handleCloseModal = () => {
    setTimePickerVisible(false);
    setSelectedTodo(null);
  };

  if (!todos || todos.length === 0) {
    return (
      <View
        style={[
          styles.emptyPrayerForDay,
          rtl ? { flexDirection: "row-reverse" } : { flexDirection: "row" },
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={emptyIconSize}
          color={colorScheme === "dark" ? "#666" : "#999"}
          style={styles.emptyDayIcon}
        />
        <ThemedText
          style={[
            styles.emptyDayText,
            { flex: 1 },
            rtl && { textAlign: "right" },
          ]}
        >
          {t("noPlansForToday")}{" "}
          <ThemedText
            onPress={onShowAddModal}
            style={{
              color: Colors.universal.primary,
              fontWeight: "700",
              fontSize: 18,
            }}
          >
            {t("addWeekly")}
          </ThemedText>
        </ThemedText>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={scrollEnabled ? styles.scrollStyle : styles.staticStyle}
        scrollEnabled={scrollEnabled}
      >
        {todos.map((todo, index) => {
          const reminder = reminders[String(todo.id)];
          const hasReminder = !!reminder;

          return (
            <View
              key={`${todo.id}-${index}`}
              style={[
                styles.todoItem,
                { backgroundColor: Colors[colorScheme].contrast },
              ]}
            >
              <View
                style={[
                  styles.todoMainRow,
                  rtl
                    ? { flexDirection: "row-reverse" }
                    : { flexDirection: "row" },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.checkboxContainer,
                    rtl ? { marginLeft: 12 } : { marginRight: 10 },
                  ]}
                  onPress={() => onToggleTodo(dayIndex, todo.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      todo.completed && styles.checkboxCompleted,
                      {
                        borderColor: colorScheme === "dark" ? "#666" : "#999",
                      },
                      todo.completed && {
                        backgroundColor:
                          colorScheme === "dark" ? "#666" : "#999",
                        borderColor: colorScheme === "dark" ? "#666" : "#999",
                      },
                    ]}
                  >
                    {todo.completed && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>

                <InlineTodoText
                  text={todo.text}
                  internalUrls={todo.internal_urls}
                  isDone={todo.completed}
                  style={[
                    styles.todoText,
                    rtl ? { textAlign: "right" } : { textAlign: "left" },
                    todo.completed && styles.todoTextCompleted,
                  ]}
                />

                <TouchableOpacity
                  style={styles.alarmButton}
                  onPress={() => handleAlarmPress(todo)}
                >
                  <Ionicons
                    name={hasReminder ? "alarm" : "alarm-outline"}
                    size={23}
                    color={
                      hasReminder
                        ? Colors.universal.primary
                        : Colors[colorScheme].defaultIcon
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onShowDeleteModal(dayIndex, todo.id)}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={23}
                    color={Colors[colorScheme].defaultIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TimePickerModal
        visible={timePickerVisible}
        onClose={handleCloseModal}
        onConfirm={handleConfirmTime}
        todoText={selectedTodo?.text || ""}
        initialTime={selectedTodo?.reminderTime}
        initialRepeatWeekly={selectedTodo?.repeatWeekly ?? false}
      />
    </>
  );
};

const styles = StyleSheet.create({
  scrollStyle: {
    flex: 1,
    marginHorizontal: 10,
  },
  staticStyle: {
    marginHorizontal: 10,
  },
  scrollContent: {
    gap: 5,
  },
  todoItem: {
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  todoMainRow: {
    alignItems: "center",
  },
  checkboxContainer: {},
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
  },
  checkboxCompleted: {},
  todoText: {
    flex: 1,
    fontSize: 15,
  },
  todoTextCompleted: {
    opacity: 0.6,
  },
  alarmButton: {
    padding: 4,
    marginRight: 3,
  },
  deleteButton: {
    padding: 4,
  },
  emptyPrayerForDay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  emptyDayText: {
    opacity: 0.8,
  },
  addButton: {
    fontSize: 18,
  },
  emptyDayIcon: {},
});
