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

type Level1_4SectionItem =
  | { type: "intro" }
  | { type: "articleTitle" }
  | { type: "articleCard"; arabic: string; latin: string; label: string }
  | { type: "wordTitle" }
  | {
      type: "wordCard";
      arabic: string;
      latin: string;
      hint: string;
      before?: string;
    }
  | { type: "patternTitle" }
  | { type: "patternCard"; arabic: string; latin: string; hint: string }
  | { type: "exercise" };

export default function Level1_4() {
  const colorScheme = useColorScheme() || "light";

  const sections: Level1_4SectionItem[] = [
    { type: "intro" },

    { type: "articleTitle" },
    {
      type: "articleCard",
      arabic: "الْ",
      latin: "al-",
      label: "das / der / die",
    },
    {
      type: "articleCard",
      arabic: "الْبَيْت",
      latin: "al-bayt",
      label: "das Haus",
    },
    {
      type: "articleCard",
      arabic: "الْقَمَر",
      latin: "al-qamar",
      label: "der Mond",
    },

    { type: "wordTitle" },
    {
      type: "wordCard",
      before: "بَيْت",
      arabic: "الْبَيْت",
      latin: "al-bayt",
      hint: "bekanntes Wort mit Artikel",
    },
    {
      type: "wordCard",
      before: "قَمَر",
      arabic: "الْقَمَر",
      latin: "al-qamar",
      hint: "das l von al- wird mitgelesen",
    },
    {
      type: "wordCard",
      before: "كِتَاب",
      arabic: "الْكِتَاب",
      latin: "al-kitāb",
      hint: "ein echtes Wort mit bestimmtem Artikel",
    },
    {
      type: "wordCard",
      before: "وَلَد",
      arabic: "الْوَلَد",
      latin: "al-walad",
      hint: "erst al-, dann das Wort lesen",
    },
    {
      type: "wordCard",
      before: "بَاب",
      arabic: "الْبَاب",
      latin: "al-bāb",
      hint: "bekanntes Wort in bestimmter Form",
    },

    { type: "patternTitle" },
    {
      type: "patternCard",
      arabic: "الْ + بَيْت = الْبَيْت",
      latin: "al- + bayt = al-bayt",
      hint: "der Artikel kommt vor das Wort",
    },
    {
      type: "patternCard",
      arabic: "الْ + قَمَر = الْقَمَر",
      latin: "al- + qamar = al-qamar",
      hint: "lies zuerst al-, dann das ganze Wort",
    },
    {
      type: "patternCard",
      arabic: "الْ + كِتَاب = الْكِتَاب",
      latin: "al- + kitāb = al-kitāb",
      hint: "bekannte Wörter bekommen eine neue Form",
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
      <FlatList<Level1_4SectionItem>
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
                Der bestimmte Artikel al-
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
                    Jetzt lernst du den bestimmten Artikel الْ. Er steht am
                    Anfang eines Wortes und bedeutet das, der oder die. So
                    werden aus bekannten Wörtern neue echte Wortformen.
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
                    So liest du den Artikel
                  </Text>
                  <Text
                    style={[
                      styles.heroText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Lies zuerst al-. Danach liest du das bekannte Wort weiter.
                    In dieser Lektion übst du nur einfache Formen, bei denen das
                    l klar hörbar bleibt.
                  </Text>
                  <Text
                    style={[
                      styles.heroExample,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    الْ + بَيْت → الْبَيْت{"\n"}al- + bayt → al-bayt
                  </Text>
                </ThemedView>
              </View>
            );
          }

          if (item.type === "articleTitle") {
            return (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Der neue Baustein
              </Text>
            );
          }

          if (item.type === "articleCard") {
            return (
              <ThemedView
                style={[
                  styles.contentCard,
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

          if (item.type === "wordTitle") {
            return (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Bekannte Wörter mit Artikel
              </Text>
            );
          }

          if (item.type === "wordCard") {
            return (
              <ThemedView
                style={[
                  styles.contentCard,
                  {
                    backgroundColor: Colors[colorScheme].contrast,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
              >
                {item.before ? (
                  <Text
                    style={[
                      styles.beforeWordText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    vorher: {item.before}
                  </Text>
                ) : null}

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

          if (item.type === "patternTitle") {
            return (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                So setzt du es zusammen
              </Text>
            );
          }

          if (item.type === "patternCard") {
            return (
              <ThemedView
                style={[
                  styles.patternCard,
                  {
                    backgroundColor: Colors[colorScheme].contrast,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.patternArabic,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {item.arabic}
                </Text>
                <Text
                  style={[
                    styles.patternLatin,
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
                  الْبَيْت
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  الْقَمَر
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  الْكِتَاب
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  الْوَلَد
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  الْبَاب
                </Text>

                <Text
                  style={[
                    styles.sectionText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Frage dich: Wo beginnt der Artikel und wo beginnt das bekannte
                  Wort?
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
              onPress={() => router.push("/(arabicLevels)/level8")}
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
  contentCard: {
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
  beforeWordText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 4,
  },
  patternCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  patternArabic: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "700",
  },
  patternLatin: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
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