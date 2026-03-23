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

type LevelAlifKhanjariyaSectionItem =
  | { type: "intro" }
  | { type: "signTitle" }
  | { type: "signCard"; arabic: string; latin: string; label: string }
  | { type: "wordTitle" }
  | {
      type: "wordCard";
      arabic: string;
      latin: string;
      hint: string;
    }
  | { type: "patternTitle" }
  | { type: "patternCard"; arabic: string; latin: string; hint: string }
  | { type: "exercise" };

export default function LevelAlifKhanjariya() {
  const colorScheme = useColorScheme() || "light";

  const sections: LevelAlifKhanjariyaSectionItem[] = [
    { type: "intro" },

    { type: "signTitle" },
    {
      type: "signCard",
      arabic: "ٰ",
      latin: "ā",
      label: "dieses kleine Zeichen zeigt oft einen langen a-Laut",
    },
    {
      type: "signCard",
      arabic: "هٰذَا",
      latin: "hādhā",
      label: "ein häufiges Wort mit Alif khanǧarīya",
    },
    {
      type: "signCard",
      arabic: "اللّٰه",
      latin: "Allāh",
      label: "auch in sehr wichtigen Wörtern kommt es vor",
    },

    { type: "wordTitle" },
    {
      type: "wordCard",
      arabic: "هٰذَا",
      latin: "hādhā",
      hint: "dieses",
    },
    {
      type: "wordCard",
      arabic: "هٰذِهِ",
      latin: "hādhihi",
      hint: "diese",
    },
    {
      type: "wordCard",
      arabic: "اللّٰه",
      latin: "Allāh",
      hint: "achte auf den langen ā-Laut",
    },
    {
      type: "wordCard",
      arabic: "رَحْمٰن",
      latin: "raḥmān",
      hint: "das kleine Zeichen ersetzt hier den langen Laut",
    },
    {
      type: "wordCard",
      arabic: "طٰه",
      latin: "ṭāhā",
      hint: "auch hier hörst du ein langes ā",
    },

    { type: "patternTitle" },
    {
      type: "patternCard",
      arabic: "هٰذَا",
      latin: "hādhā",
      hint: "das kleine Zeichen hilft dir beim langen Laut",
    },
    {
      type: "patternCard",
      arabic: "اللّٰه",
      latin: "Allāh",
      hint: "achte auf Shadda und langen Vokal zusammen",
    },
    {
      type: "patternCard",
      arabic: "رَحْمٰن",
      latin: "raḥmān",
      hint: "lies den Laut lang, auch wenn kein normales ا da ist",
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
      <FlatList<LevelAlifKhanjariyaSectionItem>
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
                Die Alif khanǧarīya
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
                    Jetzt lernst du ein sehr kleines Zeichen kennen. Es zeigt
                    dir oft einen langen a-Laut, obwohl kein normales Alif
                    geschrieben ist.
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
                    So liest du das kleine Alif
                  </Text>
                  <Text
                    style={[
                      styles.heroText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Achte auf das kleine Zeichen über dem Buchstaben. Es hilft
                    dir, den Laut lang zu lesen.
                  </Text>
                  <Text
                    style={[
                      styles.heroExample,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    هٰذَا{"\n"}hādhā
                  </Text>
                </ThemedView>
              </View>
            );
          }

          if (item.type === "signTitle") {
            return (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Das neue Zeichen
              </Text>
            );
          }

          if (item.type === "signCard") {
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
                Wörter mit Alif khanǧarīya
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
                So liest du es
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
                  هٰذَا
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  هٰذِهِ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  اللّٰه
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  رَحْمٰن
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  طٰه
                </Text>

                <Text
                  style={[
                    styles.sectionText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Frage dich: Wo siehst du das kleine Zeichen, das den langen
                  Laut zeigt?
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
              onPress={() => router.push("/(arabicLevels)/level11")}
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