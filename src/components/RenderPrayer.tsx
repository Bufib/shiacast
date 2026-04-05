
// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   useRef,
//   useCallback,
// } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   useColorScheme,
//   Alert,
//   NativeSyntheticEvent,
//   NativeScrollEvent,
//   Keyboard,
//   Animated,
// } from "react-native";
// import { FlatList } from "react-native-gesture-handler";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { StatusBar } from "expo-status-bar";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useTranslation } from "react-i18next";
// import AntDesign from "@expo/vector-icons/AntDesign";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import Octicons from "@expo/vector-icons/Octicons";
// import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
// import { getPrayerWithTranslations } from "../../db/queries/prayers";
// import { FullPrayer } from "@/constants/Types";
// import { useLanguage } from "../../contexts/LanguageContext";
// import { ThemedView } from "./ThemedView";
// import { ThemedText } from "./ThemedText";
// import { Colors } from "@/constants/Colors";
// import FontSizePickerModal from "./FontSizePickerModal";
// import { useFontSizeStore } from "../../stores/fontSizeStore";
// import FavoritePrayerPickerModal from "./FavoritePrayerPickerModal";
// import { LoadingIndicator } from "./LoadingIndicator";
// import HeaderLeftBackButton from "./HeaderLeftBackButton";
// import PrayerInformationModal from "./PrayerInformationModal";
// import { useDataVersionStore } from "../../stores/dataVersionStore";
// import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";
// import ArrowUp from "./ArrowUp";
// import { RichText } from "./RichText";

// const SCROLL_UP_THRESH = 120;
// const SCROLL_UP_HYST = 16;

// // ── Fix 1: Extracted & memoized row component ─────────────────────────
// type PrayerLineProps = {
//   index: number;
//   arabic: { text: string; hasAt: boolean } | undefined;
//   translit: { text: string; hasAt: boolean } | undefined;
//   activeTranslations: {
//     code: string;
//     lines: { text: string; hasAt: boolean }[];
//   }[];
//   bookmark: number | null;
//   colorScheme: "light" | "dark";
//   rtl: boolean;
//   fontSizeArabic: number;
//   lineHeightArabic: number;
//   mdStyleTranslit: any;
//   onBookmark: (index: number) => void;
// };

// const PrayerLine = React.memo(
//   ({
//     index,
//     arabic,
//     translit,
//     activeTranslations,
//     bookmark,
//     colorScheme,
//     rtl,
//     fontSizeArabic,
//     lineHeightArabic,
//     onBookmark,
//     mdStyleTranslit,
//   }: PrayerLineProps) => {
//     const hasNote =
//       arabic?.hasAt || activeTranslations.some((tr) => tr.lines[index]?.hasAt);

//     return (
//       <View
//         style={[
//           styles.prayerSegment,
//           { backgroundColor: Colors[colorScheme].contrast },
//           hasNote && { backgroundColor: Colors.universal.primary },
//           bookmark === index + 1 && {
//             backgroundColor: Colors[colorScheme].prayerBookmark,
//           },
//         ]}
//       >
//         <View
//           style={[styles.lineNumberBadge, rtl ? { left: 16 } : { right: 16 }]}
//         >
//           <Text style={styles.lineNumber}>{index + 1}</Text>
//         </View>

//         {bookmark === index + 1 ? (
//           <Octicons
//             name="bookmark-slash"
//             size={20}
//             color={Colors[colorScheme].defaultIcon}
//             onPress={() => onBookmark(index + 1)}
//             style={
//               rtl ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" }
//             }
//           />
//         ) : (
//           <Octicons
//             name="bookmark"
//             size={20}
//             color={Colors[colorScheme].defaultIcon}
//             onPress={() => onBookmark(index + 1)}
//             style={
//               rtl ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" }
//             }
//           />
//         )}

//         {/* ── Arabic text ── */}
//         {arabic && (
//           <Text
//             style={{
//               fontSize: fontSizeArabic,
//               lineHeight: lineHeightArabic,
//               color: Colors[colorScheme].prayerArabicText,
//               alignSelf: "flex-end",
//               textAlign: "right",
//               marginBottom: 16,
//             }}
//           >
//             {arabic.text}
//           </Text>
//         )}

//         {/* ── Transliteration text ── */}
//         {translit && (
//           <RichText type="latin" style={{ fontStyle: "italic" }}>
//             {translit.text}
//           </RichText>
//         )}

//         {/* ── Translation text (latin) ── */}
//         {activeTranslations.map((tr) => (
//           <View key={tr.code} style={styles.translationBlock}>
//             <Text
//               style={[
//                 styles.translationLabel,
//                 { color: Colors[colorScheme].prayerButtonText },
//               ]}
//             >
//               {tr.code.toUpperCase()}
//             </Text>
//             <RichText type="latin">{tr.lines[index]?.text || ""}</RichText>
//           </View>
//         ))}
//       </View>
//     );
//   },
// );
// PrayerLine.displayName = "PrayerLine";

// // ── Main component ──────────────────────────────────────────────────────
// const RenderPrayer = ({ prayerID }: { prayerID: number }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
//   const [prayer, setPrayer] = useState<FullPrayer | null>(null);
//   const [selectTranslations, setSelectTranslations] = useState<
//     Record<string, boolean>
//   >({});
//   const [bookmark, setBookmark] = useState<number | null>(null);
//   const [showScrollUp, setShowScrollUp] = useState(false);
//   const showUpRef = useRef(false);

//   const colorScheme: any = useColorScheme() || "light";
//   const { t } = useTranslation();
//   const { lang, rtl } = useLanguage();

//   const bottomSheetRef = useRef<BottomSheetMethods | null>(null);
//   const snapPoints = useMemo(() => ["70%"], []);

//   // ── Font size store ──────────────────────────────────────────────────
//   const { getFontSize, getLineHeight, fontSize } = useFontSizeStore();

//   const fontSizeArabic = getFontSize("arabic");
//   const lineHeightArabic = getLineHeight("arabic");

//   const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);
//   const [pickerVisible, setPickerVisible] = useState(false);
//   const insets = useSafeAreaInsets();

//   const flashListRef = useRef<any>(null);

//   const scrollToTop = useCallback(() => {
//     flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
//   }, []);
//   const prayersVersion = useDataVersionStore((s) => s.prayersVersion);
//   const { fadeAnim, onLayout } = useScreenFadeIn(600);

//   // ── Scroll tracking ──────────────────────────────────────────────────
//   const contentHeightRef = useRef(0);
//   const layoutHeightRef = useRef(0);

//   const [, setIsScrolling] = useState(false);
//   const isScrollingRef = useRef(false);
//   const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const clearIdle = useCallback(() => {
//     if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
//     idleTimerRef.current = null;
//   }, []);

//   const setScrollingState = useCallback((v: boolean) => {
//     isScrollingRef.current = v;
//     setIsScrolling(v);
//   }, []);

//   const scheduleStopScrolling = useCallback(() => {
//     clearIdle();
//     idleTimerRef.current = setTimeout(() => setScrollingState(false), 400);
//   }, [clearIdle, setScrollingState]);

//   useEffect(() => {
//     return () => clearIdle();
//   }, [clearIdle]);

//   // ── Load prayer (+ delayed spinner) ──────────────────────────────────
//   useEffect(() => {
//     let alive = true;
//     let done = false;

//     const timer = setTimeout(() => {
//       if (!alive || done) return;
//       setShowLoadingSpinner(true);
//     }, 300);

//     (async () => {
//       try {
//         setIsLoading(true);
//         const data = await getPrayerWithTranslations(prayerID);
//         if (!alive) return;
//         setPrayer(data as FullPrayer);
//       } catch (e) {
//         console.error(e);
//       } finally {
//         done = true;
//         if (!alive) return;
//         setIsLoading(false);
//         setShowLoadingSpinner(false);
//       }
//     })();

//     return () => {
//       alive = false;
//       clearTimeout(timer);
//     };
//   }, [prayerID, prayersVersion]);

//   // ── Init translation toggles ─────────────────────────────────────────
//   useEffect(() => {
//     if (!prayer) return;
//     const initial: Record<string, boolean> = {};
//     prayer.translations.forEach((tr) => {
//       initial[tr.language_code] = tr.language_code === lang;
//     });
//     setSelectTranslations(initial);
//   }, [prayer, lang]);

//   // ── Load bookmark ─────────────────────────────────────────────────────
//   useEffect(() => {
//     let canceled = false;
//     (async () => {
//       try {
//         const raw = await AsyncStorage.getItem(`Bookmark-${prayerID}`);
//         if (canceled) return;

//         const n = raw != null ? Number.parseInt(raw, 10) : NaN;
//         setBookmark(Number.isFinite(n) ? n : null);
//       } catch (error) {
//         console.log(error);
//         if (!canceled) setBookmark(null);
//       }
//     })();

//     return () => {
//       canceled = true;
//     };
//   }, [prayerID, prayersVersion]);

//   // ── Helpers ───────────────────────────────────────────────────────────
//   const processLines = (text?: string) =>
//     text
//       ? text
//           .split("\n")
//           .filter((l) => l.trim())
//           .map((l) => ({
//             text: l.replace(/@/g, "").trim(),
//             hasAt: l.includes("@"),
//           }))
//       : [];

//   const formatted = useMemo(() => {
//     if (!prayer) return null;
//     const arabicLines = processLines(prayer.arabic_text);
//     const translitLines = processLines(prayer.transliteration_text);
//     const translations = prayer.translations.map((tr) => ({
//       code: tr.language_code,
//       lines: processLines(tr.translated_text),
//     }));
//     return { arabicLines, translitLines, translations };
//   }, [prayer]);

//   const indices = useMemo(() => {
//     if (!formatted) return [];
//     const max =
//       Math.max(
//         formatted.arabicLines.length,
//         formatted.translitLines.length,
//         ...formatted.translations.map((tr) => tr.lines.length),
//       ) || 0;
//     return Array.from({ length: max }, (_, i) => i);
//   }, [formatted]);

//   // ── Fix 2: Pre-compute activeTranslations once ───────────────────────
//   const activeTranslations = useMemo(
//     () =>
//       formatted?.translations.filter((tr) => selectTranslations[tr.code]) ?? [],
//     [formatted, selectTranslations],
//   );

//   // ── Fix 3: Clean extraData — no JSON.stringify ───────────────────────
//   const listExtraData = useMemo(
//     () => ({
//       prayersVersion,
//       bookmark,
//       activeTranslations,
//       fontSize,
//     }),
//     [prayersVersion, bookmark, activeTranslations, fontSize],
//   );

//   const notesForLang = useMemo(() => {
//     if (!prayer) return "";
//     if (lang === "ar") return prayer.arabic_notes || "";
//     const tr = prayer.translations.find((x) => x.language_code === lang);
//     return tr?.translated_notes || "";
//   }, [prayer, lang]);

//   const handleBookmark = useCallback(
//     (index: number) => {
//       if (bookmark === index) {
//         AsyncStorage.removeItem(`Bookmark-${prayerID}`);
//         setBookmark(null);
//       } else if (bookmark) {
//         Alert.alert(t("confirmBookmarkChange"), t("bookmarkReplaceQuestion"), [
//           {
//             text: t("replace"),
//             onPress: () => {
//               AsyncStorage.setItem(`Bookmark-${prayerID}`, String(index));
//               setBookmark(index);
//             },
//           },
//           { text: t("cancel"), style: "cancel" },
//         ]);
//       } else {
//         AsyncStorage.setItem(`Bookmark-${prayerID}`, String(index));
//         setBookmark(index);
//       }
//     },
//     [bookmark, prayerID, t],
//   );

//   const handleSheetChanges = useCallback((_index: number) => {
//     /* no-op */
//   }, []);

//   const closeSheet = () => {
//     Keyboard.dismiss();
//     bottomSheetRef.current?.close();
//   };

//   // ── Scroll handlers ───────────────────────────────────────────────────
//   const handleScroll = useCallback(
//     (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//       const y = e.nativeEvent.contentOffset.y;
//       const next = showUpRef.current
//         ? y > SCROLL_UP_THRESH - SCROLL_UP_HYST
//         : y > SCROLL_UP_THRESH + SCROLL_UP_HYST;
//       if (next !== showUpRef.current) {
//         showUpRef.current = next;
//         setShowScrollUp(next);
//       }
//     },
//     [],
//   );

//   const onContentSizeChange = useCallback((_w: number, h: number) => {
//     contentHeightRef.current = h;
//   }, []);

//   const onListLayout = useCallback((e: any) => {
//     layoutHeightRef.current = e.nativeEvent.layout.height;
//   }, []);

//   // ── Fix 1 continued: stable renderItem using memoized component ──────
//   const renderItem = useCallback(
//     ({ item: index }: { item: number }) => (
//       <PrayerLine
//         index={index}
//         arabic={formatted?.arabicLines[index]}
//         translit={formatted?.translitLines[index]}
//         activeTranslations={activeTranslations}
//         bookmark={bookmark}
//         colorScheme={colorScheme}
//         rtl={rtl}
//         fontSizeArabic={fontSizeArabic}
//         lineHeightArabic={lineHeightArabic}
//         mdStyleTranslit={{ fontStyle: "italic" }}
//         onBookmark={handleBookmark}
//       />
//     ),
//     [
//       formatted,
//       activeTranslations,
//       bookmark,
//       colorScheme,
//       rtl,
//       fontSizeArabic,
//       lineHeightArabic,
//       handleBookmark,
//     ],
//   );

//   // ── Render guards ─────────────────────────────────────────────────────
//   if (showLoadingSpinner) {
//     return (
//       <ThemedView style={styles.loadingAndNoDataContainer}>
//         <LoadingIndicator size={"large"} />
//       </ThemedView>
//     );
//   }

//   if (!prayer && !isLoading) {
//     return (
//       <ThemedView style={styles.loadingAndNoDataContainer}>
//         <ThemedText>{t("noData")}</ThemedText>
//       </ThemedView>
//     );
//   }

//   // ── Main render ───────────────────────────────────────────────────────
//   return (
//     <Animated.View
//       onLayout={onLayout}
//       style={[
//         styles.container,
//         { backgroundColor: Colors[colorScheme].background, opacity: fadeAnim },
//       ]}
//     >
//       <FlatList
//         ref={flashListRef}
//         scrollEventThrottle={16}
//         onScroll={handleScroll}
//         onContentSizeChange={onContentSizeChange}
//         onLayout={onListLayout}
//         keyExtractor={(i) => i.toString()}
//         data={indices}
//         bounces={false}
//         overScrollMode="never"
//         alwaysBounceVertical={false}
//         extraData={listExtraData}
//         onScrollBeginDrag={() => {
//           clearIdle();
//           setScrollingState(true);
//         }}
//         onScrollEndDrag={() => {
//           scheduleStopScrolling();
//         }}
//         onMomentumScrollBegin={() => {
//           clearIdle();
//           setScrollingState(true);
//         }}
//         onMomentumScrollEnd={() => {
//           scheduleStopScrolling();
//         }}
//         ListHeaderComponent={
//           <View
//             style={[
//               styles.header,
//               {
//                 backgroundColor: Colors[colorScheme].prayerHeaderBackground,
//                 paddingTop: insets.top,
//                 paddingRight: insets.right,
//                 paddingLeft: insets.left,
//                 marginBottom: 20,
//               },
//             ]}
//           >
//             <View style={styles.headerContent}>
//               <HeaderLeftBackButton color="#fff" style={{ marginLeft: 5 }} />

//               <View style={{ paddingHorizontal: 20 }}>
//                 <View style={styles.titleContainer}>
//                   <ThemedText
//                     type="latin"
//                     style={[styles.title, { color: "#fff" }]}
//                   >
//                     {prayer?.translations.find(
//                       (tr) => tr.language_code === lang,
//                     )?.translated_title ?? prayer?.arabic_title}
//                   </ThemedText>
//                   <ThemedText
//                     type="latin"
//                     style={[
//                       styles.arabicTitle,
//                       { color: "#fff", textAlign: "right" },
//                     ]}
//                   >
//                     {prayer?.arabic_title}
//                   </ThemedText>
//                 </View>
//               </View>

//               <View style={styles.headerControls}>
//                 <TouchableOpacity onPress={() => setFontSizeModalVisible(true)}>
//                   <Ionicons name="text" size={28} color="#fff" />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={() => bottomSheetRef.current?.expand()}
//                 >
//                   <Ionicons
//                     name="information-circle-outline"
//                     size={32}
//                     color="#fff"
//                   />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => setPickerVisible(true)}>
//                   <AntDesign name="folder-add" size={25} color="#fff" />
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <View style={styles.languageSelectContainer}>
//               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                 {prayer?.translations.map((tr) => (
//                   <TouchableOpacity
//                     key={tr.language_code}
//                     style={[
//                       styles.languageButton,
//                       selectTranslations[tr.language_code]
//                         ? {
//                             backgroundColor:
//                               Colors[colorScheme].prayerButtonBackgroundActive,
//                           }
//                         : {
//                             backgroundColor:
//                               colorScheme === "dark"
//                                 ? "rgba(96, 96, 96, 0.2)"
//                                 : "rgba(0, 0, 0, 0.05)",
//                           },
//                     ]}
//                     onPress={() =>
//                       setSelectTranslations((prev) => ({
//                         ...prev,
//                         [tr.language_code]: !prev[tr.language_code],
//                       }))
//                     }
//                   >
//                     <Text
//                       style={[styles.languageButtonText, { color: "#000" }]}
//                     >
//                       {tr.language_code.toUpperCase()}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             </View>
//           </View>
//         }
//         renderItem={renderItem}
//         ListFooterComponent={
//           notesForLang ? (
//             <View style={{ paddingHorizontal: 16 }}>
//               <RichText type="latin">{notesForLang}</RichText>
//             </View>
//           ) : null
//         }
//         ListFooterComponentStyle={{ paddingBottom: 20 }}
//       />

//       {showScrollUp && <ArrowUp scrollToTop={scrollToTop} />}

//       <PrayerInformationModal
//         ref={bottomSheetRef}
//         prayer={prayer}
//         language={lang}
//         rtl={rtl}
//         colorScheme={colorScheme}
//         getFontSize={getFontSize}
//         getLineHeight={getLineHeight}
//         snapPoints={snapPoints}
//         onChange={handleSheetChanges}
//         onRequestClose={closeSheet}
//       />

//       <FontSizePickerModal
//         visible={fontSizeModalVisible}
//         onClose={() => setFontSizeModalVisible(false)}
//       />

//       <FavoritePrayerPickerModal
//         visible={pickerVisible}
//         prayerId={prayerID}
//         onClose={() => setPickerVisible(false)}
//       />

//       <StatusBar style="light" />
//     </Animated.View>
//   );
// };

// export default RenderPrayer;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   loadingAndNoDataContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   header: { padding: 10 },
//   headerContent: {
//     flexDirection: "column",
//     gap: 10,
//   },
//   titleContainer: { gap: 10 },
//   title: {
//     fontWeight: "700",
//     marginBottom: 4,
//     lineHeight: 35,
//   },
//   arabicTitle: { fontSize: 18 },
//   headerControls: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "flex-end",
//     gap: 15,
//     marginRight: 15,
//     marginTop: 20,
//   },
//   languageSelectContainer: {
//     paddingHorizontal: 16,
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   languageButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     marginRight: 8,
//     borderWidth: 1,
//   },
//   languageButtonText: { fontSize: 14, fontWeight: "500" },
//   prayerSegment: {
//     marginHorizontal: 10,
//     marginBottom: 16,
//     borderRadius: 12,
//     padding: 15,
//   },
//   lineNumberBadge: {
//     position: "absolute",
//     top: -8,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: Colors.universal.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   lineNumber: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   translationBlock: {
//     marginTop: 12,
//     paddingTop: 8,
//     borderTopWidth: StyleSheet.hairlineWidth,
//   },
//   translationLabel: { fontSize: 12, fontWeight: "700" },
// });


import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Keyboard,
  Animated,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { getPrayerWithTranslations } from "../../db/queries/prayers";
import { FullPrayer } from "@/constants/Types";
import { useLanguage } from "../../contexts/LanguageContext";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";
import FontSizePickerModal from "./FontSizePickerModal";
import { useFontSizeStore } from "../../stores/fontSizeStore";
import FavoritePrayerPickerModal from "./FavoritePrayerPickerModal";
import { LoadingIndicator } from "./LoadingIndicator";
import HeaderLeftBackButton from "./HeaderLeftBackButton";
import PrayerInformationModal from "./PrayerInformationModal";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";
import ArrowUp from "./ArrowUp";
import { RichText } from "./RichText";
import {
  getScaledFontSize,
  getScaledLineHeight,
} from "@/constants/typography";

const SCROLL_UP_THRESH = 120;
const SCROLL_UP_HYST = 16;

type PrayerLineProps = {
  index: number;
  arabic: { text: string; hasAt: boolean } | undefined;
  translit: { text: string; hasAt: boolean } | undefined;
  activeTranslations: {
    code: string;
    lines: { text: string; hasAt: boolean }[];
  }[];
  bookmark: number | null;
  colorScheme: "light" | "dark";
  rtl: boolean;
  fontSizeArabic: number;
  lineHeightArabic: number;
  onBookmark: (index: number) => void;
};

const PrayerLine = React.memo(
  ({
    index,
    arabic,
    translit,
    activeTranslations,
    bookmark,
    colorScheme,
    rtl,
    fontSizeArabic,
    lineHeightArabic,
    onBookmark,
  }: PrayerLineProps) => {
    const hasNote =
      arabic?.hasAt || activeTranslations.some((tr) => tr.lines[index]?.hasAt);

    return (
      <View
        style={[
          styles.prayerSegment,
          { backgroundColor: Colors[colorScheme].contrast },
          hasNote && { backgroundColor: Colors.universal.primary },
          bookmark === index + 1 && {
            backgroundColor: Colors[colorScheme].prayerBookmark,
          },
        ]}
      >
        <View
          style={[styles.lineNumberBadge, rtl ? { left: 16 } : { right: 16 }]}
        >
          <Text style={styles.lineNumber}>{index + 1}</Text>
        </View>

        {bookmark === index + 1 ? (
          <Octicons
            name="bookmark-slash"
            size={20}
            color={Colors[colorScheme].defaultIcon}
            onPress={() => onBookmark(index + 1)}
            style={
              rtl ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" }
            }
          />
        ) : (
          <Octicons
            name="bookmark"
            size={20}
            color={Colors[colorScheme].defaultIcon}
            onPress={() => onBookmark(index + 1)}
            style={
              rtl ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" }
            }
          />
        )}

        {arabic && (
          <Text
            style={{
              fontSize: fontSizeArabic,
              lineHeight: lineHeightArabic,
              color: Colors[colorScheme].prayerArabicText,
              alignSelf: "flex-end",
              textAlign: "right",
              marginBottom: 16,
            }}
          >
            {arabic.text}
          </Text>
        )}

        {translit && (
          <View style={styles.translitWrap}>
            <RichText type="latin" style={{ fontStyle: "italic" }}>
              {translit.text}
            </RichText>
          </View>
        )}

        {activeTranslations.map((tr) => (
          <View key={tr.code} style={styles.translationBlock}>
            <Text
              style={[
                styles.translationLabel,
                { color: Colors[colorScheme].prayerButtonText },
              ]}
            >
              {tr.code.toUpperCase()}
            </Text>
            <RichText type="latin">{tr.lines[index]?.text || ""}</RichText>
          </View>
        ))}
      </View>
    );
  },
);
PrayerLine.displayName = "PrayerLine";

const RenderPrayer = ({ prayerID }: { prayerID: number }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [prayer, setPrayer] = useState<FullPrayer | null>(null);
  const [selectTranslations, setSelectTranslations] = useState<
    Record<string, boolean>
  >({});
  const [bookmark, setBookmark] = useState<number | null>(null);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const showUpRef = useRef(false);

  const colorScheme = (useColorScheme() || "light") as "light" | "dark";
  const { t } = useTranslation();
  const { lang, rtl } = useLanguage();

  const bottomSheetRef = useRef<BottomSheetMethods | null>(null);
  const snapPoints = useMemo(() => ["70%"], []);

  const fontSize = useFontSizeStore((s) => s.fontSize);
  const fontSizeArabic = getScaledFontSize(fontSize, "arabic");
  const lineHeightArabic = getScaledLineHeight(fontSize, "arabic");
  const fontSizeLatin = getScaledFontSize(fontSize, "latin");
  const lineHeightLatin = getScaledLineHeight(fontSize, "latin");

  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const flashListRef = useRef<any>(null);

  const scrollToTop = useCallback(() => {
    flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const prayersVersion = useDataVersionStore((s) => s.prayersVersion);
  const { fadeAnim, onLayout } = useScreenFadeIn(600);

  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);

  const [, setIsScrolling] = useState(false);
  const isScrollingRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const setScrollingState = useCallback((v: boolean) => {
    isScrollingRef.current = v;
    setIsScrolling(v);
  }, []);

  const scheduleStopScrolling = useCallback(() => {
    clearIdle();
    idleTimerRef.current = setTimeout(() => setScrollingState(false), 400);
  }, [clearIdle, setScrollingState]);

  useEffect(() => {
    return () => clearIdle();
  }, [clearIdle]);

  useEffect(() => {
    let alive = true;
    let done = false;

    const timer = setTimeout(() => {
      if (!alive || done) return;
      setShowLoadingSpinner(true);
    }, 300);

    (async () => {
      try {
        setIsLoading(true);
        const data = await getPrayerWithTranslations(prayerID);
        if (!alive) return;
        setPrayer(data as FullPrayer);
      } catch (e) {
        console.error(e);
      } finally {
        done = true;
        if (!alive) return;
        setIsLoading(false);
        setShowLoadingSpinner(false);
      }
    })();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [prayerID, prayersVersion]);

  useEffect(() => {
    if (!prayer) return;
    const initial: Record<string, boolean> = {};
    prayer.translations.forEach((tr) => {
      initial[tr.language_code] = tr.language_code === lang;
    });
    setSelectTranslations(initial);
  }, [prayer, lang]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(`Bookmark-${prayerID}`);
        if (canceled) return;

        const n = raw != null ? Number.parseInt(raw, 10) : NaN;
        setBookmark(Number.isFinite(n) ? n : null);
      } catch (error) {
        console.log(error);
        if (!canceled) setBookmark(null);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [prayerID, prayersVersion]);

  const processLines = (text?: string) =>
    text
      ? text
          .split("\n")
          .filter((l) => l.trim())
          .map((l) => ({
            text: l.replace(/@/g, "").trim(),
            hasAt: l.includes("@"),
          }))
      : [];

  const formatted = useMemo(() => {
    if (!prayer) return null;
    const arabicLines = processLines(prayer.arabic_text);
    const translitLines = processLines(prayer.transliteration_text);
    const translations = prayer.translations.map((tr) => ({
      code: tr.language_code,
      lines: processLines(tr.translated_text),
    }));
    return { arabicLines, translitLines, translations };
  }, [prayer]);

  const indices = useMemo(() => {
    if (!formatted) return [];
    const max =
      Math.max(
        formatted.arabicLines.length,
        formatted.translitLines.length,
        ...formatted.translations.map((tr) => tr.lines.length),
      ) || 0;
    return Array.from({ length: max }, (_, i) => i);
  }, [formatted]);

  const activeTranslations = useMemo(
    () =>
      formatted?.translations.filter((tr) => selectTranslations[tr.code]) ?? [],
    [formatted, selectTranslations],
  );

  const listExtraData = useMemo(
    () => ({
      prayersVersion,
      bookmark,
      activeTranslations,
      fontSize,
    }),
    [prayersVersion, bookmark, activeTranslations, fontSize],
  );

  const notesForLang = useMemo(() => {
    if (!prayer) return "";
    if (lang === "ar") return prayer.arabic_notes || "";
    const tr = prayer.translations.find((x) => x.language_code === lang);
    return tr?.translated_notes || "";
  }, [prayer, lang]);

  const handleBookmark = useCallback(
    (index: number) => {
      if (bookmark === index) {
        AsyncStorage.removeItem(`Bookmark-${prayerID}`);
        setBookmark(null);
      } else if (bookmark) {
        Alert.alert(t("confirmBookmarkChange"), t("bookmarkReplaceQuestion"), [
          {
            text: t("replace"),
            onPress: () => {
              AsyncStorage.setItem(`Bookmark-${prayerID}`, String(index));
              setBookmark(index);
            },
          },
          { text: t("cancel"), style: "cancel" },
        ]);
      } else {
        AsyncStorage.setItem(`Bookmark-${prayerID}`, String(index));
        setBookmark(index);
      }
    },
    [bookmark, prayerID, t],
  );

  const handleSheetChanges = useCallback((_index: number) => {}, []);

  const closeSheet = () => {
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
  };

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const next = showUpRef.current
        ? y > SCROLL_UP_THRESH - SCROLL_UP_HYST
        : y > SCROLL_UP_THRESH + SCROLL_UP_HYST;
      if (next !== showUpRef.current) {
        showUpRef.current = next;
        setShowScrollUp(next);
      }
    },
    [],
  );

  const onContentSizeChange = useCallback((_w: number, h: number) => {
    contentHeightRef.current = h;
  }, []);

  const onListLayout = useCallback((e: any) => {
    layoutHeightRef.current = e.nativeEvent.layout.height;
  }, []);

  const renderItem = useCallback(
    ({ item: index }: { item: number }) => (
      <PrayerLine
        index={index}
        arabic={formatted?.arabicLines[index]}
        translit={formatted?.translitLines[index]}
        activeTranslations={activeTranslations}
        bookmark={bookmark}
        colorScheme={colorScheme}
        rtl={rtl}
        fontSizeArabic={fontSizeArabic}
        lineHeightArabic={lineHeightArabic}
        onBookmark={handleBookmark}
      />
    ),
    [
      formatted,
      activeTranslations,
      bookmark,
      colorScheme,
      rtl,
      fontSizeArabic,
      lineHeightArabic,
      handleBookmark,
    ],
  );

  if (showLoadingSpinner) {
    return (
      <ThemedView style={styles.loadingAndNoDataContainer}>
        <LoadingIndicator size="large" />
      </ThemedView>
    );
  }

  if (!prayer && !isLoading) {
    return (
      <ThemedView style={styles.loadingAndNoDataContainer}>
        <ThemedText>{t("noData")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background, opacity: fadeAnim },
      ]}
    >
      <FlatList
        key={`prayer-${fontSize}`}
        ref={flashListRef}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onListLayout}
        keyExtractor={(i) => `${i}-${fontSize}`}
        data={indices}
        bounces={false}
        overScrollMode="never"
        alwaysBounceVertical={false}
        extraData={listExtraData}
        onScrollBeginDrag={() => {
          clearIdle();
          setScrollingState(true);
        }}
        onScrollEndDrag={() => {
          scheduleStopScrolling();
        }}
        onMomentumScrollBegin={() => {
          clearIdle();
          setScrollingState(true);
        }}
        onMomentumScrollEnd={() => {
          scheduleStopScrolling();
        }}
        ListHeaderComponent={
          <View
            style={[
              styles.header,
              {
                backgroundColor: Colors[colorScheme].prayerHeaderBackground,
                paddingTop: insets.top,
                paddingRight: insets.right,
                paddingLeft: insets.left,
                marginBottom: 20,
              },
            ]}
          >
            <View style={styles.headerContent}>
              <HeaderLeftBackButton color="#fff" style={{ marginLeft: 5 }} />

              <View style={{ paddingHorizontal: 20 }}>
                <View style={styles.titleContainer}>
                  <ThemedText
                    type="latin"
                    style={[
                      styles.title,
                      {
                        color: "#fff",
                        fontSize: fontSizeLatin,
                        lineHeight: lineHeightLatin,
                      },
                    ]}
                  >
                    {prayer?.translations.find(
                      (tr) => tr.language_code === lang,
                    )?.translated_title ?? prayer?.arabic_title}
                  </ThemedText>
                  <ThemedText
                    type="latin"
                    style={[
                      styles.arabicTitle,
                      {
                        color: "#fff",
                        textAlign: "right",
                        fontSize: fontSizeArabic,
                        lineHeight: lineHeightArabic,
                      },
                    ]}
                  >
                    {prayer?.arabic_title}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.headerControls}>
                <TouchableOpacity onPress={() => setFontSizeModalVisible(true)}>
                  <Ionicons name="text" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => bottomSheetRef.current?.expand()}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={32}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPickerVisible(true)}>
                  <AntDesign name="folder-add" size={25} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.languageSelectContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {prayer?.translations.map((tr) => (
                  <TouchableOpacity
                    key={tr.language_code}
                    style={[
                      styles.languageButton,
                      selectTranslations[tr.language_code]
                        ? {
                            backgroundColor:
                              Colors[colorScheme].prayerButtonBackgroundActive,
                          }
                        : {
                            backgroundColor:
                              colorScheme === "dark"
                                ? "rgba(96, 96, 96, 0.2)"
                                : "rgba(0, 0, 0, 0.05)",
                          },
                    ]}
                    onPress={() =>
                      setSelectTranslations((prev) => ({
                        ...prev,
                        [tr.language_code]: !prev[tr.language_code],
                      }))
                    }
                  >
                    <Text
                      style={[styles.languageButtonText, { color: "#000" }]}
                    >
                      {tr.language_code.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        renderItem={renderItem}
        ListFooterComponent={
          notesForLang ? (
            <View style={{ paddingHorizontal: 16 }}>
              <RichText type="latin">{notesForLang}</RichText>
            </View>
          ) : null
        }
        ListFooterComponentStyle={{ paddingBottom: 20 }}
      />

      {showScrollUp && <ArrowUp scrollToTop={scrollToTop} />}

      <PrayerInformationModal
        ref={bottomSheetRef}
        prayer={prayer}
        language={lang}
        rtl={rtl}
        colorScheme={colorScheme}
        getFontSize={(type) => getScaledFontSize(fontSize, type)}
        getLineHeight={(type) => getScaledLineHeight(fontSize, type)}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        onRequestClose={closeSheet}
      />

      <FontSizePickerModal
        visible={fontSizeModalVisible}
        onClose={() => setFontSizeModalVisible(false)}
      />

      <FavoritePrayerPickerModal
        visible={pickerVisible}
        prayerId={prayerID}
        onClose={() => setPickerVisible(false)}
      />

      <StatusBar style="light" />
    </Animated.View>
  );
};

export default RenderPrayer;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingAndNoDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: { padding: 10 },
  headerContent: {
    flexDirection: "column",
    gap: 10,
  },
  titleContainer: { gap: 10 },
  title: {
    fontWeight: "700",
    marginBottom: 4,
  },
  arabicTitle: {},
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 15,
    marginRight: 15,
    marginTop: 20,
  },
  languageSelectContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  languageButtonText: { fontSize: 14, fontWeight: "500" },
  prayerSegment: {
    marginHorizontal: 10,
    marginBottom: 16,
    borderRadius: 12,
    padding: 15,
  },
  lineNumberBadge: {
    position: "absolute",
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.universal.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  lineNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  translitWrap: {
    marginBottom: 12,
  },
  translationBlock: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  translationLabel: { fontSize: 12, fontWeight: "700" },
});