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

type LevelTanwinFlowSectionItem =
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

export default function LevelTanwinFlow() {
  const colorScheme = useColorScheme() || "light";

  const sections: LevelTanwinFlowSectionItem[] = [
    { type: "intro" },

    { type: "signTitle" },
    {
      type: "signCard",
      arabic: "فِي بُيُوتٍ",
      latin: "fī buyūtin",
      label: "der Tanwīn bleibt hörbar, wenn du im Lesefluss weiterliest",
    },
    {
      type: "signCard",
      arabic: "هُدًى لِّلْمُتَّقِينَ",
      latin: "hudan lil-muttaqīn",
      label: "du stoppst nicht nach dem Wort, sondern liest direkt weiter",
    },
    {
      type: "signCard",
      arabic: "غَفُورٌ رَحِيمٌ",
      latin: "ghafūrun raḥīm",
      label: "die Endung mit Tanwīn geht in den Satzfluss mit hinein",
    },

    { type: "wordTitle" },
    {
      type: "wordCard",
      arabic: "بُيُوتٍ + أخرى",
      latin: "buyūtin + ukhrā",
      hint: "das -in bleibt hörbar, wenn du nicht stoppst",
    },
    {
      type: "wordCard",
      arabic: "هُدًى + لِّلْمُتَّقِينَ",
      latin: "hudan + lil-muttaqīn",
      hint: "beim Weiterlesen hörst du die Tanwīn-Endung weiter",
    },
    {
      type: "wordCard",
      arabic: "غَفُورٌ + رَحِيمٌ",
      latin: "ghafūrun + raḥīm",
      hint: "das -un wird im Lesefluss gesprochen",
    },
    {
      type: "wordCard",
      arabic: "كِتَابًا + مُبِينًا",
      latin: "kitāban mubīnan",
      hint: "das -an bleibt im Satzfluss hörbar",
    },
    {
      type: "wordCard",
      arabic: "عَلِيمٌ + حَكِيمٌ",
      latin: "ʿalīmun ḥakīm",
      hint: "achte auf die hörbare Endung vor dem nächsten Wort",
    },

    { type: "patternTitle" },
    {
      type: "patternCard",
      arabic: "-ٌ / -ٍ / -ً",
      latin: "tanwīn ending",
      hint: "Tanwīn zeigt eine hörbare Endung am Wortende",
    },
    {
      type: "patternCard",
      arabic: "kein Stopp = Endung hörbar",
      latin: "keep the ending",
      hint: "wenn du weiterliest, bleibt der Tanwīn im Klang erhalten",
    },
    {
      type: "patternCard",
      arabic: "Stopp = anderer Klang",
      latin: "pause changes sound",
      hint: "beim Anhalten verändert sich die Endung oft",
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
      <FlatList<LevelTanwinFlowSectionItem>
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
                Tanwīn im Lesefluss
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
                    Jetzt lernst du Tanwīn im Lesefluss. Wenn du auf einem Wort
                    mit Tanwīn nicht anhältst, bleibt die Endung hörbar und geht
                    direkt in das nächste Wort über.
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
                    So hörst du den Tanwīn
                  </Text>
                  <Text
                    style={[
                      styles.heroText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Tanwīn ist eine Endung wie -un, -in oder -an. Wenn du
                    weiterliest, sprichst du diese Endung mit und gehst direkt
                    zum nächsten Wort über.
                  </Text>
                  <Text
                    style={[
                      styles.heroExample,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    فِي بُيُوتٍ{"\n"}fī buyūtin
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
                Beispiele im Lesefluss
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
                  Lies flüssig weiter und achte auf den Tanwīn:
                </Text>

                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  فِي بُيُوتٍ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  هُدًى لِّلْمُتَّقِينَ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  غَفُورٌ رَحِيمٌ
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  كِتَابًا مُبِينًا
                </Text>
                <Text
                  style={[
                    styles.exerciseLine,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  عَلِيمٌ حَكِيمٌ
                </Text>

                <Text
                  style={[
                    styles.sectionText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Frage dich: Welche Tanwīn-Endung hörst du noch, weil du nicht
                  stoppst, sondern direkt weiterliest?
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
              onPress={() => router.push("/(arabicLevels)/level22")}
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