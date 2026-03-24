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

type LevelShaddaPositionsSectionItem =
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

export default function LevelShaddaPositions() {
  const colorScheme = useColorScheme() || "light";

  const sections: LevelShaddaPositionsSectionItem[] = [
    { type: "intro" },

    { type: "signTitle" },
    {
      type: "signCard",
      arabic: "رَبَّ",
      latin: "rabba",
      label: "die Shadda kann mitten im Wort auf einem Buchstaben stehen",
    },
    {
      type: "signCard",
      arabic: "إِنَّ",
      latin: "inna",
      label: "die Shadda kann auch am Ende eines kurzen Wortes vorkommen",
    },
    {
      type: "signCard",
      arabic: "ثُمَّ",
      latin: "thumma",
      label: "du sprichst den Buchstaben mit Shadda doppelt",
    },

    { type: "wordTitle" },
    {
      type: "wordCard",
      arabic: "رَبَّ",
      latin: "rabba",
      hint: "die Shadda steht auf ب und macht daraus bb",
    },
    {
      type: "wordCard",
      arabic: "إِنَّ",
      latin: "inna",
      hint: "die Shadda steht auf ن und macht daraus nn",
    },
    {
      type: "wordCard",
      arabic: "ثُمَّ",
      latin: "thumma",
      hint: "die Shadda steht auf م und macht daraus mm",
    },
    {
      type: "wordCard",
      arabic: "الَّذِي",
      latin: "alladhī",
      hint: "die Shadda kann auch nach alif-lām im Wort stehen",
    },
    {
      type: "wordCard",
      arabic: "أُمَّة",
      latin: "umma",
      hint: "achte darauf, dass der Buchstabe mit Shadda kräftig doppelt gelesen wird",
    },

    { type: "patternTitle" },
    {
      type: "patternCard",
      arabic: "am Anfang hörbar",
      latin: "start position",
      hint: "wenn die Shadda früh im Wort kommt, hörst du die Verdopplung direkt",
    },
    {
      type: "patternCard",
      arabic: "in der Mitte hörbar",
      latin: "middle position",
      hint: "die Verdopplung liegt oft mitten im Wort",
    },
    {
      type: "patternCard",
      arabic: "am Wortende hörbar",
      latin: "end position",
      hint: "auch kurz vor dem Wortende bleibt die Shadda deutlich hörbar",
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
      <FlatList<LevelShaddaPositionsSectionItem>
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
                Shadda in verschiedenen Positionen
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
                    Jetzt lernst du die Shadda in verschiedenen Positionen. Die
                    Shadda zeigt dir, dass ein Buchstabe doppelt gelesen wird.
                    Sie kann an unterschiedlichen Stellen im Wort stehen, aber
                    ihre Bedeutung bleibt immer gleich.
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
                    So liest du die Shadda
                  </Text>
                  <Text
                    style={[
                      styles.heroText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Wenn du eine Shadda siehst, sprichst du den Buchstaben
                    stärker und doppelt. Es ist also nicht nur ein einzelner
                    Laut, sondern wie zwei gleiche Buchstaben direkt
                    hintereinander.
                  </Text>
                  <Text
                    style={[
                      styles.heroExample,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    إِنَّ{"\n"}inna
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
                Die Grundidee
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
                Beispiele mit Shadda
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
                Darauf musst du achten
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
                  Lies die Wörter mit deutlicher Verdopplung:
                </Text>

                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  رَبَّ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  إِنَّ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  ثُمَّ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  الَّذِي
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  أُمَّة
                </Text>

                <Text
                  style={[
                    styles.sectionText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Frage dich: Auf welchem Buchstaben steht die Shadda, und
                  welcher Laut wird dadurch doppelt gelesen?
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
              onPress={() => router.push("/(arabicLevels)/level21")}
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
    fontSize: 32,
    textAlign: "center",
  },
  latinText: {
    fontSize: 18,
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
    fontSize: 26,
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