import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LanguageSelection from "./LanguageSelectionScreen";

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  topics: string[];
  authors: string[];
  selectedTopic: string | null;
  selectedAuthor: string | null;
  onSelectTopic: (topic: string | null) => void;
  onSelectAuthor: (author: string | null) => void;
};

export default function FilterModal({
  visible,
  onClose,
  topics,
  authors,
  selectedTopic,
  selectedAuthor,
  onSelectTopic,
  onSelectAuthor,
}: FilterModalProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["75%", "90%"], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present({ snapIndex: 0 });
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const hasActiveFilters = selectedTopic !== null || selectedAuthor !== null;

  const panelBg = isDark ? "#1e2a3a" : "#ffffff";
  const sectionLabelColor = isDark ? "#8899aa" : "#888";
  const chipBg = isDark ? "#2a3a4e" : "#f0f2f5";
  const chipBorder = isDark ? "#3a4e63" : "#e0e4ea";
  const activeBg = Colors.universal.primary;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: panelBg }}
      handleIndicatorStyle={{ backgroundColor: isDark ? "#4a5a6e" : "#dde0e6" }}
    >
      {/* Header */}
      <View style={styles.panelHeader}>
        <View style={styles.panelTitleRow}>
          <Ionicons
            name="options-outline"
            size={20}
            color={Colors.universal.primary}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[styles.panelTitle, { color: isDark ? "#fff" : "#111" }]}
          >
            Filter
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons
            name="close"
            size={22}
            color={isDark ? "#8899aa" : "#666"}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: isDark ? "#2d3d50" : "#f0f2f5" },
        ]}
      />

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        {/* Topics section */}
        {topics.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>
              {t("allTopics")
                .replace("Alle ", "")
                .replace("All ", "")
                .toUpperCase()}
            </Text>
            <View style={styles.chipsWrap}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  { backgroundColor: chipBg, borderColor: chipBorder },
                  !selectedTopic && {
                    backgroundColor: activeBg,
                    borderColor: activeBg,
                  },
                ]}
                onPress={() => onSelectTopic(null)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isDark ? "#ccd6e0" : "#444" },
                    !selectedTopic && styles.chipTextActive,
                  ]}
                >
                  {t("allTopics")}
                </Text>
              </TouchableOpacity>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={[
                    styles.chip,
                    { backgroundColor: chipBg, borderColor: chipBorder },
                    selectedTopic === topic && {
                      backgroundColor: activeBg,
                      borderColor: activeBg,
                    },
                  ]}
                  onPress={() =>
                    onSelectTopic(selectedTopic === topic ? null : topic)
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isDark ? "#ccd6e0" : "#444" },
                      selectedTopic === topic && styles.chipTextActive,
                    ]}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Authors section */}
        {authors.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>
              {t("allAuthors")
                .replace("Alle ", "")
                .replace("All ", "")
                .toUpperCase()}
            </Text>
            <View style={styles.chipsWrap}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  { backgroundColor: chipBg, borderColor: chipBorder },
                  !selectedAuthor && {
                    backgroundColor: activeBg,
                    borderColor: activeBg,
                  },
                ]}
                onPress={() => onSelectAuthor(null)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isDark ? "#ccd6e0" : "#444" },
                    !selectedAuthor && styles.chipTextActive,
                  ]}
                >
                  {t("allAuthors")}
                </Text>
              </TouchableOpacity>
              {authors.map((author) => (
                <TouchableOpacity
                  key={author}
                  style={[
                    styles.chip,
                    { backgroundColor: chipBg, borderColor: chipBorder },
                    selectedAuthor === author && {
                      backgroundColor: activeBg,
                      borderColor: activeBg,
                    },
                  ]}
                  onPress={() =>
                    onSelectAuthor(selectedAuthor === author ? null : author)
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isDark ? "#ccd6e0" : "#444" },
                      selectedAuthor === author && styles.chipTextActive,
                    ]}
                  >
                    {author}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Language selector */}
        
        {/* Clear button */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              onSelectTopic(null);
              onSelectAuthor(null);
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={15}
              color={Colors.universal.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.clearBtnText}>Filter zurücksetzen</Text>
          </TouchableOpacity>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  panelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.universal.primary,
    marginTop: 8,
  },
  clearBtnText: {
    color: Colors.universal.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
