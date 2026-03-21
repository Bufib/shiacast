
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Entypo from "@expo/vector-icons/Entypo";
import { router, Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import { getSubcategoriesForCategory } from "../../db/queries/questions";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import { useDataVersionStore } from "../../stores/dataVersionStore";

function RenderQuestionCategoryItems({ category }: { category: string }) {
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  const { lang, rtl } = useLanguage();
  const questionsVersion = useDataVersionStore((s) => s.questionsVersion);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const list = await getSubcategoriesForCategory(category, lang);
        if (cancelled) return;

        if (list) {
          setSubcategories(list);
          setError(null);
        } else {
          setSubcategories([]);
          setError(t("errorLoadingSubcategories"));
        }
      } catch (e) {
        if (cancelled) return;
        console.error("Error loading subcategories:", e);
        setSubcategories([]);
        setError(t("errorLoadingSubcategories"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category, lang, questionsVersion, t]);

  // Error state
  if (error && !isLoading && subcategories.length === 0) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText
          style={{ color: Colors[colorScheme].error }}
          type="subtitle"
        >
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText>{t("subcategoriesLoading")}</ThemedText>
      </ThemedView>
    );
  }

  // Main render
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: t(category.toLowerCase()),
        }}
      />
      <FlatList
        data={subcategories}
        keyExtractor={(item) => item.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListStyle}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/knowledge/questions/questionSubcategories",
                params: { category, subcategory: item },
              })
            }
          >
            <ThemedView
              style={[
                styles.item,
                { backgroundColor: Colors[colorScheme].contrast },
                rtl && { flexDirection: "row-reverse" },
              ]}
            >
              <ThemedText style={styles.tableText}>{item}</ThemedText>
              <Entypo
                name={rtl ? "chevron-thin-left" : "chevron-thin-right"}
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </ThemedView>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  flatListStyle: {
    paddingTop: 15,
    paddingBottom: 15,
    gap: 15,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginHorizontal: 10,
    borderWidth: 0.3,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  tableText: {
    fontSize: 18,
    fontWeight: "500",
  },
});

export default RenderQuestionCategoryItems;
