import VideoGridCard from "@/components/VideoGridCard";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Colors } from "@/constants/Colors";
import type { VideoType } from "@/constants/Types";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLanguage } from "../../contexts/LanguageContext";
import { parseTopics } from "../../utils/videoTopics";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  type FlatListProps,
  type ListRenderItemInfo,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const IS_WEB = Platform.OS === "web";
const WEB_MAX_CONTENT_WIDTH = 820;
const HORIZONTAL_PADDING = IS_WEB ? 24 : 16;
const ROW_CARD_GAP = IS_WEB ? 12 : 14;
const GRID_CARD_GAP = 12;
const UNCATEGORIZED_TOPIC_KEY = "__uncategorized__";

type TopicVideoSection = {
  key: string;
  title: string;
  videos: VideoType[];
  isUncategorized: boolean;
};

type VideoGridListProps = {
  videos: VideoType[];
  layout?: "topicRows" | "grid";
  gridColumns?: number;
  ListHeaderComponent?: FlatListProps<VideoType>["ListHeaderComponent"];
  ListEmptyComponent?: FlatListProps<VideoType>["ListEmptyComponent"];
  refreshing?: boolean;
  onRefresh?: () => void;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
};

export default function VideoGridList({
  videos,
  layout = "topicRows",
  gridColumns = 2,
  ListHeaderComponent,
  ListEmptyComponent,
  refreshing = false,
  onRefresh,
  isLoadingMore = false,
  onEndReached,
}: VideoGridListProps) {
  const { width } = useWindowDimensions();
  const { lang, rtl } = useLanguage();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const layoutWidth = IS_WEB ? Math.min(width, WEB_MAX_CONTENT_WIDTH) : width;

  const topicCardWidth = useMemo(() => {
    const availableWidth = Math.max(0, layoutWidth - HORIZONTAL_PADDING * 2);
    const targetWidth =
      layoutWidth >= 640
        ? IS_WEB
          ? 300
          : 360
        : Math.round(availableWidth * 0.82);

    return Math.min(availableWidth, Math.max(260, targetWidth));
  }, [layoutWidth]);

  const gridCardWidth = useMemo(() => {
    const availableWidth = Math.max(0, layoutWidth - HORIZONTAL_PADDING * 2);
    const minWidth = gridColumns === 1 ? 0 : IS_WEB ? 160 : 120;
    const totalGap = Math.max(0, gridColumns - 1) * GRID_CARD_GAP;
    return Math.max(
      minWidth,
      Math.floor((availableWidth - totalGap) / Math.max(1, gridColumns)),
    );
  }, [gridColumns, layoutWidth]);

  const uncategorizedTitle = t("uncategorizedTopic");

  const topicSections = useMemo<TopicVideoSection[]>(() => {
    const sectionsByKey = new Map<string, TopicVideoSection>();

    for (const video of videos) {
      const topicNames = parseTopics(video.video_topic);
      const topics =
        topicNames.length > 0
          ? Array.from(new Set(topicNames))
          : [uncategorizedTitle];

      for (const topic of topics) {
        const isUncategorized = topicNames.length === 0;
        const key = isUncategorized
          ? UNCATEGORIZED_TOPIC_KEY
          : `topic:${topic.toLocaleLowerCase()}`;

        const existing = sectionsByKey.get(key);

        if (existing) {
          existing.videos.push(video);
        } else {
          sectionsByKey.set(key, {
            key,
            title: topic,
            videos: [video],
            isUncategorized,
          });
        }
      }
    }

    return Array.from(sectionsByKey.values()).sort((a, b) => {
      if (a.isUncategorized !== b.isUncategorized) {
        return a.isUncategorized ? 1 : -1;
      }

      return a.title.localeCompare(b.title, lang, { sensitivity: "base" });
    });
  }, [lang, uncategorizedTitle, videos]);

  const renderGridItem = useCallback(
    ({ item }: ListRenderItemInfo<VideoType>) => {
      return (
        <View style={[styles.gridItemWrapper, { width: gridCardWidth }]}>
          <VideoGridCard
            video={item}
            width={gridCardWidth}
            rtl={rtl}
            lang={lang}
          />
        </View>
      );
    },
    [gridCardWidth, lang, rtl],
  );

  const renderSection = useCallback(
    ({ item: section }: ListRenderItemInfo<TopicVideoSection>) => {
      const renderVideo = ({ item }: ListRenderItemInfo<VideoType>) => {
        return (
          <View style={styles.itemWrapper}>
            <VideoGridCard
              video={item}
              width={topicCardWidth}
              rtl={rtl}
              lang={lang}
            />
          </View>
        );
      };

      return (
        <View style={[styles.topicSection, IS_WEB && styles.webTopicSection]}>
          <View
            style={[
              styles.topicHeader,
              IS_WEB && styles.webTopicHeader,
              rtl && styles.topicHeaderReverse,
            ]}
          >
            <Text
              style={[
                styles.topicTitle,
                IS_WEB && styles.webTopicTitle,
                {
                  color: colors.text,
                  textAlign: rtl ? "right" : "left",
                  writingDirection: rtl ? "rtl" : "ltr",
                },
              ]}
              numberOfLines={1}
            >
              {section.title}
            </Text>

            <Text
              style={[
                styles.topicCount,
                IS_WEB && styles.webTopicCount,
                {
                  color: colors.tabIconDefault,
                  textAlign: rtl ? "left" : "right",
                },
              ]}
              numberOfLines={1}
            >
              {section.videos.length}
            </Text>
          </View>

          <FlatList
            data={section.videos}
            horizontal
            keyExtractor={(item) => `${section.key}:${item.id}`}
            renderItem={renderVideo}
            ItemSeparatorComponent={TopicCardSeparator}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.rowContent,
              IS_WEB && styles.webRowContent,
            ]}
            style={styles.rowList}
            initialNumToRender={3}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews
          />
        </View>
      );
    },
    [colors.tabIconDefault, colors.text, lang, rtl, topicCardWidth],
  );

  if (layout === "grid") {
    return (
      <FlatList
        key={`video-grid-${gridColumns}`}
        style={IS_WEB && styles.webListFrame}
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGridItem}
        numColumns={gridColumns}
        columnWrapperStyle={
          gridColumns > 1
            ? [
                styles.gridColumnWrapper,
                rtl && styles.gridColumnWrapperReverse,
              ]
            : undefined
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <LoadingIndicator size="small" />
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    );
  }

  return (
    <FlatList
      key="topic-rows"
      style={IS_WEB && styles.webListFrame}
      data={topicSections}
      keyExtractor={(item) => item.key}
      renderItem={renderSection}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoader}>
            <LoadingIndicator size="small" />
          </View>
        ) : null
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

function TopicCardSeparator() {
  return <View style={styles.cardSeparator} />;
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 30,
  },
  topicSection: {
    marginBottom: 24,
  },
  webTopicSection: {
    marginBottom: 18,
  },
  topicHeader: {
    minHeight: 32,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  webTopicHeader: {
    minHeight: 26,
    marginBottom: 8,
  },
  topicHeaderReverse: {
    flexDirection: "row-reverse",
  },
  topicTitle: {
    flex: 1,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  webTopicTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  topicCount: {
    minWidth: 28,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  webTopicCount: {
    fontSize: 11,
    lineHeight: 14,
  },
  webListFrame: {
    width: "100%",
    maxWidth: WEB_MAX_CONTENT_WIDTH,
    alignSelf: "center",
  },
  rowList: {
    overflow: "visible",
  },
  rowContent: {
    paddingTop: 2,
    paddingBottom: 6,
  },
  webRowContent: {
    paddingBottom: 4,
  },
  gridColumnWrapper: {
    justifyContent: "space-between",
  },
  gridColumnWrapperReverse: {
    flexDirection: "row-reverse",
  },
  gridItemWrapper: {
    paddingBottom: 16,
  },
  itemWrapper: {
    paddingBottom: 8,
  },
  cardSeparator: {
    width: ROW_CARD_GAP,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
