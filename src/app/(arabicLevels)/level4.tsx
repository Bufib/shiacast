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

type SukunSectionItem =
  | { type: "intro" }
  | { type: "whatTitle" }
  | { type: "whatCard"; arabic: string; latin: string; label: string }
  | { type: "examplesTitle" }
  | { type: "exampleCard"; arabic: string; latin: string; hint: string }
  | { type: "compareTitle" }
  | {
      type: "compareCard";
      withVowel: string;
      withVowelLatin: string;
      withSukun: string;
      withSukunLatin: string;
    }
  | { type: "exercise" };

export default function Level1_2() {
  const colorScheme = useColorScheme() || "light";

  const sections: SukunSectionItem[] = [
    { type: "intro" },

    { type: "examplesTitle" },
    {
      type: "exampleCard",
      arabic: "أَبْ",
      latin: "ab",
      hint: "der letzte Buchstabe stoppt ohne Vokal",
    },
    {
      type: "exampleCard",
      arabic: "مِنْ",
      latin: "min",
      hint: "das نْ wird ohne Vokal gesprochen",
    },
    {
      type: "exampleCard",
      arabic: "بَيْتْ",
      latin: "bayt",
      hint: "am Ende hört man einen Stopp",
    },

    { type: "compareTitle" },
    {
      type: "compareCard",
      withVowel: "بَ",
      withVowelLatin: "ba",
      withSukun: "بْ",
      withSukunLatin: "b",
    },
    {
      type: "compareCard",
      withVowel: "نَ",
      withVowelLatin: "na",
      withSukun: "نْ",
      withSukunLatin: "n",
    },
    {
      type: "compareCard",
      withVowel: "مُ",
      withVowelLatin: "mu",
      withSukun: "مْ",
      withSukunLatin: "m",
    },

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
      <FlatList<SukunSectionItem>
        data={sections}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <View style={styles.headerRow}>
              <HeaderLeftBackButton
                size={30}
                color={Colors.universal.link}
                route={"/knowledge/"}
                dismiss={true}
              />
              <Text
                style={[
                  styles.headerTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Sukūn
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === "intro") {
            return (
              <View style={styles.introWrapper}>
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
                      styles.largeSectionText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Das Sukūn zeigt: Dieser Buchstabe hat keinen Vokal. Man
                    spricht ihn kurz und direkt, ohne a, i oder u.
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
                    So klingt Sukūn
                  </Text>
                  <Text
                    style={[
                      styles.heroText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Ein Buchstabe mit Vokal klingt offen: ba. Ein Buchstabe mit
                    Sukūn stoppt sofort: b.
                  </Text>
                  <Text
                    style={[
                      styles.heroExample,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    بَ → ba{"\n"}بْ → b
                  </Text>
                </ThemedView>
              </View>
            );
          }

          if (item.type === "whatCard") {
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

          if (item.type === "examplesTitle") {
            return (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Beispiele
              </Text>
            );
          }

          if (item.type === "exampleCard") {
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
                  {item.hint}
                </Text>
              </ThemedView>
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
                    mit Vokal
                  </Text>
                  <Text
                    style={[
                      styles.arabicBig,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {item.withVowel}
                  </Text>
                  <Text
                    style={[
                      styles.latinText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {item.withVowelLatin}
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
                    mit Sukūn
                  </Text>
                  <Text
                    style={[
                      styles.arabicBig,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {item.withSukun}
                  </Text>
                  <Text
                    style={[
                      styles.latinText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {item.withSukunLatin}
                  </Text>
                </View>
              </ThemedView>
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
                  بَ / بْ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  نَ / نْ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  مُ / مْ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  أَبْ / مِنْ
                </Text>

                <Text
                  style={[
                    styles.sectionText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Frage dich: Hörst du am Ende einen Vokal oder einen Stop?
                </Text>
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
              onPress={() => router.push("/(arabicLevels)/level5")}
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
  introWrapper: {
    gap: 10,
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
    lineHeight: 30,
  },
  largeSectionText: {
    fontSize: 18,
    lineHeight: 31,
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
