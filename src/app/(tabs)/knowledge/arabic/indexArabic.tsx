import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { arabicCurriculum } from "../../../../../utils/arabicCurriculum";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

const IndexArabic = () => {
  const navigateToLevel = (level: string) => {
    // @ts-ignore
    router.push(`/(arabicLevels)/level${level}`);
  };

  const colorScheme = useColorScheme() || "light";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        style={{ backgroundColor: Colors[colorScheme].background }}
        showsVerticalScrollIndicator={false}
      >
        {arabicCurriculum.map((level) => (
          <Pressable
            key={level.id}
            style={[
              styles.card,
              {
                backgroundColor: Colors[colorScheme].contrast,
              },
            ]}
            onPress={() => navigateToLevel(level.id)}
          >
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>
                {level.shortTitle}
              </ThemedText>
            </View>

            <ThemedText type="subtitle" style={styles.cardTitle}>
              {level.title}
            </ThemedText>

            <View style={styles.moduleContainer}>
              <ThemedText style={styles.moduleHeading}>Module</ThemedText>

              {level.modules.map((module, index) => (
                <View key={index} style={[styles.moduleRow, {}]}>
                  <View style={styles.bullet} />
                  <ThemedText style={styles.moduleText}>{module}</ThemedText>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
};

export default IndexArabic;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 10,
  },

  title: {
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.7,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  cardTitle: {
    marginBottom: 8,
  },

  moduleContainer: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  moduleHeading: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  moduleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    marginTop: 7,
    marginRight: 10,
  },
  moduleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
});
