// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   StyleSheet,
//   ColorSchemeName,
//   TouchableOpacity,
//   useWindowDimensions,
//   Animated,
//   useColorScheme,
// } from "react-native";
// import * as WebBrowser from "expo-web-browser";
// import { router } from "expo-router";
// import { useTranslation } from "react-i18next";
// import { prayerCategories, tasbihCategory } from "../../utils/categories";
// import { useWeeklyTodos } from "../../hooks/useWeeklyTodos";
// import { getFullDayName } from "../../utils/dayNames";
// import { WeeklyCalendarSection } from "@/components/WeeklyCalendarSection";
// import { AddTodoModal } from "@/components/AddTodoModal";
// import { DeleteTodoModal } from "@/components/DeleteTodoModal";
// import { returnSize } from "../../utils/sizes";
// import { Colors } from "@/constants/Colors";
// import { Image } from "expo-image";
// import { ThemedText } from "./ThemedText";
// import { PrayerQuestionLinksType, TodoToDeleteType } from "@/constants/Types";
// import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";
// import { cancelTodoReminderNotification } from "../../hooks/usePushNotifications";
// import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

// const PrayerLinks = () => {
//   const colorScheme: ColorSchemeName = useColorScheme() || "light";
//   const { t } = useTranslation();

//   const {
//     todosByDay,
//     loading,
//     toggleTodo,
//     addTodo,
//     deleteTodo,
//     undoAllForDay,
//   } = useWeeklyTodos();

//   const [selectedDay, setSelectedDay] = useState<number | null>(null);
//   const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
//   const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
//   const [todoToDelete, setTodoToDelete] = useState<TodoToDeleteType>({
//     dayIndex: null,
//     todoId: null,
//   });
//   const { fadeAnim, onLayout } = useScreenFadeIn(800);

//   // fade-in animation value

//   // --- Effects ---
//   const getCurrentDayIndex = useCallback((): number => {
//     const day = new Date().getDay();
//     return day === 0 ? 6 : day - 1; // Mon-Sun (0-6)
//   }, []);

//   useEffect(() => {
//     setSelectedDay(getCurrentDayIndex());
//   }, [getCurrentDayIndex]);

//   // --- Handlers ---
//   // const handleAddTodoConfirmed = useCallback(
//   //   (text: string): void => {
//   //     if (selectedDay !== null) {
//   //       addTodo(selectedDay, text);
//   //     }
//   //     setAddModalVisible(false); // Close modal after adding
//   //   },
//   //   [addTodo, selectedDay]
//   // );

//   const handleAddTodoConfirmed = useCallback(
//     (text: string, internalUrls: string[]): void => {
//       if (selectedDay !== null) {
//         addTodo(selectedDay, text, internalUrls); // ⬅️ now uses links
//       }
//       setAddModalVisible(false);
//     },
//     [addTodo, selectedDay],
//   );

//   const showDeleteConfirmation = useCallback(
//     (dayIndex: number, todoId: number): void => {
//       setTodoToDelete({ dayIndex, todoId });
//       setDeleteModalVisible(true);
//     },
//     [],
//   );

//   // const handleConfirmDelete = useCallback((): void => {
//   //   const { dayIndex, todoId } = todoToDelete;
//   //   if (dayIndex !== null && todoId !== null) {
//   //     deleteTodo(dayIndex, todoId);
//   //   }
//   //   setDeleteModalVisible(false);
//   //   setTodoToDelete({ dayIndex: null, todoId: null });
//   // }, [deleteTodo, todoToDelete]);

//   const handleConfirmDelete = useCallback(async (): Promise<void> => {
//     const { dayIndex, todoId } = todoToDelete;

//     if (dayIndex !== null && todoId !== null) {
//       // 1) cancel push + remove reminder from store
//       await cancelTodoReminderNotification(todoId);

//       // 2) delete todo from your weekly todos
//       deleteTodo(dayIndex, todoId);
//     }

//     setDeleteModalVisible(false);
//     setTodoToDelete({ dayIndex: null, todoId: null });
//   }, [deleteTodo, todoToDelete]);

//   const cancelDelete = useCallback((): void => {
//     setDeleteModalVisible(false);
//     setTodoToDelete({ dayIndex: null, todoId: null });
//   }, []);

//   const handleCategoryPress = useCallback(
//     (prayerLink: PrayerQuestionLinksType) => {
//       router.push(
//         prayerLink.value === "Tasbih"
//           ? {
//               pathname: "/knowledge/prayers/tasbih",
//             }
//           : prayerLink.value === "Names"
//             ? {
//                 pathname: "/knowledge/prayers/names",
//                 params: { prayerLink: prayerLink.value },
//               }
//             : {
//                 pathname: "/knowledge/prayers/prayerCategory",
//                 params: { prayerCategory: prayerLink.value },
//               },
//       );
//     },
//     [],
//   );

//   const handleSelectDay = useCallback((dayIndex: number): void => {
//     setSelectedDay(dayIndex);
//   }, []);

//   const openPrayerTimes = async () => {
//     await WebBrowser.openBrowserAsync("https://prayertime.ir");
//   };
//   const { width, height } = useWindowDimensions();
//   const { elementSize, fontSize, iconSize } = returnSize(width, height);

//   return (
//     <Animated.View
//       onLayout={onLayout}
//       style={[
//         styles.container,
//         { opacity: fadeAnim, backgroundColor: Colors[colorScheme].background },
//       ]}
//     >
//       <View style={styles.categoriesContainer}>
//         <View style={styles.categories}>
//           {prayerCategories.map((category, index) => (
//             <TouchableOpacity
//               key={index}
//               onPress={() => {
//                 handleCategoryPress(category);
//               }}
//               style={[
//                 styles.element,
//                 {
//                   backgroundColor: Colors[colorScheme].contrast,
//                   width: elementSize,
//                   height: elementSize,
//                 },
//               ]}
//             >
//               <View
//                 style={[
//                   styles.categoryButtonContainer,
//                   { gap: iconSize / 10 - 1 },
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.iconContainer,
//                     { width: iconSize, height: iconSize },
//                   ]}
//                 >
//                   <Image
//                     style={[styles.elementIcon, { width: iconSize }]}
//                     source={category.image}
//                     contentFit="contain"
//                   />
//                 </View>
//                 <View>
//                   <ThemedText
//                     style={[styles.elementText, { fontSize: fontSize }]}
//                   >
//                     {t(category.name)}
//                   </ThemedText>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           ))}
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "center",
//               flex: 1,
//               gap: 10,
//             }}
//           >
//             <TouchableOpacity
//               onPress={() => {
//                 handleCategoryPress(tasbihCategory[0]);
//               }}
//               style={[
//                 styles.element,
//                 {
//                   backgroundColor: Colors[colorScheme].contrast,
//                   height: elementSize / 2,
//                   width: "44%",
//                 },
//               ]}
//             >
//               <View
//                 style={[
//                   styles.categoryButtonContainer,
//                   { gap: iconSize / 10 - 1 },
//                 ]}
//               >
//                 <View style={styles.tasbihContainer}>
//                   <Image
//                     style={[styles.elementIcon, { width: iconSize / 1.2 }]}
//                     source={require("@/assets/images/tasbih.png")}
//                     contentFit="contain"
//                   />
//                   <ThemedText
//                     style={[styles.elementText, { fontSize: fontSize * 1.7 }]}
//                   >
//                     {t("tasbih")}
//                   </ThemedText>
//                 </View>
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() => {
//                 openPrayerTimes();
//               }}
//               style={[
//                 styles.element,
//                 {
//                   backgroundColor: Colors[colorScheme].contrast,
//                   width: "44%",
//                   height: elementSize / 2,
//                 },
//               ]}
//             >
//               <View
//                 style={[
//                   styles.categoryButtonContainer,
//                   { gap: iconSize / 10 - 1 },
//                 ]}
//               >
//                 <View style={styles.tasbihContainer}>
//                   <ThemedText
//                     style={[
//                       styles.elementText,
//                       { fontSize: fontSize * 1.7, color: "#E8BC14" },
//                     ]}
//                   >
//                     {t("prayerTime")}
//                   </ThemedText>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       <WeeklyCalendarSection
//         todosByDay={todosByDay}
//         loading={loading}
//         onToggleTodo={toggleTodo}
//         onUndoAll={undoAllForDay}
//         onShowAddModal={() => setAddModalVisible(true)}
//         onShowDeleteModal={showDeleteConfirmation}
//         selectedDay={selectedDay}
//         currentDayIndex={getCurrentDayIndex()}
//         onSelectDay={handleSelectDay}
//       />

//       {selectedDay !== null && (
//         <>
//           {/* <AddTodoModal
//             visible={addModalVisible}
//             onClose={() => setAddModalVisible(false)}
//             onAdd={handleAddTodoConfirmed}
//             selectedDayName={getFullDayName(selectedDay)}
//           /> */}
//           <AddTodoModal
//             visible={addModalVisible}
//             onClose={() => setAddModalVisible(false)}
//             onAdd={handleAddTodoConfirmed}
//             selectedDayName={getFullDayName(selectedDay)}
//           />
//           <DeleteTodoModal
//             visible={deleteModalVisible}
//             onClose={cancelDelete}
//             onConfirmDelete={handleConfirmDelete}
//           />
//         </>
//       )}
//     </Animated.View>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: "column",
//     gap: 20,
//     paddingTop: 10,
//     paddingBottom: 4,
//   },
//   categoriesContainer: {
//     flexDirection: "row",
//   },

//   categories: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     gap: 15,
//     paddingHorizontal: 10,
//   },

//   element: {
//     flexDirection: "column",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 13,

//     // iOS Shadow
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,

//     // Android Shadow
//     elevation: 5,
//   },

//   categoryButtonContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   iconContainer: {
//     borderRadius: 90,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: Colors.universal.prayerLinks,
//   },
//   tasbihContainer: {
//     flexDirection: "row",
//     gap: 5,
//     alignItems: "center",
//   },

//   elementIcon: {
//     height: "auto",
//     aspectRatio: 1.5,
//     alignSelf: "center",
//   },
//   elementText: {
//     fontWeight: "bold",
//     textAlign: "center",
//   },
// });

// export default PrayerLinks;

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ColorSchemeName,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  useColorScheme,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { prayerCategories, tasbihCategory } from "../../utils/categories";
import { useWeeklyTodos } from "../../hooks/useWeeklyTodos";
import { getFullDayName } from "../../utils/dayNames";
import { WeeklyCalendarSection } from "@/components/WeeklyCalendarSection";
import { AddTodoModal } from "@/components/AddTodoModal";
import { DeleteTodoModal } from "@/components/DeleteTodoModal";
import { returnSize } from "../../utils/sizes";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import { ThemedText } from "./ThemedText";
import { PrayerQuestionLinksType, TodoToDeleteType } from "@/constants/Types";
import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";
import { cancelTodoReminderNotification } from "../../hooks/usePushNotifications";

const PrayerLinks = () => {
  const colorScheme: ColorSchemeName = useColorScheme() || "light";
  const { t } = useTranslation();

  const {
    todosByDay,
    loading,
    toggleTodo,
    addTodo,
    deleteTodo,
    undoAllForDay,
  } = useWeeklyTodos();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [todoToDelete, setTodoToDelete] = useState<TodoToDeleteType>({
    dayIndex: null,
    todoId: null,
  });
  const { fadeAnim, onLayout } = useScreenFadeIn(800);

  const getCurrentDayIndex = useCallback((): number => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  }, []);

  useEffect(() => {
    setSelectedDay(getCurrentDayIndex());
  }, [getCurrentDayIndex]);

  const handleAddTodoConfirmed = useCallback(
    (text: string, internalUrls: string[]): void => {
      if (selectedDay !== null) {
        addTodo(selectedDay, text, internalUrls);
      }
      setAddModalVisible(false);
    },
    [addTodo, selectedDay],
  );

  const showDeleteConfirmation = useCallback(
    (dayIndex: number, todoId: number): void => {
      setTodoToDelete({ dayIndex, todoId });
      setDeleteModalVisible(true);
    },
    [],
  );

  const handleConfirmDelete = useCallback(async (): Promise<void> => {
    const { dayIndex, todoId } = todoToDelete;

    if (dayIndex !== null && todoId !== null) {
      await cancelTodoReminderNotification(todoId);
      deleteTodo(dayIndex, todoId);
    }

    setDeleteModalVisible(false);
    setTodoToDelete({ dayIndex: null, todoId: null });
  }, [deleteTodo, todoToDelete]);

  const cancelDelete = useCallback((): void => {
    setDeleteModalVisible(false);
    setTodoToDelete({ dayIndex: null, todoId: null });
  }, []);

  const handleCategoryPress = useCallback(
    (prayerLink: PrayerQuestionLinksType) => {
      router.push(
        prayerLink.value === "Tasbih"
          ? {
              pathname: "/knowledge/prayers/tasbih",
            }
          : prayerLink.value === "Names"
            ? {
                pathname: "/knowledge/prayers/names",
                params: { prayerLink: prayerLink.value },
              }
            : {
                pathname: "/knowledge/prayers/prayerCategory",
                params: { prayerCategory: prayerLink.value },
              },
      );
    },
    [],
  );

  const handleSelectDay = useCallback((dayIndex: number): void => {
    setSelectedDay(dayIndex);
  }, []);

  const openPrayerTimes = async () => {
    await WebBrowser.openBrowserAsync("https://prayertime.ir");
  };

  const { width, height } = useWindowDimensions();
  const { elementSize, fontSize, iconSize } = returnSize(width, height);

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.container,
        { opacity: fadeAnim, backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.categoriesContainer}>
        <View style={styles.categories}>
          {prayerCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                handleCategoryPress(category);
              }}
              style={[
                styles.element,
                {
                  backgroundColor: Colors[colorScheme].contrast,
                  width: elementSize,
                  height: elementSize,
                },
              ]}
            >
              <View
                style={[
                  styles.categoryButtonContainer,
                  { gap: iconSize / 10 - 1 },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { width: iconSize, height: iconSize },
                  ]}
                >
                  <Image
                    style={[styles.elementIcon, { width: iconSize }]}
                    source={category.image}
                    contentFit="contain"
                  />
                </View>
                <View>
                  <ThemedText
                    style={[styles.elementText, { fontSize: fontSize }]}
                  >
                    {t(category.name)}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.bottomCategories}>
          <TouchableOpacity
            onPress={() => {
              handleCategoryPress(tasbihCategory[0]);
            }}
            style={[
              styles.element,
              styles.bottomElement,
              {
                backgroundColor: Colors[colorScheme].contrast,
                height: elementSize / 2,
              },
            ]}
          >
            <View
              style={[
                styles.categoryButtonContainer,
                { gap: iconSize / 10 - 1 },
              ]}
            >
              <View style={styles.tasbihContainer}>
                {/* <Image
                    style={[styles.elementIcon, { width: iconSize / 1.2 }]}
                    source={require("@/assets/images/tasbih.png")}
                    contentFit="contain"
                  /> */}
                <ThemedText
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.bottomElementText,
                    { fontSize: fontSize * 1.15 },
                  ]}
                >
                  {t("tasbih")}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              openPrayerTimes();
            }}
            style={[
              styles.element,
              styles.bottomElement,
              {
                backgroundColor: Colors[colorScheme].contrast,
                height: elementSize / 2,
              },
            ]}
          >
            <View
              style={[
                styles.categoryButtonContainer,
                { gap: iconSize / 10 - 1 },
              ]}
            >
              <View style={styles.tasbihContainer}>
                <ThemedText
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.bottomElementText,
                    { fontSize: fontSize * 1.05, color: "#E8BC14" },
                  ]}
                >
                  {t("prayerTime")}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

        <WeeklyCalendarSection
          todosByDay={todosByDay}
          loading={loading}
          onToggleTodo={toggleTodo}
          onUndoAll={undoAllForDay}
          onShowAddModal={() => setAddModalVisible(true)}
          onShowDeleteModal={showDeleteConfirmation}
          selectedDay={selectedDay}
          currentDayIndex={getCurrentDayIndex()}
          onSelectDay={handleSelectDay}
        />

      {selectedDay !== null && (
        <>
          <AddTodoModal
            visible={addModalVisible}
            onClose={() => setAddModalVisible(false)}
            onAdd={handleAddTodoConfirmed}
            selectedDayName={getFullDayName(selectedDay)}
          />
          <DeleteTodoModal
            visible={deleteModalVisible}
            onClose={cancelDelete}
            onConfirmDelete={handleConfirmDelete}
          />
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    paddingTop: 10,
    paddingBottom: 4,
  },

  categoriesContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 15,
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
    paddingHorizontal: 10,
  },

  bottomCategories: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 25,
    gap: 10,
  },
  element: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    elevation: 5,
  },

  categoryButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.universal.prayerLinks,
  },

  tasbihContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },

  bottomElement: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
  },

  elementIcon: {
    height: "auto",
    aspectRatio: 1.5,
    alignSelf: "center",
  },

  elementText: {
    fontWeight: "bold",
    textAlign: "center",
  },

  bottomElementText: {
    fontWeight: "bold",
    textAlign: "center",
    flexShrink: 1,
  },
});

export default PrayerLinks;
