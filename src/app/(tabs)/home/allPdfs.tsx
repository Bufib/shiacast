// import { LoadingIndicator } from "@/components/LoadingIndicator";
// import { ThemedText } from "@/components/ThemedText";
// import FilterModal from "@/components/FilterModal";
// import { Colors } from "@/constants/Colors";
// import { PdfType } from "@/constants/Types";
// import { useLanguage } from "../../../../contexts/LanguageContext";
// import { supabase } from "../../../../utils/supabase";
// import { returnSize } from "../../../../utils/sizes";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   InfiniteData,
//   QueryKey,
//   useInfiniteQuery,
//   useQuery,
// } from "@tanstack/react-query";
// import { router } from "expo-router";
// import React, { useCallback, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FlatList,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useColorScheme,
//   useWindowDimensions,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";

// const PAGE_SIZE = 20;

// /**
//  * Safely parse a pdf_topic value that can be:
//  *  - null / undefined
//  *  - a plain string like "Fiqh"
//  *  - a JSON-encoded array string like '["Fiqh","Aqida"]'
//  *  - an actual JS array like ["Fiqh","Aqida"]
//  *
//  * Always returns a flat string[] of individual topics.
//  */
// function parseTopics(raw: any): string[] {
//   if (!raw) return [];
//   if (Array.isArray(raw))
//     return raw.map((t) => String(t).trim()).filter(Boolean);
//   if (typeof raw === "string") {
//     const trimmed = raw.trim();
//     if (trimmed.startsWith("[")) {
//       try {
//         const parsed = JSON.parse(trimmed);
//         if (Array.isArray(parsed))
//           return parsed.map((t) => String(t).trim()).filter(Boolean);
//       } catch {
//         // not valid JSON – treat as plain string
//       }
//     }
//     return trimmed ? [trimmed] : [];
//   }
//   return [];
// }

// /**
//  * Check whether a PDF's raw topic value contains a specific topic string.
//  */
// function pdfMatchesTopic(rawTopic: any, topic: string): boolean {
//   return parseTopics(rawTopic).includes(topic);
// }

// export default function AllPdfsScreen() {
//   const { lang } = useLanguage();
//   const { t } = useTranslation();
//   const colorScheme = useColorScheme() ?? "light";
//   const { width, height } = useWindowDimensions();
//   const { previewSizes } = returnSize(width, height);

//   const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
//   const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
//   const [filterVisible, setFilterVisible] = useState(false);

//   // ── Fetch all unique (topic, author) pairs ──────────────────────────
//   const { data: filterPairs = [] } = useQuery<
//     { topic: string | null; author: string | null }[]
//   >({
//     queryKey: ["pdf_filter_pairs", lang],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("pdfs")
//         .select("pdf_topic, pdf_author")
//         .eq("language_code", lang);
//       if (error) throw error;

//       // Flatten: one row with ["a","b"] becomes two pairs
//       return (data ?? []).flatMap((r: any): { topic: string | null; author: string | null }[] => {
//         const topics = parseTopics(r.pdf_topic);
//         const author = r.pdf_author ?? null;
//         if (topics.length === 0) return [{ topic: null, author }];
//         return topics.map((tp) => ({ topic: tp, author }));
//       });
//     },
//     staleTime: 60 * 60 * 1000,
//   });

//   // ── Derive deduplicated, sorted topic & author lists ────────────────
//   const allTopics = useMemo(
//     () =>
//       [
//         ...new Set(filterPairs.map((p) => p.topic).filter(Boolean)),
//       ].sort() as string[],
//     [filterPairs],
//   );

//   const allAuthors = useMemo(
//     () =>
//       [
//         ...new Set(filterPairs.map((p) => p.author).filter(Boolean)),
//       ].sort() as string[],
//     [filterPairs],
//   );

//   const availableTopics = useMemo(
//     () =>
//       selectedAuthor
//         ? ([
//             ...new Set(
//               filterPairs
//                 .filter((p) => p.author === selectedAuthor)
//                 .map((p) => p.topic)
//                 .filter(Boolean),
//             ),
//           ].sort() as string[])
//         : allTopics,
//     [filterPairs, selectedAuthor, allTopics],
//   );

//   const availableAuthors = useMemo(
//     () =>
//       selectedTopic
//         ? ([
//             ...new Set(
//               filterPairs
//                 .filter((p) => p.topic === selectedTopic)
//                 .map((p) => p.author)
//                 .filter(Boolean),
//             ),
//           ].sort() as string[])
//         : allAuthors,
//     [filterPairs, selectedTopic, allAuthors],
//   );

//   // ── Infinite query for PDFs ─────────────────────────────────────────
//   const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
//     useInfiniteQuery<
//       PdfType[],
//       Error,
//       InfiniteData<PdfType[]>,
//       QueryKey,
//       number
//     >({
//       queryKey: ["all_pdfs_filtered", lang, selectedTopic, selectedAuthor],
//       queryFn: async ({ pageParam = 0 }) => {
//         let query = supabase
//           .from("pdfs")
//           .select("*")
//           .eq("language_code", lang)
//           .order("created_at", { ascending: false })
//           .range(pageParam, pageParam + PAGE_SIZE - 1);

//         // Author is a simple string – use .eq directly
//         if (selectedAuthor) query = query.eq("pdf_author", selectedAuthor);

//         // Topic lives inside an array (or JSON string), so we fetch all and
//         // filter client-side. If you migrate pdf_topic to a proper Postgres
//         // array column you can replace this with:
//         //   query = query.contains("pdf_topic", [selectedTopic]);

//         const { data: result, error } = await query;
//         if (error) throw error;

//         let rows = result ?? [];

//         // Client-side topic filter – handles "Fiqh" AND '["Fiqh","Aqida"]'
//         if (selectedTopic) {
//           rows = rows.filter((pdf) =>
//             pdfMatchesTopic((pdf as any).pdf_topic, selectedTopic),
//           );
//         }

//         return rows;
//       },
//       getNextPageParam: (lastPage, allPages) => {
//         const fetchedSoFar = allPages.reduce(
//           (acc, page) => acc + page.length,
//           0,
//         );
//         return lastPage.length === PAGE_SIZE ? fetchedSoFar : undefined;
//       },
//       initialPageParam: 0,
//       enabled: Boolean(lang),
//     });

//   const pdfs: PdfType[] = data?.pages.flat() ?? [];

//   const getPaddedData = (items: PdfType[]) => {
//     if (items.length % 2 === 1) {
//       return [...items, { id: -1, isPlaceholder: true } as any];
//     }
//     return items;
//   };

//   // ── Render ──────────────────────────────────────────────────────────
//   const renderItem = useCallback(
//     ({ item }: { item: PdfType & { isPlaceholder?: boolean } }) => {
//       if ((item as any).isPlaceholder) {
//         return <View style={{ width: previewSizes }} />;
//       }
//       return (
//         <TouchableOpacity
//           style={styles.tileWrapper}
//           onPress={() =>
//             router.push({
//               pathname: "/(pdfs)",
//               params: { id: item.id, filename: item.pdf_filename },
//             })
//           }
//           activeOpacity={0.85}
//         >
//           <View
//             style={[
//               styles.modernTile,
//               {
//                 width: previewSizes,
//                 height: 200,
//                 backgroundColor: Colors[colorScheme].contrast,
//                 borderColor: Colors[colorScheme].border,
//               },
//             ]}
//           >
//             <View style={styles.tileContent}>
//               <View style={styles.tileIconContainer}>
//                 <View
//                   style={[
//                     styles.iconCircle,
//                     { backgroundColor: Colors[colorScheme].background },
//                   ]}
//                 >
//                   <Ionicons
//                     name="document-text-outline"
//                     size={22}
//                     color={Colors[colorScheme].tint}
//                   />
//                 </View>
//               </View>

//               <View style={styles.tileTitleContainer}>
//                 <Text
//                   numberOfLines={3}
//                   style={[
//                     styles.modernTileTitle,
//                     { color: Colors[colorScheme].text },
//                   ]}
//                 >
//                   {item.pdf_title.trim()}
//                 </Text>
//               </View>

//               <View style={styles.tileFooter}>
//                 <View style={styles.metaRow}>
//                   <Ionicons
//                     name="document-outline"
//                     size={12}
//                     color={Colors[colorScheme].icon}
//                     style={styles.metaIcon}
//                   />
//                   <Text
//                     numberOfLines={1}
//                     style={[
//                       styles.metaText,
//                       { color: Colors[colorScheme].icon },
//                     ]}
//                   >
//                     {item.pdf_author ?? t("tab_pdfs")}
//                   </Text>
//                 </View>
//                 {(item as any).pdf_topic ? (
//                   <View style={styles.topicBadge}>
//                     <Text
//                       numberOfLines={1}
//                       style={[
//                         styles.topicBadgeText,
//                         { color: Colors[colorScheme].icon },
//                       ]}
//                     >
//                       {parseTopics((item as any).pdf_topic).join(", ")}
//                     </Text>
//                   </View>
//                 ) : null}
//               </View>
//             </View>
//           </View>
//         </TouchableOpacity>
//       );
//     },
//     [colorScheme, previewSizes, t],
//   );

//   const activeFilterCount = (selectedTopic ? 1 : 0) + (selectedAuthor ? 1 : 0);

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { backgroundColor: Colors[colorScheme].background },
//       ]}
//     >
//       {/* Header */}
//       <View style={styles.header}>
//         <HeaderLeftBackButton />

//         <ThemedText type="subtitle" style={styles.headerTitle}>
//           {t("pdfsTitle")}
//         </ThemedText>
//         <TouchableOpacity
//           style={styles.filterBtn}
//           onPress={() => setFilterVisible(true)}
//         >
//           <Ionicons
//             name="options-outline"
//             size={22}
//             color={
//               activeFilterCount > 0
//                 ? Colors.universal.primary
//                 : Colors[colorScheme].text
//             }
//           />
//           {activeFilterCount > 0 && (
//             <View style={styles.filterBadge}>
//               <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

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

//       {/* List */}
//       {isLoading ? (
//         <LoadingIndicator size="large" style={{ marginTop: 40 }} />
//       ) : (
//         <FlatList
//           data={getPaddedData(pdfs)}
//           numColumns={2}
//           keyExtractor={(item: any) => item.id.toString()}
//           renderItem={renderItem}
//           columnWrapperStyle={styles.columnWrapper}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           onEndReached={() => {
//             if (hasNextPage && !isFetchingNextPage) fetchNextPage();
//           }}
//           onEndReachedThreshold={0.5}
//           ListFooterComponent={() =>
//             isFetchingNextPage ? (
//               <View style={styles.footerLoader}>
//                 <LoadingIndicator size="small" />
//               </View>
//             ) : null
//           }
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <ThemedText style={styles.emptyText}>
//                 {t("noSearchResult")}
//               </ThemedText>
//             </View>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 8,
//     paddingVertical: 10,
//   },
//   backBtn: {
//     padding: 6,
//   },
//   headerTitle: {
//     flex: 1,
//     textAlign: "center",
//   },
//   headerSpacer: {
//     width: 38,
//   },
//   filterBtn: {
//     width: 38,
//     height: 38,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   filterBadge: {
//     position: "absolute",
//     top: 2,
//     right: 2,
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: Colors.universal.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   filterBadgeText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "700",
//   },
//   listContent: {
//     paddingTop: 8,
//     paddingBottom: 24,
//   },
//   columnWrapper: {
//     marginBottom: 25,
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//   },
//   tileWrapper: {},
//   modernTile: {
//     borderRadius: 16,
//     borderWidth: 1,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   tileContent: {
//     flex: 1,
//     padding: 10,
//     justifyContent: "space-between",
//   },
//   tileIconContainer: {
//     marginBottom: 8,
//   },
//   iconCircle: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   tileTitleContainer: {
//     flex: 1,
//     justifyContent: "center",
//     marginVertical: 8,
//   },
//   modernTileTitle: {
//     fontSize: 15,
//     fontWeight: "600",
//     lineHeight: 20,
//     letterSpacing: 0.2,
//   },
//   tileFooter: {
//     marginTop: 8,
//     gap: 4,
//   },
//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   metaIcon: {
//     marginRight: 4,
//   },
//   metaText: {
//     fontSize: 11,
//     flex: 1,
//   },
//   topicBadge: {
//     marginTop: 2,
//   },
//   topicBadgeText: {
//     fontSize: 10,
//     fontStyle: "italic",
//   },
//   footerLoader: {
//     paddingVertical: 16,
//     alignItems: "center",
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: "center",
//     marginTop: 60,
//   },
//   emptyText: {
//     textAlign: "center",
//   },
// });

import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ThemedText } from "@/components/ThemedText";
import FilterModal from "@/components/FilterModal";
import { Colors } from "@/constants/Colors";
import { PdfType } from "@/constants/Types";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { supabase } from "../../../../utils/supabase";
import { returnSize } from "../../../../utils/sizes";
import { useSearchPdfs } from "../../../../hooks/useSearchPdfs";
import { Ionicons } from "@expo/vector-icons";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";

const PAGE_SIZE = 20;

function parseTopics(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw))
    return raw.map((t) => String(t).trim()).filter(Boolean);
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed))
          return parsed.map((t) => String(t).trim()).filter(Boolean);
      } catch {}
    }
    return trimmed ? [trimmed] : [];
  }
  return [];
}

function pdfMatchesTopic(rawTopic: any, topic: string): boolean {
  return parseTopics(rawTopic).includes(topic);
}

export default function AllPdfsScreen() {
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const { previewSizes } = returnSize(width, height);

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);

  // ── Search state ────────────────────────────────────────────────────
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedTerm(searchQuery.trim()), 350);
    return () => clearTimeout(h);
  }, [searchQuery]);

  const isSearching = debouncedTerm.length > 0;

  const { data: searchResults = [], isFetching: searchFetching } =
    useSearchPdfs(isSearching ? debouncedTerm : "");

  const openSearch = useCallback(() => {
    setSearchVisible(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedTerm("");
    setSearchVisible(false);
    Keyboard.dismiss();
  }, []);

  // ── Filter pairs ────────────────────────────────────────────────────
  const { data: filterPairs = [] } = useQuery<
    { topic: string | null; author: string | null }[]
  >({
    queryKey: ["pdf_filter_pairs", lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pdfs")
        .select("pdf_topic, pdf_author")
        .eq("language_code", lang);
      if (error) throw error;

      return (data ?? []).flatMap(
        (r: any): { topic: string | null; author: string | null }[] => {
          const topics = parseTopics(r.pdf_topic);
          const author = r.pdf_author ?? null;
          if (topics.length === 0) return [{ topic: null, author }];
          return topics.map((tp) => ({ topic: tp, author }));
        },
      );
    },
    staleTime: 60 * 60 * 1000,
  });

  const allTopics = useMemo(
    () =>
      [
        ...new Set(filterPairs.map((p) => p.topic).filter(Boolean)),
      ].sort() as string[],
    [filterPairs],
  );

  const allAuthors = useMemo(
    () =>
      [
        ...new Set(filterPairs.map((p) => p.author).filter(Boolean)),
      ].sort() as string[],
    [filterPairs],
  );

  const availableTopics = useMemo(
    () =>
      selectedAuthor
        ? ([
            ...new Set(
              filterPairs
                .filter((p) => p.author === selectedAuthor)
                .map((p) => p.topic)
                .filter(Boolean),
            ),
          ].sort() as string[])
        : allTopics,
    [filterPairs, selectedAuthor, allTopics],
  );

  const availableAuthors = useMemo(
    () =>
      selectedTopic
        ? ([
            ...new Set(
              filterPairs
                .filter((p) => p.topic === selectedTopic)
                .map((p) => p.author)
                .filter(Boolean),
            ),
          ].sort() as string[])
        : allAuthors,
    [filterPairs, selectedTopic, allAuthors],
  );

  // ── Infinite query for PDFs ─────────────────────────────────────────
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<
      PdfType[],
      Error,
      InfiniteData<PdfType[]>,
      QueryKey,
      number
    >({
      queryKey: ["all_pdfs_filtered", lang, selectedTopic, selectedAuthor],
      queryFn: async ({ pageParam = 0 }) => {
        let query = supabase
          .from("pdfs")
          .select("*")
          .eq("language_code", lang)
          .order("created_at", { ascending: false })
          .range(pageParam, pageParam + PAGE_SIZE - 1);

        if (selectedAuthor) query = query.eq("pdf_author", selectedAuthor);

        const { data: result, error } = await query;
        if (error) throw error;

        let rows = result ?? [];

        if (selectedTopic) {
          rows = rows.filter((pdf) =>
            pdfMatchesTopic((pdf as any).pdf_topic, selectedTopic),
          );
        }

        return rows;
      },
      getNextPageParam: (lastPage, allPages) => {
        const fetchedSoFar = allPages.reduce(
          (acc, page) => acc + page.length,
          0,
        );
        return lastPage.length === PAGE_SIZE ? fetchedSoFar : undefined;
      },
      initialPageParam: 0,
      enabled: Boolean(lang),
    });

  const pdfs: PdfType[] = data?.pages.flat() ?? [];

  // ── Decide which data to show ───────────────────────────────────────
  const displayData = isSearching ? searchResults : pdfs;
  const showLoading = isSearching ? searchFetching : isLoading;

  const getPaddedData = (items: PdfType[]) => {
    if (items.length % 2 === 1) {
      return [...items, { id: -1, isPlaceholder: true } as any];
    }
    return items;
  };

  // ── Render ──────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: PdfType & { isPlaceholder?: boolean } }) => {
      if ((item as any).isPlaceholder) {
        return <View style={{ width: previewSizes }} />;
      }
      return (
        <TouchableOpacity
          style={styles.tileWrapper}
          onPress={() =>
            router.push({
              pathname: "/(pdfs)",
              params: { id: item.id, filename: item.pdf_filename },
            })
          }
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.modernTile,
              {
                width: previewSizes,
                height: 200,
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
                    { backgroundColor: Colors[colorScheme].background },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={Colors[colorScheme].tint}
                  />
                </View>
                <Text
                  style={[styles.metaText, { color: Colors[colorScheme].icon }]}
                >
                  {item.pdf_author}
                </Text>
              </View>

              <View style={styles.tileTitleContainer}>
                <Text
                  numberOfLines={3}
                  style={[
                    styles.modernTileTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {item.pdf_title.trim()}
                </Text>
              </View>

              <View style={styles.tileFooter}>
                <View style={styles.metaRow}>
                  <Ionicons
                    name="document-outline"
                    size={12}
                    color={Colors[colorScheme].icon}
                    style={styles.metaIcon}
                  />

                  {(item as any).pdf_topic ? (
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.topicBadgeText,
                        { color: Colors[colorScheme].icon },
                      ]}
                    >
                      {parseTopics((item as any).pdf_topic).join(", ")}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [colorScheme, previewSizes],
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
        <HeaderLeftBackButton />

        <ThemedText type="subtitle" style={styles.headerTitle}>
          {t("pdfsTitle")}
        </ThemedText>

        <TouchableOpacity style={styles.headerIconBtn} onPress={openSearch}>
          <Ionicons
            name="search-outline"
            size={22}
            color={
              isSearching ? Colors.universal.primary : Colors[colorScheme].text
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={
              activeFilterCount > 0
                ? Colors.universal.primary
                : Colors[colorScheme].text
            }
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      {searchVisible && (
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: Colors[colorScheme].contrast,
              borderColor: Colors[colorScheme].border,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={18}
            color={Colors[colorScheme].icon}
            style={{ marginRight: 8 }}
          />
          <TextInput
            ref={searchInputRef}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("placeholder_pdfs")}
            placeholderTextColor={Colors[colorScheme].icon}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            style={[styles.searchInput, { color: Colors[colorScheme].text }]}
          />
          {searchQuery.length > 0 && !searchFetching && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearBtn}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={closeSearch} style={styles.cancelBtn}>
            <Text
              style={{ color: Colors.universal.primary, fontWeight: "600" }}
            >
              {t("cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
      {showLoading && displayData.length === 0 ? (
        <LoadingIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getPaddedData(displayData)}
          numColumns={2}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderItem}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onEndReached={() => {
            if (!isSearching && hasNextPage && !isFetchingNextPage)
              fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            !isSearching && isFetchingNextPage ? (
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
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  headerIconBtn: {
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
  // ── Search bar ──────────────────────────────────────────────────────
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  clearBtn: {
    padding: 4,
  },
  cancelBtn: {
    marginLeft: 10,
    paddingVertical: 4,
  },
  searchMeta: {
    marginHorizontal: 16,
    marginBottom: 6,
    fontSize: 12,
  },
  // ── List ────────────────────────────────────────────────────────────
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  columnWrapper: {
    marginBottom: 15,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  tileWrapper: {},
  modernTile: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    padding: 10,
  },
  tileContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  tileIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    marginVertical: 8,
  },
  modernTileTitle: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  tileFooter: {
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 11,
    flexShrink: 1,
  },
  topicBadge: {
    marginTop: 2,
  },
  topicBadgeText: {
    fontSize: 10,
    fontStyle: "italic",
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
