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
  | { type: "groupTitle"; title: string }
  | { type: "wordCard"; arabic: string; latin: string; hint: string }
  | { type: "patternTitle" }
  | { type: "patternCard"; arabic: string; latin: string; hint: string }
  | { type: "exercise" };

export default function Level1_4() {
  const colorScheme = useColorScheme() || "light";

  const sections: Level1_4SectionItem[] = [
    { type: "intro" },

    { type: "groupTitle", title: "Wörter mit langem Vokal" },
    {
      type: "wordCard",
      arabic: "بَاب",
      latin: "bāb",
      hint: "langes ā und Stop am Ende",
    },
    {
      type: "wordCard",
      arabic: "نُور",
      latin: "nūr",
      hint: "langes ū",
    },
    {
      type: "wordCard",
      arabic: "دِين",
      latin: "dīn",
      hint: "langes ī",
    },
    {
      type: "wordCard",
      arabic: "رَسُول",
      latin: "rasūl",
      hint: "langes ū in der Mitte",
    },
    {
      type: "wordCard",
      arabic: "كِتَاب",
      latin: "kitāb",
      hint: "langes ā am Ende",
    },

    { type: "groupTitle", title: "Wörter mit Sukūn am Ende" },
    {
      type: "wordCard",
      arabic: "مِنْ",
      latin: "min",
      hint: "endet mit Sukūn",
    },
    {
      type: "wordCard",
      arabic: "هَلْ",
      latin: "hal",
      hint: "kurzes Wort mit Stop",
    },
    {
      type: "wordCard",
      arabic: "بَيْت",
      latin: "bayt",
      hint: "geschlossenes Ende",
    },
    {
      type: "wordCard",
      arabic: "قَلْب",
      latin: "qalb",
      hint: "zwei Konsonanten am Schluss hörbar",
    },
    {
      type: "wordCard",
      arabic: "حَمْد",
      latin: "ḥamd",
      hint: "Stop am Wortende",
    },

    { type: "groupTitle", title: "Sehr häufige echte Wörter" },
    {
      type: "wordCard",
      arabic: "فِي",
      latin: "fī",
      hint: "langes ī",
    },
    {
      type: "wordCard",
      arabic: "هُوَ",
      latin: "huwa",
      hint: "zwei kurze Silben",
    },
    {
      type: "wordCard",
      arabic: "هِيَ",
      latin: "hiya",
      hint: "zwei kurze Silben",
    },
    {
      type: "wordCard",
      arabic: "هَذَا",
      latin: "hādhā",
      hint: "langes ā",
    },
    {
      type: "wordCard",
      arabic: "اللَّه",
      latin: "Allāh",
      hint: "sehr häufiges Wort",
    },

    { type: "groupTitle", title: "Kurze einfache Wörter zum Lesen" },
    {
      type: "wordCard",
      arabic: "قَمَر",
      latin: "qamar",
      hint: "drei klare Laute",
    },
    {
      type: "wordCard",
      arabic: "وَلَد",
      latin: "walad",
      hint: "einfaches Lesemuster",
    },
    {
      type: "wordCard",
      arabic: "ذَهَب",
      latin: "dhahab",
      hint: "drei offene Leseschritte",
    },
    {
      type: "wordCard",
      arabic: "كَبِير",
      latin: "kabīr",
      hint: "langes ī",
    },
    {
      type: "wordCard",
      arabic: "صَغِير",
      latin: "ṣaghīr",
      hint: "langes ī am Ende",
    },

    { type: "patternTitle" },
    {
      type: "patternCard",
      arabic: "كِ + تَاب = كِتَاب",
      latin: "ki + tāb = kitāb",
      hint: "du verbindest die Laute zu einem echten Wort",
    },
    {
      type: "patternCard",
      arabic: "نُ + ور = نُور",
      latin: "nu + ūr = nūr",
      hint: "lange Vokale hörst du im Wortfluss",
    },
    {
      type: "patternCard",
      arabic: "بَيْ + ت = بَيْت",
      latin: "bay + t = bayt",
      hint: "am Ende hörst du einen Stop",
    },
    {
      type: "patternCard",
      arabic: "قَ + مَر = قَمَر",
      latin: "qa + mar = qamar",
      hint: "man liest Schritt für Schritt",
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
                Echte Wörter lesen
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
                    Jetzt liest du nur noch echte Wörter. Dabei achtest du auf
                    kurze und lange Vokale, auf Sukūn und darauf, wie sich die
                    Laute zu einem ganzen Wort verbinden.
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
                    So liest du echte Wörter
                  </Text>
                  <Text
                    style={[
                      styles.heroText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Lies das Wort langsam von rechts nach links. Verbinde dann
                    die Laute miteinander, bis das ganze Wort flüssig klingt.
                  </Text>
                  <Text
                    style={[
                      styles.heroExample,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    كِ + تَاب → كِتَاب{"\n"}ki + tāb → kitāb
                  </Text>
                </ThemedView>
              </View>
            );
          }

          if (item.type === "groupTitle") {
            return (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                {item.title}
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
                  بَاب
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  نُور
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  دِين
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  مِنْ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  هَلْ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  بَيْت
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  قَلْب
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  حَمْد
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  فِي
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  هُوَ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  هِيَ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  هَذَا
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  اللَّه
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  قَمَر
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  وَلَد
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  ذَهَب
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  كَبِير
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  صَغِير
                </Text>

                <Text
                  style={[
                    styles.sectionText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Frage dich: Wo hörst du einen langen Laut, wo einen kurzen
                  Laut und wo endet das Wort mit einem Stop?
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
              onPress={() => router.push("/(arabicLevels)/level7")}
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