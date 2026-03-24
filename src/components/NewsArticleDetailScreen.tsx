//! Last worked
import { Colors } from "@/constants/Colors";
import { NewsArticlesType } from "@/constants/Types";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNewsArticles } from "../../hooks/useNewsArticles";
import { useFontSizeStore } from "../../stores/fontSizeStore";
import { formattedDate } from "../../utils/formate";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Linking,
  type GestureResponderEvent,
  Animated,
  Alert,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";
import FontSizePickerModal from "./FontSizePickerModal";
import HeaderLeftBackButton from "./HeaderLeftBackButton";
import { LoadingIndicator } from "./LoadingIndicator";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import ArrowUp from "./ArrowUp";
import {
  isNewsArticleFavorited,
  toggleNewsArticleFavorite,
} from "../../utils/favorites";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";

type Row = { key: "content" };
type SavedBookmark = { offsetY: number; addedAt: number };

export default function NewsArticleDetailScreen({
  articleId,
}: {
  articleId: number;
}) {
  const { fontSize } = useFontSizeStore();
  const colorScheme = useColorScheme() ?? "light";
  const { t } = useTranslation();
  const { lang, rtl } = useLanguage();
  const { fetchNewsArticleById } = useNewsArticles(lang);
  const incrementNewsArticleFavoritesVersion = useDataVersionStore(
    (s) => s.incrementNewsArticleFavoritesVersion,
  );

  const newsArticleVersion = useDataVersionStore((s) => s.newsArticleVersion);
  const [article, setArticle] = useState<NewsArticlesType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Favorite state + toggle
  const [isFavorite, setIsFavorite] = useState(false);

  const onPressToggle = useCallback(async () => {
    if (!articleId) return;
    try {
      const newFavStatus = await toggleNewsArticleFavorite(articleId, lang);
      setIsFavorite(newFavStatus);
      incrementNewsArticleFavoritesVersion();
    } catch (e) {
      console.log("Failed to toggle favorite", e);
    }
  }, [articleId, lang, incrementNewsArticleFavoritesVersion]);

  // Font-size modal visibility
  const [fontModalVisible, setFontModalVisible] = useState(false);

  // Absolute bookmark offset (content coords)
  const [bookmarkOffsetY, setBookmarkOffsetY] = useState<number | null>(null);

  // For converting pageY to local content Y
  const containerRef = useRef<View>(null);
  const [containerTop, setContainerTop] = useState(0);

  // Scroll handling (native, no re-renders)
  const flatListRef = useRef<Animated.FlatList<Row>>(null);
  const scrollYAV = useRef(new Animated.Value(0)).current;
  const bookmarkOffsetAV = useRef(new Animated.Value(0)).current;
  const neg14AV = useRef(new Animated.Value(-14)).current;
  const lastScrollYRef = useRef(0);
  const { fadeAnim, onLayout } = useScreenFadeIn(800);

  const [showArrowUp, setShowArrowUp] = useState(false);
  const showArrowUpRef = useRef(false);

  const bookmarkKey = useCallback(
    (id: number) => `bookmark:newsArticle:${id}:${lang}`,
    [lang],
  );

  useEffect(() => {
    const id = scrollYAV.addListener(({ value }) => {
      lastScrollYRef.current = value;
      const show = value > 200;
      if (show !== showArrowUpRef.current) {
        showArrowUpRef.current = show;
        setShowArrowUp(show);
      }
    });
    return () => {
      scrollYAV.removeListener(id);
    };
  }, [scrollYAV]);

  useEffect(() => {
    bookmarkOffsetAV.setValue(bookmarkOffsetY ?? 0);
  }, [bookmarkOffsetY, bookmarkOffsetAV]);

  const handleContainerLayout = useCallback(() => {
    containerRef.current?.measureInWindow?.((_, y) => setContainerTop(y ?? 0));
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!articleId) {
        if (alive) {
          setError(t("errorLoadingArticle"));
          setIsLoading(false);
        }
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const fetched = await fetchNewsArticleById(articleId);
        if (!alive) return;
        if (fetched) setArticle(fetched);
        else setError(t("errorLoadingArticle"));
      } catch (err: any) {
        console.error("Error loading news article:", err);
        if (alive) setError(err?.message || t("errorLoadingArticle"));
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [articleId, lang, newsArticleVersion, t, fetchNewsArticleById]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(bookmarkKey(articleId));
        if (!raw || cancelled) return;

        const saved: SavedBookmark = JSON.parse(raw);
        if (typeof saved?.offsetY === "number" && !cancelled) {
          setBookmarkOffsetY(saved.offsetY);
        }
      } catch (e) {
        if (!cancelled) console.log("Failed to load bookmark", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [articleId, bookmarkKey]);

  const saveBookmark = useCallback(
    async (offsetY: number) => {
      setBookmarkOffsetY(offsetY);
      try {
        const payload: SavedBookmark = { offsetY, addedAt: Date.now() };
        await AsyncStorage.setItem(
          bookmarkKey(articleId),
          JSON.stringify(payload),
        );
      } catch (e) {
        console.log("Failed to save bookmark", e);
      }
    },
    [articleId, bookmarkKey],
  );

  const clearBookmark = useCallback(() => {
    Alert.alert(
      t("remove", "Remove"),
      t("bookmarkRemove", "Remove this bookmark?"),
      [
        { text: t("cancel", "Cancel"), style: "cancel" },
        {
          text: t("remove", "Remove"),
          style: "destructive",
          onPress: async () => {
            try {
              setBookmarkOffsetY(null);
              await AsyncStorage.removeItem(bookmarkKey(articleId));
            } catch (e) {
              console.log("Failed to clear bookmark", e);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [articleId, bookmarkKey, t]);

  const jumpToBookmark = useCallback(() => {
    if (bookmarkOffsetY == null) return;
    const target = Math.max(bookmarkOffsetY - 200, 0);
    flatListRef.current?.scrollToOffset({ offset: target, animated: true });
  }, [bookmarkOffsetY]);

  // Initialize favorite status on mount/article change
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!articleId) return;
        const fav = await isNewsArticleFavorited(articleId, lang);
        if (!cancelled) {
          setIsFavorite(fav);
        }
      } catch (e) {
        if (!cancelled) {
          console.log("Failed to load favorite state", e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [articleId, lang]);

  // Long press to set bookmark
  const handleLongPress = useCallback(
    (e: GestureResponderEvent) => {
      const { pageY } = e.nativeEvent as any;
      const offsetY = lastScrollYRef.current + (pageY - containerTop);

      if (bookmarkOffsetY != null) {
        Alert.alert(
          t("replace"),
          t("bookmarkReplaceQuestion"),
          [
            { text: t("cancel"), style: "cancel" },
            {
              text: t("replace", "Replace"),
              style: "destructive",
              onPress: () => saveBookmark(offsetY),
            },
          ],
          { cancelable: true },
        );
        return;
      }
      saveBookmark(offsetY);
    },
    [bookmarkOffsetY, containerTop, saveBookmark, t],
  );

  const mdRules = useMemo(() => {
    const baseText = {
      color: Colors[colorScheme].text,
    } as const;

    return {
      paragraph: (node: any, children: any) => (
        <Text
          key={node?.key}
          style={{
            ...baseText,
            fontSize,
            lineHeight: fontSize * 1.85,
            marginBottom: 28,
            fontFamily: "System",
            letterSpacing: 0.3,
          }}
        >
          {children}
        </Text>
      ),
      heading1: (node: any, children: any) => (
        <Text
          key={node?.key}
          style={{
            ...baseText,
            fontSize: fontSize * 1.8,
            fontWeight: "800",
            marginBottom: 20,
            marginTop: 32,
            letterSpacing: -0.5,
          }}
        >
          {children}
        </Text>
      ),
      heading2: (node: any, children: any) => (
        <Text
          key={node?.key}
          style={{
            ...baseText,
            fontSize: fontSize * 1.5,
            fontWeight: "700",
            marginBottom: 16,
            marginTop: 28,
            letterSpacing: -0.3,
          }}
        >
          {children}
        </Text>
      ),
      em: (node: any, children: any) => (
        <Text
          key={node?.key}
          style={{
            color: Colors[colorScheme].defaultIcon,
            fontStyle: "italic",
          }}
        >
          {children}
        </Text>
      ),
      strong: (node: any, children: any) => (
        <Text
          key={node?.key}
          style={{ color: Colors[colorScheme].text, fontWeight: "700" }}
        >
          {children}
        </Text>
      ),
      link: (node: any, children: any) => (
        <Text
          key={node?.key}
          style={{
            color: Colors[colorScheme].tint,
            textDecorationLine: "underline",
          }}
          onPress={() =>
            node?.attributes?.href && Linking.openURL(node.attributes.href)
          }
          suppressHighlighting
        >
          {children}
        </Text>
      ),
      blockquote: (node: any, children: any) => (
        <View
          key={node?.key}
          style={{
            backgroundColor: "transparent",
            borderLeftColor: Colors[colorScheme].tint,
            borderLeftWidth: 4,
            paddingLeft: 20,
            paddingVertical: 16,
            marginVertical: 24,
          }}
        >
          <Text
            style={{ color: Colors[colorScheme].text, fontStyle: "italic" }}
          >
            {children}
          </Text>
        </View>
      ),
      code_inline: (node: any) => (
        <Text
          key={node?.key}
          style={{
            backgroundColor: Colors[colorScheme].tint + "15",
            color: Colors[colorScheme].tint,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            fontSize: fontSize * 0.9,
          }}
        >
          {node?.content}
        </Text>
      ),
      image: (node: any) => {
        const { src, alt } = node.attributes;
        return (
          <View
            key={node?.key}
            style={{
              width: "90%",
              alignSelf: "center",
              marginVertical: 20,
            }}
          >
            <Image
              source={{ uri: src }}
              style={{
                width: "100%",
                height: 250,
                borderRadius: 12,
              }}
              contentFit="cover"
              alt={alt}
            />
            {alt && (
              <Text
                style={{
                  fontSize: fontSize * 0.85,
                  color: Colors[colorScheme].defaultIcon,
                  marginTop: 8,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                {alt}
              </Text>
            )}
          </View>
        );
      },
    };
  }, [colorScheme, fontSize]);

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (!article) return null;
      return (
        <Pressable
          style={styles.contentSection}
          delayLongPress={350}
          onLongPress={handleLongPress}
        >
          <View style={styles.articleContent}>
            <Markdown
              rules={mdRules}
              style={{
                body: {
                  width: "100%",
                },
              }}
            >
              {article.content}
            </Markdown>
          </View>

          {!!article.source && (
            <View
              style={[
                styles.footerContainer,
                {
                  borderColor: Colors[colorScheme].border,
                  alignItems: rtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <ThemedText
                style={{ fontWeight: "600", fontSize, marginBottom: 5 }}
              >
                {t("source")}
              </ThemedText>
              <Markdown
                rules={{
                  paragraph: (node: any, children: any) => (
                    <Text
                      key={node?.key}
                      style={{
                        color: Colors[colorScheme].text,
                        fontSize: 14,
                      }}
                    >
                      {children}
                    </Text>
                  ),
                  link: (node: any, children: any) => (
                    <Text
                      key={node?.key}
                      style={{
                        color: Colors[colorScheme].tint,
                        textDecorationLine: "underline",
                        fontSize: 14,
                      }}
                      onPress={() =>
                        node?.attributes?.href &&
                        Linking.openURL(node.attributes.href)
                      }
                      suppressHighlighting
                    >
                      {children}
                    </Text>
                  ),
                }}
              >
                {article.source}
              </Markdown>
            </View>
          )}
        </Pressable>
      );
    },
    [article, colorScheme, fontSize, mdRules, handleLongPress, t, rtl],
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <View
          style={[
            styles.loadingCard,
            { backgroundColor: Colors[colorScheme].background },
          ]}
        >
          <LoadingIndicator size="large" />
        </View>
      </ThemedView>
    );
  }

  if (error || !article) {
    return (
      <ThemedView
        style={[
          {
            flex: 1,
            backgroundColor: Colors[colorScheme].background,
            justifyContent: "center",
          },
        ]}
      >
        <View style={styles.errorContainer}>
          <Ionicons
            name="newspaper-outline"
            size={80}
            color={Colors[colorScheme].defaultIcon}
          />
        </View>
        <Text style={[styles.errorTitle, { color: Colors[colorScheme].text }]}>
          {t("error")}
        </Text>
        <Text
          style={[
            styles.errorSubtitle,
            { color: Colors[colorScheme].defaultIcon },
          ]}
        >
          {t("errorLoadingArticle")}
        </Text>
        {!!error && (
          <Text
            style={[
              styles.errorSubtitle,
              { color: Colors[colorScheme].defaultIcon },
            ]}
          >
            {error}
          </Text>
        )}
      </ThemedView>
    );
  }

  const header = (
    <View style={styles.heroSection}>
      <View style={styles.header}>
        <HeaderLeftBackButton />
        <Text
          style={[
            styles.headerText,
            { backgroundColor: Colors.universal.third },
          ]}
        >
          {t("newsArticleScreenTitle").toUpperCase()}
        </Text>
      </View>

      <Text style={[styles.heroTitle, { color: Colors[colorScheme].text }]}>
        {article.title}
      </Text>

      <View style={styles.articleMetaContainer}>
        <View style={styles.articleMetaSupcontainer}>
          <View
            style={[
              styles.authorAvatar,
              {
                backgroundColor: Colors[colorScheme].contrast,
                borderColor: Colors[colorScheme].border,
              },
            ]}
          >
            {article.scholar_type === 1 ? (
              <Image
                source={require("@/assets/images/1.png")}
                style={{ width: 50, height: 50, margin: 10 }}
                contentFit="fill"
              />
            ) : article.scholar_type === 2 ? (
              <Image
                source={require("@/assets/images/2.png")}
                style={{ width: 50, height: 50, margin: 10 }}
              />
            ) : article.scholar_type === 3 ? (
              <Image
                source={require("@/assets/images/3.png")}
                style={{ width: 70, height: 70, margin: 0 }}
              />
            ) : null}
          </View>

          <View style={styles.nameDateTime}>
            <Text
              style={[styles.authorName, { color: Colors[colorScheme].text }]}
            >
              {article.author}
            </Text>
            <View style={styles.nameDateTimeSubcontainer}>
              <Text
                style={[
                  styles.publishDate,
                  { color: Colors.universal.grayedOut },
                ]}
              >
                {formattedDate(article.created_at)}
              </Text>
              <View style={styles.readTime}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={Colors[colorScheme].defaultIcon}
                />
                <Text
                  style={[
                    styles.readTimeText,
                    { color: Colors[colorScheme].defaultIcon },
                  ]}
                >
                  {article.read_time} min
                </Text>
              </View>
            </View>

            {/* ACTIONS: Favorite + Font size */}
            <View style={[styles.actionsRow]}>
              <Ionicons
                name="text"
                size={28}
                color={Colors[colorScheme].defaultIcon}
                onPress={() => setFontModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={t("changeFontSize")}
              />

              <Ionicons
                name={isFavorite ? "star" : "star-outline"}
                size={25}
                color={
                  isFavorite
                    ? Colors.universal.favorite
                    : Colors[colorScheme].defaultIcon
                }
                onPress={onPressToggle}
                accessibilityRole="button"
                accessibilityLabel={
                  isFavorite ? t("removeFromFavorites") : t("addToFavorites")
                }
                style={[styles.actionBtn, {}]}
              />
            </View>
          </View>
        </View>
      </View>

      <View
        style={[styles.border, { backgroundColor: Colors[colorScheme].border }]}
      >
        <View
          style={[
            styles.borderFill,
            { width: "100%", backgroundColor: Colors[colorScheme].tint },
          ]}
        />
      </View>
    </View>
  );

  const data: Row[] = [{ key: "content" }];

  // translateY = bookmarkOffset - scrollY
  const translateY = Animated.add(
    bookmarkOffsetAV,
    Animated.multiply(scrollYAV, -1),
  );
  const chipTranslateY = Animated.add(translateY, neg14AV);

  return (
    <SafeAreaView
      ref={containerRef}
      onLayout={handleContainerLayout}
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      edges={["top"]}
    >
      <Animated.FlatList
        ref={flatListRef}
        data={data}
        onLayout={onLayout}
        extraData={newsArticleVersion}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListHeaderComponent={header}
        style={{ opacity: fadeAnim }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollYAV } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      {/* Bookmark overlay (no re-renders on scroll) */}
      {bookmarkOffsetY !== null && (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.bookmarkLine,
              { backgroundColor: Colors.universal.third },
              { transform: [{ translateY }] },
            ]}
          />
          <Animated.View
            style={[
              styles.bookmarkChipWrap,
              { transform: [{ translateY: chipTranslateY }] },
            ]}
          >
            <View
              style={[
                styles.bookmarkChip,
                {
                  backgroundColor: Colors.universal.third,
                  borderColor: Colors[colorScheme].background,
                },
              ]}
            >
              <Ionicons name="bookmark" size={12} color="#fff" />
              <Text style={styles.bookmarkChipText}>{t("bookmark")}</Text>
              <TouchableOpacity
                onPress={clearBookmark}
                style={styles.bookmarkChipBtn}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Font-size picker modal */}
      <FontSizePickerModal
        visible={fontModalVisible}
        onClose={() => setFontModalVisible(false)}
      />

      {bookmarkOffsetY != null && (
        <TouchableOpacity style={styles.jumpBtn} onPress={jumpToBookmark}>
          <Ionicons name="flag" size={22} color="#fff" />
        </TouchableOpacity>
      )}

      {showArrowUp && (
        <ArrowUp
          scrollToTop={() =>
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  heroSection: {
    paddingHorizontal: 10,
    paddingBottom: 3,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 40,
    marginBottom: 24,
    letterSpacing: -0.8,
  },
  articleMetaContainer: {
    flexDirection: "column",
    marginBottom: 32,
  },
  articleMetaSupcontainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nameDateTime: {
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  nameDateTimeSubcontainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  authorAvatar: {
    borderWidth: 1,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  publishDate: {
    fontSize: 14,
    marginTop: 5,
  },
  readTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 5,
    marginTop: 5,
  },
  readTimeText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 10,
    marginTop: 8,
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 25.7,
    fontWeight: "600",
  },

  contentSection: { flex: 1, width: "100%" },

  border: {
    height: 2,
    marginHorizontal: 15,
    borderRadius: 2,
    marginTop: 15,
    overflow: "hidden",
  },
  borderFill: { height: "100%", borderRadius: 2 },

  articleContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    flex: 1,
    width: "100%",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    alignItems: "center",
    gap: 20,
    padding: 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtitle: { fontSize: 16, textAlign: "center", lineHeight: 24 },

  footerContainer: {
    flexDirection: "column",
    borderTopWidth: 0.5,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },

  // Bookmark overlay
  bookmarkLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    opacity: 0.9,
  },
  bookmarkChipWrap: {
    position: "absolute",
    right: 10,
    top: 0,
  },
  bookmarkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  bookmarkChipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  bookmarkChipBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  // Quick jump floating button
  jumpBtn: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.universal.third,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
});
