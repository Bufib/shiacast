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
    [state.selectedPresetId],
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
    [state.counters, targetCounterId],
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
    [state.selectedPresetId],
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
              initialDhikrTypes.map((d) => [d.id, d]),
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
                (d) => d.id === item.dhikrId,
              );
              const stepCounter = state.counters.find(
                (c) => c.id === item.dhikrId,
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
                        stroke={
                          colorScheme === "dark"
                            ? Colors[colorScheme].background
                            : "#666"
                        }
                        strokeWidth={10}
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
