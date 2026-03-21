// //! Ohne fix für abgeschnittener text und ohne usereducer
// import { Colors } from "@/constants/Colors";
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   useColorScheme,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import i18n from "@/utils/i18n";
// import { ThemedText } from "@/components/ThemedText";
// import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
// import { useLanguage } from "@/contexts/LanguageContext";
// // Make initial Dhikr Types immutable-like for safer resets
// const initialDhikrTypes = Object.freeze([
//   {
//     id: 0,
//     name: "dhikrFree",
//     arabicText: "dhikrFree",
//     defaultLimit: 100,
//   },
//   {
//     id: 1,
//     name: "dhikrSubhanallah",
//     arabicText: "dhikrSubhanallah",
//     defaultLimit: 100,
//   },
//   {
//     id: 2,
//     name: "dhikrAlhamdulillah",
//     arabicText: "dhikrAlhamdulillah",
//     defaultLimit: 100,
//   },
//   {
//     id: 3,
//     name: "dhikrAllahuAkbar",
//     arabicText: "dhikrAllahuAkbar",
//     defaultLimit: 100,
//   },
//   {
//     id: 4,
//     name: "dhikrLaIlahaIllallah",
//     arabicText: "dhikrLaIlahaIllallah",
//     defaultLimit: 100,
//   },
//   {
//     id: 5,
//     name: "dhikrAstaghfirullah",
//     arabicText: "dhikrAstaghfirullah",
//     defaultLimit: 100,
//   },
//   {
//     id: 6,
//     name: "dhikrAstaghfirullahWaAtubuIlaih",
//     arabicText: "dhikrAstaghfirullahWaAtubuIlaih",
//     defaultLimit: 70,
//   },
//   {
//     id: 7,
//     name: "dhikrHadhaMaqam",
//     arabicText: "dhikrHadhaMaqam",
//     defaultLimit: 7,
//   },
//   {
//     id: 8,
//     name: "dhikrAlAfu",
//     arabicText: "dhikrAlAfu",
//     defaultLimit: 300,
//   },
//   {
//     id: 9,
//     name: "dhikrFortyPrayer",
//     arabicText: "dhikrFortyPrayer",
//     defaultLimit: 40,
//   },
// ]);

// // Function to get initial state for counters
// const getInitialCountersState = () =>
//   initialDhikrTypes.map((dhikr) => ({ ...dhikr, count: 0 }));

// // Define prayer presets (using the base dhikr definitions)
// const prayerPresets = Object.freeze([
//   {
//     id: "free",
//     name: "freeMode",
//     description: "freeModeDescription",
//     sequence: [],
//   },
//   {
//     id: "1",
//     name: "TasbihFatima",
//     sequence: [
//       { dhikrId: 3, limit: 34 },
//       { dhikrId: 2, limit: 33 },
//       { dhikrId: 1, limit: 33 },
//     ],
//   },
//   {
//     id: "2",
//     name: "QunutSalatUlWitr",
//     sequence: [
//       { dhikrId: 6, limit: 70 },
//       { dhikrId: 7, limit: 7 },
//       { dhikrId: 8, limit: 300 },
//       { dhikrId: 9, limit: 40 },
//       { dhikrId: 9, limit: 40 },
//       { dhikrId: 9, limit: 40 },
//     ],
//   },
// ]);

// export default function RenderTasbih() {
//   const [counters, setCounters] = useState(getInitialCountersState());
//   const [activeDhikrId, setActiveDhikrId] = useState(initialDhikrTypes[0].id);
//   const [totalDhikr, setTotalDhikr] = useState(0);
//   const [selectedPresetId, setSelectedPresetId] = useState("free");
//   const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
//   const [sequenceCompleted, setSequenceCompleted] = useState(false);
//   const { isArabic } = useLanguage();
//   const rtl = isArabic();

//   // New state for free mode maximum reps
//   const [freeModeMaxRep, setFreeModeMaxRep] = useState(
//     initialDhikrTypes[0].defaultLimit
//   );

//   // --- Derived State and Helpers ---
//   const currentPreset = prayerPresets.find(
//     (preset) => preset.id === selectedPresetId
//   );
//   const isPresetMode =
//     selectedPresetId !== "free" &&
//     currentPreset &&
//     currentPreset.sequence.length > 0;

//   // Determine the ID of the counter that should be acted upon (increment/decrement)
//   const targetCounterId =
//     isPresetMode && !sequenceCompleted
//       ? currentPreset.sequence[currentPresetIndex]?.dhikrId
//       : activeDhikrId;

//   // Find the full data for the counter being displayed/acted upon
//   const activeCounter = useMemo(
//     () => counters.find((counter) => counter.id === targetCounterId),
//     [counters, targetCounterId]
//   );

//   // Determine the correct limit for the current context
//   const getActiveLimit = useCallback(() => {
//     if (
//       isPresetMode &&
//       !sequenceCompleted &&
//       currentPreset.sequence[currentPresetIndex]
//     ) {
//       return currentPreset.sequence[currentPresetIndex].limit;
//     }
//     // In free mode, return the user-defined maximum rep
//     return freeModeMaxRep;
//   }, [
//     isPresetMode,
//     sequenceCompleted,
//     currentPreset,
//     currentPresetIndex,
//     freeModeMaxRep,
//   ]);

//   const activeLimit = getActiveLimit();
//   const isLimitReached = activeCounter && activeCounter.count >= activeLimit;

//   // --- Event Handlers ---

//   const handleIncrement = useCallback(() => {
//     if (
//       !activeCounter ||
//       (isLimitReached && !isPresetMode) ||
//       (isPresetMode && sequenceCompleted)
//     )
//       return;

//     setCounters((prevCounters) =>
//       prevCounters.map((counter) => {
//         if (counter.id === targetCounterId) {
//           if (counter.count < activeLimit) {
//             setTotalDhikr((prev) => prev + 1);
//             return { ...counter, count: counter.count + 1 };
//           }
//         }
//         return counter;
//       })
//     );
//   }, [
//     activeCounter,
//     targetCounterId,
//     activeLimit,
//     isLimitReached,
//     isPresetMode,
//     sequenceCompleted,
//   ]);

//   const handleDecrement = useCallback(() => {
//     if (
//       !activeCounter ||
//       activeCounter.count <= 0 ||
//       (isPresetMode && sequenceCompleted)
//     )
//       return;

//     setCounters((prevCounters) =>
//       prevCounters.map((counter) => {
//         if (counter.id === targetCounterId && counter.count > 0) {
//           setTotalDhikr((prev) => prev - 1);
//           return { ...counter, count: counter.count - 1 };
//         }
//         return counter;
//       })
//     );
//     if (
//       isPresetMode &&
//       sequenceCompleted &&
//       activeCounter.count === activeLimit
//     ) {
//       setSequenceCompleted(false);
//     }
//   }, [
//     activeCounter,
//     targetCounterId,
//     activeLimit,
//     isPresetMode,
//     sequenceCompleted,
//   ]);

//   const handleResetCurrent = useCallback(() => {
//     if (!activeCounter) return;

//     // If using a preset, adjust the sequence state to maintain progression
//     if (isPresetMode) {
//       // If the sequence is complete, or if you want to allow a mid-sequence reset,
//       // reset the progression. Here we’re resetting the entire sequence back to stage 0.
//       if (sequenceCompleted) {
//         setSequenceCompleted(false);
//         setCurrentPresetIndex(0);
//       }
//       // (Optional) If you want to reset subsequent stages’ counts as well,
//       // you can loop over currentPreset.sequence and reset each corresponding counter.
//     }

//     // Reset the active counter regardless of mode
//     setCounters((prevCounters) =>
//       prevCounters.map((counter) => {
//         if (counter.id === activeDhikrId) {
//           setTotalDhikr((prev) => prev - (counter.count || 0));
//           return { ...counter, count: 0 };
//         }
//         return counter;
//       })
//     );
//   }, [activeCounter, activeDhikrId, isPresetMode, sequenceCompleted]);

//   const handleResetAll = useCallback(() => {
//     setCounters(getInitialCountersState());
//     setTotalDhikr(0);
//     setCurrentPresetIndex(0);
//     setSequenceCompleted(false);
//     const preset = prayerPresets.find((p) => p.id === selectedPresetId);
//     if (selectedPresetId !== "free" && preset && preset.sequence.length > 0) {
//       setActiveDhikrId(preset.sequence[0].dhikrId);
//     } else {
//       setActiveDhikrId(initialDhikrTypes[0].id);
//       setSelectedPresetId("free");
//     }
//   }, [selectedPresetId]);

//   const handlePresetChange = useCallback(
//     (presetId: string) => {
//       if (presetId !== selectedPresetId) {
//         setSelectedPresetId(presetId);
//         setCounters(getInitialCountersState());
//         setTotalDhikr(0);
//         setCurrentPresetIndex(0);
//         setSequenceCompleted(false);

//         const newPreset = prayerPresets.find((p) => p.id === presetId);
//         if (
//           presetId === "free" ||
//           !newPreset ||
//           newPreset.sequence.length === 0
//         ) {
//           setActiveDhikrId(initialDhikrTypes[0].id);
//         } else {
//           setActiveDhikrId(newPreset.sequence[0].dhikrId);
//         }
//       }
//     },
//     [selectedPresetId]
//   );

//   // --- Effect for Preset Sequence Progression ---
//   useEffect(() => {
//     if (!isPresetMode || sequenceCompleted) {
//       return;
//     }

//     const currentSequenceItem = currentPreset.sequence[currentPresetIndex];
//     if (!currentSequenceItem) return;

//     setActiveDhikrId(currentSequenceItem.dhikrId);

//     const currentCounter = counters.find(
//       (c) => c.id === currentSequenceItem.dhikrId
//     );

//     if (currentCounter && currentCounter.count >= currentSequenceItem.limit) {
//       if (currentPresetIndex < currentPreset.sequence.length - 1) {
//         const timer = setTimeout(() => {
//           setCurrentPresetIndex((prev) => prev + 1);
//         }, 150);
//         return () => clearTimeout(timer);
//       } else {
//         setSequenceCompleted(true);
//       }
//     }
//   }, [
//     counters,
//     currentPresetIndex,
//     isPresetMode,
//     sequenceCompleted,
//     currentPreset,
//   ]);

//   // --- UI Rendering ---

//   const percentage =
//     activeCounter && activeLimit > 0
//       ? Math.min((activeCounter.count / activeLimit) * 100, 100)
//       : 0;

//   const showTabs = selectedPresetId === "free";

//   const { t } = useTranslation();
//   const colorScheme = useColorScheme() || "light";

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { backgroundColor: Colors[colorScheme].background },
//       ]}
//       edges={["top"]}
//     >
//       <ScrollView
//         style={styles.scrollContainer}
//         contentContainerStyle={{ flexGrow: 1, gap: 10, paddingBottom: 20 }}
//       >
//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <View style={{ alignSelf: "flex-start" }}>
//             <HeaderLeftBackButton />
//           </View>
//           <ThemedText style={styles.headerTitle} type="title">
//             {t("tasbih")}
//           </ThemedText>
//         </View>

//         {/* Prayer Preset Cards */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.cardsContainer}
//           contentContainerStyle={styles.cardsContent}
//           decelerationRate="fast"
//         >
//           {prayerPresets.map((preset) => {
//             const dhikrInfoMap = Object.fromEntries(
//               initialDhikrTypes.map((d) => [d.id, d])
//             );
//             return (
//               <TouchableOpacity
//                 key={preset.id}
//                 style={[
//                   styles.prayerCard,
//                   selectedPresetId === preset.id && styles.selectedPrayerCard,
//                   {
//                     backgroundColor: Colors[colorScheme].contrast,
//                     borderColor: Colors[colorScheme].border,
//                   },
//                 ]}
//                 onPress={() => handlePresetChange(preset.id)}
//               >
//                 <ThemedText style={styles.prayerCardTitle}>
//                   {t(preset.name)}
//                 </ThemedText>
//                 <ThemedText style={styles.prayerCardDescription}>
//                   {t(preset.description || "")}
//                 </ThemedText>

//                 {preset.id !== "free" && (
//                   <View style={styles.prayerCardSequence}>
//                     {preset.sequence.map((item, index) => (
//                       <ThemedText
//                         key={index}
//                         style={styles.prayerCardSequenceItemText}
//                         numberOfLines={1}
//                       >
//                         {item.limit}x{" "}
//                         {dhikrInfoMap[item.dhikrId]
//                           ? t(dhikrInfoMap[item.dhikrId].name)
//                           : ""}
//                       </ThemedText>
//                     ))}
//                   </View>
//                 )}
//               </TouchableOpacity>
//             );
//           })}
//         </ScrollView>

//         {/* Preset Progress Indicator */}
//         {isPresetMode && currentPreset.sequence.length > 0 && (
//           <ScrollView
//             style={styles.presetProgressContainer}
//             contentContainerStyle={{
//               flexGrow: 1,
//               flexDirection: "row",
//               justifyContent: "center",
//             }}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//           >
//             {currentPreset.sequence.map((item, index) => {
//               const dhikrInfo = initialDhikrTypes.find(
//                 (d) => d.id === item.dhikrId
//               );
//               const stepCounter = counters.find((c) => c.id === item.dhikrId);
//               const isStepActive =
//                 index === currentPresetIndex && !sequenceCompleted;
//               const isStepCompleted =
//                 sequenceCompleted ||
//                 index < currentPresetIndex ||
//                 (stepCounter && stepCounter.count >= item.limit);

//               return (
//                 <View
//                   key={`${item.dhikrId}-${index}`}
//                   style={[
//                     styles.presetProgressItem,
//                     {
//                       borderColor: Colors[colorScheme].border,
//                       backgroundColor: Colors.universal.grayedOut,
//                     },
//                     isStepActive && styles.presetProgressItemActive,
//                     isStepCompleted && styles.presetProgressItemCompleted,
//                   ]}
//                 >
//                   <Text style={styles.presetProgressText} numberOfLines={1}>
//                     {isStepActive
//                       ? `${stepCounter?.count ?? 0}/${item.limit} `
//                       : `${item.limit}x `}
//                     {dhikrInfo && t(dhikrInfo.name)}
//                   </Text>
//                 </View>
//               );
//             })}
//           </ScrollView>
//         )}

//         {/* Dhikr Selection Tabs - Only show in free mode */}
//         {showTabs && (
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={styles.tabsContainer}
//             contentContainerStyle={styles.tabsContent}
//           >
//             {initialDhikrTypes.map((dhikr) => {
//               const counterData = counters.find((c) => c.id === dhikr.id);
//               return (
//                 <TouchableOpacity
//                   key={dhikr.id}
//                   style={[
//                     styles.tab,
//                     activeDhikrId === dhikr.id && styles.activeTab,
//                   ]}
//                   onPress={() => setActiveDhikrId(dhikr.id)}
//                 >
//                   <Text
//                     style={[
//                       styles.tabText,
//                       activeDhikrId === dhikr.id && styles.activeTabText,
//                     ]}
//                   >
//                     {t(dhikr.arabicText)}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         )}

//         {/* Maximum Reps Input for Free Mode */}
//         {selectedPresetId === "free" && (
//           <View
//             style={[
//               styles.maxRepContainer,
//               { flexDirection: "row" },
//               rtl && {
//                 flexDirection: "row-reverse",
//               },
//             ]}
//           >
//             <ThemedText style={styles.maxRepLabel}>
//               {t("setMaximumReps")}
//             </ThemedText>
//             <TextInput
//               style={[
//                 styles.maxRepInput,
//                 {
//                   backgroundColor: Colors[colorScheme].contrast,
//                   color: Colors[colorScheme].text,
//                 },
//               ]}
//               value={freeModeMaxRep.toString()}
//               onChangeText={(value) => setFreeModeMaxRep(Number(value) || 0)}
//               keyboardType="numeric"
//             />
//           </View>
//         )}

//         {/* Main Counter Card */}
//         {activeCounter && (
//           <View
//             style={[
//               styles.counterCard,
//               {
//                 backgroundColor: Colors[colorScheme].contrast,
//                 borderColor: Colors[colorScheme].border,
//               },
//             ]}
//           >
//             <View style={styles.progressContainer}>
//               <View
//                 style={[
//                   styles.progressBar,
//                   { width: `${percentage}%` },
//                   percentage >= 100 && !isPresetMode && styles.progressComplete,
//                   isPresetMode &&
//                     sequenceCompleted &&
//                     styles.progressSequenceComplete,
//                 ]}
//               />
//             </View>
//             <ThemedText style={styles.arabicText}>
//               {t(activeCounter.arabicText)}
//             </ThemedText>
//             <ThemedText style={styles.counterText}>
//               {activeCounter.count}
//             </ThemedText>
//             <ThemedText style={styles.limitText}>
//               {isPresetMode && sequenceCompleted
//                 ? "Sequence Complete"
//                 : `${activeCounter.count} / ${activeLimit}`}
//             </ThemedText>
//             {isPresetMode && sequenceCompleted && (
//               <Text
//                 style={[styles.completionText, styles.sequenceCompletionText]}
//               >
//                 {t(currentPreset.name)} {t("completedText")}
//               </Text>
//             )}
//             {isPresetMode &&
//               !sequenceCompleted &&
//               isLimitReached &&
//               currentPresetIndex < currentPreset.sequence.length - 1 && (
//                 <Text style={styles.stepCompletionText}>
//                   {t("stepCompleteNext")}
//                 </Text>
//               )}
//             {!isPresetMode && isLimitReached && (
//               <Text style={styles.completionText}>
//                 {activeCounter.name} {t("completedText")}
//               </Text>
//             )}
//           </View>
//         )}

//         {/* Counter Buttons */}
//         <View style={styles.countButtonsContainer}>
//           <TouchableOpacity
//             style={[
//               styles.decrementButton,
//               ((activeCounter && activeCounter?.count <= 0) ||
//                 (isPresetMode && sequenceCompleted)) &&
//                 styles.disabledButton,
//             ]}
//             onPress={handleDecrement}
//             activeOpacity={0.7}
//             disabled={
//               (activeCounter && activeCounter?.count <= 0) ||
//               (isPresetMode && sequenceCompleted)
//             }
//           >
//             <Text style={styles.decrementButtonText}>-</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.counterButton,
//               ((!isPresetMode && isLimitReached) ||
//                 (isPresetMode && !sequenceCompleted && isLimitReached) ||
//                 (isPresetMode && sequenceCompleted)) &&
//                 styles.disabledButton,
//             ]}
//             onPress={handleIncrement}
//             activeOpacity={0.7}
//             disabled={
//               (!isPresetMode && isLimitReached) ||
//               (isPresetMode && !sequenceCompleted && isLimitReached) ||
//               (isPresetMode && sequenceCompleted)
//             }
//           >
//             <View
//               style={[
//                 styles.counterButtonInner,
//                 ((!isPresetMode && isLimitReached) ||
//                   (isPresetMode && !sequenceCompleted && isLimitReached) ||
//                   (isPresetMode && sequenceCompleted)) && {
//                   backgroundColor: "#55798C",
//                 },
//               ]}
//             >
//               <Text style={styles.counterButtonText}>{t("tap")}</Text>
//             </View>
//           </TouchableOpacity>
//           <View style={{ width: 60, marginRight: 20 }} />
//         </View>

//         {/* Control Buttons */}
//         <View style={styles.controlsContainer}>
//           <TouchableOpacity
//             style={[
//               styles.resetButton,
//               totalDhikr === 0 && styles.disabledButton,
//             ]}
//             onPress={handleResetCurrent}
//             disabled={totalDhikr === 0}
//           >
//             <Text style={styles.resetButtonText}>{t("resetCurrent")}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.resetButton, styles.resetAllButton]}
//             onPress={handleResetAll}
//           >
//             <Text style={styles.resetButtonText}>{t("resetAll")}</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContainer: {
//     paddingBottom: 10,
//   },
//   headerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingBottom: 10,
//     marginTop: 10,
//   },
//   headerTitle: {
//     flex: 1,
//     textAlign: "center",
//   },

//   cardsContainer: {
//     padding: 10,
//   },
//   cardsContent: {
//     paddingRight: 20,
//   },
//   prayerCard: {
//     height: 200,
//     width: 170,
//     borderRadius: 15,
//     padding: 12,
//     marginHorizontal: 8,
//     borderWidth: 0.2,
//     overflow: "visible",
//   },
//   selectedPrayerCard: {
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.5,
//     shadowRadius: 3,
//     elevation: 5,
//     shadowColor: "#000",
//   },
//   prayerCardIcon: {
//     fontSize: 22,
//     marginBottom: 6,
//   },
//   prayerCardTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 4,
//     lineHeight: 25,
//   },
//   prayerCardDescription: {
//     fontSize: 12,
//     marginBottom: 1,
//     flexShrink: 1,
//   },
//   prayerCardSequence: {
//     backgroundColor: "rgba(0,0,0,0.15)",
//     padding: 6,
//     borderRadius: 6,
//     overflow: "hidden",
//     maxHeight: 100,
//   },
//   prayerCardSequenceItemText: {
//     fontSize: 11,
//     marginVertical: 1,
//   },
//   presetProgressContainer: {},
//   presetProgressItem: {
//     flexShrink: 1,
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//     marginHorizontal: 4,
//     borderRadius: 8,
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   presetProgressItemActive: {
//     backgroundColor: Colors.universal.primary,
//   },
//   presetProgressItemCompleted: {
//     backgroundColor: "rgba(102,204,138,1)",
//     borderColor: "rgba(102,204,138,0.6)",
//   },
//   presetProgressText: {
//     color: "#FFFFFF",
//     fontSize: 12,
//     fontWeight: "500",
//     textAlign: "center",
//   },
//   tabsContainer: {
//     flexDirection: "row",
//     maxHeight: 50,
//     marginVertical: 5,
//   },
//   tabsContent: {
//     paddingHorizontal: 10,
//     alignItems: "center",
//   },
//   tab: {
//     paddingHorizontal: 18,
//     paddingVertical: 8,
//     marginHorizontal: 5,
//     borderRadius: 20,
//     backgroundColor: "rgba(102,204,138,1)",
//   },
//   activeTab: {
//     backgroundColor: Colors.universal.primary,
//   },
//   tabText: {
//     fontSize: 13,
//     fontWeight: "500",
//   },
//   activeTabText: {
//     color: "#FFFFFF",
//     fontWeight: "bold",
//   },
//   maxRepContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: 10,
//   },
//   maxRepLabel: {
//     fontSize: 16,
//     marginRight: 8,
//   },
//   maxRepInput: {
//     height: 40,
//     width: 60,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 5,
//     paddingHorizontal: 8,
//     textAlign: "center",
//   },
//   counterCard: {
//     flexGrow: 1,
//     justifyContent: "center",
//     marginHorizontal: 20,
//     marginVertical: 10,
//     padding: 20,
//     borderRadius: 20,
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   progressContainer: {
//     position: "absolute",
//     top: -5,
//     left: 0,
//     right: 0,
//     height: 5,
//     marginHorizontal: 12,
//   },
//   progressBar: {
//     height: "100%",
//     backgroundColor: Colors.universal.primary,
//     borderRadius: 99,
//   },
//   progressComplete: {
//     backgroundColor: "#66CC8A",
//   },
//   progressSequenceComplete: {
//     backgroundColor: "#FFC107",
//   },
//   arabicText: {
//     fontSize: 32,
//     lineHeight: 30,
//     marginBottom: 10,
//     fontWeight: "300",
//     textAlign: "center",
//   },
//   counterText: {
//     fontSize: 72,
//     fontWeight: "bold",
//     lineHeight: 80,
//   },
//   limitText: {
//     fontSize: 16,
//     color: "#888",
//     marginTop: 8,
//   },
//   completionText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginTop: 12,
//     textAlign: "center",
//   },
//   sequenceCompletionText: {
//     color: "#FFC107",
//   },
//   stepCompletionText: {
//     color: Colors.universal.primary,
//     fontSize: 14,
//     fontWeight: "normal",
//     marginTop: 10,
//   },
//   countButtonsContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 200,
//     marginVertical: 15,
//   },
//   counterButton: {
//     width: 140,
//     height: 140,
//     borderRadius: 70,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     marginHorizontal: 15,
//   },
//   counterButtonInner: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: Colors.universal.primary,
//   },
//   counterButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   decrementButton: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(239, 83, 80, 1)",
//     borderWidth: 1,
//     borderColor: "rgba(239, 83, 80, 0.5)",
//     marginRight: 20,
//   },
//   decrementButtonText: {
//     color: "#FFFFFF",
//     fontSize: 30,
//     fontWeight: "bold",
//     lineHeight: 32,
//   },
//   disabledButton: {
//     opacity: 0.4,
//   },
//   controlsContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 10,
//     paddingBottom: 10,
//   },
//   resetButton: {
//     backgroundColor: Colors.universal.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderRadius: 10,
//     marginHorizontal: 8,
//   },
//   resetAllButton: {
//     backgroundColor: "rgba(239, 83, 80, 1)",
//   },
//   resetButtonText: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "600",
//   },

//   totalCount: {
//     fontSize: 22,
//     fontWeight: "bold",
//   },
// });

//! Mit useReducer
import { Colors } from "@/constants/Colors";
import React, { useEffect, useCallback, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { ThemedText } from "@/components/ThemedText";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { useLanguage } from "../../contexts/LanguageContext";

/* ---------- Static data ---------- */
const initialDhikrTypes = Object.freeze([
  { id: 0, name: "dhikrFree", arabicText: "dhikrFree", defaultLimit: 100 },
  {
    id: 1,
    name: "dhikrSubhanallah",
    arabicText: "dhikrSubhanallah",
    defaultLimit: 100,
  },
  {
    id: 2,
    name: "dhikrAlhamdulillah",
    arabicText: "dhikrAlhamdulillah",
    defaultLimit: 100,
  },
  {
    id: 3,
    name: "dhikrAllahuAkbar",
    arabicText: "dhikrAllahuAkbar",
    defaultLimit: 100,
  },
  {
    id: 4,
    name: "dhikrLaIlahaIllallah",
    arabicText: "dhikrLaIlahaIllallah",
    defaultLimit: 100,
  },
  {
    id: 5,
    name: "dhikrAstaghfirullah",
    arabicText: "dhikrAstaghfirullah",
    defaultLimit: 100,
  },
  {
    id: 6,
    name: "dhikrAstaghfirullahWaAtubuIlaih",
    arabicText: "dhikrAstaghfirullahWaAtubuIlaih",
    defaultLimit: 70,
  },
  {
    id: 7,
    name: "dhikrHadhaMaqam",
    arabicText: "dhikrHadhaMaqam",
    defaultLimit: 7,
  },
  { id: 8, name: "dhikrAlAfu", arabicText: "dhikrAlAfu", defaultLimit: 300 },
  {
    id: 9,
    name: "dhikrFortyPrayer",
    arabicText: "dhikrFortyPrayer",
    defaultLimit: 40,
  },
]);

const getInitialCountersState = () =>
  initialDhikrTypes.map((d) => ({ ...d, count: 0 }));

const prayerPresets = Object.freeze([
  {
    id: "free",
    name: "freeMode",
    description: "freeModeDescription",
    sequence: [] as { dhikrId: number; limit: number }[],
  },
  {
    id: "1",
    name: "TasbihFatima",
    sequence: [
      { dhikrId: 3, limit: 34 },
      { dhikrId: 2, limit: 33 },
      { dhikrId: 1, limit: 33 },
    ],
  },
  {
    id: "2",
    name: "QunutSalatUlWitr",
    sequence: [
      { dhikrId: 6, limit: 70 },
      { dhikrId: 7, limit: 7 },
      { dhikrId: 8, limit: 300 },
      { dhikrId: 9, limit: 40 },
      { dhikrId: 9, limit: 40 },
      { dhikrId: 9, limit: 40 },
    ],
  },
]);

/* ---------- Reducer ---------- */
type Counter = ReturnType<typeof getInitialCountersState>[number];

type State = {
  counters: Counter[];
  activeDhikrId: number;
  totalDhikr: number;
  selectedPresetId: string; // "free" or preset id
  currentPresetIndex: number; // step in sequence
  sequenceCompleted: boolean;
  freeModeMaxRep: number;
};

type IncrementPayload = {
  targetId: number;
  activeLimit: number;
  isPresetMode: boolean;
  sequenceCompleted: boolean;
};

type DecrementPayload = {
  targetId: number;
  activeLimit: number;
  isPresetMode: boolean;
  sequenceCompleted: boolean;
};

type ResetCurrentPayload = {
  targetId: number;
  isPresetMode: boolean;
  sequenceCompleted: boolean;
};

type SetPresetPayload = { presetId: string };
type SetActiveDhikrPayload = { id: number };
type SetFreeMaxRepPayload = { value: number };
type AdvanceSequencePayload = { totalSteps: number }; // from current preset length

type Action =
  | { type: "INCREMENT"; payload: IncrementPayload }
  | { type: "DECREMENT"; payload: DecrementPayload }
  | { type: "RESET_CURRENT"; payload: ResetCurrentPayload }
  | { type: "RESET_ALL" }
  | { type: "SET_PRESET"; payload: SetPresetPayload }
  | { type: "SET_ACTIVE_DHIKR"; payload: SetActiveDhikrPayload }
  | { type: "SET_FREE_MAX_REP"; payload: SetFreeMaxRepPayload }
  | { type: "ADVANCE_SEQUENCE"; payload: AdvanceSequencePayload }
  | { type: "MARK_SEQUENCE_COMPLETE" };

const initialState: State = {
  counters: getInitialCountersState(),
  activeDhikrId: initialDhikrTypes[0].id,
  totalDhikr: 0,
  selectedPresetId: "free",
  currentPresetIndex: 0,
  sequenceCompleted: false,
  freeModeMaxRep: initialDhikrTypes[0].defaultLimit,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INCREMENT": {
      const { targetId, activeLimit, isPresetMode, sequenceCompleted } =
        action.payload;
      if (sequenceCompleted && isPresetMode) return state;

      const idx = state.counters.findIndex((c) => c.id === targetId);
      if (idx < 0) return state;

      const c = state.counters[idx];
      if (c.count >= activeLimit) return state;

      const counters = state.counters.slice();
      counters[idx] = { ...c, count: c.count + 1 };

      return {
        ...state,
        counters,
        totalDhikr: state.totalDhikr + 1,
      };
    }

    case "DECREMENT": {
      const { targetId, isPresetMode, sequenceCompleted, activeLimit } =
        action.payload;
      const idx = state.counters.findIndex((c) => c.id === targetId);
      if (idx < 0) return state;

      const c = state.counters[idx];
      if (c.count <= 0) return state;

      const counters = state.counters.slice();
      counters[idx] = { ...c, count: c.count - 1 };

      // If preset is completed and user starts decrementing the last step at its limit,
      // unlock the sequence again (mirror of your original logic)
      const shouldUncomplete =
        isPresetMode && sequenceCompleted && c.count === activeLimit;

      return {
        ...state,
        counters,
        totalDhikr: state.totalDhikr - 1,
        sequenceCompleted: shouldUncomplete ? false : state.sequenceCompleted,
      };
    }

    case "RESET_CURRENT": {
      const { targetId, isPresetMode, sequenceCompleted } = action.payload;
      const idx = state.counters.findIndex((c) => c.id === targetId);
      if (idx < 0) return state;

      const current = state.counters[idx];
      const counters = state.counters.slice();
      counters[idx] = { ...current, count: 0 };

      const refund = current.count || 0;

      // If sequence was completed, reset it to the beginning
      return {
        ...state,
        counters,
        totalDhikr: Math.max(0, state.totalDhikr - refund),
        currentPresetIndex:
          isPresetMode && sequenceCompleted ? 0 : state.currentPresetIndex,
        sequenceCompleted: isPresetMode ? false : state.sequenceCompleted,
      };
    }

    case "RESET_ALL": {
      const preset = prayerPresets.find((p) => p.id === state.selectedPresetId);
      const nextActive =
        state.selectedPresetId !== "free" &&
        preset &&
        preset.sequence.length > 0
          ? preset.sequence[0].dhikrId
          : initialDhikrTypes[0].id;

      return {
        ...state,
        counters: getInitialCountersState(),
        totalDhikr: 0,
        currentPresetIndex: 0,
        sequenceCompleted: false,
        selectedPresetId:
          state.selectedPresetId === "free" ? "free" : state.selectedPresetId,
        activeDhikrId: nextActive,
      };
    }

    case "SET_PRESET": {
      const { presetId } = action.payload;
      const newPreset = prayerPresets.find((p) => p.id === presetId);
      const nextActive =
        presetId === "free" || !newPreset || newPreset.sequence.length === 0
          ? initialDhikrTypes[0].id
          : newPreset.sequence[0].dhikrId;

      return {
        ...state,
        selectedPresetId: presetId,
        counters: getInitialCountersState(),
        totalDhikr: 0,
        currentPresetIndex: 0,
        sequenceCompleted: false,
        activeDhikrId: nextActive,
      };
    }

    case "SET_ACTIVE_DHIKR": {
      return { ...state, activeDhikrId: action.payload.id };
    }

    case "SET_FREE_MAX_REP": {
      const value = Math.max(0, Math.floor(action.payload.value || 0));
      return { ...state, freeModeMaxRep: value };
    }

    case "ADVANCE_SEQUENCE": {
      const { totalSteps } = action.payload;
      const nextIndex = state.currentPresetIndex + 1;
      if (nextIndex < totalSteps) {
        return { ...state, currentPresetIndex: nextIndex };
      } else {
        return { ...state, sequenceCompleted: true };
      }
    }

    case "MARK_SEQUENCE_COMPLETE": {
      return { ...state, sequenceCompleted: true };
    }

    default:
      return state;
  }
}

/* ---------- Component ---------- */
export default function RenderTasbih() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { rtl } = useLanguage();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";

  const currentPreset = useMemo(
    () =>
      prayerPresets.find((p) => p.id === state.selectedPresetId) ??
      prayerPresets[0],
    [state.selectedPresetId]
  );

  const isPresetMode =
    state.selectedPresetId !== "free" &&
    currentPreset &&
    currentPreset.sequence.length > 0;

  const targetCounterId =
    isPresetMode && !state.sequenceCompleted
      ? currentPreset.sequence[state.currentPresetIndex]?.dhikrId
      : state.activeDhikrId;

  const activeCounter = useMemo(
    () => state.counters.find((c) => c.id === targetCounterId),
    [state.counters, targetCounterId]
  );

  const activeLimit = useMemo(() => {
    if (
      isPresetMode &&
      !state.sequenceCompleted &&
      currentPreset.sequence[state.currentPresetIndex]
    ) {
      return currentPreset.sequence[state.currentPresetIndex].limit;
    }
    return state.freeModeMaxRep;
  }, [
    isPresetMode,
    state.sequenceCompleted,
    currentPreset,
    state.currentPresetIndex,
    state.freeModeMaxRep,
  ]);

  const isLimitReached = !!activeCounter && activeCounter.count >= activeLimit;

  /* ---------- Handlers (dispatch only) ---------- */
  const handleIncrement = useCallback(() => {
    if (!activeCounter) return;
    dispatch({
      type: "INCREMENT",
      payload: {
        targetId: targetCounterId,
        activeLimit,
        isPresetMode,
        sequenceCompleted: state.sequenceCompleted,
      },
    });
  }, [
    activeCounter,
    targetCounterId,
    activeLimit,
    isPresetMode,
    state.sequenceCompleted,
  ]);

  const handleDecrement = useCallback(() => {
    if (!activeCounter) return;
    dispatch({
      type: "DECREMENT",
      payload: {
        targetId: targetCounterId,
        activeLimit,
        isPresetMode,
        sequenceCompleted: state.sequenceCompleted,
      },
    });
  }, [
    activeCounter,
    targetCounterId,
    activeLimit,
    isPresetMode,
    state.sequenceCompleted,
  ]);

  const handleResetCurrent = useCallback(() => {
    if (!activeCounter) return;
    dispatch({
      type: "RESET_CURRENT",
      payload: {
        targetId: state.activeDhikrId, // mirrors original behavior
        isPresetMode,
        sequenceCompleted: state.sequenceCompleted,
      },
    });
  }, [
    activeCounter,
    state.activeDhikrId,
    isPresetMode,
    state.sequenceCompleted,
  ]);

  const handleResetAll = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, []);

  const handlePresetChange = useCallback(
    (presetId: string) => {
      if (presetId !== state.selectedPresetId) {
        dispatch({ type: "SET_PRESET", payload: { presetId } });
      }
    },
    [state.selectedPresetId]
  );

  /* ---------- Sequence progression effect (same UX) ---------- */
  useEffect(() => {
    if (!isPresetMode || state.sequenceCompleted) return;

    const step = currentPreset.sequence[state.currentPresetIndex];
    if (!step) return;

    const stepCounter = state.counters.find((c) => c.id === step.dhikrId);
    if (stepCounter && stepCounter.count >= step.limit) {
      if (state.currentPresetIndex < currentPreset.sequence.length - 1) {
        const timer = setTimeout(() => {
          dispatch({
            type: "ADVANCE_SEQUENCE",
            payload: { totalSteps: currentPreset.sequence.length },
          });
        }, 150);
        return () => clearTimeout(timer);
      } else {
        dispatch({ type: "MARK_SEQUENCE_COMPLETE" });
      }
    }
  }, [
    isPresetMode,
    state.sequenceCompleted,
    state.currentPresetIndex,
    state.counters,
    currentPreset,
  ]);

  /* ---------- Derived UI values ---------- */
  const percentage =
    activeCounter && activeLimit > 0
      ? Math.min((activeCounter.count / activeLimit) * 100, 100)
      : 0;

  const showTabs = state.selectedPresetId === "free";

  /* ---------- Render ---------- */
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ flexGrow: 1, gap: 10, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={{ alignSelf: "flex-start" }}>
            <HeaderLeftBackButton />
          </View>
          <ThemedText style={styles.headerTitle} type="title">
            {t("tasbih")}
          </ThemedText>
        </View>

        {/* Prayer Preset Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.cardsContainer}
          contentContainerStyle={styles.cardsContent}
          decelerationRate="fast"
        >
          {prayerPresets.map((preset) => {
            const dhikrInfoMap = Object.fromEntries(
              initialDhikrTypes.map((d) => [d.id, d])
            );
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.prayerCard,
                  state.selectedPresetId === preset.id &&
                    styles.selectedPrayerCard,
                  {
                    backgroundColor: Colors[colorScheme].contrast,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
                onPress={() => handlePresetChange(preset.id)}
              >
                <ThemedText style={styles.prayerCardTitle}>
                  {t(preset.name)}
                </ThemedText>
                <ThemedText style={styles.prayerCardDescription}>
                  {t(preset.description || "")}
                </ThemedText>

                {preset.id !== "free" && (
                  <View style={styles.prayerCardSequence}>
                    {preset.sequence.map((item, index) => (
                      <ThemedText
                        key={index}
                        style={styles.prayerCardSequenceItemText}
                        numberOfLines={1}
                      >
                        {item.limit}x{" "}
                        {dhikrInfoMap[item.dhikrId]
                          ? t(dhikrInfoMap[item.dhikrId].name)
                          : ""}
                      </ThemedText>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Preset Progress Indicator */}
        {isPresetMode && currentPreset.sequence.length > 0 && (
          <ScrollView
            style={styles.presetProgressContainer}
            contentContainerStyle={{
              flexGrow: 1,
              flexDirection: "row",
              justifyContent: "center",
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {currentPreset.sequence.map((item, index) => {
              const dhikrInfo = initialDhikrTypes.find(
                (d) => d.id === item.dhikrId
              );
              const stepCounter = state.counters.find(
                (c) => c.id === item.dhikrId
              );
              const isStepActive =
                index === state.currentPresetIndex && !state.sequenceCompleted;
              const isStepCompleted =
                state.sequenceCompleted ||
                index < state.currentPresetIndex ||
                (stepCounter && stepCounter.count >= item.limit);

              return (
                <View
                  key={`${item.dhikrId}-${index}`}
                  style={[
                    styles.presetProgressItem,
                    {
                      borderColor: Colors[colorScheme].border,
                      backgroundColor: Colors.universal.grayedOut,
                    },
                    isStepActive && styles.presetProgressItemActive,
                    isStepCompleted && styles.presetProgressItemCompleted,
                  ]}
                >
                  <Text style={styles.presetProgressText} numberOfLines={1}>
                    {isStepActive
                      ? `${stepCounter?.count ?? 0}/${item.limit} `
                      : `${item.limit}x `}
                    {dhikrInfo && t(dhikrInfo.name)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Dhikr Selection Tabs - Only show in free mode */}
        {showTabs && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {initialDhikrTypes.map((dhikr) => {
              // const counterData = state.counters.find((c) => c.id === dhikr.id);
              return (
                <TouchableOpacity
                  key={dhikr.id}
                  style={[
                    styles.tab,
                    state.activeDhikrId === dhikr.id && styles.activeTab,
                  ]}
                  onPress={() =>
                    dispatch({
                      type: "SET_ACTIVE_DHIKR",
                      payload: { id: dhikr.id },
                    })
                  }
                >
                  <Text
                    style={[
                      styles.tabText,
                      state.activeDhikrId === dhikr.id && styles.activeTabText,
                    ]}
                  >
                    {t(dhikr.arabicText)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Maximum Reps Input for Free Mode */}
        {state.selectedPresetId === "free" && (
          <View
            style={[
              styles.maxRepContainer,
              { flexDirection: "row" },
              rtl && { flexDirection: "row-reverse" },
            ]}
          >
            <ThemedText style={styles.maxRepLabel}>
              {t("setMaximumReps")}
            </ThemedText>
            <TextInput
              style={[
                styles.maxRepInput,
                {
                  backgroundColor: Colors[colorScheme].contrast,
                  color: Colors[colorScheme].text,
                },
              ]}
              value={state.freeModeMaxRep.toString()}
              onChangeText={(value) =>
                dispatch({
                  type: "SET_FREE_MAX_REP",
                  payload: { value: Number(value) || 0 },
                })
              }
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Main Counter Card */}
        {activeCounter && (
          <View
            style={[
              styles.counterCard,
              {
                backgroundColor: Colors[colorScheme].contrast,
                borderColor: Colors[colorScheme].border,
              },
            ]}
          >
            <ThemedText style={styles.arabicText}>
              {t(activeCounter.arabicText)}
            </ThemedText>
            {/* Circular progress ring around count */}
            <View style={styles.circleContainer}>
              {(() => {
                const size = 180;
                const strokeWidth = 10;
                const radius = (size - strokeWidth) / 2;
                const circumference = 2 * Math.PI * radius;
                const clampedPct = Math.min(percentage, 100);
                const strokeDashoffset =
                  circumference - (clampedPct / 100) * circumference;
                const ringColor =
                  percentage >= 100 && !isPresetMode
                    ? "#66CC8A"
                    : isPresetMode && state.sequenceCompleted
                    ? "#FFC107"
                    : Colors.universal.primary;
                return (
                  <>
                    <Svg width={size} height={size} style={styles.circleSvg}>
                      {/* Track */}
                      <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={Colors[colorScheme].border}
                        strokeWidth={strokeWidth}
                        fill="none"
                      />
                      {/* Progress */}
                      <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={ringColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                      />
                    </Svg>
                    <View style={styles.circleInner}>
                      <ThemedText style={styles.counterText}>
                        {activeCounter.count}
                      </ThemedText>
                      <ThemedText style={styles.limitText}>
                        {isPresetMode && state.sequenceCompleted
                          ? "✓"
                          : `/ ${activeLimit}`}
                      </ThemedText>
                    </View>
                  </>
                );
              })()}
            </View>
            {isPresetMode && state.sequenceCompleted && (
              <Text
                style={[styles.completionText, styles.sequenceCompletionText]}
              >
                {t(currentPreset.name)} {t("completedText")}
              </Text>
            )}
            {isPresetMode &&
              !state.sequenceCompleted &&
              isLimitReached &&
              state.currentPresetIndex < currentPreset.sequence.length - 1 && (
                <Text style={styles.stepCompletionText}>
                  {t("stepCompleteNext")}
                </Text>
              )}
            {!isPresetMode && isLimitReached && (
              <Text style={styles.completionText}>
                {t("completedText").toUpperCase()}
              </Text>
            )}
          </View>
        )}

        {/* Counter Buttons */}
        <View style={styles.countButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.decrementButton,
              ((activeCounter && activeCounter?.count <= 0) ||
                (isPresetMode && state.sequenceCompleted)) &&
                styles.disabledButton,
            ]}
            onPress={handleDecrement}
            activeOpacity={0.7}
            disabled={
              (activeCounter && activeCounter?.count <= 0) ||
              (isPresetMode && state.sequenceCompleted)
            }
          >
            <Text style={styles.decrementButtonText}>-</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.counterButton,
              ((!isPresetMode && isLimitReached) ||
                (isPresetMode && !state.sequenceCompleted && isLimitReached) ||
                (isPresetMode && state.sequenceCompleted)) &&
                styles.disabledButton,
            ]}
            onPress={handleIncrement}
            activeOpacity={0.7}
            disabled={
              (!isPresetMode && isLimitReached) ||
              (isPresetMode && !state.sequenceCompleted && isLimitReached) ||
              (isPresetMode && state.sequenceCompleted)
            }
          >
            <View
              style={[
                styles.counterButtonInner,
                ((!isPresetMode && isLimitReached) ||
                  (isPresetMode &&
                    !state.sequenceCompleted &&
                    isLimitReached) ||
                  (isPresetMode && state.sequenceCompleted)) && {
                  backgroundColor: "#55798C",
                },
              ]}
            >
              <Text style={styles.counterButtonText}>{t("tap")}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ width: 60, marginRight: 20 }} />
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.resetButton,
              state.totalDhikr === 0 && styles.disabledButton,
            ]}
            onPress={handleResetCurrent}
            disabled={state.totalDhikr === 0}
          >
            <Text style={styles.resetButtonText}>{t("resetCurrent")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, styles.resetAllButton]}
            onPress={handleResetAll}
          >
            <Text style={styles.resetButtonText}>{t("resetAll")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Styles (unchanged) ---------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: 10 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 10,
  },
  headerTitle: { flex: 1, textAlign: "center" },
  cardsContainer: { padding: 10 },
  cardsContent: { paddingRight: 20 },
  prayerCard: {
    height: 200,
    width: 170,
    borderRadius: 15,
    padding: 12,
    marginHorizontal: 8,
    borderWidth: 0.2,
    overflow: "visible",
  },
  selectedPrayerCard: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
    shadowColor: "#000",
  },
  prayerCardIcon: { fontSize: 22, marginBottom: 6 },
  prayerCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    lineHeight: 25,
  },
  prayerCardDescription: {
    fontSize: 12,
    marginBottom: 1,
    flexShrink: 1,
  },
  prayerCardSequence: {
    backgroundColor: "rgba(0,0,0,0.15)",
    padding: 6,
    borderRadius: 6,
    overflow: "hidden",
    maxHeight: 100,
    gap: 5,
  },
  prayerCardSequenceItemText: {
    fontSize: 11,
    marginVertical: 1,
    fontWeight: "500",
  },
  presetProgressContainer: {},
  presetProgressItem: {
    flexShrink: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  presetProgressItemActive: { backgroundColor: Colors.universal.primary },
  presetProgressItemCompleted: {
    backgroundColor: "rgba(102,204,138,1)",
    borderColor: "rgba(102,204,138,0.6)",
  },
  presetProgressText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  tabsContainer: { flexDirection: "row", maxHeight: 50, marginVertical: 5 },
  tabsContent: { paddingHorizontal: 10, alignItems: "center" },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "rgba(102,204,138,1)",
  },
  activeTab: { backgroundColor: Colors.universal.primary },
  tabText: { fontSize: 13, fontWeight: "500" },
  activeTabText: { color: "#FFFFFF", fontWeight: "bold" },
  maxRepContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  maxRepLabel: { fontSize: 16, marginRight: 8 },
  maxRepInput: {
    height: 40,
    width: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  counterCard: {
    flexGrow: 1,
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  arabicText: {
    fontSize: 32,
    lineHeight: 30,
    marginBottom: 10,
    fontWeight: "300",
    textAlign: "center",
  },
  circleContainer: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  circleSvg: {
    position: "absolute",
  },
  circleInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: { fontSize: 64, fontWeight: "bold", lineHeight: 72 },
  limitText: { fontSize: 14, color: "#888" },
  completionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  sequenceCompletionText: { color: "#FFC107" },
  stepCompletionText: {
    color: Colors.universal.primary,
    fontSize: 14,
    fontWeight: "normal",
    marginTop: 10,
  },
  countButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 200,
    marginVertical: 15,
  },
  counterButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 15,
  },
  counterButtonInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.universal.primary,
  },
  counterButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  decrementButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(239, 83, 80, 1)",
    borderWidth: 1,
    borderColor: "rgba(239, 83, 80, 0.5)",
    marginRight: 20,
  },
  decrementButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    lineHeight: 32,
  },
  disabledButton: { opacity: 0.4 },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    paddingBottom: 10,
  },
  resetButton: {
    backgroundColor: Colors.universal.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  resetAllButton: { backgroundColor: "rgba(239, 83, 80, 1)" },
  resetButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  totalCount: { fontSize: 22, fontWeight: "bold" },
});
