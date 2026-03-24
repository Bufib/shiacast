import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { PrayerCategoryType, PrayerWithCategory } from "@/constants/Types";
import {
  getAllPrayersForArabicTree,
  getCategoryByTitle,
  getChildCategories,
  getPrayersForCategoryTree,
  getPrayersForCategory,
} from "../../../../../db/queries/prayers";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../../../contexts/LanguageContext";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ThemedView } from "@/components/ThemedView";
import { useDataVersionStore } from "../../../../../stores/dataVersionStore";
import { useScreenFadeIn } from "../../../../..//hooks/useScreenFadeIn";

export default function CategoryScreen() {
  const { prayerCategory } = useLocalSearchParams<{ prayerCategory: string }>();
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  const { lang, rtl } = useLanguage();
  const [childCategories, setChildCategories] = useState<PrayerCategoryType[]>(
    [],
  );
  const [allPrayers, setAllPrayers] = useState<PrayerWithCategory[]>([]);
  const [filteredPrayers, setFilteredPrayers] = useState<PrayerWithCategory[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);

  // const [currentCategory, setCurrentCategory] =
  //   useState<PrayerCategoryType | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<PrayerCategoryType | null>(null);
  const prayersVersion = useDataVersionStore((s) => s.prayersVersion);
  const { fadeAnim, onLayout } = useScreenFadeIn(800);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setSelectedSubcategory(null);
        // Fetch prayerCategory by title
        const categoryData = await getCategoryByTitle(prayerCategory);
        if (!categoryData) {
          console.error("prayerCategory not found");
          return;
        }
        // setCurrentCategory(categoryData);

        // Fetch subcategories using the parent category ID
        const categoryRows = await getChildCategories(categoryData.id);
        setChildCategories(categoryRows);

        // Fetch prayers depending on language
        if (lang === "ar") {
          const prayerRows = await getAllPrayersForArabicTree(categoryData.id);
          setAllPrayers(prayerRows);
          setFilteredPrayers(prayerRows);
        } else {
          const prayerRows = await getPrayersForCategoryTree(
            categoryData.id,
            lang,
          );
          setAllPrayers(prayerRows);
          setFilteredPrayers(prayerRows);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prayerCategory, lang, prayersVersion]);

  // Handle subcategory selection
  const handleSubcategoryPress = async (cat: PrayerCategoryType) => {
    if (selectedSubcategory?.id === cat.id) {
      setSelectedSubcategory(null);
      setFilteredPrayers(allPrayers);
      return;
    }

    setSelectedSubcategory(cat);
    try {
      const subcategoryPrayers = await getPrayersForCategory(cat.id, lang);
      setFilteredPrayers(subcategoryPrayers);
    } catch {
      const filtered = allPrayers.filter(
        (prayer) => prayer.category_id === cat.id,
      );
      setFilteredPrayers(filtered.length ? filtered : allPrayers);
    }
  };

  const handlePrayerPress = (prayer: PrayerWithCategory) => {
    router.push({
      pathname: "/(displayPrayer)/prayer",
      params: { prayer: prayer.id.toString() },
    });
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loaderContainer,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <LoadingIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemedView style={[styles.container]}>
      <Stack.Screen
        options={{
          headerTitle: prayerCategory,
        }}
      />

      <Animated.ScrollView
        onLayout={onLayout}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        {/* Subcategories */}
        {childCategories.length > 0 && (
          <View style={styles.sectionContainer}>
            <View
              style={[
                styles.sectionHeaderRow,
                rtl && { flexDirection: "row-reverse" },
              ]}
            >
              <ThemedText
                style={[styles.sectionTitle, rtl && { textAlign: "right" }]}
              >
                {t("categories")}
              </ThemedText>
              {selectedSubcategory && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubcategory(null);
                    setFilteredPrayers(allPrayers);
                  }}
                  style={styles.showAllButton}
                >
                  <ThemedText
                    style={{
                      fontWeight: "500",
                      fontSize: 14,
                      color: Colors.universal.link,
                    }}
                  >
                    {t("showAll")}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipContainer}
            >
              {childCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: Colors[colorScheme].contrast,
                      borderColor: Colors[colorScheme].border,
                    },
                    selectedSubcategory?.id === cat.id && {
                      backgroundColor: Colors.universal.primary,
                      borderWidth: 1,
                      borderColor: Colors[colorScheme].border,
                    },
                  ]}
                  onPress={() => handleSubcategoryPress(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedSubcategory?.id === cat.id
                        ? { color: "#fff", fontWeight: "600" }
                        : { color: colorScheme === "dark" ? "#fff" : "#000" },
                    ]}
                  >
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Prayers Section */}
        <View style={styles.sectionContainer}>
          <View
            style={[
              styles.sectionHeaderRow,
              rtl && { flexDirection: "row-reverse" },
            ]}
          ></View>

          {filteredPrayers.length > 0 ? (
            <View style={styles.prayerList}>
              {filteredPrayers.map((prayer) => (
                <TouchableOpacity
                  key={prayer.id}
                  style={[
                    styles.prayerCard,
                    { backgroundColor: Colors[colorScheme].contrast },
                  ]}
                  onPress={() => handlePrayerPress(prayer)}
                >
                  <View style={styles.prayerHeader}>
                    <View style={styles.prayerTitleContainer}>
                      <ThemedText
                        style={[
                          styles.prayerTitle,
                          rtl && { textAlign: "right" },
                        ]}
                        numberOfLines={1}
                      >
                        {prayer.translated_title ??
                          prayer.arabic_title ??
                          prayer.name}
                      </ThemedText>
                    </View>
                  </View>
                  {prayer.prayer_text && (
                    <Text
                      style={[
                        styles.prayerText,
                        { color: Colors.universal.grayedOut },
                        rtl && { textAlign: "right" },
                      ]}
                      numberOfLines={2}
                    >
                      {prayer.prayer_text.trim()}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.prayerFooter,
                      rtl
                        ? {
                            flexDirection: "row-reverse",
                            alignSelf: "flex-start",
                          }
                        : {
                            flexDirection: "row",
                            alignSelf: "flex-end",
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.readMore,
                        { color: Colors.universal.primary },
                      ]}
                    >
                      {t("readMore")}
                    </Text>
                    <Ionicons
                      name={rtl ? "chevron-back" : "chevron-forward"}
                      size={16}
                      color={Colors.universal.primary}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={36}
                color={colorScheme === "dark" ? "#64748b" : "#94a3b8"}
                style={styles.emptyStateIcon}
              />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: colorScheme === "dark" ? "#94a3b8" : "#64748b" },
                  rtl && { textAlign: "right" },
                ]}
              >
                {t("noSearchResult")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedSubcategory(null);
                  setFilteredPrayers(allPrayers);
                }}
                style={[
                  styles.resetButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2d3748" : "#E2E8F0",
                  },
                ]}
              >
                <Text
                  style={{
                    color: Colors.universal.link,
                    fontWeight: "500",
                  }}
                >
                  {t("showAll")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
    paddingTop: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
    gap: 5,
  },

  header: {
    fontSize: 24,
    fontWeight: "700",
  },

  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  showAllButton: {},

  chipContainer: {
    flexDirection: "row",
    paddingBottom: 4,
    paddingRight: 20,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    marginRight: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },

  prayerList: {
    gap: 16,
    marginTop: 8,
  },
  prayerCard: {
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  prayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  prayerTitleContainer: {
    flex: 1,
  },
  prayerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  prayerText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  prayerFooter: {
    justifyContent: "center",
    gap: 2,
  },
  readMore: {
    fontSize: 14,
    fontWeight: "600",
  },

  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  emptyStateIcon: {
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
});
