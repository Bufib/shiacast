//! Last worked without the button
// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useCallback,
// } from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   useColorScheme,
//   NativeSyntheticEvent,
//   NativeScrollEvent,
//   FlatList,
//   Modal,
//   Animated,
//   Text,
// } from "react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import { useTranslation } from "react-i18next";
// import { Ionicons } from "@expo/vector-icons";
// import BottomSheet, {
//   BottomSheetBackdrop,
//   BottomSheetScrollView,
// } from "@gorhom/bottom-sheet";
// import { ThemedView } from "@/components/ThemedView";
// import { ThemedText } from "@/components/ThemedText";
// import { LoadingIndicator } from "@/components/LoadingIndicator";
// import VerseCard from "@/components/VerseCard";
// import { useLastSuraStore } from "@/stores/useLastSura";
// import { Colors } from "@/constants/Colors";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { QuranVerseType } from "@/constants/Types";
// import { getPageStart, getSajdaForSurah } from "@/db/queries/quran";
// import { useReadingProgressQuran } from "@/stores/useReadingProgressQuran";
// import { useFontSizeStore } from "@/stores/fontSizeStore";
// import { seedPageIndex } from "@/utils/quranIndex";
// import { StickyHeaderQuran } from "./StickyHeaderQuran";
// import { useSuraData } from "@/hooks/useSuraData";
// import { useBookmarks } from "@/hooks/useBookmarks";
// import { vkey } from "@/stores/suraStore";
// import BasmalaRow from "./BasmalaRow";
// import ArrowUp from "./ArrowUp";
// import { useDataVersionStore } from "@/stores/dataVersionStore";
// import { useQuranAudio } from "@/hooks/useQuranAudio";
// import { RECITERS, type ReciterId } from "@/hooks/useQuranAudio";
// import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";
// import { Asset } from "expo-asset";

// const SuraScreen: React.FC = () => {
//   const colorScheme = useColorScheme() || "light";
//   const { lang, rtl } = useLanguage();

//   const { t } = useTranslation();
//   const { suraId, juzId, pageId, verseId } = useLocalSearchParams<{
//     suraId?: string;
//     juzId?: string;
//     pageId?: string;
//     verseId?: string;
//   }>();

//   const hasTafsir = true;
//   const { fontSize } = useFontSizeStore();
//   const [nextPage, setNextPage] = useState<number | null>(null);
//   const [prevPage, setPrevPage] = useState<number | null>(null);
//   const [jumping, setJumping] = useState(false);
//   const [reciter, setReciter] = useState<ReciterId>("alafasy");
//   const [pendingPlay, setPendingPlay] = useState<{
//     v: QuranVerseType;
//     i: number;
//   } | null>(null);
//   const logoAsset = Asset.fromModule(require("@/assets/images/logo.png"));
//   const artworkUri = logoAsset.uri;
//   const [reciterPicker, setReciterPicker] = useState<{
//     visible: boolean;
//     verse: QuranVerseType | null;
//     index: number;
//   }>({
//     visible: false,
//     verse: null,
//     index: -1,
//   });

//   // Sajda verses state
//   const [sajdaVerses, setSajdaVerses] = useState<Set<number>>(new Set());

//   const isPageMode = !!pageId;
//   const isJuzMode = !!juzId && !isPageMode;
//   const juzNumber = isJuzMode ? Number(juzId) : null;
//   const pageNumber = isPageMode ? Number(pageId) : null;
//   const suraNumber = useMemo(() => Number(suraId ?? 1), [suraId]);
//   const flatListRef = useRef<FlatList<QuranVerseType>>(null);
//   const [showArrow, setShowArrow] = useState(false);
//   const showArrowRef = useRef(false);
//   const { fadeAnim, onLayout } = useScreenFadeIn(800);

//   const quranDataVersion = useDataVersionStore((s) => s.quranDataVersion);

//   const handleScroll = useCallback(
//     (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//       const y = e.nativeEvent.contentOffset.y;
//       // hysteresis to avoid flicker near the threshold
//       const THRESH = 200;
//       const HYST = 16;
//       const next = showArrowRef.current ? y > THRESH - HYST : y > THRESH + HYST;
//       if (next !== showArrowRef.current) {
//         showArrowRef.current = next;
//         setShowArrow(next);
//       }
//     },
//     [],
//   );

//   const scrollToTop = () => {
//     flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
//   };

//   const [selectedVerse, setSelectedVerse] = useState<QuranVerseType | null>(
//     null,
//   );
//   const [selectedArabicVerse, setSelectedArabicVerse] =
//     useState<QuranVerseType | null>(null);

//   const bottomSheetRef = useRef<BottomSheet>(null);
//   const snapPoints = useMemo(() => ["75%"], []);

//   const setTotalVerses = useReadingProgressQuran((s) => s.setTotalVerses);
//   const setTotalVersesForJuz = useReadingProgressQuran(
//     (s) => s.setTotalVersesForJuz,
//   );
//   const setTotalVersesForPage = useReadingProgressQuran(
//     (s) => s.setTotalVersesForPage,
//   );

//   // Use custom hooks
//   const {
//     loading,
//     verses,
//     arabicVerses,
//     suraInfo,
//     displayName,
//     juzHeader,
//     bookmarksBySura,
//     setBookmarksBySura,
//   } = useSuraData({
//     lang,
//     suraNumber,
//     isJuzMode,
//     juzNumber,
//     isPageMode,
//     pageNumber,
//     setTotalVerses,
//     setTotalVersesForJuz,
//     setTotalVersesForPage,
//     quranDataVersion,
//   });

//   // Inside SuraScreen component, after your other hooks:
//   const { toggleVerse, isVersePlaying } = useQuranAudio(verses, {
//     getTitleFor: (v) =>
//       isJuzMode
//         ? `${juzHeader?.title ?? "Juz"} • ${v.sura}:${v.aya}`
//         : `${displayName ?? `Sura ${suraNumber}`} • ${v.aya}`,
//     reciter,
//     artworkUri,
//   });

//   const openReciterPicker = useCallback((v: QuranVerseType, i: number) => {
//     setReciterPicker({
//       visible: true,
//       verse: v,
//       index: i,
//     });
//   }, []);

//   const handleSelectReciter = useCallback(
//     (id: ReciterId) => {
//       if (!reciterPicker.verse) {
//         setReciterPicker({ visible: false, verse: null, index: -1 });
//         return;
//       }

//       const verse = reciterPicker.verse;
//       const index = reciterPicker.index;

//       if (id !== reciter) {
//         setReciter(id);
//         setPendingPlay({ v: verse, i: index });
//       } else {
//         toggleVerse(verse, index);
//       }

//       setReciterPicker({ visible: false, verse: null, index: -1 });
//     },
//     [reciterPicker, reciter, toggleVerse],
//   );

//   const handleCloseReciterPicker = useCallback(() => {
//     setReciterPicker({ visible: false, verse: null, index: -1 });
//   }, []);

//   const setLastSura = useLastSuraStore((s) => s.setLastSura);
//   const firstSura = verses?.[0]?.sura;

//   useEffect(() => {
//     if (firstSura) setLastSura(firstSura);
//   }, [firstSura, setLastSura]);

//   const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

//   const onViewableItemsChanged = useRef(
//     ({ viewableItems }: { viewableItems: { item: QuranVerseType }[] }) => {
//       const top = viewableItems?.[0]?.item;
//       if (top) {
//         // avoid redundant writes
//         useLastSuraStore.setState((prev) =>
//           prev.lastSura === top.sura ? prev : { lastSura: top.sura },
//         );
//       }
//     },
//   ).current;

//   // Handle pending play after reciter state update
//   useEffect(() => {
//     if (!pendingPlay) return;

//     // No timeout needed - React batches updates
//     toggleVerse(pendingPlay.v, pendingPlay.i);
//     setPendingPlay(null);
//   }, [pendingPlay, toggleVerse]);

//   const { handleBookmarkVerse } = useBookmarks({
//     lang,
//     bookmarksBySura,
//     setBookmarksBySura,
//   });

//   // Fetch sajda verses
//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       if (!verses.length) {
//         if (!cancelled) setSajdaVerses(new Set());
//         return;
//       }

//       try {
//         // Get unique sura numbers from current verses
//         const suraNumbers = [...new Set(verses.map((v) => v.sura))];

//         // Fetch sajda for all suras in view
//         const sajdaPromises = suraNumbers.map((sura) => getSajdaForSurah(sura));
//         const sajdaResults = await Promise.all(sajdaPromises);

//         // Build a set of verse keys that have sajda (type === 1)
//         const sajdaSet = new Set<number>();
//         sajdaResults.flat().forEach((sajda) => {
//           if (sajda.type === 1) {
//             // Store as "sura * 10000 + aya" for unique key
//             sajdaSet.add(sajda.sura * 10000 + sajda.aya);
//           }
//         });
//         if (!cancelled) setSajdaVerses(sajdaSet);
//       } catch (error) {
//         console.error("Error fetching sajda:", error);
//         if (!cancelled) setSajdaVerses(new Set());
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [verses, quranDataVersion]);

//   // Page navigation logic (kept in main component)
//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       if (!isPageMode || !pageNumber) {
//         if (!cancelled) {
//           setNextPage(null);
//           setPrevPage(null);
//         }
//         return;
//       }

//       try {
//         const next = await getPageStart(pageNumber + 1);
//         if (!cancelled) setNextPage(next ? pageNumber + 1 : null);

//         let prev: number | null = null;
//         if (pageNumber > 1) {
//           const prevStart = await getPageStart(pageNumber - 1);
//           prev = prevStart ? pageNumber - 1 : null;
//         }
//         if (!cancelled) setPrevPage(prev);
//       } catch {
//         if (!cancelled) {
//           setNextPage(null);
//           setPrevPage(null);
//         }
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [isPageMode, pageNumber, quranDataVersion]);

//   useEffect(() => {
//     if (!verseId || loading || !verses.length) return;

//     const targetAya = Number(verseId);
//     if (isNaN(targetAya)) return;

//     const targetIndex = verses.findIndex((v) => v.aya === targetAya);
//     if (targetIndex === -1) return;

//     const timer = setTimeout(() => {
//       flatListRef.current?.scrollToIndex({
//         index: targetIndex,
//         animated: true,
//         viewPosition: 0.2,
//       });
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [verseId, loading, verses]);

//   const arabicByKey = useMemo(
//     () => new Map(arabicVerses.map((v) => [vkey(v.sura, v.aya), v])),
//     [arabicVerses],
//   );

//   const handleOpenInfo = useCallback(
//     (verse: QuranVerseType, arabicVerse: QuranVerseType | undefined) => {
//       setSelectedVerse(verse);
//       setSelectedArabicVerse(arabicVerse || null);
//       bottomSheetRef.current?.expand();
//     },
//     [],
//   );

//   const renderBackdrop = useCallback(
//     (props: any) => (
//       <BottomSheetBackdrop
//         {...props}
//         disappearsOnIndex={-1}
//         appearsOnIndex={0}
//         opacity={0.5}
//       />
//     ),
//     [],
//   );

//   const handleGoToNextPage = useCallback(async () => {
//     if (!nextPage || jumping) return;
//     try {
//       setJumping(true);
//       try {
//         await seedPageIndex(nextPage);
//       } catch {}
//       router.setParams({ pageId: String(nextPage) });
//     } finally {
//       setJumping(false);
//     }
//   }, [nextPage, jumping]);

//   const handleGoToPrevPage = useCallback(async () => {
//     if (!prevPage || jumping) return;
//     try {
//       setJumping(true);
//       try {
//         await seedPageIndex(prevPage);
//       } catch {}
//       router.setParams({ pageId: String(prevPage) });
//     } finally {
//       setJumping(false);
//     }
//   }, [prevPage, jumping]);

//   const translitBaseStyle = useMemo(
//     () => StyleSheet.flatten([styles.arabicTransliterationText]),
//     [],
//   );

//   // Helper: should we show basmala before this row?
//   const shouldShowBasmala = useCallback(
//     (v: QuranVerseType, index: number) => {
//       if (v.sura === 1 || v.sura === 9) return false;
//       if (isJuzMode || isPageMode) return v.aya === 1;
//       return index === 0;
//     },
//     [isJuzMode, isPageMode],
//   );

//   const renderVerse = useCallback(
//     ({ item, index }: { item: QuranVerseType; index: number }) => {
//       const arabicVerse = arabicByKey.get(vkey(item.sura, item.aya));
//       const isVerseBookmarked =
//         bookmarksBySura.get(item.sura)?.has(item.aya) ?? false;
//       const isCurrentlyPlaying = isVersePlaying(item);
//       const hasSajda = sajdaVerses.has(item.sura * 10000 + item.aya);

//       return (
//         <View style={{ paddingHorizontal: 10 }}>
//           {shouldShowBasmala(item, index) && (
//             <BasmalaRow fontSize={fontSize} lang={lang} rtl={rtl} t={t} />
//           )}
//           <VerseCard
//             item={item}
//             arabicVerse={arabicVerse}
//             isBookmarked={isVerseBookmarked}
//             isJuzMode={isJuzMode || isPageMode}
//             translitBaseStyle={translitBaseStyle}
//             hasTafsir={hasTafsir}
//             hasSajda={hasSajda}
//             onBookmark={(v) => handleBookmarkVerse(v, index)}
//             onOpenInfo={handleOpenInfo}
//             language={lang}
//             isPlaying={isCurrentlyPlaying}
//             onPlayAudio={() => toggleVerse(item, index)}
//             onPickReciter={() => openReciterPicker(item, index)}
//           />
//         </View>
//       );
//     },
//     [
//       arabicByKey,
//       bookmarksBySura,
//       isJuzMode,
//       isPageMode,
//       translitBaseStyle,
//       hasTafsir,
//       handleBookmarkVerse,
//       handleOpenInfo,
//       lang,
//       isVersePlaying,
//       toggleVerse,
//       openReciterPicker,
//       fontSize,
//       rtl,
//       t,
//       shouldShowBasmala,
//       sajdaVerses,
//     ],
//   );

//   return (
//     <Animated.View
//       onLayout={onLayout}
//       style={[
//         styles.container,
//         { backgroundColor: Colors[colorScheme].background, opacity: fadeAnim },
//       ]}
//     >
//       {loading ? (
//         <View style={styles.loadingWrap}>
//           <LoadingIndicator size="large" />
//         </View>
//       ) : (
//         <FlatList
//           ref={flatListRef}
//           data={verses}
//           onScroll={handleScroll}
//           keyExtractor={(v) => `${v.sura}-${v.aya}`}
//           bounces={false}
//           overScrollMode="never"
//           alwaysBounceVertical={false}
//           contentContainerStyle={{ paddingBottom: 30 }}
//           renderItem={renderVerse}
//           onViewableItemsChanged={onViewableItemsChanged}
//           onScrollToIndexFailed={(info) => {
//             // Retry after a short delay
//             setTimeout(() => {
//               flatListRef.current?.scrollToIndex({
//                 index: info.index,
//                 animated: true,
//                 viewPosition: 0.2,
//               });
//             }, 500);
//           }}
//           viewabilityConfig={viewabilityConfig}
//           ListHeaderComponent={
//             <StickyHeaderQuran
//               suraNumber={suraNumber}
//               suraInfo={suraInfo}
//               displayName={displayName}
//               juzHeader={juzHeader}
//               juzNumber={juzNumber}
//               pageNumber={pageNumber}
//             />
//           }
//           stickyHeaderIndices={[0]}
//           stickyHeaderHiddenOnScroll
//           ListHeaderComponentStyle={{}}
//           showsVerticalScrollIndicator={false}
//           scrollEventThrottle={16}
//           ListEmptyComponent={
//             <ThemedText style={[styles.emptyText, { fontSize: fontSize }]}>
//               {t("noData")}
//             </ThemedText>
//           }
//           ListFooterComponent={
//             isPageMode && !loading ? (
//               <View
//                 style={[
//                   styles.footerContainer,
//                   prevPage
//                     ? { justifyContent: "space-between" }
//                     : { justifyContent: "flex-end" },
//                 ]}
//               >
//                 {prevPage ? (
//                   <TouchableOpacity
//                     onPress={handleGoToPrevPage}
//                     disabled={jumping}
//                     style={[styles.fabPrev, jumping && { opacity: 0.6 }]}
//                   >
//                     <Ionicons
//                       name="arrow-back-circle"
//                       size={36}
//                       color={Colors[colorScheme].defaultIcon}
//                     />
//                   </TouchableOpacity>
//                 ) : null}

//                 {nextPage ? (
//                   <TouchableOpacity
//                     onPress={handleGoToNextPage}
//                     disabled={jumping}
//                     style={[styles.fabNext, jumping && { opacity: 0.6 }]}
//                   >
//                     <Ionicons
//                       name="arrow-forward-circle"
//                       size={36}
//                       color={Colors[colorScheme].defaultIcon}
//                     />
//                   </TouchableOpacity>
//                 ) : null}
//               </View>
//             ) : null
//           }
//         />
//       )}

//       {showArrow && <ArrowUp scrollToTop={scrollToTop} />}

//       {/* Bottom Sheet for Verse Info */}
//       <BottomSheet
//         ref={bottomSheetRef}
//         index={-1}
//         snapPoints={snapPoints}
//         backdropComponent={renderBackdrop}
//         enablePanDownToClose={true}
//         backgroundStyle={{ backgroundColor: Colors[colorScheme].background }}
//         handleIndicatorStyle={{
//           backgroundColor: Colors[colorScheme].defaultIcon,
//         }}
//       >
//         <BottomSheetScrollView style={styles.bottomSheetContent}>
//           {selectedVerse && (
//             <>
//               <View style={styles.bottomSheetHeader}>
//                 <ThemedText
//                   style={[styles.bottomSheetTitle, { fontSize: fontSize }]}
//                 >
//                   {juzHeader
//                     ? `${juzHeader.title} – ${t("ayah")} ${
//                         selectedVerse.sura
//                       }:${selectedVerse.aya}`
//                     : `${displayName} - ${t("ayah")} ${selectedVerse.aya}`}
//                 </ThemedText>
//                 <TouchableOpacity
//                   onPress={() => bottomSheetRef.current?.close()}
//                   style={styles.closeButton}
//                 >
//                   <Ionicons
//                     name="close-circle-outline"
//                     size={28}
//                     color={Colors[colorScheme].defaultIcon}
//                   />
//                 </TouchableOpacity>
//               </View>

//               <View
//                 style={[
//                   styles.divider,
//                   { backgroundColor: Colors[colorScheme].border },
//                 ]}
//               />

//               <View style={styles.infoContent}>
//                 {selectedArabicVerse && (
//                   <View style={styles.infoSection}>
//                     <ThemedText
//                       style={[styles.infoLabel, { fontSize: fontSize }]}
//                     >
//                       {t("arabicText")}:
//                     </ThemedText>
//                     <ThemedText
//                       style={[
//                         styles.infoArabicText,
//                         {
//                           fontSize: fontSize * 1.3,
//                           lineHeight: fontSize * 1.3 * 2.0,
//                         },
//                       ]}
//                     >
//                       {selectedArabicVerse.text}
//                     </ThemedText>
//                   </View>
//                 )}

//                 {lang !== "ar" && (
//                   <View style={styles.infoSection}>
//                     <ThemedText
//                       style={[styles.infoLabel, { fontSize: fontSize }]}
//                     >
//                       {t("translation")}:
//                     </ThemedText>
//                     <ThemedText
//                       style={[
//                         styles.infoTranslation,
//                         { fontSize: fontSize, lineHeight: fontSize * 1.85 },
//                       ]}
//                     >
//                       {selectedVerse.text}
//                     </ThemedText>
//                   </View>
//                 )}

//                 <View style={styles.infoSection}>
//                   <ThemedText
//                     style={[styles.infoLabel, { fontSize: fontSize }]}
//                   >
//                     {t("tafsir")}:
//                   </ThemedText>
//                   <ThemedText
//                     style={[
//                       styles.infoTafsir,
//                       { fontSize: fontSize, lineHeight: fontSize * 1.85 },
//                     ]}
//                   >
//                     {t("tafsirPlaceholder") ||
//                       "Detailed explanation and commentary for this verse will appear here."}
//                   </ThemedText>
//                 </View>

//                 <View style={styles.infoSection}>
//                   <ThemedText
//                     style={[styles.infoLabel, { fontSize: fontSize }]}
//                   >
//                     {t("additionalInfo")}:
//                   </ThemedText>
//                   <View style={styles.metaInfo}>
//                     {!juzHeader && (
//                       <ThemedText
//                         style={[styles.metaText, { fontSize: fontSize }]}
//                       >
//                         • {t("surahNumber")}: {suraNumber}
//                       </ThemedText>
//                     )}
//                     <ThemedText
//                       style={[styles.metaText, { fontSize: fontSize }]}
//                     >
//                       • {t("verseNumber")}: {selectedVerse.sura}:
//                       {selectedVerse.aya}
//                     </ThemedText>
//                     {!juzHeader && (
//                       <ThemedText
//                         style={[styles.metaText, { fontSize: fontSize }]}
//                       >
//                         • {t("revelation")}:{" "}
//                         {suraInfo?.makki ? t("makki") : t("madani")}
//                       </ThemedText>
//                     )}
//                   </View>
//                 </View>
//               </View>
//             </>
//           )}
//         </BottomSheetScrollView>
//       </BottomSheet>

//       {/* Reciter Picker - Custom iOS-like dialog */}
//       <Modal
//         visible={reciterPicker.visible}
//         transparent
//         animationType="fade"
//         onRequestClose={handleCloseReciterPicker}
//       >
//         <ThemedView style={styles.reciterBackdrop}>
//           <TouchableOpacity
//             style={styles.reciterBackdropTouchable}
//             activeOpacity={1}
//             onPress={handleCloseReciterPicker}
//           />
//           <ThemedView
//             style={[
//               styles.reciterCard,
//               { borderColor: Colors[colorScheme].border },
//             ]}
//           >
//             <ThemedText style={styles.reciterTitle}>
//               {t("chooseReciter")}
//             </ThemedText>

//             <View style={styles.reciterList}>
//               {(Object.keys(RECITERS) as ReciterId[]).map((id) => (
//                 <TouchableOpacity
//                   key={id}
//                   style={[
//                     styles.reciterOption,
//                     { borderColor: Colors[colorScheme].border },
//                   ]}
//                   onPress={() => handleSelectReciter(id)}
//                 >
//                   <Text
//                     style={[
//                       styles.reciterOptionText,
//                       id === reciter && styles.reciterOptionTextActive,
//                     ]}
//                   >
//                     {RECITERS[id].label}
//                     {id === reciter ? " ✓" : ""}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <TouchableOpacity
//               style={[
//                 styles.reciterCancelButton,
//                 { backgroundColor: Colors[colorScheme].contrast },
//               ]}
//               onPress={handleCloseReciterPicker}
//             >
//               <ThemedText style={styles.reciterCancelText}>
//                 {t("cancel")}
//               </ThemedText>
//             </TouchableOpacity>
//           </ThemedView>
//         </ThemedView>
//       </Modal>
//     </Animated.View>
//   );
// };

// export default SuraScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   loadingWrap: {
//     paddingTop: 32,
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   arabicTransliterationText: {
//     fontStyle: "italic",
//     fontWeight: "400",
//     textAlign: "left",
//     color: Colors.universal.grayedOut,
//   },
//   emptyText: {
//     textAlign: "center",
//     padding: 24,
//   },
//   bottomSheetContent: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   bottomSheetHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 16,
//   },
//   bottomSheetTitle: {
//     fontWeight: "700",
//     flex: 1,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   divider: {
//     height: 1,
//     marginBottom: 16,
//   },
//   infoContent: {
//     paddingBottom: 20,
//   },
//   infoSection: {
//     marginBottom: 20,
//   },
//   infoLabel: {
//     fontWeight: "600",
//     color: Colors.universal.grayedOut,
//     marginBottom: 8,
//   },
//   infoArabicText: {
//     textAlign: "right",
//     fontWeight: "400",
//   },
//   infoTranslation: {},
//   infoTafsir: {
//     textAlign: "justify",
//   },
//   metaInfo: {
//     gap: 4,
//   },
//   metaText: {},
//   footerContainer: {
//     flexDirection: "row",
//     paddingHorizontal: 16,
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingBottom: 40,
//   },
//   fabNext: {
//     height: 56,
//     width: 56,
//     borderRadius: 28,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(0,0,0,0.08)",
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//     elevation: 4,
//     zIndex: 2000,
//   },
//   fabPrev: {
//     height: 56,
//     width: 56,
//     borderRadius: 28,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(0,0,0,0.08)",
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//     elevation: 4,
//     zIndex: 2000,
//   },
//   arrowUp: {
//     position: "absolute",
//     bottom: "60%",
//     right: "3%",
//     borderWidth: 2.5,
//     borderRadius: 99,
//     padding: 5,
//     backgroundColor: Colors.universal.primary,
//     borderColor: Colors.universal.primary,
//   },
//   reciterBackdrop: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   reciterBackdropTouchable: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   reciterCard: {
//     width: "82%",
//     borderRadius: 18,
//     paddingTop: 14,
//     paddingBottom: 8,
//     paddingHorizontal: 14,
//     alignItems: "stretch",
//     borderWidth: 1,
//   },
//   reciterTitle: {
//     fontSize: 17,
//     fontWeight: "600",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   reciterList: {
//     borderRadius: 14,
//     overflow: "hidden",
//     marginBottom: 8,
//   },
//   reciterOption: {
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     borderBottomWidth: 0.2,
//   },
//   reciterOptionText: {
//     fontSize: 16,
//     lineHeight: 35,
//     textAlign: "center",
//     color: Colors.universal.link,
//   },
//   reciterOptionTextActive: {
//     fontWeight: "600",
//   },
//   reciterCancelButton: {
//     marginTop: 4,
//     paddingVertical: 10,
//     borderRadius: 14,
//     backgroundColor: "rgba(0,0,0,0.06)",
//     marginBottom: 5,
//   },
//   reciterCancelText: {
//     fontSize: 16,
//     textAlign: "center",
//   },
// });

// SuraScreen.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
  Modal,
  Animated,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Asset } from "expo-asset";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import VerseCard from "@/components/VerseCard";

import { useLastSuraStore } from "../../stores/useLastSura";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { QuranVerseType } from "@/constants/Types";
import { getPageStart, getSajdaForSurah } from "../../db/queries/quran";
import { useReadingProgressQuran } from "../../stores/useReadingProgressQuran";
import { useFontSizeStore } from "../../stores/fontSizeStore";
import { seedPageIndex } from "../../utils/quranIndex";
import { StickyHeaderQuran } from "./StickyHeaderQuran";
import { useSuraData } from "../../hooks/useSuraData";
import { useBookmarks } from "../../hooks/useBookmarks";
import { vkey } from "../../stores/suraStore";
import BasmalaRow from "./BasmalaRow";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { useQuranAudio, RECITERS, type ReciterId } from "../../hooks/useQuranAudio";
import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";
import ArrowUp from "./ArrowUp";

// ✅ IMPORTANT: import from the correct file

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

const SuraScreen: React.FC = () => {
  const colorScheme = useColorScheme() || "light";
  const { lang, rtl } = useLanguage();
  const { t } = useTranslation();

  const { suraId, juzId, pageId, verseId } = useLocalSearchParams<{
    suraId?: string;
    juzId?: string;
    pageId?: string;
    verseId?: string;
  }>();

  const hasTafsir = true;
  const { fontSize } = useFontSizeStore();

  const [nextPage, setNextPage] = useState<number | null>(null);
  const [prevPage, setPrevPage] = useState<number | null>(null);
  const [jumping, setJumping] = useState(false);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const showUpRef = useRef(false);
  const [reciter, setReciter] = useState<ReciterId>("alafasy");
  const [pendingPlay, setPendingPlay] = useState<{
    v: QuranVerseType;
    i: number;
  } | null>(null);

  const logoAsset = Asset.fromModule(require("@/assets/images/logo.png"));
  const artworkUri = logoAsset.uri;

  const [reciterPicker, setReciterPicker] = useState<{
    visible: boolean;
    verse: QuranVerseType | null;
    index: number;
  }>({ visible: false, verse: null, index: -1 });

  const [sajdaVerses, setSajdaVerses] = useState<Set<number>>(new Set());

  const isPageMode = !!pageId;
  const isJuzMode = !!juzId && !isPageMode;
  const juzNumber = isJuzMode ? Number(juzId) : null;
  const pageNumber = isPageMode ? Number(pageId) : null;
  const suraNumber = useMemo(() => Number(suraId ?? 1), [suraId]);

  const flatListRef = useRef<FlatList<QuranVerseType>>(null);

  const [selectedVerse, setSelectedVerse] = useState<QuranVerseType | null>(
    null,
  );
  const [selectedArabicVerse, setSelectedArabicVerse] =
    useState<QuranVerseType | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["75%"], []);

  const { fadeAnim, onLayout } = useScreenFadeIn(800);

  const quranDataVersion = useDataVersionStore((s) => s.quranDataVersion);

  const setTotalVerses = useReadingProgressQuran((s) => s.setTotalVerses);
  const setTotalVersesForJuz = useReadingProgressQuran(
    (s) => s.setTotalVersesForJuz,
  );
  const setTotalVersesForPage = useReadingProgressQuran(
    (s) => s.setTotalVersesForPage,
  );

  // ----- data
  const {
    loading,
    verses,
    arabicVerses,
    suraInfo,
    displayName,
    juzHeader,
    bookmarksBySura,
    setBookmarksBySura,
  } = useSuraData({
    lang,
    suraNumber,
    isJuzMode,
    juzNumber,
    isPageMode,
    pageNumber,
    setTotalVerses,
    setTotalVersesForJuz,
    setTotalVersesForPage,
    quranDataVersion,
  });

  // ----- audio
  const { toggleVerse, isVersePlaying } = useQuranAudio(verses, {
    getTitleFor: (v) =>
      isJuzMode
        ? `${juzHeader?.title ?? "Juz"} • ${v.sura}:${v.aya}`
        : `${displayName ?? `Sura ${suraNumber}`} • ${v.aya}`,
    reciter,
    artworkUri,
  });

  const openReciterPicker = useCallback((v: QuranVerseType, i: number) => {
    setReciterPicker({ visible: true, verse: v, index: i });
  }, []);

  const handleSelectReciter = useCallback(
    (id: ReciterId) => {
      if (!reciterPicker.verse) {
        setReciterPicker({ visible: false, verse: null, index: -1 });
        return;
      }

      const verse = reciterPicker.verse;
      const index = reciterPicker.index;

      if (id !== reciter) {
        setReciter(id);
        setPendingPlay({ v: verse, i: index });
      } else {
        toggleVerse(verse, index);
      }

      setReciterPicker({ visible: false, verse: null, index: -1 });
    },
    [reciterPicker, reciter, toggleVerse],
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      // hysteresis to avoid flicker near the threshold
      const THRESH = 200;
      const HYST = 16;
      const next = showArrowRef.current ? y > THRESH - HYST : y > THRESH + HYST;
      if (next !== showArrowRef.current) {
        showArrowRef.current = next;
        setShowArrow(next);
      }
    },
    [],
  );

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleCloseReciterPicker = useCallback(() => {
    setReciterPicker({ visible: false, verse: null, index: -1 });
  }, []);

  // ----- last sura tracking
  const setLastSura = useLastSuraStore((s) => s.setLastSura);
  const firstSura = verses?.[0]?.sura;

  useEffect(() => {
    if (firstSura) setLastSura(firstSura);
  }, [firstSura, setLastSura]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { item: QuranVerseType }[] }) => {
      const top = viewableItems?.[0]?.item;
      if (top) {
        useLastSuraStore.setState((prev) =>
          prev.lastSura === top.sura ? prev : { lastSura: top.sura },
        );
      }
    },
  ).current;

  // Play after reciter updates
  useEffect(() => {
    if (!pendingPlay) return;
    toggleVerse(pendingPlay.v, pendingPlay.i);
    setPendingPlay(null);
  }, [pendingPlay, toggleVerse]);

  const { handleBookmarkVerse } = useBookmarks({
    lang,
    bookmarksBySura,
    setBookmarksBySura,
  });

  // ----- sajda fetch
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!verses.length) {
        if (!cancelled) setSajdaVerses(new Set());
        return;
      }
      try {
        const suraNumbers = [...new Set(verses.map((v) => v.sura))];
        const sajdaResults = await Promise.all(
          suraNumbers.map((s) => getSajdaForSurah(s)),
        );

        const sajdaSet = new Set<number>();
        sajdaResults.flat().forEach((sajda) => {
          if (sajda.type === 1) sajdaSet.add(sajda.sura * 10000 + sajda.aya);
        });

        if (!cancelled) setSajdaVerses(sajdaSet);
      } catch (error) {
        console.error("Error fetching sajda:", error);
        if (!cancelled) setSajdaVerses(new Set());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [verses, quranDataVersion]);

  // ----- page navigation
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isPageMode || !pageNumber) {
        if (!cancelled) {
          setNextPage(null);
          setPrevPage(null);
        }
        return;
      }

      try {
        const next = await getPageStart(pageNumber + 1);
        if (!cancelled) setNextPage(next ? pageNumber + 1 : null);

        let prev: number | null = null;
        if (pageNumber > 1) {
          const prevStart = await getPageStart(pageNumber - 1);
          prev = prevStart ? pageNumber - 1 : null;
        }
        if (!cancelled) setPrevPage(prev);
      } catch {
        if (!cancelled) {
          setNextPage(null);
          setPrevPage(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isPageMode, pageNumber, quranDataVersion]);

  // scroll to verseId
  useEffect(() => {
    if (!verseId || loading || !verses.length) return;

    const targetAya = Number(verseId);
    if (isNaN(targetAya)) return;

    const targetIndex = verses.findIndex((v) => v.aya === targetAya);
    if (targetIndex === -1) return;

    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0.2,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [verseId, loading, verses]);

  const arabicByKey = useMemo(
    () => new Map(arabicVerses.map((v) => [vkey(v.sura, v.aya), v])),
    [arabicVerses],
  );

  const handleOpenInfo = useCallback(
    (verse: QuranVerseType, ar: QuranVerseType | undefined) => {
      setSelectedVerse(verse);
      setSelectedArabicVerse(ar || null);
      bottomSheetRef.current?.expand();
    },
    [],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const handleGoToNextPage = useCallback(async () => {
    if (!nextPage || jumping) return;
    try {
      setJumping(true);
      try {
        await seedPageIndex(nextPage);
      } catch {}
      router.setParams({ pageId: String(nextPage) });
    } finally {
      setJumping(false);
    }
  }, [nextPage, jumping]);

  const handleGoToPrevPage = useCallback(async () => {
    if (!prevPage || jumping) return;
    try {
      setJumping(true);
      try {
        await seedPageIndex(prevPage);
      } catch {}
      router.setParams({ pageId: String(prevPage) });
    } finally {
      setJumping(false);
    }
  }, [prevPage, jumping]);

  const translitBaseStyle = useMemo(
    () => StyleSheet.flatten([styles.arabicTransliterationText]),
    [],
  );

  const shouldShowBasmala = useCallback(
    (v: QuranVerseType, index: number) => {
      if (v.sura === 1 || v.sura === 9) return false;
      if (isJuzMode || isPageMode) return v.aya === 1;
      return index === 0;
    },
    [isJuzMode, isPageMode],
  );

  const THRESH = 200;
  const HYST = 16;
  const DIR_EPS = 2;

  const [showArrow, setShowArrow] = useState(false);
  const showArrowRef = useRef(false);

  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const scrollDirRef = useRef<"up" | "down">("up");

  const lastYRef = useRef(0);
  const currentOffsetRef = useRef(0);

  const listHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  const scrollToIndexFailedTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const scrollToEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearScrollToIndexFailedTimer = useCallback(() => {
    if (scrollToIndexFailedTimerRef.current) {
      clearTimeout(scrollToIndexFailedTimerRef.current);
      scrollToIndexFailedTimerRef.current = null;
    }
  }, []);

  const clearScrollToEndTimer = useCallback(() => {
    if (scrollToEndTimerRef.current) {
      clearTimeout(scrollToEndTimerRef.current);
      scrollToEndTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearScrollToIndexFailedTimer();
      clearScrollToEndTimer();
    };
  }, [clearScrollToIndexFailedTimer, clearScrollToEndTimer]);

  const handleListLayout = useCallback((e: any) => {
    const h = e?.nativeEvent?.layout?.height ?? 0;
    if (h > 0) listHeightRef.current = h;
  }, []);

  const handleContentSizeChange = useCallback((_: number, h: number) => {
    contentHeightRef.current = h;
  }, []);

  // ✅ NEW: only show button while actively scrolling (keep your current logic)
  const [isScrolling, setIsScrolling] = useState(false);
  const isScrollingRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const setScrolling = useCallback((v: boolean) => {
    isScrollingRef.current = v;
    setIsScrolling(v);
  }, []);

  const scheduleStopScrolling = useCallback(() => {
    clearIdle();
    idleTimerRef.current = setTimeout(() => setScrolling(false), 400);
  }, [clearIdle, setScrolling]);

  useEffect(() => {
    return () => clearIdle();
  }, [clearIdle]);


  const scrollToEdge = useCallback(() => {
    if (!verses.length) return;

    clearScrollToEndTimer();

    if (scrollDirRef.current === "down") {
      const lastIndex = verses.length - 1;

      flatListRef.current?.scrollToIndex({
        index: lastIndex,
        animated: true,
        viewPosition: 1,
      });

      scrollToEndTimerRef.current = setTimeout(() => {
        flatListRef.current?.scrollToEnd?.({ animated: true });
        scrollToEndTimerRef.current = null;
      }, 0);
    } else {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [verses.length, clearScrollToEndTimer]);

  const renderVerse = useCallback(
    ({ item, index }: { item: QuranVerseType; index: number }) => {
      const arabicVerse = arabicByKey.get(vkey(item.sura, item.aya));
      const isVerseBookmarked =
        bookmarksBySura.get(item.sura)?.has(item.aya) ?? false;
      const isCurrentlyPlaying = isVersePlaying(item);
      const hasSajda = sajdaVerses.has(item.sura * 10000 + item.aya);

      return (
        <View style={{ paddingHorizontal: 10 }}>
          {shouldShowBasmala(item, index) && (
            <BasmalaRow fontSize={fontSize} lang={lang} rtl={rtl} t={t} />
          )}
          <VerseCard
            item={item}
            arabicVerse={arabicVerse}
            isBookmarked={isVerseBookmarked}
            isJuzMode={isJuzMode || isPageMode}
            translitBaseStyle={translitBaseStyle}
            hasTafsir={hasTafsir}
            hasSajda={hasSajda}
            onBookmark={(v) => handleBookmarkVerse(v, index)}
            onOpenInfo={handleOpenInfo}
            language={lang}
            isPlaying={isCurrentlyPlaying}
            onPlayAudio={() => toggleVerse(item, index)}
            onPickReciter={() => openReciterPicker(item, index)}
          />
        </View>
      );
    },
    [
      arabicByKey,
      bookmarksBySura,
      isJuzMode,
      isPageMode,
      translitBaseStyle,
      hasTafsir,
      handleBookmarkVerse,
      handleOpenInfo,
      lang,
      rtl,
      t,
      fontSize,
      shouldShowBasmala,
      sajdaVerses,
      isVersePlaying,
      toggleVerse,
      openReciterPicker,
    ],
  );

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background, opacity: fadeAnim },
      ]}
    >
      {loading ? (
        <View style={styles.loadingWrap}>
          <LoadingIndicator size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={verses}
          keyExtractor={(v) => `${v.sura}-${v.aya}`}
          renderItem={renderVerse}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={handleListLayout}
          onContentSizeChange={handleContentSizeChange}
          bounces={false}
          overScrollMode="never"
          alwaysBounceVertical={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={(info) => {
            clearScrollToIndexFailedTimer();

            scrollToIndexFailedTimerRef.current = setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.2,
              });
              scrollToIndexFailedTimerRef.current = null;
            }, 500);
          }}
          // ✅ NEW: active scrolling tracking (doesn't change your showArrow logic)
          onScrollBeginDrag={() => {
            clearIdle();
            setScrolling(true);
          }}
          onScrollEndDrag={() => {
            scheduleStopScrolling();
          }}
          onMomentumScrollBegin={() => {
            clearIdle();
            setScrolling(true);
          }}
          onMomentumScrollEnd={() => {
            scheduleStopScrolling();
          }}
          ListHeaderComponent={
            <StickyHeaderQuran
              suraNumber={suraNumber}
              suraInfo={suraInfo}
              displayName={displayName}
              juzHeader={juzHeader}
              juzNumber={juzNumber}
              pageNumber={pageNumber}
            />
          }
          stickyHeaderIndices={[0]}
          stickyHeaderHiddenOnScroll
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ paddingHorizontal: 10 }}>
              <ThemedText style={[styles.emptyText, { fontSize }]}>
                {t("noData")}
              </ThemedText>
            </View>
          }
          ListFooterComponent={
            isPageMode && !loading ? (
              <View
                style={[
                  styles.footerContainer,
                  prevPage
                    ? { justifyContent: "space-between" }
                    : { justifyContent: "flex-end" },
                ]}
              >
                {prevPage ? (
                  <TouchableOpacity
                    onPress={handleGoToPrevPage}
                    disabled={jumping}
                    style={[styles.fabPrev, jumping && { opacity: 0.6 }]}
                  >
                    <Ionicons
                      name="arrow-back-circle"
                      size={36}
                      color={Colors[colorScheme].defaultIcon}
                    />
                  </TouchableOpacity>
                ) : null}

                {nextPage ? (
                  <TouchableOpacity
                    onPress={handleGoToNextPage}
                    disabled={jumping}
                    style={[styles.fabNext, jumping && { opacity: 0.6 }]}
                  >
                    <Ionicons
                      name="arrow-forward-circle"
                      size={36}
                      color={Colors[colorScheme].defaultIcon}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null
          }
        />
      )}

       {showArrow && <ArrowUp scrollToTop={scrollToTop} />}

      {/* Bottom Sheet for Verse Info */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: Colors[colorScheme].background }}
        handleIndicatorStyle={{
          backgroundColor: Colors[colorScheme].defaultIcon,
        }}
      >
        <BottomSheetScrollView style={styles.bottomSheetContent}>
          {selectedVerse && (
            <>
              <View style={styles.bottomSheetHeader}>
                <ThemedText style={[styles.bottomSheetTitle, { fontSize }]}>
                  {juzHeader
                    ? `${juzHeader.title} – ${t("ayah")} ${selectedVerse.sura}:${selectedVerse.aya}`
                    : `${displayName} - ${t("ayah")} ${selectedVerse.aya}`}
                </ThemedText>

                <TouchableOpacity
                  onPress={() => bottomSheetRef.current?.close()}
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={28}
                    color={Colors[colorScheme].defaultIcon}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: Colors[colorScheme].border },
                ]}
              />

              <View style={styles.infoContent}>
                {selectedArabicVerse && (
                  <View style={styles.infoSection}>
                    <ThemedText
                      type="defaultWithFontsize"
                      style={[styles.infoLabel]}
                    >
                      {t("arabicText")}:
                    </ThemedText>
                    <ThemedText type="arabic" style={[styles.infoArabicText]}>
                      {selectedArabicVerse.text}
                    </ThemedText>
                  </View>
                )}

                {lang !== "ar" && (
                  <View style={styles.infoSection}>
                    <ThemedText
                      type="defaultWithFontsize"
                      style={[styles.infoLabel]}
                    >
                      {t("translation")}:
                    </ThemedText>
                    <ThemedText
                      type="defaultWithFontsize"
                      style={[styles.infoTranslation]}
                    >
                      {selectedVerse.text}
                    </ThemedText>
                  </View>
                )}

                <View style={styles.infoSection}>
                  <ThemedText
                    type="defaultWithFontsize"
                    style={[styles.infoLabel]}
                  >
                    {t("tafsir")}:
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.infoTafsir,
                      { fontSize, lineHeight: fontSize * 1.85 },
                    ]}
                  >
                    {t("tafsirPlaceholder") ||
                      "Detailed explanation and commentary for this verse will appear here."}
                  </ThemedText>
                </View>

                <View style={styles.infoSection}>
                  <ThemedText
                    type="defaultWithFontsize"
                    style={[styles.infoLabel]}
                  >
                    {t("additionalInfo")}:
                  </ThemedText>
                  <View style={styles.metaInfo}>
                    {!juzHeader && (
                      <ThemedText style={[styles.metaText, { fontSize }]}>
                        • {t("surahNumber")}: {suraNumber}
                      </ThemedText>
                    )}

                    <ThemedText style={[styles.metaText, { fontSize }]}>
                      • {t("verseNumber")}: {selectedVerse.sura}:
                      {selectedVerse.aya}
                    </ThemedText>

                    {!juzHeader && (
                      <ThemedText style={[styles.metaText, { fontSize }]}>
                        • {t("revelation")}:{" "}
                        {suraInfo?.makki ? t("makki") : t("madani")}
                      </ThemedText>
                    )}
                  </View>
                </View>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Reciter Picker */}
      <Modal
        visible={reciterPicker.visible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseReciterPicker}
      >
        <ThemedView style={styles.reciterBackdrop}>
          <TouchableOpacity
            style={styles.reciterBackdropTouchable}
            activeOpacity={1}
            onPress={handleCloseReciterPicker}
          />

          <ThemedView
            style={[
              styles.reciterCard,
              { borderColor: Colors[colorScheme].border },
            ]}
          >
            <ThemedText style={styles.reciterTitle}>
              {t("chooseReciter")}
            </ThemedText>

            <View style={styles.reciterList}>
              {(Object.keys(RECITERS) as ReciterId[]).map((id) => (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.reciterOption,
                    { borderColor: Colors[colorScheme].border },
                  ]}
                  onPress={() => handleSelectReciter(id)}
                >
                  <Text
                    style={[
                      styles.reciterOptionText,
                      id === reciter && styles.reciterOptionTextActive,
                    ]}
                  >
                    {RECITERS[id].label}
                    {id === reciter ? " ✓" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.reciterCancelButton,
                { backgroundColor: Colors[colorScheme].contrast },
              ]}
              onPress={handleCloseReciterPicker}
            >
              <ThemedText style={styles.reciterCancelText}>
                {t("cancel")}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </Animated.View>
  );
};

export default SuraScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: {
    paddingTop: 32,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  arabicTransliterationText: {
    fontStyle: "italic",
    fontWeight: "400",
    textAlign: "left",
    color: Colors.universal.grayedOut,
  },
  emptyText: {
    textAlign: "center",
    padding: 24,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  bottomSheetTitle: {
    fontWeight: "700",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  infoContent: {
    paddingBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    fontWeight: "600",
    color: Colors.universal.grayedOut,
    marginBottom: 8,
  },
  infoArabicText: {
    textAlign: "right",
    fontWeight: "400",
  },
  infoTranslation: {},
  infoTafsir: {
    textAlign: "justify",
  },
  metaInfo: {
    gap: 4,
  },
  metaText: {},

  footerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 40,
  },
  fabNext: {
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    zIndex: 2000,
  },
  fabPrev: {
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    zIndex: 2000,
  },

  reciterBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  reciterBackdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  reciterCard: {
    width: "82%",
    borderRadius: 18,
    paddingTop: 14,
    paddingBottom: 8,
    paddingHorizontal: 14,
    alignItems: "stretch",
    borderWidth: 1,
  },
  reciterTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  reciterList: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 8,
  },
  reciterOption: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0.2,
  },
  reciterOptionText: {
    fontSize: 16,
    lineHeight: 35,
    textAlign: "center",
    color: Colors.universal.link,
  },
  reciterOptionTextActive: {
    fontWeight: "600",
  },
  reciterCancelButton: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginBottom: 5,
  },
  reciterCancelText: {
    fontSize: 16,
    textAlign: "center",
  },
});