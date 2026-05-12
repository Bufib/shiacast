// import { LoadingIndicator } from "@/components/LoadingIndicator";
// import RetryButton from "@/components/RetryButton";
// import { ThemedText } from "@/components/ThemedText";
// import FilterModal from "@/components/FilterModal";
// import { Colors } from "@/constants/Colors";
// import { PodcastType } from "@/constants/Types";
// import { useGradient } from "@/hooks/useGradient";
// import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";
// import Feather from "@expo/vector-icons/Feather";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   InfiniteData,
//   QueryKey,
//   useInfiniteQuery,
//   useQuery,
// } from "@tanstack/react-query";
// import { router } from "expo-router";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   Animated,
//   FlatList,
//   Keyboard,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   useWindowDimensions,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { useLanguage } from "../../../../contexts/LanguageContext";
// import { supabase } from "../../../../utils/supabase";
// import { formatDate } from "../../../../utils/formatDate";

// const PAGE_SIZE = 20;
// const GRID_GAP = 12;
// const HORIZONTAL_PADDING = 16;
// const CARD_HEIGHT = 230;

// type PodcastPage = {
//   items: PodcastType[];
//   nextOffset?: number;
// };

// type PodcastGridCardProps = {
//   podcast: PodcastType;
//   width: number;
//   rtl: boolean;
//   lang: string;
//   listenText: string;
//   gradientColors: readonly [string, string, ...string[]] | string[];
// };

// function useDebouncedValue<T>(value: T, delay = 350) {
//   const [debouncedValue, setDebouncedValue] = useState(value);
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => clearTimeout(timeout);
//   }, [value, delay]);

//   return debouncedValue;
// }

// function parseTopics(raw: any): string[] {
//   if (!raw) return [];

//   if (Array.isArray(raw)) {
//     return raw.map((topic) => String(topic).trim()).filter(Boolean);
//   }

//   if (typeof raw === "string") {
//     const trimmed = raw.trim();

//     if (trimmed.startsWith("[")) {
//       try {
//         const parsed = JSON.parse(trimmed);

//         if (Array.isArray(parsed)) {
//           return parsed.map((topic) => String(topic).trim()).filter(Boolean);
//         }
//       } catch {}
//     }

//     return trimmed ? [trimmed] : [];
//   }

//   return [];
// }

// function matchesTopic(rawTopic: any, topic: string): boolean {
//   return parseTopics(rawTopic).includes(topic);
// }

// function PodcastGridCard({
//   podcast,
//   width,
//   rtl,
//   lang,
//   listenText,
//   gradientColors,
// }: PodcastGridCardProps) {
//   const formattedDate = formatDate(podcast.created_at);
//   const colorScheme = useColorScheme() || "light";

//   return (
//     <View style={[styles.cardShadow, { width }]}>
//       <LinearGradient
//         style={styles.card}
//         colors={gradientColors as any}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View style={styles.cardOverlay} />

//         <View
//           style={[
//             styles.vinylRecord,
//             rtl ? styles.vinylRecordRtl : styles.vinylRecordLtr,
//           ]}
//         >
//           <Feather name="mic" size={18} color={"#fff"} />
//         </View>

//         <View style={styles.cardContent}>
//           <View style={styles.titleContainer}>
//             <Text
//               style={[
//                 styles.cardTitle,
//                 {
//                   textAlign: lang === "ar" ? "right" : "left",
//                   writingDirection: rtl ? "rtl" : "ltr",
//                 },
//               ]}
//               numberOfLines={4}
//               ellipsizeMode="tail"
//             >
//               {podcast.title}
//             </Text>
//           </View>

//           <View style={styles.cardFooter}>
//             <View
//               style={[
//                 styles.playSection,
//                 { flexDirection: rtl ? "row-reverse" : "row" },
//               ]}
//             >
//               <View style={styles.playButton}>
//                 <Feather name="play" size={13} color="#FFFFFF" />
//               </View>

//               <Text
//                 style={[
//                   styles.playText,
//                   rtl ? styles.playTextRtl : styles.playTextLtr,
//                 ]}
//                 numberOfLines={1}
//               >
//                 {listenText}
//               </Text>
//             </View>

//             <Text
//               style={[
//                 styles.createdAt,
//                 {
//                   textAlign: rtl ? "left" : "right",
//                   writingDirection: rtl ? "rtl" : "ltr",
//                 },
//               ]}
//               numberOfLines={1}
//             >
//               {formattedDate}
//             </Text>
//           </View>
//         </View>
//       </LinearGradient>
//     </View>
//   );
// }

// export default function HomeScreen() {
//   const colorScheme = useColorScheme() ?? "light";
//   const colors = Colors[colorScheme];

//   const { t } = useTranslation();
//   const { lang, rtl } = useLanguage();
//   const { gradientColors } = useGradient();
//   const { fadeAnim, onLayout } = useScreenFadeIn(800);
//   const insets = useSafeAreaInsets();
//   const { width } = useWindowDimensions();

//   const searchInputRef = useRef<TextInput>(null);

//   const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
//   const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
//   const [filterVisible, setFilterVisible] = useState(false);

//   const [searchVisible, setSearchVisible] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 350);

//   const podcastCardWidth = useMemo(() => {
//     return (width - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;
//   }, [width]);

//   const activeFilterCount = (selectedTopic ? 1 : 0) + (selectedAuthor ? 1 : 0);
//   const hasActiveSearch = debouncedSearchQuery.length > 0;

//   useEffect(() => {
//     if (searchVisible) {
//       const timeout = setTimeout(() => {
//         searchInputRef.current?.focus();
//       }, 120);

//       return () => clearTimeout(timeout);
//     }
//   }, [searchVisible]);

//   const { data: filterPairs = [] } = useQuery<
//     { topic: string | null; author: string | null }[]
//   >({
//     queryKey: ["home_podcast_filter_pairs", lang],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("podcasts")
//         .select("podcast_topic, podcast_author")
//         .eq("language_code", lang);

//       if (error) throw error;

//       return (data ?? []).flatMap(
//         (row: any): { topic: string | null; author: string | null }[] => {
//           const topics = parseTopics(row.podcast_topic);
//           const author = row.podcast_author ?? null;

//           if (topics.length === 0) {
//             return [{ topic: null, author }];
//           }

//           return topics.map((topic) => ({
//             topic,
//             author,
//           }));
//         },
//       );
//     },
//     enabled: Boolean(lang),
//     staleTime: 60 * 60 * 1000,
//   });

//   const allTopics = useMemo(
//     () =>
//       [
//         ...new Set(
//           filterPairs
//             .map((pair) => pair.topic)
//             .filter((topic): topic is string => Boolean(topic)),
//         ),
//       ].sort(),
//     [filterPairs],
//   );

//   const allAuthors = useMemo(
//     () =>
//       [
//         ...new Set(
//           filterPairs
//             .map((pair) => pair.author)
//             .filter((author): author is string => Boolean(author)),
//         ),
//       ].sort(),
//     [filterPairs],
//   );

//   const availableTopics = useMemo(() => {
//     if (!selectedAuthor) return allTopics;

//     return [
//       ...new Set(
//         filterPairs
//           .filter((pair) => pair.author === selectedAuthor)
//           .map((pair) => pair.topic)
//           .filter((topic): topic is string => Boolean(topic)),
//       ),
//     ].sort();
//   }, [filterPairs, selectedAuthor, allTopics]);

//   const availableAuthors = useMemo(() => {
//     if (!selectedTopic) return allAuthors;

//     return [
//       ...new Set(
//         filterPairs
//           .filter((pair) => pair.topic === selectedTopic)
//           .map((pair) => pair.author)
//           .filter((author): author is string => Boolean(author)),
//       ),
//     ].sort();
//   }, [filterPairs, selectedTopic, allAuthors]);

//   const {
//     data: podcastPages,
//     isLoading: podcastsLoading,
//     isError: podcastsError,
//     error: podcastsErrorObj,
//     fetchNextPage: podcastsFetchNextPage,
//     hasNextPage: podcastsHasNextPage,
//     isFetchingNextPage: podcastsIsFetchingNextPage,
//     refetch: podcastsRefetch,
//   } = useInfiniteQuery<
//     PodcastPage,
//     Error,
//     InfiniteData<PodcastPage>,
//     QueryKey,
//     number
//   >({
//     queryKey: [
//       "home_podcasts_grid",
//       lang,
//       selectedTopic,
//       selectedAuthor,
//       debouncedSearchQuery,
//     ],
//     queryFn: async ({ pageParam = 0 }) => {
//       let query = supabase
//         .from("podcasts")
//         .select("*")
//         .eq("language_code", lang)
//         .order("created_at", { ascending: false })
//         .range(pageParam, pageParam + PAGE_SIZE - 1);

//       if (selectedAuthor) {
//         query = query.eq("podcast_author", selectedAuthor);
//       }

//       if (debouncedSearchQuery.length > 0) {
//         query = query.ilike("title", `%${debouncedSearchQuery}%`);
//       }

//       const { data, error } = await query;

//       if (error) throw error;

//       const rawRows = (data ?? []) as PodcastType[];

//       const filteredRows = selectedTopic
//         ? rawRows.filter((podcast: any) =>
//             matchesTopic(podcast.podcast_topic, selectedTopic),
//           )
//         : rawRows;

//       return {
//         items: filteredRows,
//         nextOffset:
//           rawRows.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
//       };
//     },
//     getNextPageParam: (lastPage) => lastPage.nextOffset,
//     initialPageParam: 0,
//     enabled: Boolean(lang),
//   });

//   const podcasts: PodcastType[] =
//     podcastPages?.pages.flatMap((page) => page.items) ?? [];

//   const clearFilters = () => {
//     setSelectedTopic(null);
//     setSelectedAuthor(null);
//   };

//   const clearSearch = () => {
//     setSearchQuery("");
//     Keyboard.dismiss();
//   };

//   const closeSearch = () => {
//     setSearchQuery("");
//     setSearchVisible(false);
//     Keyboard.dismiss();
//   };

//   const renderHeader = () => (
//     <View style={styles.headerWrapper}>
//       <View
//         style={[
//           styles.sectionHeaderRow,
//           {
//             flexDirection: rtl ? "row-reverse" : "row",
//           },
//         ]}
//       >
//         <View
//           style={[
//             styles.titleGroup,
//             {
//               flexDirection: rtl ? "row-reverse" : "row",
//             },
//           ]}
//         >
//           {searchVisible ? (
//             <View
//               style={[
//                 styles.searchContainer,
//                 {
//                   backgroundColor: Colors[colorScheme].contrast,
//                   flexDirection: rtl ? "row-reverse" : "row",
//                 },
//               ]}
//             >
//               <Ionicons
//                 name="search-outline"
//                 size={18}
//                 color={colors.tabIconDefault}
//               />

//               <TextInput
//                 ref={searchInputRef}
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//                 placeholder={t("search") || "Suchen"}
//                 placeholderTextColor={colors.tabIconDefault}
//                 returnKeyType="search"
//                 autoCorrect={false}
//                 autoCapitalize="none"
//                 clearButtonMode="never"
//                 style={[
//                   styles.searchInput,
//                   {
//                     color: colors.text,
//                     textAlign: rtl ? "right" : "left",
//                     writingDirection: rtl ? "rtl" : "ltr",
//                   },
//                 ]}
//               />

//               {searchQuery.length > 0 && (
//                 <TouchableOpacity
//                   activeOpacity={0.75}
//                   onPress={clearSearch}
//                   style={styles.clearSearchButton}
//                 >
//                   <Ionicons
//                     name="close-circle"
//                     size={18}
//                     color={colors.tabIconDefault}
//                   />
//                 </TouchableOpacity>
//               )}
//             </View>
//           ) : (
//             <ThemedText
//               type="title"

//               style={[
//                 styles.sectionLabel,
//                 {
//                   textAlign: rtl ? "right" : "left",
//                 },
//               ]}
//             >
//               {t("podcastsTitle")}
//             </ThemedText>
//           )}
//         </View>

//         <View
//           style={[
//             styles.headerActions,
//             {
//               flexDirection: rtl ? "row-reverse" : "row",
//             },
//           ]}
//         >
//           <TouchableOpacity
//             activeOpacity={0.75}
//             onPress={() => {
//               if (searchVisible) {
//                 closeSearch();
//               } else {
//                 setSearchVisible(true);
//               }
//             }}
//             style={[
//               styles.iconButton,
//               {
//                 backgroundColor: searchVisible
//                   ? Colors.universal.primary
//                   : colors.backgroundElement,
//               },
//             ]}
//           >
//             <Ionicons
//               name={searchVisible ? "close-outline" : "search-outline"}
//               size={20}
//               color={searchVisible ? "#FFFFFF" : colors.text}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             activeOpacity={0.75}
//             onPress={() => setFilterVisible(true)}
//             style={[
//               styles.iconButton,
//               {
//                 backgroundColor: colors.backgroundElement,
//               },
//             ]}
//           >
//             <Ionicons
//               name="options-outline"
//               size={19}
//               color={
//                 activeFilterCount > 0 ? Colors.universal.primary : colors.text
//               }
//             />

//             {activeFilterCount > 0 && (
//               <View style={styles.filterBadge}>
//                 <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>

//       {activeFilterCount > 0 && (
//         <View
//           style={[
//             styles.activeFiltersRow,
//             {
//               flexDirection: rtl ? "row-reverse" : "row",
//             },
//           ]}
//         >
//           {selectedTopic && (
//             <View
//               style={[
//                 styles.filterChip,
//                 {
//                   backgroundColor: colors.backgroundElement,
//                 },
//               ]}
//             >
//               <Text
//                 numberOfLines={1}
//                 style={[
//                   styles.filterChipText,
//                   {
//                     color: colors.text,
//                     textAlign: rtl ? "right" : "left",
//                   },
//                 ]}
//               >
//                 {selectedTopic}
//               </Text>
//             </View>
//           )}

//           {selectedAuthor && (
//             <View
//               style={[
//                 styles.filterChip,
//                 {
//                   backgroundColor: colors.backgroundElement,
//                 },
//               ]}
//             >
//               <Text
//                 numberOfLines={1}
//                 style={[
//                   styles.filterChipText,
//                   {
//                     color: colors.text,
//                     textAlign: rtl ? "right" : "left",
//                   },
//                 ]}
//               >
//                 {selectedAuthor}
//               </Text>
//             </View>
//           )}

//           <TouchableOpacity onPress={clearFilters} activeOpacity={0.75}>
//             <Text
//               style={[
//                 styles.clearFiltersText,
//                 {
//                   color: Colors.universal.link,
//                 },
//               ]}
//             >
//               {t("reset")}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );

//   const renderEmpty = () => {
//     if (podcastsLoading) {
//       return <LoadingIndicator style={styles.sectionLoader} size="large" />;
//     }

//     if (podcastsError) {
//       return (
//         <View style={styles.errorContainer}>
//           <Text
//             style={[
//               styles.errorText,
//               {
//                 color: colors.error,
//               },
//             ]}
//           >
//             {podcastsErrorObj?.message ?? t("errorLoadingData")}
//           </Text>

//           <RetryButton onPress={() => podcastsRefetch()} />
//         </View>
//       );
//     }

//     return (
//       <View style={styles.emptyContainer}>
//         <ThemedText style={styles.emptyText} type="subtitle">
//           {hasActiveSearch || activeFilterCount > 0
//             ? t("noSearchResult") || "Keine passenden Podcasts gefunden"
//             : t("podcastsEmpty") ||
//               t("noPodcasts") ||
//               "Keine Podcasts vorhanden"}
//         </ThemedText>
//       </View>
//     );
//   };

//   return (
//     <Animated.View
//       onLayout={onLayout}
//       style={[
//         styles.animatedContainer,
//         {
//           backgroundColor: colors.background,
//           paddingTop: insets.top,
//           paddingBottom: insets.bottom,
//         },
//       ]}
//     >
//       <FilterModal
//         visible={filterVisible}
//         onClose={() => setFilterVisible(false)}
//         topics={availableTopics}
//         authors={availableAuthors}
//         selectedTopic={selectedTopic}
//         selectedAuthor={selectedAuthor}
//         onSelectTopic={setSelectedTopic}
//         onSelectAuthor={setSelectedAuthor}
//       />

//       <FlatList
//         data={podcasts}
//         numColumns={2}
//         key="podcast-grid-2"
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             activeOpacity={0.85}
//             style={[
//               styles.podcastItem,
//               {
//                 width: podcastCardWidth,
//               },
//             ]}
//             onPress={() =>
//               router.push({
//                 pathname: "/indexPodcast",
//                 params: {
//                   podcast: JSON.stringify(item),
//                 },
//               })
//             }
//           >
//             <PodcastGridCard
//               podcast={item}
//               width={podcastCardWidth}
//               rtl={rtl}
//               lang={lang}
//               listenText={t("listen")}
//               gradientColors={gradientColors}
//             />
//           </TouchableOpacity>
//         )}
//         columnWrapperStyle={styles.columnWrapper}
//         ListHeaderComponent={renderHeader}
//         ListEmptyComponent={renderEmpty}
//         ListFooterComponent={
//           podcastsIsFetchingNextPage ? (
//             <View style={styles.footerLoader}>
//               <LoadingIndicator size="small" />
//             </View>
//           ) : null
//         }
//         onEndReached={() => {
//           if (
//             podcastsHasNextPage &&
//             !podcastsIsFetchingNextPage &&
//             !podcastsLoading
//           ) {
//             podcastsFetchNextPage();
//           }
//         }}
//         onEndReachedThreshold={0.4}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContent}
//       />
//     </Animated.View>
//   );
// }
// const styles = StyleSheet.create({
//   animatedContainer: {
//     flex: 1,
//   },

//   listContent: {
//     paddingTop: 18,
//     paddingBottom: 30,
//     paddingHorizontal: HORIZONTAL_PADDING,
//   },

//   headerWrapper: {
//     marginBottom: 16,
//   },

//   sectionHeaderRow: {
//     minHeight: 40,
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   titleGroup: {
//     flex: 1,
//     alignItems: "center",
//     gap: 10,
//     paddingRight: 12,
//     height: 50
//   },

//   headerIconContainer: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   sectionLabel: {
//     paddingHorizontal: 6
//   },

//   headerActions: {
//     alignItems: "center",
//     gap: 8,
//   },

//   iconButton: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   searchContainer: {
//     minHeight: 44,
//     borderRadius: 22,
//     alignItems: "center",
//     paddingHorizontal: 14,
//     gap: 8,

//   },

//   searchInput: {
//     flex: 1,
//     fontSize: 15,
//     fontWeight: "500",
//     paddingVertical: 10,
//   },

//   clearSearchButton: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   filterBadge: {
//     position: "absolute",
//     top: -2,
//     right: -2,
//     minWidth: 16,
//     height: 16,
//     borderRadius: 8,
//     paddingHorizontal: 4,
//     backgroundColor: Colors.universal.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   filterBadgeText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "700",
//   },

//   activeFiltersRow: {
//     alignItems: "center",
//     flexWrap: "wrap",
//   },

//   filterChip: {
//     maxWidth: 170,
//     borderRadius: 999,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },

//   filterChipText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },

//   clearFiltersText: {
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   columnWrapper: {
//     justifyContent: "space-between",
//     marginBottom: GRID_GAP,
//   },

//   podcastItem: {
//     marginBottom: 0,
//   },

//   cardShadow: {
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.18,
//     shadowRadius: 4,
//     elevation: 3,
//     overflow: "visible",
//   },

//   card: {
//     width: "100%",
//     height: CARD_HEIGHT,
//     borderRadius: 26,
//     position: "relative",
//     overflow: "hidden",
//   },

//   cardOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0, 0, 0, 0.2)",
//     zIndex: 1,
//   },

//   vinylRecord: {
//     position: "absolute",
//     top: 12,
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     backgroundColor: "rgba(0, 0, 0, 0.22)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 3,
//   },

//   vinylRecordLtr: {
//     right: 12,
//   },

//   vinylRecordRtl: {
//     left: 12,
//   },

//   cardContent: {
//     flex: 1,
//     padding: 16,
//     justifyContent: "space-between",
//     zIndex: 2,
//   },

//   titleContainer: {
//     flex: 1,
//     justifyContent: "center",
//     paddingTop: 44,
//     marginBottom: 12,
//   },

//   cardTitle: {
//     fontSize: 17,
//     fontWeight: "900",
//     color: "#FFFFFF",
//     lineHeight: 22,
//     letterSpacing: -0.3,
//     textShadowColor: "rgba(0, 0, 0, 0.45)",
//     textShadowOffset: {
//       width: 0,
//       height: 0,
//     },
//     textShadowRadius: 4,
//   },

//   cardFooter: {
//     gap: 8,
//   },

//   playSection: {
//     alignItems: "center",
//   },

//   playButton: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "rgba(255, 255, 255, 0.28)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   playText: {
//     flex: 1,
//     fontSize: 11,
//     fontWeight: "800",
//     color: "rgba(255, 255, 255, 0.9)",
//     letterSpacing: 0.8,
//     textTransform: "uppercase",
//   },

//   playTextLtr: {
//     marginLeft: 8,
//   },

//   playTextRtl: {
//     marginRight: 8,
//   },

//   createdAt: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "rgba(255, 255, 255, 0.78)",
//     letterSpacing: 0.4,
//     textTransform: "uppercase",
//   },

//   sectionLoader: {
//     marginVertical: 24,
//   },

//   footerLoader: {
//     paddingVertical: 16,
//     alignItems: "center",
//   },

//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 32,
//     backgroundColor: "transparent",
//   },

//   emptyText: {
//     textAlign: "center",
//   },

//   errorContainer: {
//     alignItems: "center",
//     gap: 10,
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//   },

//   errorText: {
//     fontSize: 16,
//     textAlign: "center",
//   },
// });
import { LoadingIndicator } from "@/components/LoadingIndicator";
import RetryButton from "@/components/RetryButton";
import { ThemedText } from "@/components/ThemedText";
import FilterModal from "@/components/FilterModal";
import { Colors } from "@/constants/Colors";
import { PodcastType } from "@/constants/Types";
import { useGradient } from "@/hooks/useGradient";
import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { usePodcastFilters } from "../../../../hooks/usePodcastFilters";
import { usePodcastLanguages } from "../../../../hooks/usePodcastLanguages";
import { usePodcastList } from "../../../../hooks/usePodcastList";
import Feather from "@expo/vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage } from "../../../../contexts/LanguageContext";
import { formatDate } from "../../../../utils/formatDate";

const PAGE_SIZE = 20;
const GRID_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_HEIGHT = 230;

const getLanguageLabel = (language: string | null) => {
  if (language === null) return "All languages";

  switch (language) {
    case "de":
      return "Deutsch";
    case "en":
      return "English";
    case "ar":
      return "العربية";
    default:
      return language.toUpperCase();
  }
};

type PodcastGridCardProps = {
  podcast: PodcastType;
  width: number;
  rtl: boolean;
  lang: string;
  listenText: string;
  gradientColors: readonly [string, string, ...string[]] | string[];
};



function PodcastGridCard({
  podcast,
  width,
  rtl,
  lang,
  listenText,
  gradientColors,
}: PodcastGridCardProps) {
  const formattedDate = formatDate(podcast.created_at);
  const hasCover = Boolean(podcast.image_url);

  return (
    <View style={[styles.cardShadow, { width }]}>
      <View style={styles.card}>
        {hasCover ? (
          <>
            <Image
              source={{ uri: podcast.image_url! }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />

            <LinearGradient
              colors={[
                "rgba(0,0,0,0.15)",
                "rgba(0,0,0,0.4)",
                "rgba(0,0,0,0.8)",
              ]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </>
        ) : (
          <>
            <LinearGradient
              style={StyleSheet.absoluteFill}
              colors={gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.cardOverlay} />
          </>
        )}

        <View
          style={[
            styles.vinylRecord,
            rtl ? styles.vinylRecordRtl : styles.vinylRecordLtr,
          ]}
        >
          <Feather name="mic" size={18} color="#fff" />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.cardTitle,
                {
                  textAlign: lang === "ar" ? "right" : "left",
                  writingDirection: rtl ? "rtl" : "ltr",
                },
              ]}
              numberOfLines={4}
              ellipsizeMode="tail"
            >
              {podcast.title}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View
              style={[
                styles.playSection,
                { flexDirection: rtl ? "row-reverse" : "row" },
              ]}
            >
              <View style={styles.playButton}>
                <Feather name="play" size={13} color="#FFFFFF" />
              </View>

              <Text
                style={[
                  styles.playText,
                  rtl ? styles.playTextRtl : styles.playTextLtr,
                ]}
                numberOfLines={1}
              >
                {listenText}
              </Text>
            </View>

            <Text
              style={[
                styles.createdAt,
                {
                  textAlign: rtl ? "left" : "right",
                  writingDirection: rtl ? "rtl" : "ltr",
                },
              ]}
              numberOfLines={1}
            >
              {formattedDate}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const { t } = useTranslation();
  const { lang, rtl } = useLanguage();
  const { gradientColors } = useGradient();
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const searchInputRef = useRef<TextInput>(null);
  const previousPodcastDefaultLanguageRef = useRef(lang);

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedPodcastLanguage, setSelectedPodcastLanguage] = useState<
    string | null
  >(lang);
  const [filterVisible, setFilterVisible] = useState(false);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 350);

  const podcastCardWidth = useMemo(() => {
    return (width - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;
  }, [width]);

  const activeFilterCount =
    (selectedTopic ? 1 : 0) +
    (selectedAuthor ? 1 : 0) +
    (selectedPodcastLanguage !== lang ? 1 : 0);
  const hasActiveSearch = debouncedSearchQuery.length > 0;

  const { languages } = usePodcastLanguages();
  const { availableTopics, availableAuthors } = usePodcastFilters({
    language: selectedPodcastLanguage,
    selectedTopic,
    selectedAuthor,
  });
  const {
    podcasts,
    isLoading: podcastsLoading,
    isError: podcastsError,
    error: podcastsErrorObj,
    fetchNextPage: podcastsFetchNextPage,
    hasNextPage: podcastsHasNextPage,
    isFetchingNextPage: podcastsIsFetchingNextPage,
    refetch: podcastsRefetch,
  } = usePodcastList({
    language: selectedPodcastLanguage,
    selectedTopic,
    selectedAuthor,
    searchQuery: debouncedSearchQuery,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    const previousDefaultLanguage = previousPodcastDefaultLanguageRef.current;
    previousPodcastDefaultLanguageRef.current = lang;

    if (selectedPodcastLanguage === previousDefaultLanguage) {
      setSelectedPodcastLanguage(lang);
    }
  }, [lang, selectedPodcastLanguage]);

  useEffect(() => {
    if (!searchVisible) return;

    const timeout = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 120);

    return () => clearTimeout(timeout);
  }, [searchVisible]);

  const clearFilters = () => {
    setSelectedTopic(null);
    setSelectedAuthor(null);
    setSelectedPodcastLanguage(lang);
  };

  const clearSearch = () => {
    setSearchQuery("");
    Keyboard.dismiss();
  };

  const closeSearch = () => {
    setSearchQuery("");
    setSearchVisible(false);
    Keyboard.dismiss();
  };

  const renderHeader = () => (
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
                placeholder={t("search") || "Suchen"}
                placeholderTextColor={colors.tabIconDefault}
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
              {t("podcastsTitle")}
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
              size={20}
              color={searchVisible ? "#FFFFFF" : colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setFilterVisible(true)}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.backgroundElement,
              },
            ]}
          >
            <Ionicons
              name="options-outline"
              size={19}
              color={
                activeFilterCount > 0 ? Colors.universal.primary : colors.text
              }
            />

            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
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
  );

  const renderEmpty = () => {
    if (podcastsLoading) {
      return <LoadingIndicator style={styles.sectionLoader} size="large" />;
    }

    if (podcastsError) {
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
            {podcastsErrorObj?.message ?? t("errorLoadingData")}
          </Text>

          <RetryButton onPress={() => podcastsRefetch()} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText} type="subtitle">
          {hasActiveSearch || activeFilterCount > 0
            ? t("noSearchResult") || "Keine passenden Podcasts gefunden"
            : t("podcastsEmpty") ||
              t("noPodcasts") ||
              "Keine Podcasts vorhanden"}
        </ThemedText>
      </View>
    );
  };

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.animatedContainer,
        {
          opacity: fadeAnim,
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        topics={availableTopics}
        authors={availableAuthors}
        languages={languages}
        selectedTopic={selectedTopic}
        selectedAuthor={selectedAuthor}
        selectedLanguage={selectedPodcastLanguage}
        defaultLanguage={lang}
        onSelectTopic={setSelectedTopic}
        onSelectAuthor={setSelectedAuthor}
        onSelectLanguage={(language) => {
          setSelectedPodcastLanguage(language);
          setSelectedTopic(null);
          setSelectedAuthor(null);
        }}
      />

      <FlatList
        data={podcasts}
        numColumns={2}
        key="podcast-grid-2"
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.podcastItem,
              {
                width: podcastCardWidth,
              },
            ]}
            onPress={() =>
              router.push({
                pathname: "/indexPodcast",
                params: {
                  podcast: JSON.stringify(item),
                },
              })
            }
          >
            <PodcastGridCard
              podcast={item}
              width={podcastCardWidth}
              rtl={rtl}
              lang={lang}
              listenText={t("listen")}
              gradientColors={gradientColors}
            />
          </TouchableOpacity>
        )}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          podcastsIsFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <LoadingIndicator size="small" />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (
            podcastsHasNextPage &&
            !podcastsIsFetchingNextPage &&
            !podcastsLoading
          ) {
            podcastsFetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
  },

  listContent: {
    paddingTop: 18,
    paddingBottom: 30,
    paddingHorizontal: HORIZONTAL_PADDING,
  },

  headerWrapper: {
    marginBottom: 16,
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
    height: 50,
  },

  sectionLabel: {
    paddingHorizontal: 6,
  },

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

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: GRID_GAP,
  },

  podcastItem: {
    marginBottom: 0,
  },

  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
    overflow: "visible",
  },

  card: {
    width: "100%",
    height: CARD_HEIGHT,
    borderRadius: 26,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    zIndex: 1,
  },

  vinylRecord: {
    position: "absolute",
    top: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },

  vinylRecordLtr: {
    right: 12,
  },

  vinylRecordRtl: {
    left: 12,
  },

  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    zIndex: 2,
  },

  titleContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 44,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 22,
    letterSpacing: -0.3,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 4,
  },

  cardFooter: {
    gap: 8,
  },

  playSection: {
    alignItems: "center",
  },

  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    justifyContent: "center",
    alignItems: "center",
  },

  playText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  playTextLtr: {
    marginLeft: 8,
  },

  playTextRtl: {
    marginRight: 8,
  },

  createdAt: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.78)",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  sectionLoader: {
    marginVertical: 24,
  },

  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
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
