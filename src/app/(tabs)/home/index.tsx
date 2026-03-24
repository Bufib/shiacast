// ! Last that worked

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
// import { getAllCalendarDates } from "../../../../db/queries/calendar";
// import handleOpenExternalUrl from "../../../../utils/handleOpenExternalUrl";
// import { EvilIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
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
// import { useSafeAreaInsets } from "react-native-safe-area-context";
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

//   const podcasts: PodcastType[] = podcastPages?.pages.flat() ?? [];
//   const pdfs: PdfType[] = pdfPages?.pages.flat() ?? [];

//   // Calendar event (today or next upcoming)
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

//   /** Extract the Islamic day number and month name from "3. Šawwāl 1447" */
//   const parseIslamicDate = (islamicDate: string) => {
//     const match = islamicDate.match(/^(\d+)\.\s*(.+?)(?:\s+\d+)?$/);
//     if (match) return { day: match[1], month: match[2] };
//     return { day: "", month: islamicDate };
//   };

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           backgroundColor: Colors[colorScheme].background,
//           paddingBottom: insets.bottom,
//         },
//       ]}
//     >
//       <Animated.ScrollView
//         onLayout={onLayout}
//         showsHorizontalScrollIndicator={false}
//         showsVerticalScrollIndicator={false}
//         style={[
//           styles.scrollStyles,
//           {
//             backgroundColor: Colors[colorScheme].background,
//             marginBottom: 5,
//             opacity: fadeAnim,
//           },
//         ]}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           Platform.OS !== "web" ? (
//             <RefreshControl
//               refreshing={isRefreshing}
//               onRefresh={handlePullToRefresh}
//               tintColor={Colors[colorScheme].tint}
//             />
//           ) : undefined
//         }
//       >
//         {/* Aktuelles — hero card */}
//         <View style={styles.newsContainer}>
//           <View style={[styles.heroCard, {}]}>
//             {/* Colored header: title + calendar */}
//             <View
//               style={[
//                 styles.heroHeader,
//                 {
//                   paddingTop: insets.top,
//                 },
//               ]}
//             >
//               <View style={styles.heroTitleRow}>
//                 <ThemedText
//                   type="titleBiggerLessBold"
//                   style={[
//                     styles.titleShadow,
//                     {
//                       shadowColor: Colors[colorScheme].shadow,
//                       fontSize: fontsizeHomeHeaders,
//                       paddingLeft: 16,
//                     },
//                   ]}
//                 >
//                   {t("newsTitle")}
//                 </ThemedText>
//                 {isAdmin && (
//                   <Ionicons
//                     name="add-circle-outline"
//                     size={28}
//                     color={Colors[colorScheme].defaultIcon}
//                     onPress={() => router.push("/(addNews)")}
//                     style={{ paddingRight: 16 }}
//                   />
//                 )}
//               </View>

//               {calendarEvent && (
//                 <TouchableOpacity
//                   style={[
//                     styles.calendarBanner,
//                     {
//                       backgroundColor: Colors[colorScheme].contrast,
//                       borderColor: Colors[colorScheme].border,
//                     },
//                   ]}
//                   activeOpacity={0.7}
//                   onPress={() => {
//                     router.push({
//                       pathname:
//                         "/(tabs)/knowledge/calendar/calendarDayDetail" as any,
//                       params: {
//                         date: calendarEvent.gregorian_date,
//                         islamicDate: calendarEvent.islamic_date,
//                       },
//                     });
//                   }}
//                 >
//                   {/* Islamic day pill */}
//                   <View
//                     style={[
//                       styles.calendarDatePill,
//                       {
//                         backgroundColor:
//                           colorScheme === "dark"
//                             ? "rgba(55, 138, 221, 0.15)"
//                             : "rgba(55, 138, 221, 0.08)",
//                       },
//                     ]}
//                   >
//                     <Text
//                       style={[
//                         styles.calendarDatePillDay,
//                         {
//                           color: colorScheme === "dark" ? "#85B7EB" : "#185FA5",
//                         },
//                       ]}
//                     >
//                       {parseIslamicDate(calendarEvent.islamic_date).day}
//                     </Text>
//                     <Text
//                       style={[
//                         styles.calendarDatePillMonth,
//                         {
//                           color: colorScheme === "dark" ? "#85B7EB" : "#378ADD",
//                         },
//                       ]}
//                     >
//                       {parseIslamicDate(calendarEvent.islamic_date).month}
//                     </Text>
//                   </View>

//                   {/* Event details */}
//                   <View style={styles.calendarBannerContent}>
//                     <Text
//                       style={[
//                         styles.calendarGregorianDate,
//                         { color: Colors[colorScheme].icon },
//                       ]}
//                     >
//                       {(() => {
//                         const [y, m, d] =
//                           calendarEvent.gregorian_date.split("-");
//                         return `${d}. ${t(`months.${parseInt(m)}`)} ${y}`;
//                       })()}
//                     </Text>
//                     <Text
//                       numberOfLines={1}
//                       ellipsizeMode="tail"
//                       style={[
//                         styles.calendarEventTitle,
//                         { color: Colors[colorScheme].text },
//                       ]}
//                     >
//                       {calendarEvent.title}
//                     </Text>
//                     <View style={styles.calendarBadge}>
//                       <View
//                         style={[
//                           styles.calendarBadgeDot,
//                           {
//                             backgroundColor:
//                               calendarEventDiff === 0
//                                 ? "#1D9E75"
//                                 : Colors.universal.primary,
//                           },
//                         ]}
//                       />
//                       <Text
//                         style={[
//                           styles.calendarBadgeText,
//                           { color: Colors[colorScheme].icon },
//                         ]}
//                       >
//                         {calendarEventDiff === 0
//                           ? t("legendToday")
//                           : t("countdownDaysToGo", {
//                               count: calendarEventDiff,
//                             })}
//                       </Text>
//                     </View>
//                   </View>

//                   {/* Chevron */}
//                   <View style={styles.calendarChevron}>
//                     <Ionicons
//                       name="chevron-forward"
//                       size={16}
//                       color={Colors[colorScheme].icon}
//                     />
//                   </View>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {showUpdateButton && (
//               <TouchableOpacity
//                 style={[
//                   styles.updateButton,
//                   {
//                     backgroundColor:
//                       colorScheme === "dark"
//                         ? Colors.universal.secondary
//                         : Colors.universal.primary,
//                   },
//                 ]}
//                 onPress={handleRefresh}
//                 activeOpacity={0.8}
//               >
//                 <View style={styles.updateButtonContent}>
//                   <Ionicons
//                     name="refresh-circle"
//                     size={20}
//                     color="#fff"
//                     style={styles.updateButtonIcon}
//                   />
//                   <Text style={styles.updateButtonText}>
//                     {t("newNewsAvailable") ||
//                       "New items available - Tap to refresh"}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )}

//             <View style={styles.newsScrollArea}>
//               {newsIsLoading && (
//                 <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
//               )}

//               {newsIsError && (
//                 <View style={styles.errorContainer}>
//                   <Text
//                     style={[
//                       styles.errorText,
//                       { color: Colors[colorScheme].error },
//                     ]}
//                   >
//                     {newsError?.message ?? t("errorLoadingData")}
//                   </Text>
//                   <RetryButton onPress={handleRefresh} />
//                 </View>
//               )}

//               {!newsIsLoading && allNews.length === 0 && (
//                 <ThemedView style={styles.newsEmptyContainer}>
//                   <ThemedText style={styles.newsEmptyText} type="subtitle">
//                     {t("newsEmpty")}
//                   </ThemedText>
//                 </ThemedView>
//               )}

//               {!newsIsLoading && !newsIsError && allNews.length > 0 && (
//                 <ScrollView
//                   contentContainerStyle={styles.newsContentContainer}
//                   style={{ flex: 1 }}
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                 >
//                   {allNews.map((item) => (
//                     <NewsItem
//                       key={item.id.toString()}
//                       id={item.id}
//                       language_code={item.language_code}
//                       is_pinned={item.is_pinned}
//                       title={item.title}
//                       content={item.content}
//                       created_at={item.created_at}
//                       images_url={item.images_url}
//                       internal_urls={item.internal_urls}
//                       external_urls={item.external_urls}
//                     />
//                   ))}

//                   {newsHasNextPage && (
//                     <View style={styles.loadMoreContainer}>
//                       {newsIsFetchingNextPage ? (
//                         <LoadingIndicator size="small" />
//                       ) : (
//                         <TouchableOpacity
//                           onPress={handleLoadMore}
//                           style={styles.loadMoreButton}
//                         >
//                           <Text style={styles.loadMoreText}>
//                             {t("loadMore") || "Load More"}
//                           </Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>
//                   )}
//                 </ScrollView>
//               )}
//             </View>
//           </View>
//         </View>

//         {/* Podcasts */}
//         {podcasts.length > 0 && (
//           <View style={styles.podcastContainer}>
//             <View style={styles.sectionHeaderRow}>
//               <ThemedText
//                 type="titleBiggerLessBold"
//                 style={[
//                   styles.titleShadow,
//                   {
//                     shadowColor: Colors[colorScheme].shadow,
//                     marginHorizontal: 16,
//                     fontSize: fontsizeHomeHeaders,
//                   },
//                 ]}
//               >
//                 {t("podcastsTitle")}
//               </ThemedText>
//               <TouchableOpacity
//                 onPress={() => router.push("/(tabs)/home/allPodcasts")}
//               >
//                 <ThemedText
//                   style={{
//                     marginRight: 15,
//                     fontSize: fontsizeHomeShowAll,
//                     color: Colors.universal.link,
//                     fontWeight: 600,
//                   }}
//                 >
//                   {t("showAll")}
//                 </ThemedText>
//               </TouchableOpacity>
//             </View>

//             {podcastsLoading && (
//               <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
//             )}

//             {podcastsError && (
//               <View style={styles.errorContainer}>
//                 <Text
//                   style={[
//                     styles.errorText,
//                     { color: Colors[colorScheme].error },
//                   ]}
//                 >
//                   {podcastsErrorObj?.message ?? t("errorLoadingData")}
//                 </Text>
//                 <RetryButton onPress={() => podcastsFetchNextPage()} />
//               </View>
//             )}

//             {!podcastsLoading && !podcastsError && (
//               <FlatList
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.flatListContentContainer}
//                 data={podcasts}
//                 keyExtractor={(item) => item.id.toString()}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     onPress={() =>
//                       router.push({
//                         pathname: "/indexPodcast",
//                         params: { podcast: JSON.stringify(item) },
//                       })
//                     }
//                   >
//                     <PodcastPreviewCard podcast={item} />
//                   </TouchableOpacity>
//                 )}
//                 onEndReached={() => {
//                   if (podcastsHasNextPage && !podcastsIsFetchingNextPage) {
//                     podcastsFetchNextPage();
//                   }
//                 }}
//                 onEndReachedThreshold={0.5}
//                 ListFooterComponent={() =>
//                   podcastsIsFetchingNextPage ? (
//                     <LoadingIndicator size="small" />
//                   ) : null
//                 }
//               />
//             )}
//           </View>
//         )}

//         {/* PDFs */}
//         {pdfs.length > 0 && (
//           <View style={styles.pdfContainer}>
//             <View style={styles.sectionHeaderRow}>
//               <ThemedText
//                 type="titleBiggerLessBold"
//                 style={[
//                   styles.titleShadow,
//                   {
//                     shadowColor: Colors[colorScheme].shadow,
//                     marginHorizontal: 16,
//                     fontSize: fontsizeHomeHeaders,
//                   },
//                 ]}
//               >
//                 {t("pdfsTitle")}
//               </ThemedText>
//               <TouchableOpacity
//                 onPress={() => router.push("/(tabs)/home/allPdfs")}
//               >
//                 <ThemedText
//                   style={{
//                     marginRight: 15,
//                     fontSize: fontsizeHomeShowAll,
//                     color: Colors.universal.link,
//                     fontWeight: 600,
//                   }}
//                 >
//                   {t("showAll")}
//                 </ThemedText>
//               </TouchableOpacity>
//             </View>

//             {pdfsLoading && (
//               <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
//             )}

//             {pdfsError && (
//               <View style={styles.errorContainer}>
//                 <Text
//                   style={[
//                     styles.errorText,
//                     { color: Colors[colorScheme].error },
//                   ]}
//                 >
//                   {pdfsErrorObj?.message ?? t("errorLoadingData")}
//                 </Text>
//                 <RetryButton onPress={() => pdfsFetchNextPage()} />
//               </View>
//             )}

//             {!pdfsLoading && !pdfsError && (
//               <FlatList
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.flatListContentContainer}
//                 data={pdfs}
//                 keyExtractor={(item) => item.id.toString()}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     onPress={() =>
//                       router.push({
//                         pathname: "/(pdfs)",
//                         params: {
//                           filename: item.pdf_filename,
//                         },
//                       })
//                     }
//                   >
//                     <PdfPreviewCard pdf={item} />
//                   </TouchableOpacity>
//                 )}
//                 onEndReached={() => {
//                   if (pdfsHasNextPage && !pdfsIsFetchingNextPage) {
//                     pdfsFetchNextPage();
//                   }
//                 }}
//                 onEndReachedThreshold={0.5}
//                 ListFooterComponent={() =>
//                   pdfsIsFetchingNextPage ? (
//                     <LoadingIndicator size="small" />
//                   ) : null
//                 }
//               />
//             )}
//           </View>
//         )}
//       </Animated.ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollStyles: {},
//   scrollContent: {
//     gap: 15,
//   },
//   newsArticleContainer: {
//     flex: 1,
//     gap: 15,
//   },
//   podcastContainer: {
//     flex: 1,
//     gap: 20,
//     marginBottom: 20,
//   },
//   pdfContainer: {
//     flex: 1,
//     gap: 20,
//     paddingBottom: 20,
//   },
//   heroCard: {
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.12,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   heroHeader: { gap: 16 },
//   heroTitleRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   heroTitle: {},

//   calendarBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 0,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     gap: 14,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//   },
//   calendarDatePill: {
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 10,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     minWidth: 56,
//   },
//   calendarDatePillDay: {
//     fontSize: 24,
//     fontWeight: "700",
//     lineHeight: 28,
//   },
//   calendarDatePillMonth: {
//     fontSize: 11,
//     fontWeight: "600",
//     marginTop: 1,
//   },
//   calendarBannerContent: {
//     flex: 1,
//     gap: 3,
//   },
//   calendarGregorianDate: {
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   calendarEventTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     letterSpacing: -0.2,
//   },
//   calendarBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     marginTop: 2,
//   },
//   calendarBadgeDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//   },
//   calendarBadgeText: {
//     fontSize: 11,
//     fontWeight: "600",
//   },
//   calendarChevron: {
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   newsScrollArea: {
//     height: 210,
//     justifyContent: "center",
//   },
//   newsContainer: {
//     flex: 1,
//     gap: 10,
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
//     gap: 10,
//     paddingHorizontal: 14,
//     paddingBottom: 16,
//     paddingTop: 0.5,
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
import { NewsItem } from "@/components/NewsItem";
import PdfPreviewCard from "@/components/PdfPreviewCard";
import PodcastPreviewCard from "@/components/PodcastPreviewCard";
import RetryButton from "@/components/RetryButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { PodcastType, PdfType, CalendarType } from "@/constants/Types";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { getAllCalendarDates } from "../../../../db/queries/calendar";
import { useNews } from "../../../../hooks/useNews";
import { usePdfs } from "../../../../hooks/usePdfs";
import { usePodcasts } from "../../../../hooks/usePodcasts";
import { useScreenFadeIn } from "../../../../hooks/useScreenFadeIn";
import { useAuthStore } from "../../../../stores/authStore";
import { useDataVersionStore } from "../../../../stores/dataVersionStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const insets = useSafeAreaInsets();
  const isAdmin = useAuthStore((state) => state.isAdmin);

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

  const podcasts: PodcastType[] = podcastPages?.pages.flat() ?? [];
  const pdfs: PdfType[] = pdfPages?.pages.flat() ?? [];

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

        let found: CalendarType | null = null;
        let foundDiff = 0;
        let minPosDiff: number | null = null;

        for (const event of events) {
          const diff = getDiff(event.gregorian_date);
          if (diff > 0 && (minPosDiff === null || diff < minPosDiff)) {
            minPosDiff = diff;
          }
        }

        for (const event of events) {
          const diff = getDiff(event.gregorian_date);

          if (diff === 0) {
            found = event;
            foundDiff = 0;
            break;
          }

          if (minPosDiff !== null && diff === minPosDiff && !found) {
            found = event;
            foundDiff = diff;
          }
        }

        setCalendarEvent(found);
        setCalendarEventDiff(foundDiff);
      } catch {
        // Calendar is supplementary content, so failures stay silent.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [calendarVersion, lang]);

  const parseIslamicDate = (islamicDate: string) => {
    const match = islamicDate.match(/^(\d+)\.\s*(.+?)(?:\s+\d+)?$/);

    if (match) {
      return { day: match[1], month: match[2] };
    }

    return { day: "", month: islamicDate };
  };

  const islamicDateParts = calendarEvent
    ? parseIslamicDate(calendarEvent.islamic_date)
    : null;

  return (
    <View
      style={[
        styles.container,
        styles.screenBackground,
        {
          backgroundColor: Colors[colorScheme].background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Animated.ScrollView
        onLayout={onLayout}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={[
          styles.scrollView,
          styles.screenBackground,
          {
            backgroundColor: Colors[colorScheme].background,
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
        <View style={styles.headerContainer}>
          <ThemedText style={[styles.sectionLabel, { marginBottom: 10 }]}>
            {t("newsTitle").toUpperCase()}
          </ThemedText>

          {calendarEvent && islamicDateParts && (
            <TouchableOpacity
              style={[
                styles.calendarCard,
                {
                  backgroundColor:
                    Colors[colorScheme].homeCalendarCardBackground,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => {
                router.push({
                  pathname:
                    "/(tabs)/knowledge/calendar/calendarDayDetail" as any,
                  params: {
                    date: calendarEvent.gregorian_date,
                    islamicDate: calendarEvent.islamic_date,
                  },
                });
              }}
            >
              <View
                style={[
                  styles.calendarDatePill,
                  {
                    backgroundColor:
                      Colors[colorScheme].homeCalendarDatePillBackground,
                  },
                ]}
              >
                <Text style={styles.calendarDay}>{islamicDateParts.day}</Text>
                <Text
                  style={[
                    styles.calendarMonth,
                    { color: Colors[colorScheme].homeCalendarMonthText },
                  ]}
                >
                  {islamicDateParts.month}
                </Text>
              </View>

              <View
                style={[
                  styles.calendarDivider,
                  { backgroundColor: Colors[colorScheme].homeCalendarDivider },
                ]}
              />

              <View style={styles.calendarContent}>
                <Text
                  style={[
                    styles.calendarGregorian,
                    { color: Colors[colorScheme].homeCalendarGregorianText },
                  ]}
                >
                  {(() => {
                    const [y, m, d] = calendarEvent.gregorian_date.split("-");
                    return `${d}. ${t(`months.${parseInt(m)}`)} ${y}`;
                  })()}
                </Text>

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.calendarTitle}
                >
                  {calendarEvent.title}
                </Text>

                <View style={styles.calendarBadge}></View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme].homeCalendarChevron}
              />
            </TouchableOpacity>
          )}

          {showUpdateButton && (
            <TouchableOpacity
              style={[
                styles.updateBanner,
                {
                  backgroundColor:
                    Colors[colorScheme].homeUpdateBannerBackground,
                },
              ]}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <Ionicons
                name="refresh-circle"
                size={18}
                color={Colors[colorScheme].homeUpdateBannerText}
                style={styles.updateBannerIcon}
              />
              <Text
                style={[
                  styles.updateBannerText,
                  { color: Colors[colorScheme].homeUpdateBannerText },
                ]}
              >
                {t("newNewsAvailable") ||
                  "New items available - Tap to refresh"}
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.section}>
            <View style={styles.newsHeaderRow}>
              {isAdmin && (
                <TouchableOpacity
                  onPress={() => router.push("/(addNews)")}
                  style={[
                    styles.addButton,
                    {
                      backgroundColor:
                        Colors[colorScheme].homeAdminButtonBackground,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={Colors[colorScheme].homeAdminButtonIcon}
                  />
                </TouchableOpacity>
              )}
            </View>

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

            {!newsIsLoading && allNews.length === 0 && !newsIsError && (
              <ThemedView style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText} type="subtitle">
                  {t("newsEmpty")}
                </ThemedText>
              </ThemedView>
            )}

            {newsIsLoading ? <View style={{ height: 180 }}></View> : null}

            {!newsIsLoading && !newsIsError && allNews.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.newsHorizontalList}
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
                        style={[
                          styles.loadMoreButton,
                          {
                            backgroundColor:
                              Colors[colorScheme].homeLoadMoreButtonBackground,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.loadMoreText,
                            {
                              color: Colors[colorScheme].homeLoadMoreButtonText,
                            },
                          ]}
                        >
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

        {podcasts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={[styles.sectionLabel]}>
                {t("podcastsTitle").toUpperCase()}
              </ThemedText>

              <Pressable
                onPressIn={() => router.push("/(tabs)/home/allPodcasts")}
                hitSlop={styles.showAllHitSlop}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Text
                  style={[styles.showAllText, { color: Colors.universal.link }]}
                >
                  {t("showAll")}
                </Text>
              </Pressable>
            </View>

            {podcastsLoading && (
              <LoadingIndicator style={styles.sectionLoader} size="large" />
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
                contentContainerStyle={styles.horizontalListContent}
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

        {pdfs.length > 0 && (
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={[styles.sectionLabel]}>
                {t("pdfsTitle").toUpperCase()}
              </ThemedText>

              <Pressable
                onPressIn={() => router.push("/(tabs)/home/allPdfs")}
                hitSlop={styles.showAllHitSlop}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Text
                  style={[styles.showAllText, { color: Colors.universal.link }]}
                >
                  {t("showAll")}
                </Text>
              </Pressable>
            </View>

            {pdfsLoading && (
              <LoadingIndicator style={styles.sectionLoader} size="large" />
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
                contentContainerStyle={styles.horizontalListContent}
                data={pdfs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/(pdfs)",
                        params: { filename: item.pdf_filename },
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
  screenBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 30,
    paddingBottom: 30,
  },

  headerContainer: {
    paddingTop: 18,
  },

  calendarCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  calendarDatePill: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 52,
  },
  calendarDay: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FAFAF8",
  },

  calendarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FAFAF8",
  },
  calendarMonth: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },
  calendarDivider: {
    width: 1,
    height: 36,
  },
  calendarContent: {
    flex: 1,
    gap: 10,
  },
  calendarGregorian: {
    fontSize: 12,
    fontWeight: "500",
  },

  calendarBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  calendarBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  calendarBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  updateBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  updateBannerIcon: {
    marginRight: 8,
  },
  updateBannerText: {
    fontSize: 14,
    fontWeight: "600",
  },

  section: {
    gap: 10,
  },
  lastSection: {},

  newsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 15,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
    paddingHorizontal: 20,
  },
  showAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  showAllHitSlop: {
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
  },

  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionLoader: {
    marginVertical: 24,
  },

  newsHorizontalList: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
  },
  horizontalListContent: {
    gap: 12,
    paddingHorizontal: 16,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "transparent",
  },
  emptyText: {
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 16,
  },

  loadMoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  loadMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
