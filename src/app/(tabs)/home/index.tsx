// import { LoadingIndicator } from "@/components/LoadingIndicator";
// import NewsArticlePreviewCard from "@/components/NewsArticlePreviewCard";
// import { NewsItem } from "@/components/NewsItem";
// import PodcastPreviewCard from "@/components/PodcastPreviewCard";
// import RetryButton from "@/components/RetryButton";
// import { ThemedText } from "@/components/ThemedText";
// import { ThemedView } from "@/components/ThemedView";
// import { Colors } from "@/constants/Colors";
// import {
//   NewsArticlesType,
//   PodcastType,
//   PdfType,
//   CalendarType,
// } from "@/constants/Types";
// import { useLanguage } from "../../../../contexts/LanguageContext";
// import { useNews } from "../../../../hooks/useNews";
// import { useNewsArticles } from "../../../../hooks/useNewsArticles";
// import { usePodcasts } from "../../../../hooks/usePodcasts";
// import { useAuthStore } from "../../../../stores/authStore";
// import { useDataVersionStore } from "../../../../stores/dataVersionStore";
// import { useKnowledgeTabStore } from "../../../../stores/useKnowledgeTabStore";
// import { getAllCalendarDates } from "../../../../db/queries/calendar";
// import handleOpenExternalUrl from "../../../../utils/handleOpenExternalUrl";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import React, { useState, useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FlatList,
//   Platform,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useColorScheme,
//   View,
//   Animated,
//   useWindowDimensions,
//   ScrollView,
// } from "react-native";
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from "react-native-safe-area-context";
// import { useScreenFadeIn } from "../../../../hooks/useScreenFadeIn";
// import { returnSize } from "../../../../utils/sizes";
// import PdfPreviewCard from "@/components/PdfPreviewCard";
// import { usePdfs } from "../../../../hooks/usePdfs";

// export default function HomeScreen() {
//   const colorScheme = useColorScheme() ?? "light";
//   const { t } = useTranslation();
//   const { lang } = useLanguage();
//   const { fadeAnim, onLayout } = useScreenFadeIn(800);
//   const insets = useSafeAreaInsets();
//   const isAdmin = useAuthStore((state) => state.isAdmin);
//   const { width, height } = useWindowDimensions();
//   const { fontsizeHomeShowAll, fontsizeHomeHeaders } = returnSize(
//     width,
//     height,
//   );

//   // Hooks
//   // const {
//   //   data: newsArticlesData,
//   //   isLoading: newsArticlesIsLoading,
//   //   isError: newsArticlesIsError,
//   //   error: newsArticlesError,
//   //   fetchNextPage: newsArticlesFetchNextPage,
//   //   hasNextPage: newsArticlesHasNextPage,
//   //   isFetchingNextPage: newsArticlesIsFetchingNextPage,
//   // } = useNewsArticles(lang);

//   const {
//     allNews,
//     showUpdateButton,
//     isRefreshing,
//     handlePullToRefresh,
//     handleRefresh,
//     handleLoadMore,
//     isLoading: newsIsLoading,
//     isError: newsIsError,
//     error: newsError,
//     hasNextPage: newsHasNextPage,
//     isFetchingNextPage: newsIsFetchingNextPage,
//   } = useNews(lang);

//   const {
//     data: podcastPages,
//     isLoading: podcastsLoading,
//     isError: podcastsError,
//     error: podcastsErrorObj,
//     fetchNextPage: podcastsFetchNextPage,
//     hasNextPage: podcastsHasNextPage,
//     isFetchingNextPage: podcastsIsFetchingNextPage,
//   } = usePodcasts(lang);

//   const {
//     data: pdfPages,
//     isLoading: pdfsLoading,
//     isError: pdfsError,
//     error: pdfsErrorObj,
//     fetchNextPage: pdfsFetchNextPage,
//     hasNextPage: pdfsHasNextPage,
//     isFetchingNextPage: pdfsIsFetchingNextPage,
//   } = usePdfs(lang);

//   // const articles: NewsArticlesType[] = newsArticlesData?.pages.flat() ?? [];
//   const podcasts: PodcastType[] = podcastPages?.pages.flat() ?? [];
//   const pdfs: PdfType[] = pdfPages?.pages.flat() ?? [];

//   // Calendar event (today or next upcoming)
//   const setKnowledgeTab = useKnowledgeTabStore((s) => s.setActiveTab);

//   const calendarVersion = useDataVersionStore((s) => s.calendarVersion);
//   const [calendarEvent, setCalendarEvent] = useState<CalendarType | null>(null);
//   const [calendarEventDiff, setCalendarEventDiff] = useState<number>(0);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const events = await getAllCalendarDates(lang);
//         if (cancelled) return;

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const getDiff = (dateStr: string) => {
//           const [year, month, day] = dateStr.split("-").map(Number);
//           const d = new Date(year, month - 1, day);
//           return Math.round((d.getTime() - today.getTime()) / 86400000);
//         };

//         // Find today's event first, then next upcoming
//         let found: CalendarType | null = null;
//         let foundDiff = 0;
//         let minPosDiff: number | null = null;

//         for (const e of events) {
//           const d = getDiff(e.gregorian_date);
//           if (d > 0 && (minPosDiff === null || d < minPosDiff)) minPosDiff = d;
//         }

//         for (const e of events) {
//           const d = getDiff(e.gregorian_date);
//           if (d === 0) {
//             found = e;
//             foundDiff = 0;
//             break;
//           }
//           if (minPosDiff !== null && d === minPosDiff && !found) {
//             found = e;
//             foundDiff = d;
//           }
//         }

//         setCalendarEvent(found);
//         setCalendarEventDiff(foundDiff);
//       } catch {
//         // silently fail — calendar is supplementary
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [calendarVersion, lang]);
//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { backgroundColor: Colors[colorScheme].background, 
          
          
//         },

//       ]}
//      edges={{ top: 'off', left: 'off', right: 'off', bottom: 'maximum' }}
//     >
//         <Animated.ScrollView
//           onLayout={onLayout}
//           showsHorizontalScrollIndicator={false}
//           showsVerticalScrollIndicator={false}
//           style={[
//             styles.scrollStyles,
//             {
//               backgroundColor: Colors[colorScheme].background,
//               marginBottom: 5,
//               opacity: fadeAnim,
//             },
//           ]}
//           contentContainerStyle={styles.scrollContent}
//           refreshControl={
//             Platform.OS !== "web" ? (
//               <RefreshControl
//                 refreshing={isRefreshing}
//                 onRefresh={handlePullToRefresh}
//                 tintColor={Colors[colorScheme].tint}
//               />
//             ) : undefined
//           }
//         >
//           {/* News Articles */}
//           {/* {articles.length > 0 && (
//             <View style={styles.newsArticleContainer}>
//               <View style={styles.sectionHeaderRow}>
//                 <ThemedText
//                   type="titleBiggerLessBold"
//                   style={[
//                     styles.titleShadow,
//                     {
//                       shadowColor: Colors[colorScheme].shadow,
//                       lineHeight: 40,
//                       marginHorizontal: 16,
//                       fontSize: fontsizeHomeHeaders,
//                     },
//                   ]}
//                 >
//                   {t("newsArticlesTitle")}
//                 </ThemedText>
//                 <TouchableOpacity onPress={() => router.push("/(tabs)/home/all-articles")}>
//                   <ThemedText
//                     style={{
//                       marginRight: 15,
//                       fontSize: fontsizeHomeShowAll,
//                       color: Colors.universal.link,
//                       fontWeight: 600,
//                     }}
//                   >
//                     {t("showAll")}
//                   </ThemedText>
//                 </TouchableOpacity>
//               </View>

//               {newsArticlesIsLoading && (
//                 <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
//               )}

//               {newsArticlesIsError && (
//                 <View style={styles.errorContainer}>
//                   <Text
//                     style={[
//                       styles.errorText,
//                       { color: Colors[colorScheme].error },
//                     ]}
//                   >
//                     {newsArticlesError?.message ?? t("errorLoadingData")}
//                   </Text>
//                   <RetryButton onPress={() => newsArticlesFetchNextPage()} />
//                 </View>
//               )}

//               {!newsArticlesIsLoading && !newsArticlesIsError && (
//                 <FlatList
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                   showsVerticalScrollIndicator={false}
//                   contentContainerStyle={styles.flatListContentContainer}
//                   data={articles}
//                   keyExtractor={(item) => item.id.toString()}
//                   renderItem={({ item }) => (
//                     <TouchableOpacity
//                       onPress={() =>
//                         item.is_external_link
//                           ? handleOpenExternalUrl(item.external_link_url || "")
//                           : router.push({
//                               pathname: "/(newsArticle)",
//                               params: { articleId: item.id },
//                             })
//                       }
//                     >
//                       <NewsArticlePreviewCard
//                         title={item.title}
//                         is_external_link={item.is_external_link}
//                         created_at={item.created_at}
//                       />
//                     </TouchableOpacity>
//                   )}
//                   onEndReached={() => {
//                     if (
//                       newsArticlesHasNextPage &&
//                       !newsArticlesIsFetchingNextPage
//                     ) {
//                       newsArticlesFetchNextPage();
//                     }
//                   }}
//                   onEndReachedThreshold={0.5}
//                   ListFooterComponent={() =>
//                     newsArticlesIsFetchingNextPage ? (
//                       <LoadingIndicator size="small" />
//                     ) : null
//                   }
//                 />
//               )}
//             </View>
//           )} */}

//           {/* Aktuelles — hero card */}
//           <View style={styles.newsContainer}>
//             <View
//               style={[
//                 styles.heroCard,
//                 {
//                   backgroundColor: Colors[colorScheme].background,
//                 },
//               ]}
//             >
//               {/* Colored header: title + calendar */}
//               <View
//                 style={[
//                   styles.heroHeader,
//                   {
//                     backgroundColor:
//                       colorScheme === "dark" ? "#152C3E" : "#1A4731",
//                     paddingTop: insets.top + 18,
//                   },
//                 ]}
//               >
//                 <View style={styles.heroTitleRow}>
//                   <Text
//                     style={[
//                       styles.heroTitle,
//                       { fontSize: fontsizeHomeHeaders },
//                     ]}
//                   >
//                     {t("newsTitle")}
//                   </Text>
//                   {isAdmin && (
//                     <Ionicons
//                       name="add-circle-outline"
//                       size={28}
//                       color="rgba(255,255,255,0.75)"
//                       onPress={() => router.push("/(addNews)")}
//                     />
//                   )}
//                 </View>

//                 {calendarEvent && (
//                   <TouchableOpacity
//                     style={styles.calendarBanner}
//                     onPress={() => {
//                       setKnowledgeTab(2); // open calendar tab in knowledge
//                       router.push("/(tabs)/knowledge" as any);
//                     }}
//                     activeOpacity={0.75}
//                   >
//                     {/* Left: text content */}
//                     <View style={styles.calendarBannerContent}>
//                       <View style={styles.calendarBannerTop}>
//                         <Ionicons
//                           name="moon-outline"
//                           size={11}
//                           color="rgba(255,255,255,0.55)"
//                         />
//                         <Text style={styles.calendarBannerLabel}>
//                           {t("calendarTitle").toUpperCase()}
//                         </Text>
//                         <View style={styles.calendarBadge}>
//                           <Text style={styles.calendarBadgeText}>
//                             {calendarEventDiff === 0
//                               ? t("legendToday")
//                               : t("countdownDaysToGo", {
//                                   count: calendarEventDiff,
//                                 })}
//                           </Text>
//                         </View>
//                       </View>
//                       <Text
//                         numberOfLines={1}
//                         ellipsizeMode="tail"
//                         style={styles.calendarBannerTitle}
//                       >
//                         {calendarEvent.title}
//                       </Text>
//                     </View>
//                     {/* Right: chevron indicating tappable */}
//                     <View style={styles.calendarChevron}>
//                       <Ionicons
//                         name="chevron-forward"
//                         size={16}
//                         color="rgba(255,255,255,0.6)"
//                       />
//                     </View>
//                   </TouchableOpacity>
//                 )}
//               </View>

//               {/* Update button */}
//               {showUpdateButton && (
//                 <TouchableOpacity
//                   style={[
//                     styles.updateButton,
//                     {
//                       backgroundColor:
//                         colorScheme === "dark"
//                           ? Colors.universal.secondary
//                           : Colors.universal.primary,
//                     },
//                   ]}
//                   onPress={handleRefresh}
//                   activeOpacity={0.8}
//                 >
//                   <View style={styles.updateButtonContent}>
//                     <Ionicons
//                       name="refresh-circle"
//                       size={20}
//                       color="#fff"
//                       style={styles.updateButtonIcon}
//                     />
//                     <Text style={styles.updateButtonText}>
//                       {t("newNewsAvailable") ||
//                         "New items available - Tap to refresh"}
//                     </Text>
//                   </View>
//                 </TouchableOpacity>
//               )}

//               {/* Fixed-height area — prevents collapse during loading */}
//               <View style={styles.newsScrollArea}>
//                 {/* Loading */}
//                 {newsIsLoading && (
//                   <LoadingIndicator
//                     style={{ marginVertical: 20 }}
//                     size="large"
//                   />
//                 )}

//                 {/* Error */}
//                 {newsIsError && (
//                   <View style={styles.errorContainer}>
//                     <Text
//                       style={[
//                         styles.errorText,
//                         { color: Colors[colorScheme].error },
//                       ]}
//                     >
//                       {newsError?.message ?? t("errorLoadingData")}
//                     </Text>
//                     <RetryButton onPress={handleRefresh} />
//                   </View>
//                 )}

//                 {/* Empty */}
//                 {!newsIsLoading && allNews.length === 0 && (
//                   <ThemedView style={styles.newsEmptyContainer}>
//                     <ThemedText style={styles.newsEmptyText} type="subtitle">
//                       {t("newsEmpty")}
//                     </ThemedText>
//                   </ThemedView>
//                 )}

//                 {/* News scroll */}
//                 {!newsIsLoading && !newsIsError && allNews.length > 0 && (
//                   <ScrollView
//                     contentContainerStyle={styles.newsContentContainer}
//                     style={{ flex: 1 }}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                   >
//                     {allNews.map((item) => (
//                       <NewsItem
//                         key={item.id.toString()}
//                         id={item.id}
//                         language_code={item.language_code}
//                         is_pinned={item.is_pinned}
//                         title={item.title}
//                         content={item.content}
//                         created_at={item.created_at}
//                         images_url={item.images_url}
//                         internal_urls={item.internal_urls}
//                         external_urls={item.external_urls}
//                       />
//                     ))}

//                     {newsHasNextPage && (
//                       <View style={styles.loadMoreContainer}>
//                         {newsIsFetchingNextPage ? (
//                           <LoadingIndicator size="small" />
//                         ) : (
//                           <TouchableOpacity
//                             onPress={handleLoadMore}
//                             style={styles.loadMoreButton}
//                           >
//                             <Text style={styles.loadMoreText}>
//                               {t("loadMore") || "Load More"}
//                             </Text>
//                           </TouchableOpacity>
//                         )}
//                       </View>
//                     )}
//                   </ScrollView>
//                 )}
//               </View>
//             </View>
//           </View>
//           {/* Podcasts */}
//           {podcasts.length > 0 && (
//             <View style={styles.podcastContainer}>
//               <View style={styles.sectionHeaderRow}>
//                 <ThemedText
//                   type="titleBiggerLessBold"
//                   style={[
//                     styles.titleShadow,
//                     {
//                       shadowColor: Colors[colorScheme].shadow,
//                       lineHeight: 40,
//                       marginHorizontal: 16,
//                       fontSize: fontsizeHomeHeaders,
//                     },
//                   ]}
//                 >
//                   {t("podcastsTitle")}
//                 </ThemedText>
//                 <TouchableOpacity
//                   onPress={() => router.push("/(tabs)/home/allPodcasts")}
//                 >
//                   <ThemedText
//                     style={{
//                       marginRight: 15,
//                       fontSize: fontsizeHomeShowAll,
//                       color: Colors.universal.link,
//                       fontWeight: 600,
//                     }}
//                   >
//                     {t("showAll")}
//                   </ThemedText>
//                 </TouchableOpacity>
//               </View>

//               {podcastsLoading && (
//                 <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
//               )}

//               {podcastsError && (
//                 <View style={styles.errorContainer}>
//                   <Text
//                     style={[
//                       styles.errorText,
//                       { color: Colors[colorScheme].error },
//                     ]}
//                   >
//                     {podcastsErrorObj?.message ?? t("errorLoadingData")}
//                   </Text>
//                   <RetryButton onPress={() => podcastsFetchNextPage()} />
//                 </View>
//               )}

//               {!podcastsLoading && !podcastsError && (
//                 <FlatList
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                   showsVerticalScrollIndicator={false}
//                   contentContainerStyle={styles.flatListContentContainer}
//                   data={podcasts}
//                   keyExtractor={(item) => item.id.toString()}
//                   renderItem={({ item }) => (
//                     <TouchableOpacity
//                       onPress={() =>
//                         router.push({
//                           pathname: "/indexPodcast",
//                           params: { podcast: JSON.stringify(item) },
//                         })
//                       }
//                     >
//                       <PodcastPreviewCard podcast={item} />
//                     </TouchableOpacity>
//                   )}
//                   onEndReached={() => {
//                     if (podcastsHasNextPage && !podcastsIsFetchingNextPage) {
//                       podcastsFetchNextPage();
//                     }
//                   }}
//                   onEndReachedThreshold={0.5}
//                   ListFooterComponent={() =>
//                     podcastsIsFetchingNextPage ? (
//                       <LoadingIndicator size="small" />
//                     ) : null
//                   }
//                 />
//               )}
//             </View>
//           )}

//           {/* PDFs */}
//           {pdfs.length > 0 && (
//             <View style={styles.pdfContainer}>
//               <View style={styles.sectionHeaderRow}>
//                 <ThemedText
//                   type="titleBiggerLessBold"
//                   style={[
//                     styles.titleShadow,
//                     {
//                       shadowColor: Colors[colorScheme].shadow,
//                       lineHeight: 40,
//                       marginHorizontal: 16,
//                       fontSize: fontsizeHomeHeaders,
//                     },
//                   ]}
//                 >
//                   {t("pdfsTitle")}
//                 </ThemedText>
//                 <TouchableOpacity
//                   onPress={() => router.push("/(tabs)/home/allPdfs")}
//                 >
//                   <ThemedText
//                     style={{
//                       marginRight: 15,
//                       fontSize: fontsizeHomeShowAll,
//                       color: Colors.universal.link,
//                       fontWeight: 600,
//                     }}
//                   >
//                     {t("showAll")}
//                   </ThemedText>
//                 </TouchableOpacity>
//               </View>

//               {pdfsLoading && (
//                 <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
//               )}

//               {pdfsError && (
//                 <View style={styles.errorContainer}>
//                   <Text
//                     style={[
//                       styles.errorText,
//                       { color: Colors[colorScheme].error },
//                     ]}
//                   >
//                     {pdfsErrorObj?.message ?? t("errorLoadingData")}
//                   </Text>
//                   <RetryButton onPress={() => pdfsFetchNextPage()} />
//                 </View>
//               )}

//               {!pdfsLoading && !pdfsError && (
//                 <FlatList
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                   showsVerticalScrollIndicator={false}
//                   contentContainerStyle={styles.flatListContentContainer}
//                   data={pdfs}
//                   keyExtractor={(item) => item.id.toString()}
//                   renderItem={({ item }) => (
//                     <TouchableOpacity
//                       onPress={() =>
//                         router.push({
//                           pathname: "/(pdfs)",
//                           params: {
//                             filename: item.pdf_filename,
//                           },
//                         })
//                       }
//                     >
//                       <PdfPreviewCard pdf={item} />
//                     </TouchableOpacity>
//                   )}
//                   onEndReached={() => {
//                     if (pdfsHasNextPage && !pdfsIsFetchingNextPage) {
//                       pdfsFetchNextPage();
//                     }
//                   }}
//                   onEndReachedThreshold={0.5}
//                   ListFooterComponent={() =>
//                     pdfsIsFetchingNextPage ? (
//                       <LoadingIndicator size="small" />
//                     ) : null
//                   }
//                 />
//               )}
//             </View>
//           )}
//         </Animated.ScrollView>

//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollStyles: {},
//   scrollContent: {
//     gap: 40,
//   },
//   newsArticleContainer: {
//     flex: 1,
//     gap: 15,
//   },
//   podcastContainer: {
//     flex: 1,
//     gap: 15,
//   },
//   pdfContainer: {
//     flex: 1,
//     gap: 15,
//   },
//   heroCard: {
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.12,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   heroHeader: {
//     paddingHorizontal: 18,
//     paddingTop: 18,
//     paddingBottom: 20,
//     gap: 16,
//   },
//   heroTitleRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   heroTitle: {
//     fontWeight: "800",
//     color: "#fff",
//     letterSpacing: -0.5,
//   },
//   calendarBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.15)",
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     gap: 10,
//   },
//   calendarBannerContent: {
//     flex: 1,
//     gap: 5,
//   },
//   calendarChevron: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   newsScrollArea: {
//     height: 210,
//     justifyContent: "center",
//   },
//   calendarBannerTop: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//   },
//   calendarBannerLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 0.8,
//     flex: 1,
//     color: "rgba(255,255,255,0.55)",
//   },
//   calendarBannerTitle: {
//     fontSize: 17,
//     fontWeight: "700",
//     letterSpacing: -0.3,
//     color: "#fff",
//   },
//   calendarBadge: {
//     backgroundColor: "rgba(255,255,255,0.18)",
//     paddingHorizontal: 9,
//     paddingVertical: 3,
//     borderRadius: 20,
//   },
//   calendarBadgeText: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 0.3,
//     color: "#fff",
//   },
//   newsContainer: {
//     flex: 1,
//     gap: 15,
//   },
//   newsTitleContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginRight: 15,
//   },
//   sectionHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   newsEmptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     marginTop: 20,
//     backgroundColor: "transparent",
//   },
//   newsEmptyText: {
//     textAlign: "center",
//   },
//   errorContainer: {
//     alignItems: "center",
//     gap: 10,
//   },
//   errorText: {
//     fontSize: 20,
//   },
//   flatListContentContainer: {
//     gap: 15,
//     marginHorizontal: 15,
//   },
//   newsContentContainer: {
//     flexDirection: "row",
//     gap: 16,
//     paddingHorizontal: 14,
//     paddingBottom: 16,
//     paddingTop: 14,
//   },
//   titleShadow: {
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.22,
//     shadowRadius: 2.22,
//     elevation: 2,
//   },
//   updateButton: {
//     marginVertical: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//     marginHorizontal: 16,
//   },
//   updateButtonContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   updateButtonIcon: {
//     marginRight: 8,
//   },
//   updateButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   loadMoreContainer: {
//     alignItems: "center",
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   loadMoreButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     backgroundColor: "rgba(0, 0, 0, 0.1)",
//   },
//   loadMoreText: {
//     fontSize: 16,
//     fontWeight: "500",
//   },
// });


import { LoadingIndicator } from "@/components/LoadingIndicator";
import NewsArticlePreviewCard from "@/components/NewsArticlePreviewCard";
import { NewsItem } from "@/components/NewsItem";
import PodcastPreviewCard from "@/components/PodcastPreviewCard";
import RetryButton from "@/components/RetryButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import {
  NewsArticlesType,
  PodcastType,
  PdfType,
  CalendarType,
} from "@/constants/Types";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { useNews } from "../../../../hooks/useNews";
import { useNewsArticles } from "../../../../hooks/useNewsArticles";
import { usePodcasts } from "../../../../hooks/usePodcasts";
import { useAuthStore } from "../../../../stores/authStore";
import { useDataVersionStore } from "../../../../stores/dataVersionStore";
import { useKnowledgeTabStore } from "../../../../stores/useKnowledgeTabStore";
import { getAllCalendarDates } from "../../../../db/queries/calendar";
import handleOpenExternalUrl from "../../../../utils/handleOpenExternalUrl";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Animated,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScreenFadeIn } from "../../../../hooks/useScreenFadeIn";
import { returnSize } from "../../../../utils/sizes";
import PdfPreviewCard from "@/components/PdfPreviewCard";
import { usePdfs } from "../../../../hooks/usePdfs";

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const insets = useSafeAreaInsets();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { width, height } = useWindowDimensions();
  const { fontsizeHomeShowAll, fontsizeHomeHeaders } = returnSize(
    width,
    height,
  );

  // Hooks
  // const {
  //   data: newsArticlesData,
  //   isLoading: newsArticlesIsLoading,
  //   isError: newsArticlesIsError,
  //   error: newsArticlesError,
  //   fetchNextPage: newsArticlesFetchNextPage,
  //   hasNextPage: newsArticlesHasNextPage,
  //   isFetchingNextPage: newsArticlesIsFetchingNextPage,
  // } = useNewsArticles(lang);

  const {
    allNews,
    showUpdateButton,
    isRefreshing,
    handlePullToRefresh,
    handleRefresh,
    handleLoadMore,
    isLoading: newsIsLoading,
    isError: newsIsError,
    error: newsError,
    hasNextPage: newsHasNextPage,
    isFetchingNextPage: newsIsFetchingNextPage,
  } = useNews(lang);

  const {
    data: podcastPages,
    isLoading: podcastsLoading,
    isError: podcastsError,
    error: podcastsErrorObj,
    fetchNextPage: podcastsFetchNextPage,
    hasNextPage: podcastsHasNextPage,
    isFetchingNextPage: podcastsIsFetchingNextPage,
  } = usePodcasts(lang);

  const {
    data: pdfPages,
    isLoading: pdfsLoading,
    isError: pdfsError,
    error: pdfsErrorObj,
    fetchNextPage: pdfsFetchNextPage,
    hasNextPage: pdfsHasNextPage,
    isFetchingNextPage: pdfsIsFetchingNextPage,
  } = usePdfs(lang);

  // const articles: NewsArticlesType[] = newsArticlesData?.pages.flat() ?? [];
  const podcasts: PodcastType[] = podcastPages?.pages.flat() ?? [];
  const pdfs: PdfType[] = pdfPages?.pages.flat() ?? [];

  // Calendar event (today or next upcoming)
  const setKnowledgeTab = useKnowledgeTabStore((s) => s.setActiveTab);

  const calendarVersion = useDataVersionStore((s) => s.calendarVersion);
  const [calendarEvent, setCalendarEvent] = useState<CalendarType | null>(null);
  const [calendarEventDiff, setCalendarEventDiff] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const events = await getAllCalendarDates(lang);
        if (cancelled) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const getDiff = (dateStr: string) => {
          const [year, month, day] = dateStr.split("-").map(Number);
          const d = new Date(year, month - 1, day);
          return Math.round((d.getTime() - today.getTime()) / 86400000);
        };

        // Find today's event first, then next upcoming
        let found: CalendarType | null = null;
        let foundDiff = 0;
        let minPosDiff: number | null = null;

        for (const e of events) {
          const d = getDiff(e.gregorian_date);
          if (d > 0 && (minPosDiff === null || d < minPosDiff)) minPosDiff = d;
        }

        for (const e of events) {
          const d = getDiff(e.gregorian_date);
          if (d === 0) {
            found = e;
            foundDiff = 0;
            break;
          }
          if (minPosDiff !== null && d === minPosDiff && !found) {
            found = e;
            foundDiff = d;
          }
        }

        setCalendarEvent(found);
        setCalendarEventDiff(foundDiff);
      } catch {
        // silently fail — calendar is supplementary
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [calendarVersion, lang]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme].background,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Animated.ScrollView
        onLayout={onLayout}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={[
          styles.scrollStyles,
          {
            backgroundColor: Colors[colorScheme].background,
            marginBottom: 5,
            opacity: fadeAnim,
          },
        ]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          Platform.OS !== "web" ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handlePullToRefresh}
              tintColor={Colors[colorScheme].tint}
            />
          ) : undefined
        }
      >
        {/* News Articles */}
        {/* {articles.length > 0 && (
          <View style={styles.newsArticleContainer}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText
                type="titleBiggerLessBold"
                style={[
                  styles.titleShadow,
                  {
                    shadowColor: Colors[colorScheme].shadow,
                    lineHeight: 40,
                    marginHorizontal: 16,
                    fontSize: fontsizeHomeHeaders,
                  },
                ]}
              >
                {t("newsArticlesTitle")}
              </ThemedText>
              <TouchableOpacity onPress={() => router.push("/(tabs)/home/all-articles")}>
                <ThemedText
                  style={{
                    marginRight: 15,
                    fontSize: fontsizeHomeShowAll,
                    color: Colors.universal.link,
                    fontWeight: 600,
                  }}
                >
                  {t("showAll")}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {newsArticlesIsLoading && (
              <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
            )}

            {newsArticlesIsError && (
              <View style={styles.errorContainer}>
                <Text
                  style={[
                    styles.errorText,
                    { color: Colors[colorScheme].error },
                  ]}
                >
                  {newsArticlesError?.message ?? t("errorLoadingData")}
                </Text>
                <RetryButton onPress={() => newsArticlesFetchNextPage()} />
              </View>
            )}

            {!newsArticlesIsLoading && !newsArticlesIsError && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContentContainer}
                data={articles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() =>
                      item.is_external_link
                        ? handleOpenExternalUrl(item.external_link_url || "")
                        : router.push({
                            pathname: "/(newsArticle)",
                            params: { articleId: item.id },
                          })
                    }
                  >
                    <NewsArticlePreviewCard
                      title={item.title}
                      is_external_link={item.is_external_link}
                      created_at={item.created_at}
                    />
                  </TouchableOpacity>
                )}
                onEndReached={() => {
                  if (
                    newsArticlesHasNextPage &&
                    !newsArticlesIsFetchingNextPage
                  ) {
                    newsArticlesFetchNextPage();
                  }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                  newsArticlesIsFetchingNextPage ? (
                    <LoadingIndicator size="small" />
                  ) : null
                }
              />
            )}
          </View>
        )} */}

        {/* Aktuelles — hero card */}
        <View style={styles.newsContainer}>
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: Colors[colorScheme].background,
              },
            ]}
          >
            {/* Colored header: title + calendar */}
            <View
              style={[
                styles.heroHeader,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#152C3E" : "#1A4731",
                  paddingTop: insets.top + 18,
                },
              ]}
            >
              <View style={styles.heroTitleRow}>
                <Text
                  style={[
                    styles.heroTitle,
                    { fontSize: fontsizeHomeHeaders },
                  ]}
                >
                  {t("newsTitle")}
                </Text>
                {isAdmin && (
                  <Ionicons
                    name="add-circle-outline"
                    size={28}
                    color="rgba(255,255,255,0.75)"
                    onPress={() => router.push("/(addNews)")}
                  />
                )}
              </View>

              {calendarEvent && (
                <TouchableOpacity
                  style={styles.calendarBanner}
                  onPress={() => {
                    setKnowledgeTab(2);
                    router.push("/(tabs)/knowledge" as any);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.calendarBannerContent}>
                    <View style={styles.calendarBannerTop}>
                      <Ionicons
                        name="moon-outline"
                        size={11}
                        color="rgba(255,255,255,0.55)"
                      />
                      <Text style={styles.calendarBannerLabel}>
                        {t("calendarTitle").toUpperCase()}
                      </Text>
                      <View style={styles.calendarBadge}>
                        <Text style={styles.calendarBadgeText}>
                          {calendarEventDiff === 0
                            ? t("legendToday")
                            : t("countdownDaysToGo", {
                                count: calendarEventDiff,
                              })}
                        </Text>
                      </View>
                    </View>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.calendarBannerTitle}
                    >
                      {calendarEvent.title}
                    </Text>
                  </View>
                  <View style={styles.calendarChevron}>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="rgba(255,255,255,0.6)"
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {showUpdateButton && (
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  {
                    backgroundColor:
                      colorScheme === "dark"
                        ? Colors.universal.secondary
                        : Colors.universal.primary,
                  },
                ]}
                onPress={handleRefresh}
                activeOpacity={0.8}
              >
                <View style={styles.updateButtonContent}>
                  <Ionicons
                    name="refresh-circle"
                    size={20}
                    color="#fff"
                    style={styles.updateButtonIcon}
                  />
                  <Text style={styles.updateButtonText}>
                    {t("newNewsAvailable") ||
                      "New items available - Tap to refresh"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.newsScrollArea}>
              {newsIsLoading && (
                <LoadingIndicator
                  style={{ marginVertical: 20 }}
                  size="large"
                />
              )}

              {newsIsError && (
                <View style={styles.errorContainer}>
                  <Text
                    style={[
                      styles.errorText,
                      { color: Colors[colorScheme].error },
                    ]}
                  >
                    {newsError?.message ?? t("errorLoadingData")}
                  </Text>
                  <RetryButton onPress={handleRefresh} />
                </View>
              )}

              {!newsIsLoading && allNews.length === 0 && (
                <ThemedView style={styles.newsEmptyContainer}>
                  <ThemedText style={styles.newsEmptyText} type="subtitle">
                    {t("newsEmpty")}
                  </ThemedText>
                </ThemedView>
              )}

              {!newsIsLoading && !newsIsError && allNews.length > 0 && (
                <ScrollView
                  contentContainerStyle={styles.newsContentContainer}
                  style={{ flex: 1 }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {allNews.map((item) => (
                    <NewsItem
                      key={item.id.toString()}
                      id={item.id}
                      language_code={item.language_code}
                      is_pinned={item.is_pinned}
                      title={item.title}
                      content={item.content}
                      created_at={item.created_at}
                      images_url={item.images_url}
                      internal_urls={item.internal_urls}
                      external_urls={item.external_urls}
                    />
                  ))}

                  {newsHasNextPage && (
                    <View style={styles.loadMoreContainer}>
                      {newsIsFetchingNextPage ? (
                        <LoadingIndicator size="small" />
                      ) : (
                        <TouchableOpacity
                          onPress={handleLoadMore}
                          style={styles.loadMoreButton}
                        >
                          <Text style={styles.loadMoreText}>
                            {t("loadMore") || "Load More"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </View>

        {/* Podcasts */}
        {podcasts.length > 0 && (
          <View style={styles.podcastContainer}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText
                type="titleBiggerLessBold"
                style={[
                  styles.titleShadow,
                  {
                    shadowColor: Colors[colorScheme].shadow,
                    lineHeight: 40,
                    marginHorizontal: 16,
                    fontSize: fontsizeHomeHeaders,
                  },
                ]}
              >
                {t("podcastsTitle")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/home/allPodcasts")}
              >
                <ThemedText
                  style={{
                    marginRight: 15,
                    fontSize: fontsizeHomeShowAll,
                    color: Colors.universal.link,
                    fontWeight: 600,
                  }}
                >
                  {t("showAll")}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {podcastsLoading && (
              <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
            )}

            {podcastsError && (
              <View style={styles.errorContainer}>
                <Text
                  style={[
                    styles.errorText,
                    { color: Colors[colorScheme].error },
                  ]}
                >
                  {podcastsErrorObj?.message ?? t("errorLoadingData")}
                </Text>
                <RetryButton onPress={() => podcastsFetchNextPage()} />
              </View>
            )}

            {!podcastsLoading && !podcastsError && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContentContainer}
                data={podcasts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/indexPodcast",
                        params: { podcast: JSON.stringify(item) },
                      })
                    }
                  >
                    <PodcastPreviewCard podcast={item} />
                  </TouchableOpacity>
                )}
                onEndReached={() => {
                  if (podcastsHasNextPage && !podcastsIsFetchingNextPage) {
                    podcastsFetchNextPage();
                  }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                  podcastsIsFetchingNextPage ? (
                    <LoadingIndicator size="small" />
                  ) : null
                }
              />
            )}
          </View>
        )}

        {/* PDFs */}
        {pdfs.length > 0 && (
          <View style={styles.pdfContainer}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText
                type="titleBiggerLessBold"
                style={[
                  styles.titleShadow,
                  {
                    shadowColor: Colors[colorScheme].shadow,
                    lineHeight: 40,
                    marginHorizontal: 16,
                    fontSize: fontsizeHomeHeaders,
                  },
                ]}
              >
                {t("pdfsTitle")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/home/allPdfs")}
              >
                <ThemedText
                  style={{
                    marginRight: 15,
                    fontSize: fontsizeHomeShowAll,
                    color: Colors.universal.link,
                    fontWeight: 600,
                  }}
                >
                  {t("showAll")}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {pdfsLoading && (
              <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
            )}

            {pdfsError && (
              <View style={styles.errorContainer}>
                <Text
                  style={[
                    styles.errorText,
                    { color: Colors[colorScheme].error },
                  ]}
                >
                  {pdfsErrorObj?.message ?? t("errorLoadingData")}
                </Text>
                <RetryButton onPress={() => pdfsFetchNextPage()} />
              </View>
            )}

            {!pdfsLoading && !pdfsError && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContentContainer}
                data={pdfs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/(pdfs)",
                        params: {
                          filename: item.pdf_filename,
                        },
                      })
                    }
                  >
                    <PdfPreviewCard pdf={item} />
                  </TouchableOpacity>
                )}
                onEndReached={() => {
                  if (pdfsHasNextPage && !pdfsIsFetchingNextPage) {
                    pdfsFetchNextPage();
                  }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                  pdfsIsFetchingNextPage ? (
                    <LoadingIndicator size="small" />
                  ) : null
                }
              />
            )}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollStyles: {},
  scrollContent: {
    gap: 40,
  },
  newsArticleContainer: {
    flex: 1,
    gap: 15,
  },
  podcastContainer: {
    flex: 1,
    gap: 15,
  },
  pdfContainer: {
    flex: 1,
    gap: 15,
  },
  heroCard: {
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  heroHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 16,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTitle: {
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  calendarBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  calendarBannerContent: {
    flex: 1,
    gap: 5,
  },
  calendarChevron: {
    justifyContent: "center",
    alignItems: "center",
  },
  newsScrollArea: {
    height: 210,
    justifyContent: "center",
  },
  calendarBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  calendarBannerLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    flex: 1,
    color: "rgba(255,255,255,0.55)",
  },
  calendarBannerTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: "#fff",
  },
  calendarBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  calendarBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: "#fff",
  },
  newsContainer: {
    flex: 1,
    gap: 15,
  },
  newsTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 15,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "transparent",
  },
  newsEmptyText: {
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    fontSize: 20,
  },
  flatListContentContainer: {
    gap: 15,
    marginHorizontal: 15,
  },
  newsContentContainer: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 14,
  },
  titleShadow: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
  },
  updateButton: {
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 16,
  },
  updateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadMoreContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  loadMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "500",
  },
});