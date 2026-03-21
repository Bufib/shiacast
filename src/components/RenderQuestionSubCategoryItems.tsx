
import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Entypo from "@expo/vector-icons/Entypo";
import { router, useLocalSearchParams } from "expo-router";
import { getQuestionsForSubcategory } from "../../db/queries/questions";
import { QuestionType } from "@/constants/Types";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { LoadingIndicator } from "./LoadingIndicator";
import { useTranslation } from "react-i18next";

function RenderQuestionSubCategoryItems() {
  const { category, subcategory } = useLocalSearchParams<{
    category: string;
    subcategory: string;
  }>();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme() || "light";
  const { lang } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const qs = await getQuestionsForSubcategory(
          category,
          subcategory,
          lang
        );
        if (cancelled) return;

        if (qs) {
          setQuestions(qs);
          setError(null);
        } else {
          setQuestions([]);
          setError(t("noQuestionsFound"));
        }
      } catch (e) {
        if (cancelled) return;
        console.error("Error in RenderQuestionSubCategoryItems:", e);
        setQuestions([]);
        setError(t("errorLoadingQuestions"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category, subcategory, lang, t]);

  // Error state
  if (error && !isLoading && questions.length === 0) {
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
      <View style={styles.centeredContainer}>
        <LoadingIndicator size="large" />
      </View>
    );
  }

  // Main render
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListStyle}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(displayQuestion)",
                params: {
                  category,
                  subcategory,
                  questionId: item.id.toString(),
                  questionTitle: item.title,
                },
              })
            }
          >
            <ThemedView style={[styles.item, Colors[colorScheme].contrast]}>
              <View style={styles.questionContainer}>
                <ThemedText style={styles.titleText}>{item.title}</ThemedText>
                <ThemedText style={styles.questionText} numberOfLines={1}>
                  {item.question}
                </ThemedText>
              </View>
              <Entypo
                name="chevron-thin-right"
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
    textAlign: "center"

  },
  flatListStyle: {
    paddingTop: 15,
    gap: 15,
    paddingBottom: 15,
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
  questionContainer: {
    flex: 1,
    marginRight: 10,
    gap: 2,
  },
  titleText: {
    fontSize: 18,
    textAlign: "left",
    fontWeight: "500",
  },
  questionText: {
    fontSize: 16,
    textAlign: "left",
  },
});

export default RenderQuestionSubCategoryItems;
