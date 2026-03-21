import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ThemedText } from "@/components/ThemedText";
import FilterModal from "@/components/FilterModal";
import { Colors } from "@/constants/Colors";
import { NewsArticlesType } from "@/constants/Types";
import { useLanguage } from "../../../../contexts/LanguageContext";
import handleOpenExternalUrl from "../../../../utils/handleOpenExternalUrl";
import { supabase } from "../../../../utils/supabase";
import { returnSize } from "../../../../utils/sizes";
import { Ionicons } from "@expo/vector-icons";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 20;

const formatDate = (dateString: string, lang: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AllArticlesScreen() {
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const { previewSizes } = returnSize(width, height);

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);

  const { data: filterPairs = [] } = useQuery<{ topic: string | null; author: string | null }[]>({
    queryKey: ["article_filter_pairs", lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("article_topic, author")
        .eq("language_code", lang);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ topic: r.article_topic ?? null, author: r.author || null }));
    },
    staleTime: 60 * 60 * 1000,
  });

  const allTopics = [...new Set(filterPairs.map((p) => p.topic).filter(Boolean))].sort() as string[];
  const allAuthors = [...new Set(filterPairs.map((p) => p.author).filter(Boolean))].sort() as string[];

  const availableTopics = selectedAuthor
    ? ([...new Set(filterPairs.filter((p) => p.author === selectedAuthor).map((p) => p.topic).filter(Boolean))].sort() as string[])
    : allTopics;
  const availableAuthors = selectedTopic
    ? ([...new Set(filterPairs.filter((p) => p.topic === selectedTopic).map((p) => p.author).filter(Boolean))].sort() as string[])
    : allAuthors;

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<
    NewsArticlesType[],
    Error,
    InfiniteData<NewsArticlesType[]>,
    QueryKey,
    number
  >({
    queryKey: ["all_articles_filtered", lang, selectedTopic, selectedAuthor],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("news_articles")
        .select("*")
        .eq("language_code", lang)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (selectedTopic) query = query.eq("article_topic", selectedTopic);
      if (selectedAuthor) query = query.eq("author", selectedAuthor);

      const { data: result, error } = await query;
      if (error) throw error;
      return result ?? [];
    },
    getNextPageParam: (lastPage, allPages) => {
      const fetchedSoFar = allPages.reduce((acc, page) => acc + page.length, 0);
      return lastPage.length === PAGE_SIZE ? fetchedSoFar : undefined;
    },
    initialPageParam: 0,
    enabled: Boolean(lang),
  });

  const articles: NewsArticlesType[] = data?.pages.flat() ?? [];

  const getPaddedData = (items: NewsArticlesType[]) => {
    if (items.length % 2 === 1) {
      return [...items, { id: -1, isPlaceholder: true } as any];
    }
    return items;
  };

  const renderItem = useCallback(
    ({
      item,
    }: {
      item: NewsArticlesType & { isPlaceholder?: boolean };
    }) => {
      if ((item as any).isPlaceholder) {
        return <View style={{ width: previewSizes }} />;
      }
      return (
        <TouchableOpacity
          style={styles.tileWrapper}
          onPress={() => {
            if (item.is_external_link) {
              handleOpenExternalUrl(item.external_link_url || "");
            } else {
              router.push({
                pathname: "/(newsArticle)",
                params: { articleId: item.id },
              });
            }
          }}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.modernTile,
              {
                width: previewSizes,
                height: 210,
                backgroundColor: Colors[colorScheme].contrast,
                borderColor: Colors[colorScheme].border,
              },
            ]}
          >
            <View style={styles.tileContent}>
              <View style={styles.tileIconContainer}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(74,144,226,0.2)"
                          : "rgba(74,144,226,0.12)",
                    },
                  ]}
                >
                  <Ionicons
                    name={item.is_external_link ? "link-outline" : "newspaper-outline"}
                    size={22}
                    color={Colors[colorScheme].tint}
                  />
                </View>
              </View>

              <View style={styles.tileTitleContainer}>
                <Text
                  numberOfLines={4}
                  style={[
                    styles.modernTileTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {item.title.trim()}
                </Text>
              </View>

              <View style={styles.tileFooter}>
                {item.author ? (
                  <View style={styles.metaRow}>
                    <Ionicons
                      name="person-outline"
                      size={11}
                      color={Colors[colorScheme].icon}
                      style={styles.metaIcon}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.metaText, { color: Colors[colorScheme].icon }]}
                    >
                      {item.author}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.metaRow}>
                  <Ionicons
                    name="time-outline"
                    size={11}
                    color={Colors[colorScheme].icon}
                    style={styles.metaIcon}
                  />
                  <Text
                    style={[styles.metaText, { color: Colors[colorScheme].icon }]}
                  >
                    {formatDate(item.created_at, lang)}
                  </Text>
                </View>
                {item.article_topic ? (
                  <Text
                    numberOfLines={1}
                    style={[styles.topicText, { color: Colors[colorScheme].icon }]}
                  >
                    {item.article_topic}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [colorScheme, lang, previewSizes]
  );

  const activeFilterCount = (selectedTopic ? 1 : 0) + (selectedAuthor ? 1 : 0);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={Colors[colorScheme].text}
          />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          {t("newsArticlesTitle")}
        </ThemedText>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={activeFilterCount > 0 ? Colors.universal.primary : Colors[colorScheme].text}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        topics={availableTopics}
        authors={availableAuthors}
        selectedTopic={selectedTopic}
        selectedAuthor={selectedAuthor}
        onSelectTopic={setSelectedTopic}
        onSelectAuthor={setSelectedAuthor}
      />

      {/* List */}
      {isLoading ? (
        <LoadingIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getPaddedData(articles)}
          numColumns={2}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderItem}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <LoadingIndicator size="small" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {t("noSearchResult")}
              </ThemedText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 38,
  },
  filterBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.universal.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  columnWrapper: {
    marginBottom: 12,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  tileWrapper: {},
  modernTile: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tileContent: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  tileIconContainer: {
    marginBottom: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  tileTitleContainer: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 6,
  },
  modernTileTitle: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
    letterSpacing: 0.1,
  },
  tileFooter: {
    marginTop: 6,
    gap: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 3,
  },
  metaText: {
    fontSize: 11,
    flex: 1,
  },
  topicText: {
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 2,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    textAlign: "center",
  },
});
