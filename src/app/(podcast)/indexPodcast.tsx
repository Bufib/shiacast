import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import PodcastGridCard from "@/components/PodcastGridCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useGradient } from "@/hooks/useGradient";
import { usePodcastById } from "@/hooks/usePodcastById";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function PodcastScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const podcastId = id ? Number(id) : null;
  const colorScheme = useColorScheme() || "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { lang, rtl } = useLanguage();
  const { gradientColors } = useGradient();
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: podcast, isLoading, isError } = usePodcastById(podcastId);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <LoadingIndicator size="large" />
      </ThemedView>
    );
  }

  if (isError || !podcast) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={styles.errorText}>{t("error")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <HeaderLeftBackButton color={colors.text} size={38} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PodcastGridCard
          podcast={podcast}
          width={width - 32}
          rtl={rtl}
          lang={lang}
          gradientColors={gradientColors}
          isPlaying={isPlaying}
          onRequestPlay={() => setIsPlaying(true)}
          onStopPlaying={() => setIsPlaying(false)}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 12,
  },
});
