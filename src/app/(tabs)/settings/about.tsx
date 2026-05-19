import { Stack } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  StyleSheet,
  View,
  ScrollView
} from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../../contexts/LanguageContext";

export default function About() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { rtl } = useLanguage();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        style={[
          styles.scrollStyle,
          { backgroundColor: Colors[colorScheme].background },
        ]}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Stack.Screen options={{ headerTitle: t("aboutTheApp") }} />

        <View style={styles.aboutContainer}>
          <ThemedText
            style={[
              styles.aboutText,
              rtl && { textAlign: "right", writingDirection: "rtl" },
            ]}
          >
            {t("aboutAppContent")}
          </ThemedText>

          <View style={styles.imageContainer}>
            <Image
              source={require("@/assets/images/bufibLogo.png")}
              style={styles.image}
              contentFit="contain"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollStyle: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  aboutContainer: {
    marginHorizontal: 15,
    marginBottom: 60,
    marginTop: 20,
  },
  aboutText: {
    fontSize: 18,
    lineHeight: 28,
  },
  imageContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  image: {
    height: 200,
    width: 300,
  },
});
