import React from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import {
  comparePairs,
  longVowels,
  shortVowels,
} from "../../../utils/arabicCurriculum";
import { SectionItem } from "@/constants/Types";

export default function Level1_1() {
  const colorScheme = useColorScheme() || "light";

  const sections: SectionItem[] = [
    { type: "intro" },
    { type: "shortTitle" },
    ...shortVowels.map((item): SectionItem => ({ type: "shortCard", ...item })),
    { type: "longTitle" },
    ...longVowels.map((item): SectionItem => ({ type: "longCard", ...item })),
    { type: "compareTitle" },
    ...comparePairs.map(
      (item): SectionItem => ({ type: "compareCard", ...item }),
    ),
    { type: "exercise" },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      edges={["top"]}
    >
      <FlatList
        data={sections}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <View style={styles.headerRow}>
              <HeaderLeftBackButton size={30} color={Colors.universal.link} />
              <Text
                style={[
                  styles.headerTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Lange und kurze Vokale
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === "intro") {
            return (
              <View style={{ gap: 10 }}>
                <ThemedView
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: Colors[colorScheme].contrast,
                      borderColor: Colors[colorScheme].border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionText,
                      {
                        color: Colors[colorScheme].text,
                        fontSize: 18,
                        lineHeight: 18 * 1.7,
                      },
                    ]}
                  >
                    Im Arabischen gibt es kurze und lange Vokale. Die kurzen
                    Vokale sind kleine Zeichen. Die langen Vokale werden mit
                    Buchstaben geschrieben und länger gesprochen.
                  </Text>
                </ThemedView>
                <ThemedView
                  style={[
                    styles.heroBox,
                    {
                      backgroundColor: Colors[colorScheme].contrast,
                      borderColor: Colors[colorScheme].border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.heroTitle,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    So hörst du den Unterschied
                  </Text>
                  <Text
                    style={[
                      styles.heroText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Kurze Vokale werden kurz gesprochen. Lange Vokale klingen
                    ähnlich, aber werden länger gezogen.
                  </Text>
                  <Text
                    style={[
                      styles.heroExample,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    ba → kurz{"\n"}bā → lang
                  </Text>
                </ThemedView>
              </View>
            );
          }

          if (item.type === "shortTitle") {
            return (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Kurze Vokale
              </Text>
            );
          }

          if (item.type === "longTitle") {
            return (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Lange Vokale
              </Text>
            );
          }

          if (item.type === "compareTitle") {
            return (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Direkt vergleichen
              </Text>
            );
          }

          if (item.type === "exercise") {
            return (
              <ThemedView
                style={[
                  styles.exerciseBox,
                  {
                    backgroundColor: Colors[colorScheme].contrast,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.exerciseTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Mini-Übung
                </Text>
                <Text
                  style={[
                    styles.sectionText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Lies laut:
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  بَ / بَا
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  بِ / بِي
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  بُ / بُو
                </Text>
                <Text
                  style={[
                    styles.sectionText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Frage dich: Ist der Laut kurz oder lang?
                </Text>
              </ThemedView>
            );
          }

          if (item.type === "shortCard" || item.type === "longCard") {
            return (
              <ThemedView
                style={[
                  styles.vowelCard,
                  {
                    backgroundColor: Colors[colorScheme].contrast,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.arabicBig,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {item.arabic}
                </Text>
                <Text
                  style={[
                    styles.latinText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {item.latin}
                </Text>
                <Text
                  style={[
                    styles.labelText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {item.label}
                </Text>
              </ThemedView>
            );
          }

          if (item.type === "compareCard") {
            return (
              <ThemedView
                style={[
                  styles.compareCard,
                  {
                    backgroundColor: Colors[colorScheme].contrast,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
              >
                <View style={styles.compareSide}>
                  <Text
                    style={[
                      styles.compareLabel,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    kurz
                  </Text>
                  <Text
                    style={[
                      styles.arabicBig,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {item.short}
                  </Text>
                  <Text
                    style={[
                      styles.latinText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {item.shortLatin}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.compareVs,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  vs
                </Text>

                <View style={styles.compareSide}>
                  <Text
                    style={[
                      styles.compareLabel,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    lang
                  </Text>
                  <Text
                    style={[
                      styles.arabicBig,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {item.long}
                  </Text>
                  <Text
                    style={[
                      styles.latinText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {item.longLatin}
                  </Text>
                </View>
              </ThemedView>
            );
          }

          return null;
        }}
        ListFooterComponent={
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.button, styles.secondaryButton]}
            >
              <ThemedText>Zurück</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(arabicLevels)/level4")}
              style={[styles.button, styles.primaryButton]}
            >
              <ThemedText>Weiter</ThemedText>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 32,
    gap: 12,
  },
  headerWrapper: {
    marginBottom: 8,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  headerTitle: {
    fontSize: 28,
    flexShrink: 1,
    textAlign: "center",
  },
  heroBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  heroText: {
    fontSize: 15,
    lineHeight: 25,
  },
  heroExample: {
    fontSize: 22,
    lineHeight: 34,
    textAlign: "center",
    fontWeight: "700",
    marginTop: 4,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 15 * 2,
  },
  vowelCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 6,
  },
  arabicBig: {
    fontSize: 40,
    textAlign: "center",
  },
  latinText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  labelText: {
    fontSize: 14,
    opacity: 0.75,
    textAlign: "center",
  },
  compareCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compareSide: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  compareLabel: {
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.7,
  },
  compareVs: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 8,
    opacity: 0.6,
  },
  exerciseBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    marginTop: 4,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  exerciseLine: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "700",
    marginVertical: 2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButton: {
    backgroundColor: "#BDBDBD",
  },
  primaryButton: {
    backgroundColor: "#E53935",
  },
});
