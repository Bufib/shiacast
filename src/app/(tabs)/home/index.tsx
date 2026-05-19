import RetryButton from "@/components/RetryButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useVideoList } from "../../../hooks/useVideoList";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Keyboard,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "../../../../contexts/LanguageContext";
import VideoGridList from "@/components/VideoGridList";
import VideoGridCardSkeleton from "@/components/VideoGridCardSkeleton";
import { getLanguageLabel } from "../../../../utils/languageLabel";
import { useVideoFilterStore } from "../../../../stores/videoFilterStore";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PAGE_SIZE = 20;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { t } = useTranslation();
  const { lang, rtl } = useLanguage();
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const listOpacity = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const searchInputRef = useRef<TextInput>(null);
  const storeDefaultLanguage = useVideoFilterStore((s) => s.defaultLanguage);
  const selectedTopic = useVideoFilterStore((s) => s.selectedTopic);
  const selectedAuthor = useVideoFilterStore((s) => s.selectedAuthor);
  const selectedLanguageValue = useVideoFilterStore((s) => s.selectedLanguage);
  const setDefaultLanguage = useVideoFilterStore((s) => s.setDefaultLanguage);
  const resetFilters = useVideoFilterStore((s) => s.resetFilters);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const selectedPodcastLanguage =
    storeDefaultLanguage === null ? lang : selectedLanguageValue;
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 350);
  const activeFilterCount =
    (selectedTopic ? 1 : 0) +
    (selectedAuthor ? 1 : 0) +
    (selectedPodcastLanguage !== lang ? 1 : 0);
  const hasActiveSearch = debouncedSearchQuery.length > 0;
  const {
    videos,
    isLoading: videosLoading,
    isError: videosError,
    error: videosErrorObj,
    fetchNextPage: videosFetchNextPage,
    hasNextPage: videosHasNextPage,
    isFetchingNextPage: videosIsFetchingNextPage,
    refetch: videosRefetch,
    isRefetching: videosIsRefetching,
    isFetching: videosIsFetching,
  } = useVideoList({
    language: selectedPodcastLanguage,
    selectedTopic,
    selectedAuthor,
    searchQuery: debouncedSearchQuery,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    setDefaultLanguage(lang);
  }, [lang, setDefaultLanguage]);

  useEffect(() => {
    if (!videosIsRefetching) setIsManualRefreshing(false);
  }, [videosIsRefetching]);

  useEffect(() => {
    const isBusyFetching =
      videosIsFetching && !videosIsFetchingNextPage && !videosLoading;
    Animated.timing(listOpacity, {
      toValue: isBusyFetching ? 0.4 : 1,
      duration: isBusyFetching ? 120 : 280,
      useNativeDriver: true,
    }).start();
  }, [videosIsFetching, videosIsFetchingNextPage, videosLoading, listOpacity]);

  useEffect(() => {
    if (!searchVisible) return;

    const timeout = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 120);

    return () => clearTimeout(timeout);
  }, [searchVisible]);

  const clearFilters = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    resetFilters(lang);
  }, [lang, resetFilters]);

  const clearSearch = () => {
    setSearchQuery("");
    Keyboard.dismiss();
  };

  const closeSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchQuery("");
    setSearchVisible(false);
    Keyboard.dismiss();
  };

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerWrapper}>
        <View
          style={[
            styles.sectionHeaderRow,
            {
              flexDirection: rtl ? "row-reverse" : "row",
            },
          ]}
        >
          <View
            style={[
              styles.titleGroup,
              {
                flexDirection: rtl ? "row-reverse" : "row",
              },
            ]}
          >
            {searchVisible ? (
              <View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: Colors[colorScheme].contrast,
                    flexDirection: rtl ? "row-reverse" : "row",
                  },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={colors.tabIconDefault}
                />

                <TextInput
                  ref={searchInputRef}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t("search")}
                  placeholderTextColor={Colors[colorScheme].text}
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                  clearButtonMode="never"
                  style={[
                    styles.searchInput,
                    {
                      color: colors.text,
                      textAlign: rtl ? "right" : "left",
                      writingDirection: rtl ? "rtl" : "ltr",
                    },
                  ]}
                />

                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={clearSearch}
                    style={styles.clearSearchButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.tabIconDefault}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <ThemedText
                type="title"
                style={[
                  styles.sectionLabel,
                  {
                    textAlign: rtl ? "right" : "left",
                  },
                ]}
              >
                {t("videosTitle")}
              </ThemedText>
            )}
          </View>

          <View
            style={[
              styles.headerActions,
              {
                flexDirection: rtl ? "row-reverse" : "row",
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                if (searchVisible) {
                  closeSearch();
                } else {
                  setSearchVisible(true);
                }
              }}
              style={[
                styles.iconButton,
                {
                  backgroundColor: searchVisible
                    ? Colors.universal.primary
                    : colors.backgroundElement,
                },
              ]}
            >
              <Ionicons
                name={searchVisible ? "close-outline" : "search-outline"}
                size={searchVisible ? 25 : 27}
                color={searchVisible ? "#FFFFFF" : colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push("/video-filters")}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.backgroundElement,
                },
              ]}
            >
              <Ionicons
                name="options-outline"
                size={27}
                color={
                  activeFilterCount > 0 ? Colors.universal.primary : colors.text
                }
              />

              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {activeFilterCount > 0 && (
          <View
            style={[
              styles.activeFiltersRow,
              {
                flexDirection: rtl ? "row-reverse" : "row",
              },
            ]}
          >
            {selectedTopic && (
              <View
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: colors.backgroundElement,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.filterChipText,
                    {
                      color: colors.text,
                      textAlign: rtl ? "right" : "left",
                    },
                  ]}
                >
                  {selectedTopic}
                </Text>
              </View>
            )}

            {selectedAuthor && (
              <View
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: colors.backgroundElement,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.filterChipText,
                    {
                      color: colors.text,
                      textAlign: rtl ? "right" : "left",
                    },
                  ]}
                >
                  {selectedAuthor}
                </Text>
              </View>
            )}

            {selectedPodcastLanguage !== lang && (
              <View
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: colors.backgroundElement,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.filterChipText,
                    {
                      color: colors.text,
                      textAlign: rtl ? "right" : "left",
                    },
                  ]}
                >
                  {getLanguageLabel(selectedPodcastLanguage)}
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={clearFilters} activeOpacity={0.75}>
              <Text
                style={[
                  styles.clearFiltersText,
                  {
                    color: Colors.universal.link,
                  },
                ]}
              >
                {t("reset")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [
      rtl,
      searchVisible,
      searchQuery,
      colorScheme,
      colors,
      t,
      activeFilterCount,
      selectedTopic,
      selectedAuthor,
      selectedPodcastLanguage,
      lang,
      clearFilters,
    ],
  );

  const renderEmpty = useCallback(() => {
    if (videosLoading) {
      return <VideoGridCardSkeleton />;
    }

    if (videosError) {
      return (
        <View style={styles.errorContainer}>
          <Text
            style={[
              styles.errorText,
              {
                color: colors.error,
              },
            ]}
          >
            {videosErrorObj?.message ?? t("errorLoadingData")}
          </Text>

          <RetryButton onPress={() => videosRefetch()} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText} type="subtitle">
          {hasActiveSearch || activeFilterCount > 0
            ? t("noSearchResult")
            : t("videosEmpty")}
        </ThemedText>
      </View>
    );
  }, [
    videosLoading,
    videosError,
    videosErrorObj,
    t,
    hasActiveSearch,
    activeFilterCount,
    videosRefetch,
    colors,
  ]);

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.animatedContainer,
        {
          opacity: fadeAnim,
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
        // Platform.OS === "ios" &&
        //   parseInt(Platform.Version, 10) >= 26 && {
        //     paddingBottom: insets.bottom,
        //   },
      ]}
    >
      <Animated.View style={{ flex: 1, opacity: listOpacity }}>
        <VideoGridList
          videos={videos}
          layout={
            hasActiveSearch || activeFilterCount > 0 ? "grid" : "topicRows"
          }
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshing={isManualRefreshing}
          onRefresh={() => {
            setIsManualRefreshing(true);
            videosRefetch();
          }}
          isLoadingMore={videosIsFetchingNextPage}
          onEndReached={() => {
            if (
              videosHasNextPage &&
              !videosIsFetchingNextPage &&
              !videosLoading
            ) {
              videosFetchNextPage();
            }
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
  },
  headerWrapper: {
    paddingBottom: 16,
    paddingTop: 10,
  },
  sectionHeaderRow: {
    minHeight: 40,
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleGroup: {
    flex: 1,
    alignItems: "center",
    gap: 10,
    paddingRight: 12,
    height: 40,
  },
  sectionLabel: {},
  headerActions: {
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    minHeight: 44,
    borderRadius: 22,
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 10,
  },
  clearSearchButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: Colors.universal.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  activeFiltersRow: {
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  filterChip: {
    maxWidth: 170,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: "transparent",
  },
  emptyText: {
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
});
